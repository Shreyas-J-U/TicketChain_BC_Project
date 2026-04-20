import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { Ticket, Shield, Zap, ArrowRight, Users, Lock, RefreshCw } from "lucide-react";

const features = [
  { icon: <Ticket size={22} />, title: "Mint Tickets", desc: "Issue unique blockchain tickets that cannot be duplicated or forged." },
  { icon: <Shield size={22} />, title: "Verify Instantly", desc: "Scan & verify ticket validity on-chain in seconds at event entry." },
  { icon: <RefreshCw size={22} />, title: "Transfer Ownership", desc: "Safely transfer your ticket to another wallet with full on-chain history." },
  { icon: <Lock size={22} />, title: "Prevent Reuse", desc: "Once used, tickets are permanently marked on the blockchain." },
  { icon: <Users size={22} />, title: "Decentralized", desc: "No central authority — powered by Ethereum Sepolia smart contracts." },
  { icon: <Zap size={22} />, title: "MetaMask Native", desc: "Connect your wallet and interact with the contract directly from your browser." },
];

const steps = [
  { n: "01", title: "Create Event", desc: "Organizer sets name, date, price and ticket limit." },
  { n: "02", title: "Connect Wallet", desc: "Attendee connects MetaMask to the DApp." },
  { n: "03", title: "Buy Ticket", desc: "Smart contract mints a ticket and assigns ownership." },
  { n: "04", title: "Get QR Code", desc: "A unique QR is generated for your ticket ID." },
  { n: "05", title: "Verify at Entry", desc: "Organizer scans & verifies on-chain." },
  { n: "06", title: "Mark as Used", desc: "Ticket is permanently marked — reuse prevented." },
];

export default function Home() {
  const { account, connect, isConnecting } = useWallet();

  return (
    <div className="app-bg" style={{ minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section style={{ padding: "80px 20px 60px", textAlign: "center" }} className="fade-in">
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 99,
          background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
          fontSize: 12, fontWeight: 600, color: "#818cf8", marginBottom: 28,
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          <Zap size={12} /> Powered by Ethereum Sepolia
        </div>

        <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 22 }}>
          Blockchain Event Tickets
          <br />
          <span className="gradient-text">Secure. Verifiable. Yours.</span>
        </h1>
        <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Issue, transfer, and verify event tickets on the Ethereum blockchain.
          No fraud. No duplicates. Full ownership transparency.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {!account ? (
            <button className="btn-primary glow-pulse" onClick={connect} disabled={isConnecting}
              style={{ padding: "13px 28px", fontSize: 16 }}>
              {isConnecting ? <span className="spinner" /> : <Ticket size={18} />}
              {isConnecting ? "Connecting…" : "Get Started"}
            </button>
          ) : (
            <Link to="/buy-ticket" className="btn-primary" style={{ padding: "13px 28px", fontSize: 16, textDecoration: "none" }}>
              <Ticket size={18} /> Buy a Ticket <ArrowRight size={16} />
            </Link>
          )}
          <Link to="/verify-ticket" className="btn-secondary" style={{ padding: "13px 28px", fontSize: 16, textDecoration: "none" }}>
            <Shield size={18} /> Verify Ticket
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "0 20px 64px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[["100%", "On-Chain"], ["0", "Fraud Risk"], ["∞", "Verifiable"]].map(([val, label]) => (
            <div key={label} className="glass-card" style={{ padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif" }} className="gradient-text">{val}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Why TicketChain?</h2>
          <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: 40, fontSize: 15 }}>Everything you need for fraud-proof event ticketing</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {features.map(f => (
              <div key={f.title} className="glass-card" style={{ padding: "28px 24px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "rgba(99,102,241,0.15)", color: "#818cf8",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: "0 20px 80px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>How It Works</h2>
          <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: 40, fontSize: 15 }}>Six simple steps from event creation to entry</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            {steps.map(s => (
              <div key={s.n} className="glass-card" style={{ padding: "24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: "#6366f1", fontFamily: "'Space Grotesk', sans-serif",
                  background: "rgba(99,102,241,0.12)", padding: "4px 8px", borderRadius: 6, flexShrink: 0, marginTop: 2,
                }}>{s.n}</span>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{s.title}</h4>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 20px 80px" }}>
        <div className="glass-card" style={{
          maxWidth: 700, margin: "0 auto", padding: "48px 40px", textAlign: "center",
          background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08))",
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ color: "#94a3b8", marginBottom: 28, fontSize: 15 }}>Connect your MetaMask wallet and explore the future of event ticketing.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/create-event" style={{ textDecoration: "none" }} className="btn-primary">
              <Ticket size={16} /> Create Event
            </Link>
            <Link to="/my-tickets" style={{ textDecoration: "none" }} className="btn-secondary">
              View My Tickets <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
