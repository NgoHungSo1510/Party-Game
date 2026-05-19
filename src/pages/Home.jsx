import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../utils/constants";

// MOCK DATA cho Avatar
const AVATARS = [
  { id: "avatar_1", name: "Mèo Xanh", color: "#4ECDC4", emoji: "🐱" },
  { id: "avatar_2", name: "Cún Cam", color: "#FFB347", emoji: "🐶" },
  { id: "avatar_3", name: "Thỏ Hồng", color: "#FF6B6B", emoji: "🐰" },
  { id: "avatar_4", name: "Gấu Nâu", color: "#A87A51", emoji: "🐻" },
  { id: "avatar_5", name: "Cáo Đỏ", color: "#FF4500", emoji: "🦊" },
  { id: "avatar_6", name: "Hổ Vàng", color: "#FFD700", emoji: "🐯" },
  { id: "avatar_7", name: "Khỉ Tím", color: "#9B59B6", emoji: "🐒" },
  { id: "avatar_8", name: "Ếch Xanh", color: "#2ECC71", emoji: "🐸" }
];

export default function Home() {
  const { roomId: initialRoomId } = useParams();
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState(initialRoomId || "");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill from saved profile
  useEffect(() => {
    const savedProfile = localStorage.getItem("spyfinder_profile");
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      if (p.username) setUsername(p.username);
      if (p.avatarId) setSelectedAvatar(p.avatarId);
    }
    // Auto-fill last room ID if no URL param
    // Ƭu tiên: active session, sau đó: last_session (khi đã rời phòng)
    if (!initialRoomId) {
      const savedSession = localStorage.getItem("spyfinder_session") || localStorage.getItem("spyfinder_last_session");
      if (savedSession) {
        const s = JSON.parse(savedSession);
        if (s.currentRoomId) setRoomId(s.currentRoomId);
      }
    }
  }, [initialRoomId]);

  const handleCreateRoom = async () => {
    if (!username) return alert("Vui lòng nhập tên!");
    if (!selectedAvatar) return alert("Vui lòng chọn Avatar!");
    setIsLoading(true);

    try {
      const playerId = "host_" + Date.now();
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostPlayerId: playerId, username, avatarId: selectedAvatar })
      });
      
      const data = await response.json();
      
      if (data.success && data.roomId) {
        const session = { currentRoomId: data.roomId, playerId, username, avatarId: selectedAvatar };
        localStorage.setItem("spyfinder_session", JSON.stringify(session));
        localStorage.setItem("spyfinder_profile", JSON.stringify({ username, avatarId: selectedAvatar }));
        navigate(`/room/${data.roomId}`);
      } else {
        alert("Lỗi khi tạo phòng: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối đến Backend!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username || !roomId) return alert("Vui lòng nhập tên và mã phòng!");
    if (!selectedAvatar) return alert("Vui lòng chọn Avatar!");
    setIsLoading(true);

    try {
      // Kiểm tra session cũ (active hoặc last) — nếu cùng roomId thì dùng lại playerId cũ
      let playerId;
      const activeSession = localStorage.getItem("spyfinder_session");
      const lastSession = localStorage.getItem("spyfinder_last_session");
      const sessionToCheck = activeSession || lastSession;
      if (sessionToCheck) {
        const oldSession = JSON.parse(sessionToCheck);
        if (oldSession.currentRoomId === roomId.trim() && oldSession.playerId) {
          playerId = oldSession.playerId; // Tái sử dụng playerId cũ!
        }
      }
      if (!playerId) playerId = "player_" + Date.now();
      
      const response = await fetch(`${API_BASE_URL}/api/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomId.trim(), playerId, username, avatarId: selectedAvatar })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const session = { currentRoomId: roomId.trim(), playerId, username, avatarId: selectedAvatar };
        localStorage.setItem("spyfinder_session", JSON.stringify(session));
        localStorage.setItem("spyfinder_profile", JSON.stringify({ username, avatarId: selectedAvatar }));
        navigate(`/room/${roomId.trim()}`);
      } else {
        alert("Lỗi tham gia: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối đến Backend!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        style={{ textAlign: "center", marginBottom: 30 }}
      >
        <h1 style={{ fontSize: 36, color: "var(--primary)", textShadow: "2px 2px 0px #FFD93D", marginBottom: 10 }}>
          SPY FINDER 🕵️‍♂️
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Tìm ra kẻ gián điệp!</p>
      </motion.div>

      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 15 }}>
        
        {/* Chọn Avatar Grid */}
        <div>
          <p style={{ fontWeight: "bold", marginBottom: 10, textAlign: "center", color: "var(--text-main)" }}>CHỌN AVATAR</p>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: 12, 
            padding: "15px",
            backgroundColor: "white",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)"
          }}>
            {AVATARS.map(avatar => (
              <motion.div
                key={avatar.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedAvatar(avatar.id)}
                style={{
                  aspectRatio: "1",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  cursor: "pointer",
                  border: selectedAvatar === avatar.id ? `4px solid ${avatar.color}` : "2px solid #EAEAEA",
                  backgroundColor: selectedAvatar === avatar.id ? avatar.color + "20" : "transparent",
                  transition: "all 0.2s"
                }}
              >
                {avatar.emoji}
              </motion.div>
            ))}
          </div>
        </div>

        <input 
          className="input"
          placeholder="Tên của bạn..." 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        
        <button className="btn btn-primary" onClick={handleCreateRoom} disabled={isLoading}>
          {isLoading ? "ĐANG XỬ LÝ..." : "TẠO PHÒNG MỚI"}
        </button>

        <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
          <div style={{ flex: 1, height: 1, backgroundColor: "#EAEAEA" }}></div>
          <span style={{ padding: "0 10px", color: "#A0A0A0", fontSize: 14 }}>hoặc</span>
          <div style={{ flex: 1, height: 1, backgroundColor: "#EAEAEA" }}></div>
        </div>

        <input 
          className="input"
          placeholder="Mã phòng..." 
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={handleJoinRoom} disabled={isLoading}>
          {isLoading ? "ĐANG XỬ LÝ..." : "THAM GIA PHÒNG"}
        </button>
      </div>
    </div>
  );
}
