import { useState, useEffect } from "react";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";

export default function GuardPanel({ roomId, playerId, roomData, stepStartedAt, isHost, onTimerEnd }) {
  const players = roomData.players || {};
  const settings = roomData.settings || {};
  const duration = settings.roleTimerSec || 30;

  const [timeLeft, setTimeLeft] = useState(duration);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const lastTargetId = roomData.nightState?.guardLastTarget || null;
  const activePlayers = Object.entries(players).filter(([_, p]) => p.isAlive);

  // Countdown timer
  useEffect(() => {
    let timer;
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - stepStartedAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        if (isHost) {
          onTimerEnd();
        }
      }
    };

    calculateTimeLeft();
    timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [stepStartedAt, duration, isHost]);

  const handleProtect = async () => {
    if (!selectedTargetId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/werewolf/guard-protect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerId,
          targetId: selectedTargetId
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Lỗi chọn mục tiêu bảo vệ!");
        return;
      }
      setHasConfirmed(true);
    } catch (error) {
      alert("Lỗi chọn mục tiêu bảo vệ: " + error.message);
    }
  };

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 className="ww-glow-text" style={{ fontSize: "20px", color: "var(--ww-guard)", fontWeight: 900 }}>
          🛡️ LƯỢT BẢO VỆ
        </h2>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--ww-accent)" }}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      <div className="ww-card" style={{ background: "rgba(46, 204, 113, 0.05)", border: "1px solid rgba(46, 204, 113, 0.2)" }}>
        <p style={{ fontSize: "14px", fontWeight: 700 }}>
          Chọn một người để bảo vệ khỏi Ma Sói đêm nay. Bạn có thể tự chọn bảo vệ bản thân!
        </p>
        {lastTargetId && players[lastTargetId] && (
          <p style={{ fontSize: "12px", color: "var(--ww-text-muted)", marginTop: "5px" }}>
            Đêm trước bạn đã bảo vệ: <strong style={{ color: "var(--ww-wolf)" }}>{players[lastTargetId].username}</strong> (không thể chọn tiếp đêm nay).
          </p>
        )}
      </div>

      {/* Grid người chơi */}
      <div className="ww-grid-2" style={{ marginBottom: "20px" }}>
        {activePlayers.map(([id, p]) => {
          const avatar = AVATARS[p.avatarId] || { emoji: "👤", color: "#3498db" };
          const isLastTarget = id === lastTargetId;
          const isSelected = selectedTargetId === id;
          const isMyself = id === playerId;

          return (
            <div 
              key={id}
              className={`ww-choice-card ${isSelected ? "selected" : ""} ${isLastTarget ? "dead" : ""}`}
              onClick={() => {
                if (!hasConfirmed && !isLastTarget) {
                  setSelectedTargetId(id);
                }
              }}
              style={{ 
                border: isSelected ? "2px solid var(--ww-guard)" : undefined,
                opacity: isLastTarget ? 0.4 : 1
              }}
            >
              {isLastTarget && (
                <span style={{ 
                  position: "absolute", top: "5px", right: "8px", 
                  fontSize: "9px", background: "rgba(231, 76, 60, 0.2)", 
                  color: "#e74c3c", padding: "1px 4px", borderRadius: "4px", fontWeight: "bold"
                }}>
                  Không được chọn
                </span>
              )}

              <span className="ww-avatar-emoji">{avatar.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: "14px" }}>
                {p.username} {isMyself ? "(Bạn)" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {!hasConfirmed ? (
        <button 
          className="ww-btn" 
          disabled={!selectedTargetId}
          onClick={handleProtect}
          style={{ background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)", boxShadow: "0 4px 15px rgba(46, 204, 113, 0.4)" }}
        >
          🛡️ BẢO VỆ MỤC TIÊU
        </button>
      ) : (
        <div className="ww-card" style={{ textAlign: "center", background: "rgba(46, 204, 113, 0.1)", border: "1px solid rgba(46, 204, 113, 0.2)" }}>
          <p style={{ color: "#2ecc71", fontWeight: 700 }}>
            ✓ Đã xác nhận bảo vệ mục tiêu!
          </p>
          <p style={{ color: "var(--ww-text-muted)", fontSize: "12px", marginTop: "5px" }}>
            Trời sắp sáng rồi...
          </p>
        </div>
      )}
    </div>
  );
}
