import { useState, useEffect } from "react";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";
import { Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function DayDiscussion({ roomId, playerId, roomData, isHost }) {
  const dayState = roomData.dayState || {};
  const discussionEndTime = dayState.discussionEndTime || (Date.now() + 180000);
  
  const [timeLeft, setTimeLeft] = useState(180);
  const players = roomData.players || {};

  useEffect(() => {
    const calculateTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((discussionEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Nếu hết giờ, tự động chuyển sang Bầu Chọn (Host gọi API)
      if (remaining === 0 && isHost) {
        handleTimerEnd();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [discussionEndTime, isHost]);

  const handleTimerEnd = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/end-discussion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
    } catch (error) {
      console.error("Lỗi chuyển sang bầu chọn (Hết giờ):", error);
    }
  };

  const handleSkipVote = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/skip-discussion-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
    } catch (error) {
      console.error("Lỗi bỏ phiếu bỏ qua:", error);
    }
  };

  const alivePlayers = Object.entries(players).filter(([id, p]) => p.isAlive);
  const skipVotes = dayState.skipVotes || {};
  const hasSkipped = !!skipVotes[playerId];
  const skipCount = Object.keys(skipVotes).length;

  return (
    <div style={{ padding: "10px 0" }}>
      <h2 className="ww-glow-text" style={{ textAlign: "center", fontSize: "20px", marginBottom: "5px" }}>
        🗣️ THẢO LUẬN TỰ DO
      </h2>
      <p style={{ textAlign: "center", color: "var(--ww-text-muted)", fontSize: "13px", marginBottom: "20px" }}>
        Tất cả người chơi hãy bật mic và thảo luận để tìm ra Ma Sói!
      </p>

      {/* Timer Card */}
      <div className="ww-card" style={{ textAlign: "center", padding: "30px 20px", marginBottom: "20px" }}>
        <Clock size={30} color={timeLeft <= 10 ? "var(--ww-wolf)" : "var(--ww-accent)"} style={{ marginBottom: "10px" }} />
        
        <div style={{ 
          fontSize: "48px", 
          fontWeight: 900, 
          color: timeLeft <= 10 ? "var(--ww-wolf)" : "var(--ww-accent)",
          textShadow: timeLeft <= 10 ? "0 0 15px rgba(231, 76, 60, 0.4)" : "0 0 15px rgba(108, 92, 231, 0.4)",
          margin: "10px 0 20px"
        }}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>

        {!players[playerId]?.isAlive ? (
          <p style={{ color: "var(--ww-text-muted)", fontSize: "14px", fontStyle: "italic", marginTop: "10px" }}>
            💀 Bạn đã chết nên không thể bỏ phiếu qua nhanh.
          </p>
        ) : (
          <button 
            className="ww-btn" 
            onClick={handleSkipVote} 
            disabled={hasSkipped}
            style={{ 
              display: "inline-flex", alignItems: "center", gap: "8px", 
              background: hasSkipped ? "rgba(46, 204, 113, 0.2)" : "rgba(255,255,255,0.1)", 
              border: hasSkipped ? "1px solid rgba(46, 204, 113, 0.4)" : "1px solid rgba(255,255,255,0.2)",
              color: hasSkipped ? "#2ecc71" : "var(--ww-text)"
            }}
          >
            {hasSkipped ? `✅ ĐÃ BỎ PHIẾU BỎ QUA (${skipCount}/${Math.ceil(alivePlayers.length/2)})` : "⏩ BỎ QUA & BẦU CHỌN NGAY"}
          </button>
        )}
      </div>

      {/* Alive Players Grid */}
      <div className="ww-card" style={{ padding: "15px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "15px", color: "var(--ww-text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
          <Users size={16} /> NGƯỜI CÒN SỐNG ({alivePlayers.length})
        </h4>
        <div className="ww-grid-3">
          {alivePlayers.map(([id, p]) => {
            const avatar = AVATARS[p.avatarId] || { emoji: "👤" };
            const isMe = id === playerId;
            
            return (
              <motion.div 
                key={id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  textAlign: "center", 
                  padding: "10px 5px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  position: "relative"
                }}
              >
                <div style={{ fontSize: "30px", marginBottom: "5px" }}>{avatar.emoji}</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.username} {isMe && "(Bạn)"}
                </div>
                {p.isMayor && (
                  <span style={{ 
                    position: "absolute", top: "-5px", right: "-5px", 
                    fontSize: "12px", background: "var(--ww-villager)", borderRadius: "10px", 
                    padding: "2px 6px", color: "#fff", fontWeight: "bold", border: "1px solid #fff"
                  }}>
                    Trưởng Làng
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
