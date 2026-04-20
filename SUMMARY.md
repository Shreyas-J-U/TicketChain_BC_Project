# Blockchain-Based Event Ticket Verification System

## Problem Statement
Traditional event ticketing systems face several critical challenges:
- **Ticket Fraud and Scalping:** Physical tickets can be duplicated, forged, or resold at inflated prices, leading to unauthorized entry and financial losses for event organizers.
- **Lack of Transparency:** Centralized systems make it difficult to verify ticket authenticity and ownership, creating opportunities for fraud.
- **No Transfer Control:** Once purchased, tickets can be transferred without proper tracking or validation.
- **Double Entry Prevention:** Without proper verification mechanisms, tickets can be used multiple times.
- **Trust Issues:** Users and organizers lack confidence in the ticketing process due to potential manipulation by intermediaries.
- **High Fees and Intermediaries:** Traditional platforms charge high service fees and introduce unnecessary middlemen.

## Proposed Solution
A decentralized blockchain-based event ticketing system that leverages Ethereum smart contracts to:
- Issue unique, non-duplicable digital tickets as blockchain assets
- Enable secure peer-to-peer ticket transfers
- Provide instant verification of ticket ownership and validity
- Implement permanent "used" status to prevent ticket reuse
- Eliminate intermediaries through direct blockchain transactions
- Ensure transparency and immutability of all ticket-related operations

## Methods Used

### Smart Contract Architecture
- **Solidity Programming:** Writing secure, audited smart contract code
- **Struct-based Data Modeling:** Using `Event` and `Ticket` structs to represent complex data
- **Mapping Storage:** Efficient key-value storage for events, tickets, and user relationships
- **Access Control Modifiers:** Implementing role-based permissions (organizer-only functions)
- **Event Emission:** Logging important state changes for off-chain monitoring

### Backend API Design
- **RESTful API:** Clean HTTP endpoints for contract interaction
- **Transaction Handling:** Managing blockchain transactions with proper error handling
- **Data Serialization:** Converting blockchain data types to JSON-compatible formats

### Frontend User Experience
- **Wallet Integration:** MetaMask connection for user authentication and transactions
- **Reactive UI:** Real-time updates based on blockchain state changes
- **QR Code Generation:** Visual ticket representation for easy verification

### Development Workflow
- **Test-Driven Development:** Writing and deploying contracts to testnet first
- **Iterative Deployment:** Step-by-step integration from blockchain to frontend
- **Environment Management:** Secure handling of private keys and network configurations

## Technology Used

### Blockchain Layer
- **Ethereum Sepolia Testnet:** Public test network for development and testing
- **Solidity 0.8.20:** Smart contract programming language
- **Hardhat:** Development environment for compiling, testing, and deploying contracts
- **Ethers.js:** JavaScript library for blockchain interaction

### Backend Layer
- **Node.js:** JavaScript runtime for server-side development
- **Express.js:** Web framework for building REST APIs
- **CORS:** Cross-origin resource sharing for frontend communication
- **Dotenv:** Environment variable management

### Frontend Layer
- **React 18:** Component-based UI framework
- **Vite:** Fast build tool and development server
- **Tailwind CSS v4:** Utility-first CSS framework with glassmorphism design
- **React Router:** Client-side routing for single-page application
- **Lucide React:** Icon library for UI elements
- **QRCode.js:** QR code generation library

### Development Tools
- **MetaMask:** Browser wallet for Ethereum transactions
- **Visual Studio Code:** Integrated development environment
- **Git:** Version control system
- **NPM:** Package management

## Implementation Details

### Smart Contract Implementation (`TicketVerification.sol`)
The core smart contract implements the following key components:

**Data Structures:**
```solidity
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
```

**State Management:**
- Event and ticket counters for unique ID generation
- Mappings for efficient data retrieval:
  - `events[eventId]` → Event details
  - `tickets[ticketId]` → Ticket details
  - `userTickets[owner]` → User's ticket IDs
  - `eventTickets[eventId]` → Event's ticket IDs

**Core Functions:**
- `createEvent()`: Organizer creates new events with parameters
- `mintTicket()`: Users purchase tickets with ETH payment
- `transferTicket()`: Peer-to-peer ticket transfers
- `verifyTicket()`: Read-only ticket validation
- `useTicket()`: Organizer marks tickets as used
- `getUserTickets()`: Retrieve user's ticket portfolio
- `getEventTickets()`: Get all tickets for an event

**Security Features:**
- Access modifiers restrict functions to authorized users
- Payment validation ensures correct ticket pricing
- Transfer restrictions prevent invalid operations
- Usage tracking prevents double-entry

### Backend Implementation (`index.js`)
The Express server acts as a bridge between frontend and blockchain:

**API Endpoints:**
- `POST /create-event`: Create new events
- `POST /mint-ticket`: Purchase tickets
- `POST /transfer-ticket`: Transfer ticket ownership
- `GET /verify-ticket/:ticketId`: Check ticket validity
- `POST /use-ticket`: Mark ticket as used
- `GET /events`: List all events
- `GET /events/:eventId`: Get specific event details
- `GET /user-tickets/:address`: Get user's tickets

