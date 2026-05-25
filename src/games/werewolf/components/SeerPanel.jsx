import { useState, useEffect } from "react";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";

export default function SeerPanel({ roomId, playerId, roomData, stepStartedAt, isHost, onTimerEnd }) {
  const players = roomData.players || {};
  const settings = roomData.settings || {};
  const duration = settings.roleTimerSec || 30;

  const [timeLeft, setTimeLeft] = useState(duration);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [revealResult, setRevealResult] = useState(null); // 'wolf' or 'villager'

  const activePlayers = Object.entries(players).filter(([id, p]) => p.isAlive && id !== playerId);

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

  const handleReveal = async () => {
    if (!selectedTargetId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/werewolf/seer-check`, {
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
        alert("Lỗi Tiên Tri soi bài: " + (errorData.error || response.statusText));
        return;
      }
      const data = await response.json();
      setRevealResult(data.result);
      setHasConfirmed(true);
    } catch (error) {
      alert("Lỗi Tiên Tri soi bài: " + error.message);
    }
  };

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 className="ww-glow-text" style={{ fontSize: "20px", color: "var(--ww-seer)", fontWeight: 900 }}>
          🔮 LƯỢT TIÊN TRI
        </h2>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--ww-accent)" }}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      <div className="ww-card" style={{ background: "rgba(155, 89, 182, 0.05)", border: "1px solid rgba(155, 89, 182, 0.2)" }}>
        <p style={{ fontSize: "14px", fontWeight: 700 }}>
          Chọn một người chơi để soi xem họ thuộc phe nào (Dân Làng hay Ma Sói).
        </p>
      </div>

      {/* Kết quả sau khi soi */}
      {hasConfirmed && revealResult && (
        <div className="ww-card" style={{ 
          textAlign: "center", 
          border: `2px solid ${revealResult === "wolf" ? "var(--ww-wolf)" : "var(--ww-villager)"}`,
          background: revealResult === "wolf" ? "rgba(231, 76, 60, 0.15)" : "rgba(52, 152, 219, 0.15)"
        }}>
          <h3 style={{ fontSize: "16px", marginBottom: "5px", color: "var(--ww-text-muted)" }}>KẾT QUẢ SOI VAI TRÒ</h3>
          <span style={{ fontSize: "40px" }}>{revealResult === "wolf" ? "🐺" : "👤"}</span>
          <p className={revealResult === "wolf" ? "ww-glow-text-red" : "ww-glow-text"} style={{ 
            fontSize: "20px", 
            fontWeight: 900, 
            marginTop: "10px", 
            color: revealResult === "wolf" ? "var(--ww-wolf)" : "var(--ww-villager)"
          }}>
            {players[selectedTargetId]?.username} là {revealResult === "wolf" ? "MA SÓI!" : "DÂN LÀNG!"}
          </p>
        </div>
      )}

      {/* Grid người chơi */}
      {!hasConfirmed && (
        <div className="ww-grid-2" style={{ marginBottom: "20px" }}>
          {activePlayers.map(([id, p]) => {
            const avatar = AVATARS[p.avatarId] || { emoji: "👤", color: "#3498db" };
            const isSelected = selectedTargetId === id;

            return (
              <div 
                key={id}
                className={`ww-choice-card ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedTargetId(id)}
                style={{ border: isSelected ? "2px solid var(--ww-seer)" : undefined }}
              >
                <span className="ww-avatar-emoji">{avatar.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: "14px" }}>
                  {p.username}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!hasConfirmed ? (
        <button 
          className="ww-btn" 
          disabled={!selectedTargetId}
          onClick={handleReveal}
          style={{ background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)", boxShadow: "0 4px 15px rgba(155, 89, 182, 0.4)" }}
        >
          🔮 SOI VAI TRÒ NGƯỜI NÀY
        </button>
      ) : (
        <div style={{ textAlign: "center", color: "var(--ww-text-muted)", fontSize: "13px", marginTop: "10px" }}>
          Bạn đã dùng năng lực soi đêm nay. Trời sắp sáng...
        </div>
      )}
    </div>
  );
}
