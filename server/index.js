require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const { ABI } = require("./contractABI");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Provider & Contract Setup ─────────────────────────────────────────────────
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);
const readContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, provider);

// ─── Helper ────────────────────────────────────────────────────────────────────
function bigIntToStr(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)));
}

// ─── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /create-event
 * Body: { name, date (unix timestamp), ticketPrice (in ETH), ticketLimit }
 */
app.post("/create-event", async (req, res) => {
  try {
    const { name, date, ticketPrice, ticketLimit } = req.body;
    if (!name || !date || ticketPrice === undefined || !ticketLimit) {
      return res.status(400).json({ error: "Missing required fields: name, date, ticketPrice, ticketLimit" });
    }

    const priceWei = ethers.parseEther(ticketPrice.toString());
    const tx = await contract.createEvent(name, BigInt(date), priceWei, BigInt(ticketLimit));
    const receipt = await tx.wait();

    // Parse EventCreated event
    const eventLog = receipt.logs.find(
      (log) => log.topics[0] === ethers.id("EventCreated(uint256,string,address)")
    );
    const parsed = eventLog ? contract.interface.parseLog(eventLog) : null;
    const eventId = parsed ? parsed.args[0].toString() : null;

    res.json({ success: true, txHash: tx.hash, eventId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.reason || err.message });
  }
});

/**
 * POST /mint-ticket
 * Body: { eventId, ticketPrice (in ETH), buyerAddress }
 * Note: Backend wallet mints on behalf of buyer for demo (in production user signs)
 */
app.post("/mint-ticket", async (req, res) => {
  try {
    const { eventId, ticketPrice } = req.body;
    if (!eventId || ticketPrice === undefined) {
      return res.status(400).json({ error: "Missing required fields: eventId, ticketPrice" });
    }

    const priceWei = ethers.parseEther(ticketPrice.toString());
    const tx = await contract.mintTicket(BigInt(eventId), { value: priceWei });
    const receipt = await tx.wait();

    // Parse TicketMinted event
    const eventLog = receipt.logs.find(
      (log) => log.topics[0] === ethers.id("TicketMinted(uint256,uint256,address)")
    );
    const parsed = eventLog ? contract.interface.parseLog(eventLog) : null;
    const ticketId = parsed ? parsed.args[0].toString() : null;

    res.json({ success: true, txHash: tx.hash, ticketId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.reason || err.message });
  }
});

/**
 * POST /transfer-ticket
 * Body: { ticketId, to }
 */
app.post("/transfer-ticket", async (req, res) => {
  try {
    const { ticketId, to } = req.body;
    if (!ticketId || !to) {
      return res.status(400).json({ error: "Missing required fields: ticketId, to" });
    }

    const tx = await contract.transferTicket(BigInt(ticketId), to);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.reason || err.message });
  }
});

/**
 * GET /verify-ticket/:ticketId
 */
app.get("/verify-ticket/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const result = await readContract.verifyTicket(BigInt(ticketId));
    const [tId, eventId, owner, timestamp, isUsed, isValid] = result;

    res.json(bigIntToStr({
      ticketId: tId,
      eventId,
      owner,
      timestamp,
      isUsed,
      isValid
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.reason || err.message });
  }
});

/**
 * POST /use-ticket
 * Body: { ticketId }
 */
app.post("/use-ticket", async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ error: "Missing required field: ticketId" });
    }

    const tx = await contract.useTicket(BigInt(ticketId));
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.reason || err.message });
  }
});

/**
 * GET /events/:eventId
 */
app.get("/events/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const ev = await readContract.events(BigInt(eventId));
    const [id, name, date, ticketPrice, ticketLimit, ticketsSold, organizer, exists] = ev;
    res.json(bigIntToStr({ eventId: id, name, date, ticketPrice, ticketLimit, ticketsSold, organizer, exists }));
  } catch (err) {
    res.status(500).json({ error: err.reason || err.message });
  }
});

/**
 * GET /events
 */
app.get("/events", async (req, res) => {
  try {
    const count = await readContract.getEventCount();
    const events = [];
    for (let i = 1; i <= Number(count); i++) {
      const ev = await readContract.events(BigInt(i));
      const [id, name, date, ticketPrice, ticketLimit, ticketsSold, organizer, exists] = ev;
      if (exists) {
        events.push(bigIntToStr({ eventId: id, name, date, ticketPrice, ticketLimit, ticketsSold, organizer, exists }));
      }
    }
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.reason || err.message });
  }
});

/**
 * GET /user-tickets/:address
 */
app.get("/user-tickets/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const ids = await readContract.getUserTickets(address);
    const tickets = [];
    for (const id of ids) {
      const t = await readContract.tickets(id);
      const [ticketId, eventId, owner, timestamp, isUsed, exists] = t;
      if (exists) {
        tickets.push(bigIntToStr({ ticketId, eventId, owner, timestamp, isUsed, exists }));
      }
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.reason || err.message });
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
