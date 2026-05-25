import { useState, useEffect } from "react";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";

export default function WitchPanel({ roomId, playerId, roomData, stepStartedAt, isHost, onTimerEnd }) {
  const players = roomData.players || {};
  const settings = roomData.settings || {};
  const duration = settings.roleTimerSec || 30;

  const [timeLeft, setTimeLeft] = useState(duration);
  const [useSave, setUseSave] = useState(false);
  const [selectedKillId, setSelectedKillId] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const wolfTargetId = roomData.nightState?.wolfTarget || null;
  const healRemaining = roomData.nightState?.witchHealRemaining !== false;
  const poisonRemaining = roomData.nightState?.witchPoisonRemaining !== false;
  
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

  const handleAction = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/werewolf/witch-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerId,
          save: useSave,
          killPlayerId: selectedKillId
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert("Lỗi Phù Thủy hành động: " + (errorData.error || response.statusText));
        return;
      }
      setHasConfirmed(true);
    } catch (error) {
      alert("Lỗi Phù Thủy hành động: " + error.message);
    }
  };

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 className="ww-glow-text" style={{ fontSize: "20px", color: "var(--ww-witch)", fontWeight: 900 }}>
          🧙 LƯỢT PHÙ THỦY
        </h2>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--ww-accent)" }}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Thông tin bình thuốc */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <div className="ww-card" style={{ flex: 1, textAlign: "center", background: healRemaining ? "rgba(46, 204, 113, 0.05)" : "rgba(0,0,0,0.3)", borderColor: healRemaining ? "var(--ww-guard)" : "transparent", padding: "12px" }}>
          <span style={{ fontSize: "24px" }}>🧪</span>
          <h4 style={{ fontSize: "12px", marginTop: "5px" }}>Bình Cứu</h4>
          <span className="ww-badge" style={{ background: healRemaining ? "var(--ww-guard)" : "#7f8c8d" }}>
            {healRemaining ? "Còn" : "Hết"}
          </span>
        </div>
        <div className="ww-card" style={{ flex: 1, textAlign: "center", background: poisonRemaining ? "rgba(231, 76, 60, 0.05)" : "rgba(0,0,0,0.3)", borderColor: poisonRemaining ? "var(--ww-wolf)" : "transparent", padding: "12px" }}>
          <span style={{ fontSize: "24px" }}>☠️</span>
          <h4 style={{ fontSize: "12px", marginTop: "5px" }}>Bình Độc</h4>
          <span className="ww-badge" style={{ background: poisonRemaining ? "var(--ww-wolf)" : "#7f8c8d" }}>
            {poisonRemaining ? "Còn" : "Hết"}
          </span>
        </div>
      </div>

      {/* Thông tin nạn nhân */}
      <div className="ww-card" style={{ background: "rgba(26, 188, 156, 0.05)", border: "1px solid rgba(26, 188, 156, 0.2)" }}>
        {wolfTargetId && players[wolfTargetId] ? (
          <div>
            <p style={{ fontSize: "14px" }}>
              ⚠️ Đêm nay, <strong style={{ color: "var(--ww-wolf)" }}>{players[wolfTargetId].username}</strong> đã bị Ma Sói cắn.
            </p>
            {healRemaining ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                <input 
                  type="checkbox" 
                  id="useSave"
                  checked={useSave}
                  onChange={(e) => setUseSave(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="useSave" style={{ fontSize: "13px", cursor: "pointer", fontWeight: 700 }}>
                  Sử dụng Bình Cứu để cứu sống họ?
                </label>
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "var(--ww-text-muted)", marginTop: "8px", fontStyle: "italic" }}>
                Bạn không còn bình thuốc cứu nào.
              </p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: "14px" }}>
            Đêm nay Ma Sói không cắn trúng ai hoặc không hoạt động.
          </p>
        )}
      </div>

      {/* Sử dụng bình độc */}
      {poisonRemaining && !hasConfirmed && (
        <div className="ww-card" style={{ padding: "15px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px", color: "var(--ww-wolf)" }}>
            ☠️ Sử dụng bình độc giết người khác?
          </h4>
          <p style={{ fontSize: "12px", color: "var(--ww-text-muted)", marginBottom: "12px" }}>
            Bỏ qua nếu bạn không muốn giết ai đêm nay.
          </p>
          
          <div className="ww-grid-2">
            {activePlayers.map(([id, p]) => {
              const avatar = AVATARS[p.avatarId] || { emoji: "👤", color: "#3498db" };
              const isSelected = selectedKillId === id;

              return (
                <div 
                  key={id}
                  className={`ww-choice-card ${isSelected ? "selected-wolf" : ""}`}
                  onClick={() => setSelectedKillId(isSelected ? null : id)}
                  style={{ border: isSelected ? "2px solid var(--ww-wolf)" : undefined }}
                >
                  <span className="ww-avatar-emoji">{avatar.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: "14px" }}>
                    {p.username}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasConfirmed ? (
        <button 
          className="ww-btn" 
          onClick={handleAction}
          style={{ background: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)", boxShadow: "0 4px 15px rgba(26, 188, 156, 0.4)" }}
        >
          🧙 XÁC NHẬN HÀNH ĐỘNG
        </button>
      ) : (
        <div className="ww-card" style={{ textAlign: "center", background: "rgba(26, 188, 156, 0.1)", border: "1px solid rgba(26, 188, 156, 0.2)" }}>
          <p style={{ color: "#1abc9c", fontWeight: 700 }}>
            ✓ Hành động của bạn đã được ghi nhận!
          </p>
          <p style={{ color: "var(--ww-text-muted)", fontSize: "12px", marginTop: "5px" }}>
            Bình minh đang lên...
          </p>
        </div>
      )}
    </div>
  );
}
