import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AVATARS, API_BASE_URL } from "../../utils/constants";
import { Clock, StopCircle, UserX } from "lucide-react";

export default function VotingPhase({ roomData, session, handleEndGame }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const { players, votes, meta } = roomData;
  const isHost = meta.hostPlayerId === session.playerId;
  const me = players[session.playerId];
  const amIAlive = me?.isAlive && me?.role !== "spectator";

  // Danh sách những người còn sống để vote
  const alivePlayers = Object.entries(players).filter(([id, p]) => p.isAlive);

  useEffect(() => {
    const votingEndTime = votes?.votingEndTime;
    if (!votingEndTime) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((votingEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      // Auto-submit if time runs out
      if (remaining === 0 && amIAlive && !hasVoted) {
          // Gửi phiếu ngẫu nhiên hoặc bỏ phiếu trắng nếu muốn (hiện tại submit người đầu tiên)
          submitVote(alivePlayers[0][0]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [votes?.votingEndTime, amIAlive, hasVoted]);

  // Kiểm tra xem mình đã vote chưa trên firebase
  useEffect(() => {
      if (votes?.ballots?.[session.playerId]) {
          setHasVoted(true);
      }
  }, [votes?.ballots, session.playerId]);

  const submitVote = async (targetId) => {
    if (hasVoted) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/submit-vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId: meta.roomId, playerId: session.playerId, targetId })
        });
        if (response.ok) {
            setHasVoted(true);
        }
    } catch(e) {
        console.error("Lỗi gửi vote", e);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ position: "relative", textAlign: "center" }}>
      <h2 style={{ color: "var(--primary)", fontSize: 24, marginBottom: 10 }}>BẦU CHỌN NGƯỜI ĐÁNG NGỜ</h2>
      
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontSize: 32, fontWeight: "bold", color: timeLeft < 10 ? "#D9534F" : "var(--text-main)", marginBottom: 30 }}>
          <Clock size={32} /> {timeLeft}s
      </div>

      {!amIAlive && (
          <div style={{ padding: 15, backgroundColor: "#FFF3CD", color: "#856404", borderRadius: 12, marginBottom: 20 }}>
              Bạn đang là Khán Giả. Hãy theo dõi những người khác bầu chọn.
          </div>
      )}

      {hasVoted && amIAlive && (
          <div style={{ padding: 15, backgroundColor: "#D4EDDA", color: "#155724", borderRadius: 12, marginBottom: 20 }}>
              Bạn đã bỏ phiếu. Đang chờ những người khác...
          </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 30 }}>
        {alivePlayers.map(([id, player]) => {
          const avatar = AVATARS[player.avatarId] || AVATARS["avatar_1"];
          const isSelected = selectedTarget === id;
          return (
            <div 
              key={id} 
              onClick={() => { if(amIAlive && !hasVoted) setSelectedTarget(id); }}
              style={{
                backgroundColor: isSelected ? "var(--primary)20" : "white", 
                borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", alignItems: "center",
                boxShadow: "var(--shadow)", 
                border: `3px solid ${isSelected ? "var(--primary)" : "transparent"}`,
                cursor: amIAlive && !hasVoted ? "pointer" : "default",
                opacity: (hasVoted && !isSelected) ? 0.5 : 1
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 25, backgroundColor: avatar.color + "30",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `2px solid ${avatar.color}`,
                marginBottom: 8
              }}>
                {avatar.emoji}
              </div>
              <div style={{ fontWeight: "bold", fontSize: 14 }}>
                {player.username} {id === session.playerId && "(Bạn)"}
              </div>
            </div>
          );
        })}
      </div>

      {amIAlive && !hasVoted && (
          <button 
            className="btn btn-primary" 
            style={{ height: 50, marginBottom: 20, width: "100%" }} 
            onClick={() => submitVote(selectedTarget)}
            disabled={!selectedTarget}
          >
            <UserX size={18} style={{ marginRight: 8 }} /> CHỐT BỎ PHIẾU
          </button>
      )}

      {isHost && (
          <button 
            className="btn" 
            style={{ backgroundColor: "#FFE5E5", color: "#D9534F", width: "100%", marginTop: 20 }} 
            onClick={handleEndGame}
          >
            <StopCircle size={18} style={{ marginRight: 8 }} /> KẾT THÚC VÁN (VỀ PHÒNG CHỜ)
          </button>
      )}
    </motion.div>
  );
}
