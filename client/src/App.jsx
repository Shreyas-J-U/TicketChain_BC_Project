import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CreateEvent from "./pages/CreateEvent";
import BuyTicket from "./pages/BuyTicket";
import MyTickets from "./pages/MyTickets";
import VerifyTicket from "./pages/VerifyTicket";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-bg" style={{ minHeight: "100vh" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/buy-ticket" element={<BuyTicket />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/verify-ticket" element={<VerifyTicket />} />
          <Route path="*" element={
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <h2 style={{ fontSize: 24, marginBottom: 12, color: "#94a3b8" }}>404 — Page not found</h2>
              <a href="/" style={{ color: "#818cf8" }}>Go Home</a>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
