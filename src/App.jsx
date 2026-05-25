import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* ===== FLOW MỚI: Home → Lobby → GameRoom ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/join/:roomId" element={<Home />} />
        <Route path="/lobby/:roomId" element={<Lobby />} />
        <Route path="/game/:roomId" element={<GameRoom />} />

        {/* ===== BACKWARD COMPAT: Route cũ vẫn hoạt động ===== */}
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;
