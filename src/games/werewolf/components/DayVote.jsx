import { useState, useEffect } from "react";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";

export default function DayVote({ roomId, playerId, roomData, isHost }) {
  const players = roomData.players || {};
  const activePlayers = Object.entries(players).filter(([_, p]) => p.isAlive);
  const dayState = roomData.dayState || {};
  const votes = dayState.votes || {};
  const voteEndTime = dayState.voteEndTime || Date.now();

  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [hasVoted, setHasVoted] = useState(!!votes[playerId]);
  const [timeLeft, setTimeLeft] = useState(60);

  // Lượt vote kéo dài 60s
  useEffect(() => {
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - (voteEndTime - 60000)) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(remaining);

      // Nếu hết giờ, tự động skip hoặc vote người được chọn (Host kích hoạt)
      if (remaining === 0 && !hasVoted) {
        handleAutoVote();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [voteEndTime, hasVoted]);

  const handleAutoVote = async () => {
    setHasVoted(true);
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/day-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerId,
          targetId: selectedTargetId || "skip"
        })
      });
    } catch (error) {
      console.error("Lỗi tự động vote:", error);
    }
  };

  const handleVote = async (targetId) => {
    const finalTarget = targetId || selectedTargetId;
    if (!finalTarget) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/werewolf/day-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerId,
          targetId: finalTarget
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert("Lỗi khi vote treo cổ: " + (errorData.error || response.statusText));
        return;
      }
      setHasVoted(true);
    } catch (error) {
      alert("Lỗi khi vote treo cổ: " + error.message);
    }
  };

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 className="ww-glow-text" style={{ fontSize: "20px", fontWeight: 900 }}>
          🗳️ BIỂU QUYẾT TREO CỔ
        </h2>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--ww-accent)" }}>
          ⏱️ {timeLeft}s
        </div>
      </div>
      
      <p style={{ textAlign: "center", color: "var(--ww-text-muted)", fontSize: "13px", marginBottom: "20px" }}>
        Hãy chọn kẻ mà bạn nghi ngờ là Ma Sói. Chọn "Bỏ qua" nếu không muốn treo cổ ai hôm nay!
      </p>

      {/* Grid danh sách bầu cử */}
      <div className="ww-grid-2" style={{ marginBottom: "20px" }}>
        
        {/* Danh sách người chơi */}
        {activePlayers.map(([id, p]) => {
          const avatar = AVATARS[p.avatarId] || { emoji: "👤", color: "#3498db" };
          const isSelected = selectedTargetId === id;
          const isMyself = id === playerId;
          const userVoted = !!votes[id];

          return (
            <div 
              key={id}
              className={`ww-choice-card ${isSelected ? "selected" : ""}`}
              onClick={() => {
                if (!hasVoted) setSelectedTargetId(id);
              }}
              style={{ 
                opacity: hasVoted && !isSelected ? 0.7 : 1,
                border: isSelected ? "2px solid var(--ww-primary)" : p.isMayor ? "2px solid #2ecc71" : undefined
              }}
            >
              {userVoted && (
                <span style={{ 
                  position: "absolute", top: "5px", right: "8px", 
                  fontSize: "12px", background: "rgba(46, 204, 113, 0.2)", 
                  color: "#2ecc71", padding: "1px 6px", borderRadius: "10px", fontWeight: "bold"
                }}>
                  Đã vote
                </span>
              )}

              <span className="ww-avatar-emoji">{avatar.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: "14px", color: isMyself ? "var(--ww-accent)" : "#fff" }}>
                {p.username} {isMyself ? "(Bạn)" : ""}
              </span>
              {p.isMayor && (
                <span className="ww-badge ww-badge-mayor" style={{ background: "#2ecc71", color: "#fff", border: "none" }}>
                  Trưởng Làng x2
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Nút biểu quyết */}
      {!players[playerId]?.isAlive ? (
        <div className="ww-card" style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "var(--ww-text-muted)", fontStyle: "italic", fontSize: "14px" }}>
            💀 Bạn đã chết nên không thể tham gia biểu quyết treo cổ.
          </p>
          <p style={{ color: "var(--ww-text-muted)", fontSize: "12px", marginTop: "5px" }}>
            Đang đợi làng biểu quyết... ({Object.keys(votes).length}/{activePlayers.length})
          </p>
        </div>
      ) : !hasVoted ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button 
            className="ww-btn" 
            disabled={!selectedTargetId}
            onClick={() => handleVote(selectedTargetId)}
          >
            🗳️ XÁC NHẬN BIỂU QUYẾT
          </button>

          <button 
            className="ww-btn" 
            onClick={() => handleVote("skip")}
            style={{ 
              background: "rgba(255,255,255,0.1)", 
              border: "1px solid rgba(255,255,255,0.2)", 
              color: "var(--ww-text)" 
            }}
          >
            🕊️ HÒA BÌNH (Không bỏ phiếu treo cổ)
          </button>
        </div>
      ) : (
        <div className="ww-card" style={{ textAlign: "center", background: "rgba(46, 204, 113, 0.1)", border: "1px solid rgba(46, 204, 113, 0.2)" }}>
          <p style={{ color: "#2ecc71", fontWeight: 700, fontSize: "14px" }}>
            ✓ Đã bỏ phiếu biểu quyết thành công!
          </p>
          <p style={{ color: "var(--ww-text-muted)", fontSize: "12px", marginTop: "5px" }}>
            Đang đợi người chơi khác biểu quyết... ({Object.keys(votes).length}/{activePlayers.length})
          </p>
        </div>
      )}
    </div>
  );
}
