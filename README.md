# Blockchain-Based Event Ticket Verification System

A decentralized event ticketing application featuring on-chain ticket issuance, ownership transfer, and entry verification.

## 🏗 Project Architecture

- **Blockchain**: Solidity Smart Contract (`TicketVerification.sol`) managed with Hardhat.
- **Backend**: Node.js & Express API for server-side blockchain interaction.
- **Frontend**: React (Vite) with Tailwind CSS v4, featuring a modern glassmorphism UI.

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MetaMask](https://metamask.io/) extension with Sepolia Testnet ETH

### 1. Blockchain (Contracts)
```bash
cd blockchain
npm install
# Setup .env with SEPOLIA_RPC_URL and PRIVATE_KEY
npm run deploy
```

### 2. Backend (API)
```bash
cd server
npm install
# Setup .env with CONTRACT_ADDRESS, SEPOLIA_RPC_URL, and PRIVATE_KEY
npm run dev
```

### 3. Frontend (UI)
```bash
cd client
npm install
# Setup .env with VITE_CONTRACT_ADDRESS
npm run dev
```

## 🛠 Features
- **Minting**: Unique tickets generated on-chain.
- **Transfers**: Peer-to-peer ticket transfer via wallet address.
- **Verification**: Instant QR-based or ID-based verification.
- **Security**: Permanent "Used" status marks to prevent double-entry.
- **UI**: High-performance dark-mode interface with glassmorphism aesthetics.


