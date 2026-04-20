const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TicketVerificationModule", (m) => {
  const ticketVerification = m.contract("TicketVerification");
  return { ticketVerification };
});
