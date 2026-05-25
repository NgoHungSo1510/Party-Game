import { useState, useEffect } from "react";
import { Check, Play, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function GameSelectionModal({
  games,
  myGameVote,
  voteCounts,
  topGameId,
  topVotes,
  handleVoteGame,
  handleConfirmGame,
  handleCancelVote,
  isHost,
  numPlayers,
  totalVotes,
  voteEndTime
}) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!voteEndTime) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((voteEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [voteEndTime]);

  // Auto-confirm logic for host
  useEffect(() => {
    if (isHost) {
      if (timeLeft === 0 && totalVotes === 0) {
        handleCancelVote();
      } else if (topGameId && (totalVotes === numPlayers || timeLeft === 0)) {
        handleConfirmGame();
      }
    }
  }, [isHost, totalVotes, numPlayers, timeLeft, topGameId, handleConfirmGame, handleCancelVote]);

  const chatBubbleStyle = {
    position: "relative",
    backgroundColor: "var(--bg-main)",
    width: "100%",
    borderRadius: 24,
    borderBottomLeftRadius: 4,
    padding: 24,
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: "flex", alignItems: "center", padding: 20 }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "var(--radius)" }} />
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={chatBubbleStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, margin: 0, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8 }}>
            🗳️ Bỏ phiếu
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: "bold", color: timeLeft <= 10 ? "#e74c3c" : "var(--primary)" }}>
            <Clock size={18} /> {timeLeft}s
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 25 }}>
          {games.map(game => {
            const isVoted = myGameVote === game.id;
            const voteCount = voteCounts[game.id] || 0;
            const isTopVoted = game.id === topGameId && topVotes > 0;

            return (
              <motion.div
                key={game.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleVoteGame(game.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: 14, borderRadius: 16,
                  backgroundColor: isVoted ? game.color + "15" : "white",
                  border: `2px solid ${isVoted ? game.color : "#EAEAEA"}`,
                  boxShadow: isVoted ? `0 4px 12px ${game.color}30` : "var(--shadow)",
                  cursor: "pointer", transition: "all 0.2s",
                  position: "relative", overflow: "hidden"
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  backgroundColor: game.color + "20",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, flexShrink: 0
                }}>
                  {game.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "bold", fontSize: 15, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 6 }}>
                    {game.name}
                    {isTopVoted && <span style={{ fontSize: 11, backgroundColor: "#FFD700", color: "#000", padding: "2px 6px", borderRadius: 6 }}>TOP</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {game.description}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {game.minPlayers}-{game.maxPlayers} người • {game.tags.join(", ")}
                  </div>
                </div>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  fontSize: 12, color: isVoted ? game.color : "var(--text-muted)",
                  fontWeight: "bold", flexShrink: 0, width: "50px"
                }}>
                  {isVoted && <Check size={16} color={game.color} />}
                  <span>{voteCount} phiếu</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {isHost ? (
          <div style={{ borderTop: "1px solid #eee", paddingTop: 15, display: "flex", flexDirection: "column", gap: 10 }}>
            {topGameId ? (
              <button
                className="btn btn-primary"
                style={{ height: 50, background: "linear-gradient(135deg, #2ecc71, #27ae60)", border: "none" }}
                onClick={handleConfirmGame}
              >
                <Play size={18} style={{ marginRight: 8 }} />
                CHỐT TRÒ CHƠI SỚM
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ height: 50, opacity: 0.5 }}
                disabled
              >
                ĐỢI MỌI NGƯỜI CHỌN...
              </button>
            )}
            <button
              className="btn"
              style={{ height: 40, backgroundColor: "transparent", color: "white", border: "none" }}
              onClick={handleCancelVote}
            >
              HỦY BỎ
            </button>
          </div>
        ) : (
          <div style={{ padding: 12, backgroundColor: "#FFF3CD", color: "#856404", borderRadius: 12, textAlign: "center", fontSize: 14 }}>
            Đã nhận {totalVotes}/{numPlayers} phiếu...
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
