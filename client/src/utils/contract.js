// Contract ABI & address helper for the frontend (MetaMask/ethers.js direct interaction)
import { ethers, BrowserProvider } from "ethers";
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const ABI = [
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "eventId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "address", "name": "organizer", "type": "address" }], "name": "EventCreated", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "ticketId", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "eventId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "owner", "type": "address" }], "name": "TicketMinted", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "ticketId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "address", "name": "to", "type": "address" }], "name": "TicketTransferred", "type": "event" },
  { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "ticketId", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "eventId", "type": "uint256" }], "name": "TicketUsed", "type": "event" },
  { "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "uint256", "name": "date", "type": "uint256" }, { "internalType": "uint256", "name": "ticketPrice", "type": "uint256" }, { "internalType": "uint256", "name": "ticketLimit", "type": "uint256" }], "name": "createEvent", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "events", "outputs": [{ "internalType": "uint256", "name": "eventId", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "uint256", "name": "date", "type": "uint256" }, { "internalType": "uint256", "name": "ticketPrice", "type": "uint256" }, { "internalType": "uint256", "name": "ticketLimit", "type": "uint256" }, { "internalType": "uint256", "name": "ticketsSold", "type": "uint256" }, { "internalType": "address", "name": "organizer", "type": "address" }, { "internalType": "bool", "name": "exists", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getEventCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "eventId", "type": "uint256" }], "name": "getEventTickets", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getTicketCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getUserTickets", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "eventId", "type": "uint256" }], "name": "mintTicket", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "tickets", "outputs": [{ "internalType": "uint256", "name": "ticketId", "type": "uint256" }, { "internalType": "uint256", "name": "eventId", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "bool", "name": "isUsed", "type": "bool" }, { "internalType": "bool", "name": "exists", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "ticketId", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }], "name": "transferTicket", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "ticketId", "type": "uint256" }], "name": "useTicket", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "ticketId", "type": "uint256" }], "name": "verifyTicket", "outputs": [{ "internalType": "uint256", "name": "tId", "type": "uint256" }, { "internalType": "uint256", "name": "eventId", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "bool", "name": "isUsed", "type": "bool" }, { "internalType": "bool", "name": "isValid", "type": "bool" }], "stateMutability": "view", "type": "function" }
];

/**
 * Get a read-only contract instance (no signer needed)
 */
export async function getReadContract() {
  const provider = new BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

/**
 * Get a write contract instance (requires MetaMask signer)
 */
export async function getWriteContract() {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}
