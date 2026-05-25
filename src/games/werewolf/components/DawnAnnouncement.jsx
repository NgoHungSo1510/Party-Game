import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../utils/constants";

export default function DawnAnnouncement({ roomId, playerId, roomData, isHost }) {
  const dayState = roomData.dayState || {};
  const deadPlayers = dayState.deadPlayers || [];
  const announcement = dayState.announcement || "";
  
  const isMeDead = deadPlayers.includes(playerId);
  const [timeLeft, setTimeLeft] = useState(5);

  const dawnStartedAt = dayState.dawnStartedAt || Date.now();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - dawnStartedAt) / 1000);
      const remaining = Math.max(0, 5 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && isHost) {
        handleStartDiscussion();
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [dawnStartedAt, isHost]);
  
  const handleStartDiscussion = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/start-discussion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
    } catch (error) {
      console.error("Lỗi bắt đầu thảo luận:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px 10px" }}>
      {/* Sunrise Icon & Title */}
      <div 
        className="ww-pulse-animation" 
        style={{ 
          width: "100px", height: "100px", borderRadius: "50%", 
          background: "rgba(241, 196, 15, 0.1)", display: "flex", 
          alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
          border: "1px dashed rgba(241, 196, 15, 0.4)"
        }}
      >
        <span style={{ fontSize: "50px" }}>☀️</span>
      </div>

      <h2 className="ww-glow-text-gold" style={{ fontSize: "24px", fontWeight: 900, marginBottom: "15px" }}>
        BÌNH MINH LÊN
      </h2>

      {/* Thông cáo của làng */}
      <div className="ww-card" style={{ 
        border: "1px solid rgba(241, 196, 15, 0.2)",
        background: "rgba(241, 196, 15, 0.03)",
        padding: "24px",
        marginBottom: "24px"
      }}>
        <p style={{ 
          fontSize: "18px", 
          lineHeight: "1.6", 
          fontWeight: 700,
          color: deadPlayers.length > 0 ? "var(--ww-wolf)" : "#2ecc71"
        }}>
          {announcement}
        </p>

        {deadPlayers.length > 0 && (
          <div style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            {deadPlayers.map(pid => {
              const p = roomData.players?.[pid] || {};
              return (
                <span key={pid} className="ww-badge" style={{ background: "rgba(231, 76, 60, 0.2)", color: "var(--ww-wolf)", border: "1px solid rgba(231, 76, 60, 0.3)", padding: "5px 12px", fontSize: "13px" }}>
                  💀 {p.username}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Cảnh báo tự tử/chết cho bản thân */}
      {isMeDead && (
        <div className="ww-card" style={{ 
          background: "rgba(231, 76, 60, 0.1)", 
          borderColor: "rgba(231, 76, 60, 0.3)",
          color: "var(--ww-wolf)",
          padding: "16px",
          marginBottom: "24px"
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "5px" }}>⚠️ BẠN ĐÃ BỊ LOẠI</h3>
          <p style={{ fontSize: "13px", color: "var(--ww-text)" }}>
            Bạn đã bị sát hại đêm qua. Từ giờ bạn sẽ trở thành Quan Sát Viên, không được tham gia thảo luận và bỏ phiếu nữa!
          </p>
        </div>
      )}

      {/* Hành động */}
      <div className="ww-card" style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "12px" }}>
        <p style={{ color: "var(--ww-accent)", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold" }}>
          <span className="ww-pulse-animation" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ww-accent)", display: "inline-block" }}></span>
          CÒN LẠI {timeLeft}s SẼ BẮT ĐẦU TRANH LUẬN
        </p>
      </div>
    </div>
  );
}
