import { useState, useEffect } from "react";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";

export default function MayorElection({ roomId, playerId, roomData }) {
  const players = roomData.players || {};
  const activePlayers = Object.entries(players).filter(([_, p]) => p.isAlive);
  const votes = roomData.mayorElection?.votes || {};

  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [hasVoted, setHasVoted] = useState(!!votes[playerId]);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const startedAt = roomData.mayorElection?.startedAt || Date.now();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setTimeLeft(remaining);

      // Tự động bầu ngẫu nhiên nếu hết giờ mà chưa chọn
      if (remaining === 0 && !hasVoted) {
        handleAutoVote();
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [startedAt, hasVoted]);

  const handleAutoVote = () => {
    if (activePlayers.length === 0) return;
    const randomId = activePlayers[Math.floor(Math.random() * activePlayers.length)][0];
    setSelectedTargetId(randomId);
    handleVote(randomId);
  };

  const handleVote = async (targetIdToVote = selectedTargetId) => {
    if (!targetIdToVote) return;
    setHasVoted(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/werewolf/mayor-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerId,
          targetId: targetIdToVote
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert("Lỗi khi bầu chọn: " + (errorData.error || response.statusText));
        return;
      }
      setHasVoted(true);
    } catch (error) {
      alert("Lỗi khi bầu chọn: " + error.message);
    }
  };

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <h2 className="ww-glow-text" style={{ fontSize: "20px", fontWeight: 900 }}>
          🗳️ BẦU CHỌN TRƯỞNG LÀNG
        </h2>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--ww-accent)" }}>
          ⏱️ {timeLeft}s
        </div>
      </div>
      <p style={{ textAlign: "center", color: "var(--ww-text-muted)", fontSize: "13px", marginBottom: "20px" }}>
        Chọn một người uy tín nhất làm Trưởng Làng. Phiếu của Trưởng Làng sẽ tính gấp đôi (x2) khi biểu quyết treo cổ! Hết giờ hệ thống sẽ chọn ngẫu nhiên.
      </p>

      {/* Grid danh sách bầu cử */}
      <div className="ww-grid-2" style={{ marginBottom: "20px" }}>
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
                border: isSelected ? "2px solid var(--ww-accent)" : undefined
              }}
            >
              {/* Trạng thái đã vote xong */}
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
            </div>
          );
        })}
      </div>

      {/* Hành động */}
      {!hasVoted ? (
        <button 
          className="ww-btn" 
          disabled={!selectedTargetId}
          onClick={() => handleVote(selectedTargetId)}
          style={{ background: "linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)", color: "#000", boxShadow: "0 4px 15px rgba(241, 196, 15, 0.4)" }}
        >
          🗳️ XÁC NHẬN BẦU CỬ
        </button>
      ) : (
        <div className="ww-card" style={{ textAlign: "center", background: "rgba(46, 204, 113, 0.1)", border: "1px solid rgba(46, 204, 113, 0.2)" }}>
          <p style={{ color: "#2ecc71", fontWeight: 700, fontSize: "14px" }}>
            ✓ Bạn đã bỏ phiếu thành công!
          </p>
          <p style={{ color: "var(--ww-text-muted)", fontSize: "12px", marginTop: "5px" }}>
            Đang đợi người chơi khác bỏ phiếu... ({Object.keys(votes).length}/{activePlayers.length})
          </p>
        </div>
      )}
    </div>
  );
}
