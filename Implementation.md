# Project Prompt: Blockchain-Based Event Ticket Verification System

Build a **Blockchain-Based Event Ticket Verification System** using the following stack:

## Tech Stack

Frontend:

- React (Vite)
- Tailwind CSS (for UI)

Backend:

- Node.js
- Express.js

Blockchain:

- Solidity Smart Contracts
- Hardhat Development Environment
- Ethereum Sepolia Testnet

Wallet Integration:

- MetaMask

Libraries:

- ethers.js (for blockchain interaction)
- dotenv (for environment variables)
- qrcode (for ticket QR generation)

---

# Project Goal

Develop a decentralized event ticket system that:

- Issues unique blockchain-based tickets
- Prevents duplicate tickets
- Allows ownership transfer
- Verifies tickets at event entry
- Marks tickets as used to prevent reuse

---

# System Architecture

Frontend (React Vite)

↓

Backend (Node.js API)

↓

Smart Contract (Solidity)

↓

Ethereum Sepolia Blockchain

↓

MetaMask Wallet

---

# Core Features

## 1. Event Management

Organizer should be able to:

- Create Event
- Set event name
- Set date
- Set ticket price
- Set ticket limit

---

## 2. Ticket Minting

Each ticket should store:

- Ticket ID
- Event ID
- Owner wallet address
- Timestamp
- Used status

---

## 3. Ticket Purchase

User flow:

1. Connect MetaMask
2. Buy ticket
3. Smart contract mints ticket
4. Ownership assigned to wallet

---

## 4. Ticket Transfer

Users should be able to:

- Transfer ticket to another wallet address
- Update ownership on blockchain

---

## 5. Ticket Verification

Organizer should:

- Enter Ticket ID
- Verify ticket validity
- Check owner address
- Check if ticket used

---

## 6. Ticket Usage

At event entry:

- Verify ticket
- Mark ticket as used
- Prevent reuse

---

# Smart Contract Requirements

Create Solidity smart contract:

Contract Name:

TicketVerification.sol

Functions Required:

- createEvent()
- mintTicket()
- transferTicket()
- verifyTicket()
- useTicket()
- getUserTickets()

Use:

- struct
- mapping
- modifiers
- events

Ticket Struct

Include:

- ticketId
- eventId
- owner
- isUsed
- timestamp

---

# Backend Requirements

Create Node.js Express API:

Endpoints:

POST /create-event
POST /mint-ticket
POST /transfer-ticket
GET /verify-ticket/:ticketId
POST /use-ticket

Backend Responsibilities:

- Connect to blockchain using ethers.js
- Call smart contract functions
- Handle wallet transactions

---

# Frontend Requirements

Create React Vite app with pages:

Pages:

Home Page
Create Event Page
Buy Ticket Page
My Tickets Page
Verify Ticket Page

Features:

- Connect MetaMask
- Show wallet address
- Display user tickets
- QR code generation
- Ticket transfer UI

---

# Folder Structure

Create project structure:

```bash
blockchain-ticket-system/
│
├── frontend/
│   └── React Vite
│
├── backend/
│   └── Node Express
│
├── blockchain/
│   └── Hardhat project
│
└── README.md
```

---

# Blockchain Setup

Use:

Hardhat

Network:

Ethereum Sepolia

Include:

- deploy script
- contract ABI export
- environment variables

---

# Security Requirements

Implement:

- Modifier for organizer only functions
- Prevent double usage of ticket
- Validate ticket ownership before transfer

---

# Demonstration Flow

1. Organizer creates event
2. User connects MetaMask
3. User buys ticket
4. Ticket minted on blockchain
5. QR generated
6. Ticket verified
7. Ticket marked used
8. Reuse prevented

---

# Additional Features (Optional but Preferred)

- QR Code generation
- Ticket ownership history
- Event dashboard
- Transaction history

---

# Deliverables

Build:

- Smart contract
- Backend API
- React frontend
- Deployment scripts
- README instructions

---

# Constraints

Keep implementation:

- Simple
- Educational
- Syllabus-aligned
- Sepolia testnet only

Do not use:

- NFTs marketplace complexity
- IPFS (optional only if simple)
- Advanced Web3 frameworks

---

# Expected Outcome

A working DApp where:

- Tickets are issued on blockchain
- Tickets cannot be duplicated
- Ownership is traceable
- Tickets can be verified at entry

---

Build step-by-step:

1. Smart Contract
2. Deploy to Sepolia
3. Backend integration
4. Frontend UI
5. Full testing

---