**Contract Interaction:**
- Read contract for view functions (verification, data retrieval)
- Write contract with signer for state-changing operations
- Error handling and transaction confirmation
- BigInt conversion for JSON serialization

### Frontend Implementation (React + Vite)
The user interface provides an intuitive experience:

**Key Components:**
- **Wallet Connection:** MetaMask integration for user authentication
- **Event Management:** Create and display events
- **Ticket Purchase:** Buy tickets with ETH payment
- **Ticket Management:** View owned tickets, transfer ownership
- **Verification Interface:** QR code display and validation

**State Management:**
- React hooks for local state management
- Real-time updates from blockchain
- Error handling and user feedback

**UI/UX Features:**
- Glassmorphism design with Tailwind CSS
- Responsive layout for mobile and desktop
- Dark mode interface
- Loading states and transaction feedback

## Event Workflow

1. **Event Creation Phase**
   - Organizer connects MetaMask wallet
   - Navigates to "Create Event" page
   - Enters event details (name, date, price, limit)
   - Submits transaction to `createEvent()` function
   - Event is recorded on blockchain with organizer as owner

2. **Ticket Purchase Phase**
   - User connects MetaMask wallet
   - Browses available events on home page
   - Selects event and clicks "Buy Ticket"
   - Approves ETH payment in MetaMask
   - Smart contract mints unique ticket
   - Ticket ownership assigned to user's wallet
   - Ticket appears in user's "My Tickets" page

3. **Ticket Transfer Phase (Optional)**
   - Ticket owner views ticket details
   - Enters recipient's wallet address
   - Initiates transfer transaction
   - Smart contract updates ownership
   - Ticket removed from sender's list, added to receiver's list

4. **Event Entry Verification Phase**
   - At event venue, attendee shows ticket (QR code or ID)
   - Event staff enters ticket ID in verification system
   - Backend calls `verifyTicket()` function
   - System checks:
     - Ticket exists
     - Ticket not already used
     - Ticket belongs to valid event
   - If valid, staff marks ticket as used via `useTicket()`
   - Attendee granted entry

5. **Post-Event Phase**
   - Used tickets cannot be transferred or reused
   - Event data remains permanently on blockchain
   - Organizers can view complete ticket sales and usage data
   - Transparent audit trail for all transactions

## Detailed Synopsis of the Whole Project

**Project Overview**
This project implements a complete decentralized event ticketing ecosystem that addresses the shortcomings of traditional ticketing systems through blockchain technology. By leveraging Ethereum smart contracts, the system ensures transparency, security, and trustlessness in event ticket management.

**Architecture Layers**
- **Blockchain Layer (Foundation):** The Solidity smart contract serves as the immutable backbone, storing all event and ticket data on-chain. It enforces business logic, handles payments, and provides public verification functions.
- **Backend Layer (Bridge):** The Node.js Express API provides a RESTful interface for frontend applications to interact with the blockchain. It manages wallet connections, transaction signing, and data formatting.
- **Frontend Layer (Interface):** The React application offers an intuitive user experience with MetaMask integration, allowing users to seamlessly interact with the blockchain through familiar web interfaces.

**Key Innovations**
- **Immutable Ticket Ownership:** Tickets exist as blockchain assets with provable ownership
- **Preventable Double-Entry:** Smart contract enforces single-use tickets
- **Peer-to-Peer Transfers:** Direct wallet-to-wallet ticket trading without intermediaries
- **Instant Verification:** On-chain verification eliminates fraud possibilities
- **Transparent Pricing:** Direct payment to organizers reduces fees

**Security Considerations**
- **Access Control:** Modifiers ensure only authorized operations
- **Payment Security:** Smart contract handles ETH transfers securely
- **State Validation:** All operations check prerequisites before execution
- **Immutability:** Blockchain ensures transaction history cannot be altered

**Scalability and Performance**
- **Gas Optimization:** Efficient Solidity code minimizes transaction costs
- **Off-Chain Storage:** Event metadata can be stored off-chain if needed
- **Batch Operations:** Potential for batch ticket minting and verification
- **Layer 2 Solutions:** Future upgrade path to cheaper networks

**Educational Value**
This project demonstrates:
- Smart contract development best practices
- Decentralized application architecture
- Web3 integration patterns
- Blockchain security principles
- Full-stack blockchain development workflow

**Future Enhancements**
Potential improvements include:
- NFT-based tickets with visual designs
- Dynamic pricing mechanisms
- Secondary market integration
- Multi-event packages
- Mobile application development
- Cross-chain compatibility

**Deployment and Testing**
The system is deployed on Ethereum Sepolia testnet, allowing for safe testing without real value transactions. The modular architecture enables easy migration to mainnet or other blockchain networks.

This comprehensive solution provides a robust, secure, and user-friendly alternative to traditional event ticketing systems, leveraging the power of blockchain technology to create trust and transparency in the events industry.
