import { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { getReadContract, getWriteContract } from "../utils/contract";
import { ethers } from "ethers";
import { Ticket, Search, ShoppingCart, AlertCircle, CheckCircle, ChevronDown, Users } from "lucide-react";

export default function BuyTicket() {
  const { account, connect } = useWallet();
  const [eventId, setEventId] = useState("");
  const [eventData, setEventData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState("");
  const [buying, setBuying] = useState(false);
  const [buyResult, setBuyResult] = useState(null);
  const [buyErr, setBuyErr] = useState("");

  const fetchEvent = async () => {
    if (!eventId) return;
    setFetching(true); setFetchErr(""); setEventData(null); setBuyResult(null);
    try {
      const contract = await getReadContract();
      const ev = await contract.events(BigInt(eventId));
      const [id, name, date, ticketPrice, ticketLimit, ticketsSold, organizer, exists] = ev;
      if (!exists) { setFetchErr("Event does not exist."); return; }
      setEventData({ id: id.toString(), name, date: date.toString(), ticketPrice: ticketPrice.toString(), ticketLimit: ticketLimit.toString(), ticketsSold: ticketsSold.toString(), organizer });
    } catch (e) {
      setFetchErr(e.reason || e.message || "Failed to fetch event.");
    } finally {
      setFetching(false);
    }
  };

  const handleBuy = async () => {
    if (!account) { await connect(); return; }
    setBuying(true); setBuyErr(""); setBuyResult(null);
    try {
      const contract = await getWriteContract();
      const tx = await contract.mintTicket(BigInt(eventId), { value: BigInt(eventData.ticketPrice) });
      const receipt = await tx.wait();

      let ticketId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed?.name === "TicketMinted") { ticketId = parsed.args[0].toString(); break; }
        } catch {}
      }

      setBuyResult({ txHash: tx.hash, ticketId });
      // Refresh event data
      await fetchEvent();
    } catch (e) {
      setBuyErr(e.reason || e.message || "Transaction failed.");
    } finally {
      setBuying(false);
    }
  };

  const isSoldOut = eventData && BigInt(eventData.ticketsSold) >= BigInt(eventData.ticketLimit);
  const priceEth = eventData ? ethers.formatEther(eventData.ticketPrice) : null;
  const availability = eventData ? Number(BigInt(eventData.ticketLimit) - BigInt(eventData.ticketsSold)) : 0;
  const dateFormatted = eventData ? new Date(Number(eventData.date) * 1000).toLocaleString() : "";

  return (
    <div className="app-bg" style={{ minHeight: "100vh" }}>
      <div className="page">
        <div className="fade-in">
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Buy a Ticket</h1>
          <p style={{ color: "#94a3b8", marginBottom: 32, fontSize: 15 }}>Purchase a blockchain ticket for any listed event</p>

          {/* Search */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
            <label className="form-label" htmlFor="event-id-input">Enter Event ID</label>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6366f1" }} />
                <input
                  id="event-id-input" type="number" min="1" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="e.g. 1" value={eventId}
                  onChange={e => setEventId(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && fetchEvent()}
                />
              </div>
              <button className="btn-primary" onClick={fetchEvent} disabled={fetching || !eventId}>
                {fetching ? <span className="spinner" /> : <Search size={15} />}
                {fetching ? "Fetching…" : "Look Up"}
              </button>
            </div>
            {fetchErr && <div className="alert alert-error"><AlertCircle size={15} /> {fetchErr}</div>}
          </div>

          {/* Event Details */}
          {eventData && (
            <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700 }}>{eventData.name}</h2>
                    <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Event ID #{eventData.id}</p>
                  </div>
                  <span className={`badge ${isSoldOut ? "badge-danger" : "badge-success"}`}>
                    {isSoldOut ? "Sold Out" : "Available"}
                  </span>
                </div>
                <hr className="divider" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  {[
                    ["Date", dateFormatted],
                    ["Price", `${priceEth} ETH`],
                    ["Available", `${availability} / ${eventData.ticketLimit}`],
                    ["Sold", eventData.ticketsSold],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: "14px 16px", background: "rgba(22,24,49,0.6)", borderRadius: 10, border: "1px solid rgba(99,102,241,0.15)" }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(22,24,49,0.6)", border: "1px solid rgba(99,102,241,0.15)", wordBreak: "break-all" }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Organizer</span>
                  <p style={{ fontSize: 12, color: "#a5b4fc", marginTop: 4, fontFamily: "monospace" }}>{eventData.organizer}</p>
                </div>
              </div>

              {/* Purchase Panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Purchase Ticket</h3>
                  <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 18 }}>1 ticket will be minted to your wallet</p>

                  <div style={{ padding: "14px 16px", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.08))", marginBottom: 18, border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>You Pay</div>
                    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }} className="gradient-text">
                      {priceEth} ETH
                    </div>
                  </div>

                  {!account ? (
                    <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: 13 }} onClick={connect}>
                      Connect Wallet to Buy
                    </button>
                  ) : (
                    <button id="buy-ticket-btn" className="btn-success" style={{ width: "100%", justifyContent: "center", padding: 13 }}
                      onClick={handleBuy} disabled={buying || isSoldOut}>
                      {buying ? <><span className="spinner" /> Processing…</> : isSoldOut ? "Sold Out" : <><ShoppingCart size={16} /> Buy Ticket</>}
                    </button>
                  )}

                  {buyResult && (
                    <div className="alert alert-success">
                      <CheckCircle size={15} />
                      <div>
                        <strong>Ticket #{buyResult.ticketId} minted! 🎉</strong><br />
                        <a href={`https://sepolia.etherscan.io/tx/${buyResult.txHash}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: 12, color: "#34d399", wordBreak: "break-all" }}>View on Etherscan ↗</a>
                      </div>
                    </div>
                  )}
                  {buyErr && <div className="alert alert-error"><AlertCircle size={15} /> {buyErr}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
