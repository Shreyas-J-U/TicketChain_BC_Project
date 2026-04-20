import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { getWriteContract } from "../utils/contract";
import { ethers } from "ethers";
import { CalendarDays, Tag, Hash, DollarSign, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function CreateEvent() {
  const { account, connect } = useWallet();
  const [form, setForm] = useState({ name: "", date: "", ticketPrice: "", ticketLimit: "" });
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!account) { await connect(); return; }

    setStatus("loading"); setErr(""); setResult(null);
    try {
      const contract = await getWriteContract();
      const dateUnix = Math.floor(new Date(form.date).getTime() / 1000);
      const priceWei = ethers.parseEther(form.ticketPrice);
      const limit = BigInt(form.ticketLimit);

      const tx = await contract.createEvent(form.name, BigInt(dateUnix), priceWei, limit);
      setStatus("loading");
      const receipt = await tx.wait();

      // Find EventCreated log
      const iface = contract.interface;
      let eventId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed?.name === "EventCreated") { eventId = parsed.args[0].toString(); break; }
        } catch {}
      }

      setResult({ txHash: tx.hash, eventId });
      setStatus("success");
      setForm({ name: "", date: "", ticketPrice: "", ticketLimit: "" });
    } catch (e) {
      setErr(e.reason || e.message || "Transaction failed");
      setStatus("error");
    }
  };

  return (
    <div className="app-bg" style={{ minHeight: "100vh" }}>
      <div className="page">
        <div className="fade-in">
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Create Event</h1>
          <p style={{ color: "#94a3b8", marginBottom: 32, fontSize: 15 }}>
            Deploy a new event on the Ethereum Sepolia blockchain
          </p>

          {!account && (
            <div className="alert alert-info" style={{ marginBottom: 24 }}>
              <AlertCircle size={16} />
              Connect your MetaMask wallet to create an event.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
            {/* ── Form ── */}
            <form className="glass-card" style={{ padding: 32 }} onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Event Name</label>
                <div style={{ position: "relative" }}>
                  <Tag size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6366f1" }} />
                  <input id="name" name="name" className="form-input" style={{ paddingLeft: 36 }}
                    placeholder="e.g. ETH Mumbai 2025" value={form.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="date">Event Date & Time</label>
                <div style={{ position: "relative" }}>
                  <CalendarDays size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6366f1" }} />
                  <input id="date" name="date" type="datetime-local" className="form-input" style={{ paddingLeft: 36 }}
                    value={form.date} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ticketPrice">Ticket Price (ETH)</label>
                <div style={{ position: "relative" }}>
                  <DollarSign size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6366f1" }} />
                  <input id="ticketPrice" name="ticketPrice" type="number" step="0.001" min="0" className="form-input" style={{ paddingLeft: 36 }}
                    placeholder="0.01" value={form.ticketPrice} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ticketLimit">Ticket Limit</label>
                <div style={{ position: "relative" }}>
                  <Hash size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6366f1" }} />
                  <input id="ticketLimit" name="ticketLimit" type="number" min="1" className="form-input" style={{ paddingLeft: 36 }}
                    placeholder="100" value={form.ticketLimit} onChange={handleChange} required />
                </div>
              </div>

              <button id="create-event-btn" type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "13px" }}
                disabled={status === "loading"}>
                {status === "loading" ? <><span className="spinner" /> Creating Event…</> : <><CheckCircle size={16} /> Create Event on Blockchain</>}
              </button>

              {status === "success" && result && (
                <div className="alert alert-success">
                  <CheckCircle size={16} />
                  <div>
                    <strong>Event Created! 🎉</strong><br />
                    <span style={{ fontSize: 12 }}>Event ID: <strong>#{result.eventId}</strong></span><br />
                    <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: 12, color: "#34d399", wordBreak: "break-all" }}>
                      View on Etherscan ↗
                    </a>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="alert alert-error">
                  <AlertCircle size={16} /> {err}
                </div>
              )}
            </form>

            {/* ── Info ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: "#818cf8" }}>How It Works</h3>
                {[
                  "Fill in the event details",
                  "MetaMask will prompt for confirmation",
                  "Event is created on Sepolia blockchain",
                  "You become the event organizer",
                  "Attendees can now buy tickets",
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "#94a3b8", alignItems: "flex-start" }}>
                    <span style={{ color: "#6366f1", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span> {s}
                  </div>
                ))}
              </div>

              <div className="glass-card" style={{ padding: 24, background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#fbbf24" }}>⚠ Note</h3>
                <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
                  Creating an event costs a small gas fee on the Sepolia testnet. Make sure your wallet has test ETH.
                  Get free Sepolia ETH from <a href="https://sepoliafaucet.com" target="_blank" rel="noreferrer" style={{ color: "#818cf8" }}>sepoliafaucet.com</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
