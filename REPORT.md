# Project Report: Blockchain-Based Event Ticket Verification System

## 1) Project Overview

This project implements a decentralized event ticketing platform with on-chain ticket minting, transfer, verification, and usage tracking.

Key goals:

- Create event listings on the blockchain
- Mint unique tickets as blockchain assets
- Transfer tickets between wallets
- Verify ticket ownership and use status
- Prevent ticket reuse by marking tickets as `used`

---

## 2) Repository Structure

- `blockchain/`
  - `contracts/TicketVerification.sol` — Solidity smart contract
  - `hardhat.config.js` — Hardhat config for Sepolia
  - `package.json` — blockchain scripts
  - `ignition/` — deployment artifacts and module
- `client/`
  - `src/` — React app source
  - `utils/contract.js` — front-end contract ABI + helper
  - `package.json` — front-end dependencies and scripts
- `server/`
  - `index.js` — Express API server
  - `contractABI.js` — contract ABI used by backend
  - `package.json` — backend dependencies and scripts
- `Implementation.md` — project prompt and feature requirements
- `README.md` — summary and quick instructions

---

## 3) Blockchain Implementation

### Smart contract

File: `blockchain/contracts/TicketVerification.sol`

Primary state:

- `Event` struct
  - `eventId`, `name`, `date`, `ticketPrice`, `ticketLimit`, `ticketsSold`, `organizer`, `exists`
- `Ticket` struct
  - `ticketId`, `eventId`, `owner`, `timestamp`, `isUsed`, `exists`

Mappings:

- `events[eventId]`
- `tickets[ticketId]`
- `userTickets[owner]`
- `eventTickets[eventId]`

Important functions:

- `createEvent(string name, uint256 date, uint256 ticketPrice, uint256 ticketLimit)`
- `mintTicket(uint256 eventId)`
- `transferTicket(uint256 ticketId, address to)`
- `verifyTicket(uint256 ticketId)`
- `useTicket(uint256 ticketId)`
- `getUserTickets(address user)`
- `getEventTickets(uint256 eventId)`

Security / business logic:

- Only event organizer may create and mark tickets as used
- Tickets cannot be transferred to zero address or self
- Tickets cannot be used more than once
- `mintTicket` refunds excess payment and forwards price to organizer

Hardhat config:

- `solidity: "0.8.20"`
- Sepolia network using:
  - `SEPOLIA_RPC_URL`
  - `PRIVATE_KEY`

Scripts:

- `npm run compile`
- `npm run deploy`

---

## 4) Backend Implementation

File: `server/index.js`

Backend responsibilities:

- Connect to Ethereum Sepolia via `ethers`
- Provide REST API to interact with contract
- Use wallet from `PRIVATE_KEY` for write operations

Key routes:

- `POST /create-event`
- `POST /mint-ticket`
- `POST /transfer-ticket`
- `GET /verify-ticket/:ticketId`
- `POST /use-ticket`
- `GET /events/:eventId`
- `GET /events`
- `GET /user-tickets/:address`

Contract setup:

- `readContract` for view calls
- `contract` with wallet signer for transactions

Helper:

- `bigIntToStr()` converts BigInt results to JSON-friendly strings

Backend dependencies:

- `express`
- `cors`
- `dotenv`
- `ethers`

---

## 5) Frontend Implementation

Folder: `client/src`

Contract helper:

- `client/src/utils/contract.js`
- Exposes `getReadContract()` and `getWriteContract()`
- Uses MetaMask browser provider via `ethers`

Front-end stack:

- React + Vite
- Tailwind CSS
- `qrcode` for QR generation
- `react-router-dom` for routing
- `lucide-react` for icons

Expected pages from repo structure:

- `Home.jsx`
- `CreateEvent.jsx`
- `BuyTicket.jsx`
- `MyTickets.jsx`
- `VerifyTicket.jsx`

Front-end responsibilities:

- Connect MetaMask
- Display wallet address
- Fetch and display events
- Mint ticket with payment
- Transfer tickets
- Show owned tickets and verify status

---

## 6) Build & Run Instructions

### 6.1 Blockchain

```powershell
cd "E:\6th Semester\BlockChain\Project\blockchain"
npm install
```

Create `.env`:

- `SEPOLIA_RPC_URL=<your-sepolia-rpc-url>`
- `PRIVATE_KEY=<your-wallet-private-key>`

Then:

```powershell
npm run compile
npm run deploy
```

---

### 6.2 Backend

```powershell
cd "E:\6th Semester\BlockChain\Project\server"
npm install
```

Create `.env`:

- `SEPOLIA_RPC_URL=<your-sepolia-rpc-url>`
- `PRIVATE_KEY=<backend-wallet-private-key>`
- `CONTRACT_ADDRESS=<deployed-contract-address>`
- `PORT=5000` (optional)

Then:

```powershell
npm run dev
```

---

### 6.3 Frontend

```powershell
cd "E:\6th Semester\BlockChain\Project\client"
npm install
```

Create `.env`:

- `VITE_CONTRACT_ADDRESS=<deployed-contract-address>`

Then:

```powershell
npm run dev
```

---

## 7) Tools & Technologies Used

- Ethereum Smart Contract development:
  - Solidity
  - Hardhat
  - Sepolia testnet
- Backend:
  - Node.js
  - Express
  - ethers.js
- Frontend:
  - React
  - Vite
  - Tailwind CSS
  - MetaMask wallet integration
- Utilities:
  - dotenv
  - qrcode
  - CORS

---

## 8) User Workflow

1. **Organizer creates event**
   - Backend calls `createEvent`
   - Event saved on-chain

2. **Buyer purchases ticket**
   - User connects MetaMask
   - Sends payment to `mintTicket`
   - Ticket minted and owned by buyer wallet

3. **User transfers ticket**
   - `transferTicket` updates ticket owner on-chain

4. **Verifier checks ticket**
   - Backend calls `verifyTicket`
   - Returns owner, used status, event ID

5. **Organizer marks ticket used**
   - `useTicket` sets `isUsed = true`

---

## 9) Important Notes

- The backend currently mints and transfers using the wallet from `PRIVATE_KEY`; for production, user-side signing should be used directly from MetaMask.
- The smart contract prevents reuse by requiring `ticketNotUsed` before transfer/use.
- If you deploy the contract again, update `CONTRACT_ADDRESS` in both backend `.env` and frontend `.env`.
