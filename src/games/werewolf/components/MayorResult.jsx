import { useState, useEffect } from "react";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";
import { motion } from "framer-motion";

export default function MayorResult({ roomId, playerId, roomData, isHost }) {
  const mayorElection = roomData.mayorElection || {};
  const mayorId = mayorElection.mayorId;
  const mayorPlayer = roomData.players?.[mayorId] || {};
  const avatar = AVATARS[mayorPlayer.avatarId] || { emoji: "👤" };
  
  const resultStartedAt = mayorElection.resultStartedAt || Date.now();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - resultStartedAt) / 1000);
      const remaining = Math.max(0, 5 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && isHost) {
        handleStartNight();
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [resultStartedAt, isHost]);

  const handleStartNight = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/start-night`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
    } catch (error) {
      console.error("Lỗi chuyển sang ban đêm:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px 10px" }}>
      <h2 className="ww-glow-text" style={{ fontSize: "20px", marginBottom: "15px", color: "#f1c40f" }}>
        👑 KẾT QUẢ BẦU TRƯỞNG LÀNG 👑
      </h2>

      <div className="ww-card" style={{ 
        border: "2px solid #f1c40f",
        background: "rgba(241, 196, 15, 0.1)",
        padding: "30px 20px",
        marginBottom: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "15px"
      }}>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          style={{ fontSize: "60px", marginBottom: "10px" }}
        >
          {avatar.emoji}
        </motion.div>
        
        <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", textTransform: "uppercase" }}>
          {mayorPlayer.username}
        </h3>
        
        <div style={{ background: "#f1c40f", color: "#000", padding: "5px 15px", borderRadius: "15px", fontWeight: "bold", fontSize: "14px" }}>
          ĐÃ TRỞ THÀNH TRƯỞNG LÀNG!
        </div>
      </div>

      <div className="ww-card" style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "12px" }}>
        <p style={{ color: "var(--ww-accent)", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold" }}>
          <span className="ww-pulse-animation" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ww-accent)", display: "inline-block" }}></span>
          CÒN LẠI {timeLeft}s SẼ BẮT ĐẦU ĐÊM ĐẦU TIÊN
        </p>
      </div>
    </div>
  );
}
