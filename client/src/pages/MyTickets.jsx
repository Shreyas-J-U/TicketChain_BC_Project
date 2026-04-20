import { useState, useEffect, useRef } from "react";
import { useWallet } from "../hooks/useWallet";
import { getReadContract, getWriteContract } from "../utils/contract";
import { ethers } from "ethers";
import QRCode from "qrcode";
import { Ticket, RefreshCw, Send, AlertCircle, CheckCircle, Download, QrCode } from "lucide-react";

function TicketCard({ ticket, onTransfer, onQR }) {
  const { id, eventId, timestamp, isUsed } = ticket;
  const date = new Date(Number(timestamp) * 1000).toLocaleDateString();

  return (
    <div className="glass-card" style={{
      padding: 24,
      borderColor: isUsed ? "rgba(100,116,139,0.2)" : "rgba(99,102,241,0.25)",
      opacity: isUsed ? 0.7 : 1,
      transition: "all 0.2s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: isUsed ? "rgba(100,116,139,0.2)" : "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(6,182,212,0.15))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ticket size={18} color={isUsed ? "#64748b" : "#818cf8"} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Ticket #{id}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Event #{eventId}</div>
          </div>
        </div>
        <span className={`badge ${isUsed ? "badge-danger" : "badge-success"}`}>
          {isUsed ? "Used" : "Valid"}
        </span>
      </div>

      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Purchased: {date}</div>

      {!isUsed && (
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: 12 }}
            onClick={() => onQR(ticket)}>
            <QrCode size={13} /> QR Code
          </button>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: 12 }}
            onClick={() => onTransfer(ticket)}>
            <Send size={13} /> Transfer
          </button>
        </div>
      )}
    </div>
  );
}

function QRModal({ ticket, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !ticket) return;
    QRCode.toCanvas(canvasRef.current, `TicketChain:${ticket.id}:Event:${ticket.eventId}`, {
      width: 220, margin: 2,
      color: { dark: "#6366f1", light: "#0f1029" },
    });
  }, [ticket]);

  const download = () => {
    const url = canvasRef.current.toDataURL();
    const a = document.createElement("a"); a.href = url; a.download = `ticket-${ticket.id}.png`; a.click();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }} onClick={onClose}>
      <div className="glass-card" style={{ padding: 32, textAlign: "center", maxWidth: 320, width: "90%" }}
        onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Ticket #{ticket.id}</h3>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Event #{ticket.eventId}</p>
        <div style={{ display: "flex", justifyContent: "center", padding: 16, background: "#0f1029", borderRadius: 12, marginBottom: 20 }}>
          <canvas ref={canvasRef} style={{ borderRadius: 8 }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={download}>
            <Download size={14} /> Download
          </button>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function TransferModal({ ticket, onClose, onSuccess }) {
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleTransfer = async () => {
    if (!ethers.isAddress(to)) { setErr("Invalid Ethereum address"); return; }
    setLoading(true); setErr("");
    try {
      const contract = await getWriteContract();
      const tx = await contract.transferTicket(BigInt(ticket.id), to);
      await tx.wait();
      onSuccess(tx.hash);
      onClose();
    } catch (e) {
      setErr(e.reason || e.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }} onClick={onClose}>
      <div className="glass-card" style={{ padding: 32, maxWidth: 400, width: "90%" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Transfer Ticket #{ticket.id}</h3>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>Transfer ownership to another wallet address.</p>

        <div className="form-group">
          <label className="form-label">Recipient Address</label>
          <input className="form-input" placeholder="0x..." value={to} onChange={e => setTo(e.target.value)} />
        </div>

        {err && <div className="alert alert-error" style={{ marginBottom: 16 }}><AlertCircle size={15} /> {err}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleTransfer} disabled={loading || !to}>
            {loading ? <><span className="spinner" /> Transferring…</> : <><Send size={14} /> Confirm Transfer</>}
          </button>
          <button className="btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function MyTickets() {
  const { account, connect } = useWallet();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [qrTicket, setQrTicket] = useState(null);
  const [transferTicket, setTransferTicket] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const loadTickets = async () => {
    if (!account) return;
    setLoading(true); setErr("");
    try {
      const contract = await getReadContract();
      const ids = await contract.getUserTickets(account);
      const details = [];
      for (const id of ids) {
        const t = await contract.tickets(id);
        const [ticketId, eventId, owner, timestamp, isUsed, exists] = t;
        if (exists) details.push({ id: ticketId.toString(), eventId: eventId.toString(), owner, timestamp: timestamp.toString(), isUsed });
      }
      setTickets(details.reverse());
    } catch (e) {
      setErr(e.reason || e.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, [account]);

  return (
    <div className="app-bg" style={{ minHeight: "100vh" }}>
      <div className="page-wide">
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>My Tickets</h1>
              <p style={{ color: "#94a3b8", fontSize: 15 }}>All blockchain tickets owned by your wallet</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {account && (
                <button className="btn-secondary" onClick={loadTickets} disabled={loading}>
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
              )}
            </div>
          </div>

          {!account ? (
            <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
              <Ticket size={48} color="#6366f1" style={{ margin: "0 auto 16px", display: "block" }} />
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>Connect Your Wallet</h2>
              <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: 15 }}>Connect MetaMask to view your tickets</p>
              <button className="btn-primary" onClick={connect}>Connect Wallet</button>
            </div>
          ) : loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
              <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
          ) : err ? (
            <div className="alert alert-error"><AlertCircle size={15} /> {err}</div>
          ) : tickets.length === 0 ? (
            <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
              <Ticket size={48} color="#374151" style={{ margin: "0 auto 16px", display: "block" }} />
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10, color: "#64748b" }}>No Tickets Yet</h2>
              <p style={{ color: "#64748b", marginBottom: 24, fontSize: 15 }}>You don't own any tickets yet.</p>
              <a href="/buy-ticket" className="btn-primary" style={{ textDecoration: "none" }}>Buy a Ticket</a>
            </div>
          ) : (
            <>
              {successMsg && <div className="alert alert-success" style={{ marginBottom: 24 }}><CheckCircle size={15} /> {successMsg}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {tickets.map(t => (
                  <TicketCard key={t.id} ticket={t}
                    onQR={setQrTicket}
                    onTransfer={setTransferTicket} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {qrTicket && <QRModal ticket={qrTicket} onClose={() => setQrTicket(null)} />}
      {transferTicket && (
        <TransferModal ticket={transferTicket} onClose={() => setTransferTicket(null)}
          onSuccess={(txHash) => { setSuccessMsg(`Ticket transferred! Tx: ${txHash.slice(0,18)}…`); loadTickets(); }} />
      )}
    </div>
  );
}
