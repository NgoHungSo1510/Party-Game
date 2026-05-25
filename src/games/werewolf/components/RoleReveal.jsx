import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../utils/constants";
import { ROLE_CARDS } from "../utils/werewolfConstants";

export default function RoleReveal({ roomId, playerId, roomData, isHost }) {
  const myRole = roomData.players?.[playerId]?.role || "villager";
  const roleInfo = ROLE_CARDS[myRole] || ROLE_CARDS.villager;
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const [startedAt] = useState(() => roomData.meta?.roleRevealStartedAt || Date.now());

  useEffect(() => {
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && isHost) {
        handleTimerEnd();
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [startedAt, isHost]);

  const handleTimerEnd = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/start-election`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
    } catch (error) {
      console.error("Lỗi chuyển sang bầu cử (Hết giờ):", error);
    }
  };

  const handleSkipVote = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/skip-reveal-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
    } catch (error) {
      console.error("Lỗi bỏ phiếu bỏ qua reveal:", error);
    }
  };

  const playerCount = Object.keys(roomData.players || {}).length;
  const skipVotes = roomData.meta?.skipRevealVotes || {};
  const hasSkipped = !!skipVotes[playerId];
  const skipCount = Object.keys(skipVotes).length;
  return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <h2 className="ww-glow-text" style={{ fontSize: "20px", marginBottom: "10px" }}>
        🎭 TIẾT LỘ VAI TRÒ
      </h2>
      <p style={{ color: "var(--ww-text-muted)", fontSize: "14px", marginBottom: "15px" }}>
        Nhấn và giữ thẻ bài bên dưới để xem vai trò bí mật của bạn!
      </p>

      {/* Role card với animation lật */}
      <div 
        className={`ww-role-card ${revealed ? "revealed" : ""}`} 
        onMouseDown={() => setRevealed(true)}
        onMouseUp={() => setRevealed(false)}
        onMouseLeave={() => setRevealed(false)}
        onTouchStart={(e) => { e.preventDefault(); setRevealed(true); }}
        onTouchEnd={() => setRevealed(false)}
      >
        <div className="ww-role-card-inner">
          {/* Mặt sau thẻ bài */}
          <div className="ww-role-card-front" style={{ border: "2px solid var(--ww-primary)" }}>
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>🌕</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--ww-accent)", textTransform: "uppercase" }}>
              BÀI VAI TRÒ
            </h3>
            <p style={{ fontSize: "13px", color: "var(--ww-text-muted)", marginTop: "10px" }}>
              Nhấn và giữ để xem
            </p>
          </div>

          {/* Mặt trước thẻ bài */}
          <div className="ww-role-card-back" style={{ border: `3px solid ${roleInfo.color}` }}>
            <span style={{ fontSize: "70px", marginBottom: "15px" }}>{roleInfo.emoji}</span>
            <h3 className="ww-glow-text" style={{ fontSize: "24px", fontWeight: 900, color: roleInfo.color, marginBottom: "8px", textTransform: "uppercase" }}>
              ✦ {roleInfo.name} ✦
            </h3>
            
            <span className="ww-badge" style={{ backgroundColor: roleInfo.color, color: "#fff", marginBottom: "20px" }}>
              {roleInfo.teamName}
            </span>

            <p style={{ fontSize: "14px", color: "var(--ww-text)", lineHeight: "1.5", padding: "0 10px" }}>
              {roleInfo.description}
            </p>

            <p style={{ fontSize: "11px", color: "var(--ww-text-muted)", fontStyle: "italic", marginTop: "30px" }}>
              Thả tay để úp lại
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "30px", padding: "0 20px" }}>
        <div className="ww-card" style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "15px" }}>
          <p style={{ color: "var(--ww-accent)", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold" }}>
            <span className="ww-pulse-animation" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ww-accent)", display: "inline-block" }}></span>
            CÒN LẠI {timeLeft}s ĐỂ THẢO LUẬN, SAU ĐÓ SẼ BẦU TRƯỞNG LÀNG
          </p>
        </div>

        <button 
          className="ww-btn" 
          onClick={handleSkipVote} 
          disabled={hasSkipped}
          style={{ 
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", 
            background: hasSkipped ? "rgba(46, 204, 113, 0.2)" : "rgba(255,255,255,0.1)", 
            border: hasSkipped ? "1px solid rgba(46, 204, 113, 0.4)" : "1px solid rgba(255,255,255,0.2)",
            color: hasSkipped ? "#2ecc71" : "var(--ww-text)"
          }}
        >
          {hasSkipped ? `✅ ĐÃ BỎ PHIẾU BỎ QUA (${skipCount}/${Math.ceil(playerCount/2)})` : "⏩ BỎ QUA & BẦU CHỌN NGAY"}
        </button>
      </div>
    </div>
  );
}
