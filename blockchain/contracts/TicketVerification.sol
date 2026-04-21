// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TicketVerification {
    // ─── Structs ───────────────────────────────────────────────────────────────

    struct Event {
        uint256 eventId;
        string name;
        uint256 date;
        uint256 ticketPrice;
        uint256 ticketLimit;
        uint256 ticketsSold;
        address organizer;
        bool exists;
    }

    struct Ticket {
        uint256 ticketId;
        uint256 eventId;
        address owner;
        uint256 timestamp;
        bool isUsed;
        bool exists;
    }

    // ─── State Variables ───────────────────────────────────────────────────────

    uint256 private _eventCounter;
    uint256 private _ticketCounter;

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) private userTickets;
    mapping(uint256 => uint256[]) private eventTickets;

    // ─── Events (Solidity) ────────────────────────────────────────────────────

    event EventCreated(uint256 indexed eventId, string name, address organizer);
    event TicketMinted(uint256 indexed ticketId, uint256 indexed eventId, address owner);
    event TicketTransferred(uint256 indexed ticketId, address from, address to);
    event TicketUsed(uint256 indexed ticketId, uint256 indexed eventId);

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOrganizer(uint256 eventId) {
        require(events[eventId].exists, "Event does not exist");
        require(events[eventId].organizer == msg.sender, "Only event organizer allowed");
        _;
    }

    modifier onlyTicketOwner(uint256 ticketId) {
        require(tickets[ticketId].exists, "Ticket does not exist");
        require(tickets[ticketId].owner == msg.sender, "Only ticket owner allowed");
        _;
    }

    modifier ticketNotUsed(uint256 ticketId) {
        require(tickets[ticketId].exists, "Ticket does not exist");
        require(!tickets[ticketId].isUsed, "Ticket already used");
        _;
    }

    //  Functions

    // Create a new event.
     
    function createEvent(
        string calldata name,
        uint256 date,
        uint256 ticketPrice,
        uint256 ticketLimit
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Event name cannot be empty");
        require(date > block.timestamp, "Event date must be in the future");
        require(ticketLimit > 0, "Ticket limit must be > 0");

        _eventCounter++;
        uint256 eventId = _eventCounter;

        events[eventId] = Event({
            eventId: eventId,
            name: name,
            date: date,
            ticketPrice: ticketPrice,
            ticketLimit: ticketLimit,
            ticketsSold: 0,
            organizer: msg.sender,
            exists: true
        });

        emit EventCreated(eventId, name, msg.sender);
        return eventId;
    }

    // Mint a ticket for an event. Caller pays ticket price.
     
    function mintTicket(uint256 eventId) external payable returns (uint256) {
        Event storage ev = events[eventId];
        require(ev.exists, "Event does not exist");
        require(ev.ticketsSold < ev.ticketLimit, "Event sold out");
        require(msg.value >= ev.ticketPrice, "Insufficient payment");

        _ticketCounter++;
        uint256 ticketId = _ticketCounter;

        tickets[ticketId] = Ticket({
            ticketId: ticketId,
            eventId: eventId,
            owner: msg.sender,
            timestamp: block.timestamp,
            isUsed: false,
            exists: true
        });

        ev.ticketsSold++;
        userTickets[msg.sender].push(ticketId);
        eventTickets[eventId].push(ticketId);

        // Refund excess payment
        if (msg.value > ev.ticketPrice) {
            payable(msg.sender).transfer(msg.value - ev.ticketPrice);
        }

        // Forward ticket price to organizer
        payable(ev.organizer).transfer(ev.ticketPrice);

        emit TicketMinted(ticketId, eventId, msg.sender);
        return ticketId;
    }

    // Transfer ticket ownership to another wallet.

    function transferTicket(uint256 ticketId, address to)
        external
        onlyTicketOwner(ticketId)
        ticketNotUsed(ticketId)
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(to != msg.sender, "Cannot transfer to yourself");

        address from = tickets[ticketId].owner;
        tickets[ticketId].owner = to;

        // Update userTickets mappings
        _removeFromUserTickets(from, ticketId);
        userTickets[to].push(ticketId);

        emit TicketTransferred(ticketId, from, to);
    }

    // Verify a ticket — returns its details.
     
    function verifyTicket(uint256 ticketId)
        external
        view
        returns (
            uint256 tId,
            uint256 eventId,
            address owner,
            uint256 timestamp,
            bool isUsed,
            bool isValid
        )
    {
        Ticket storage t = tickets[ticketId];
        require(t.exists, "Ticket does not exist");
        return (t.ticketId, t.eventId, t.owner, t.timestamp, t.isUsed, t.exists);
    }

    // Mark a ticket as used. Only the event organizer can call this.
     
    function useTicket(uint256 ticketId) external ticketNotUsed(ticketId) {
        Ticket storage t = tickets[ticketId];
        require(t.exists, "Ticket does not exist");

        uint256 eventId = t.eventId;
        require(
            events[eventId].organizer == msg.sender,
            "Only event organizer can mark tickets as used"
        );

        t.isUsed = true;
        emit TicketUsed(ticketId, eventId);
    }

    // Get all ticket IDs owned by a user.
    
    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }

    // Get all ticket IDs for an event.
     
    function getEventTickets(uint256 eventId) external view returns (uint256[] memory) {
        return eventTickets[eventId];
    }

    // Get event count.
     
    function getEventCount() external view returns (uint256) {
        return _eventCounter;
    }

    // Get ticket count.
     
    function getTicketCount() external view returns (uint256) {
        return _ticketCounter;
    }

    // ─── Internal Helpers ──────────────────────────────────────────────────────

    function _removeFromUserTickets(address user, uint256 ticketId) internal {
        uint256[] storage tList = userTickets[user];
        for (uint256 i = 0; i < tList.length; i++) {
            if (tList[i] == ticketId) {
                tList[i] = tList[tList.length - 1];
                tList.pop();
                break;
            }
        }
    }
}
