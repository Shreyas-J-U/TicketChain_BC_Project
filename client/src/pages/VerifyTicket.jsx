import { useState } from "react";
import { getReadContract, getWriteContract } from "../utils/contract";
import { useWallet } from "../hooks/useWallet";
import { ethers } from "ethers";
import { Shield, Search, CheckCircle, XCircle, AlertCircle, Stamp } from "lucide-react";

export default function VerifyTicket() {
  const { account, connect } = useWallet();
  const [ticketId, setTicketId] = useState("");
  const [ticketData, setTicketData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [usingTicket, setUsingTicket] = useState(false);
  const [useResult, setUseResult] = useState(null);
  const [useErr, setUseErr] = useState("");

  const handleVerify = async () => {
    if (!ticketId) return;
    setLoading(true); setErr(""); setTicketData(null); setEventData(null); setUseResult(null);
    try {
      const contract = await getReadContract();
      const result = await contract.verifyTicket(BigInt(ticketId));
      const [tId, evId, owner, timestamp, isUsed, isValid] = result;

      const td = {
        ticketId: tId.toString(), eventId: evId.toString(), owner,
        timestamp: timestamp.toString(), isUsed, isValid
      };
      setTicketData(td);

      // Also load event info
      const ev = await contract.events(BigInt(evId.toString()));
      const [id, name, date, ticketPrice, ticketLimit, ticketsSold, organizer, exists] = ev;
      setEventData({ name, date: date.toString(), ticketPrice: ticketPrice.toString(), organizer });
    } catch (e) {
      setErr(e.reason || e.message || "Could not verify ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleUseTicket = async () => {
    if (!account) { await connect(); return; }
    setUsingTicket(true); setUseErr(""); setUseResult(null);
    try {
      const contract = await getWriteContract();
      const tx = await contract.useTicket(BigInt(ticketId));
      await tx.wait();
      setUseResult(tx.hash);
      // Refresh
      await handleVerify();
    } catch (e) {
      setUseErr(e.reason || e.message || "Failed to mark as used");
    } finally {
      setUsingTicket(false);
    }
  };

  const isOrganizer = ticketData && eventData && account &&
    account.toLowerCase() === eventData.organizer.toLowerCase();

  return (
    <div className="app-bg" style={{ minHeight: "100vh" }}>
      <div className="page">
        <div className="fade-in">
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Verify Ticket</h1>
          <p style={{ color: "#94a3b8", marginBottom: 32, fontSize: 15 }}>
            Check ticket validity and mark as used at event entry
          </p>

          {/* Search */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
            <label className="form-label" htmlFor="verify-ticket-id">Ticket ID</label>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Shield size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6366f1" }} />
                <input
                  id="verify-ticket-id" type="number" min="1" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="Enter ticket ID…" value={ticketId}
                  onChange={e => setTicketId(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleVerify()}
                />
              </div>
              <button id="verify-btn" className="btn-primary" onClick={handleVerify} disabled={loading || !ticketId}>
                {loading ? <span className="spinner" /> : <Search size={15} />}
                {loading ? "Verifying…" : "Verify"}
              </button>
            </div>
            {err && <div className="alert alert-error"><AlertCircle size={15} /> {err}</div>}
          </div>

          {/* Result */}
          {ticketData && (
            <div className="fade-in">
              {/* Status Banner */}
              <div style={{
                padding: "20px 24px", borderRadius: 14, marginBottom: 24,
                display: "flex", alignItems: "center", gap: 16,
                background: ticketData.isUsed
                  ? "rgba(239,68,68,0.1)" : ticketData.isValid
                  ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                border: `1px solid ${ticketData.isUsed ? "rgba(239,68,68,0.3)" : ticketData.isValid ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}>
                {ticketData.isUsed
                  ? <XCircle size={36} color="#ef4444" />
                  : ticketData.isValid
                  ? <CheckCircle size={36} color="#10b981" />
                  : <AlertCircle size={36} color="#f59e0b" />
                }
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                    {ticketData.isUsed ? "Ticket Already Used" : ticketData.isValid ? "✓ Ticket Valid" : "⚠ Invalid Ticket"}
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    {ticketData.isUsed
                      ? "This ticket has already been scanned and cannot be reused."
                      : ticketData.isValid
                      ? "This ticket is valid and has not been used."
                      : "This ticket does not exist or is invalid."
                    }
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
                {/* Ticket Info */}
                <div className="glass-card" style={{ padding: 28 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Ticket Details</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      ["Ticket ID", `#${ticketData.ticketId}`],
                      ["Event ID", `#${ticketData.eventId}`],
                      ["Event Name", eventData?.name || "—"],
                      ["Event Date", eventData ? new Date(Number(eventData.date) * 1000).toLocaleString() : "—"],
                      ["Minted", new Date(Number(ticketData.timestamp) * 1000).toLocaleString()],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
                        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{k}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ paddingBottom: 12 }}>
                      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>Owner</div>
                      <div style={{ fontSize: 12, color: "#a5b4fc", fontFamily: "monospace", wordBreak: "break-all" }}>{ticketData.owner}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {!ticketData.isUsed && ticketData.isValid && (
                    <div className="glass-card" style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Mark as Used</h3>
                      <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, lineHeight: 1.6 }}>
                        {isOrganizer
                          ? "As the event organizer, you can mark this ticket as used at entry."
                          : "Only the event organizer can mark this ticket as used."}
                      </p>
                      {!account ? (
                        <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={connect}>
                          Connect Wallet
                        </button>
                      ) : (
                        <button id="use-ticket-btn" className="btn-danger"
                          style={{ width: "100%", justifyContent: "center", padding: 11 }}
                          onClick={handleUseTicket} disabled={usingTicket || !isOrganizer}>
                          {usingTicket ? <><span className="spinner" /> Processing…</> : <><Stamp size={15} /> Mark as Used</>}
                        </button>
                      )}
                      {!isOrganizer && account && (
                        <p style={{ fontSize: 12, color: "#64748b", marginTop: 10, textAlign: "center" }}>
                          Connected as non-organizer
                        </p>
                      )}
                      {useResult && <div className="alert alert-success"><CheckCircle size={14} /> Ticket marked as used!</div>}
                      {useErr && <div className="alert alert-error"><AlertCircle size={14} /> {useErr}</div>}
                    </div>
                  )}

                  <div className="glass-card" style={{ padding: 20, background: "rgba(99,102,241,0.06)", borderColor: "rgba(99,102,241,0.2)" }}>
                    <Shield size={18} color="#6366f1" style={{ marginBottom: 10 }} />
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>On-Chain Verification</h4>
                    <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                      This data is fetched directly from the Ethereum Sepolia blockchain and cannot be tampered with.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
