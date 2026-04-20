import { NavLink } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { Ticket, Wallet, Menu, X, Zap } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { account, connect, disconnect, isConnecting, shortAddress, isCorrectNetwork } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/create-event", label: "Create Event" },
    { to: "/buy-ticket", label: "Buy Ticket" },
    { to: "/my-tickets", label: "My Tickets" },
    { to: "/verify-ticket", label: "Verify" },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,11,26,0.85)",
      borderBottom: "1px solid rgba(99,102,241,0.2)",
      backdropFilter: "blur(16px)",
      padding: "0 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 64, gap: 24 }}>
        {/* Logo */}
        <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ticket size={18} color="white" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: "#e2e8f0" }}>
            Ticket<span style={{ color: "#818cf8" }}>Chain</span>
          </span>
        </NavLink>

        {/* Nav links – desktop */}
        <div style={{ display: "flex", gap: 4, marginLeft: 8, flex: 1 }} className="hidden md:flex">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
              padding: "6px 14px", borderRadius: 8, textDecoration: "none",
              fontSize: 14, fontWeight: 500,
              color: isActive ? "#818cf8" : "#94a3b8",
              background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
              transition: "all 0.15s",
            })}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Wallet */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {account && !isCorrectNetwork && (
            <span className="badge badge-warning">Wrong Network</span>
          )}
          {account ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 14px",
                background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#a5b4fc",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                {shortAddress}
              </div>
              <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }} onClick={disconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className="btn-primary glow-pulse" onClick={connect} disabled={isConnecting}>
              {isConnecting ? <span className="spinner" /> : <Wallet size={16} />}
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}

          {/* Hamburger */}
          <button
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "none" }}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ padding: "12px 0 16px", borderTop: "1px solid rgba(99,102,241,0.15)" }}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={({ isActive }) => ({
              display: "block", padding: "10px 20px", textDecoration: "none",
              fontSize: 15, fontWeight: 500,
              color: isActive ? "#818cf8" : "#94a3b8",
              background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
            })}>
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
