const { ethers } = require("ethers");
require("dotenv").config();
const { ABI } = require("./contractABI");

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, provider);

    try {
        console.log("Fetching Event ID 1...");
        const ev = await contract.events(1);
        console.log("Event Details:");
        console.log("ID:", ev.eventId.toString());
        console.log("Name:", ev.name);
        console.log("Price (Wei):", ev.ticketPrice.toString());
        console.log("Price (ETH):", ethers.formatEther(ev.ticketPrice));
        console.log("Organizer:", ev.organizer);
        console.log("Exists:", ev.exists);
    } catch (err) {
        console.error("Error fetching event:", err.message);
    }
}

main();
