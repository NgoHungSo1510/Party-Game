import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AVATARS } from "../../utils/constants";
import { StopCircle, Trophy, UserMinus, RotateCcw, Home } from "lucide-react";

export default function ResultPhase({ roomData, session, handleNextRound, handleEndGame, handleStartGame }) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [endGameTimeLeft, setEndGameTimeLeft] = useState(10);
  const [myVote, setMyVote] = useState(null);
  
  const { meta, players, votes, gameState, endGameVotes } = roomData;
  const isHost = meta.hostPlayerId === session.playerId;
  
  const eliminatedId = votes?.eliminatedPlayerId;
  const eliminatedPlayer = eliminatedId ? players[eliminatedId] : null;
  const isGameOver = !!gameState?.winner;

  // Countdown for intermediate rounds
  useEffect(() => {
    if (isGameOver) return;

    if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isHost) {
        handleNextRound();
    }
  }, [timeLeft, isGameOver, isHost, handleNextRound]);

  // Vote counting for game over
  const [voteCounts, setVoteCounts] = useState({ play_again: 0, lobby: 0 });
  
  useEffect(() => {
    if (!isGameOver) return;
    const votesObj = endGameVotes || {};
    let pa = 0; let l = 0;
    Object.values(votesObj).forEach(v => {
        if (v === "play_again") pa++;
        else if (v === "lobby") l++;
    });
    setVoteCounts({ play_again: pa, lobby: l });
  }, [endGameVotes, isGameOver]);

  // Countdown for game over voting
  useEffect(() => {
    if (!isGameOver) return;
    if (endGameTimeLeft > 0) {
        const timer = setTimeout(() => setEndGameTimeLeft(endGameTimeLeft - 1), 1000);
        return () => clearTimeout(timer);
    } else if (endGameTimeLeft === 0 && isHost) {
        if (voteCounts.lobby > voteCounts.play_again) {
            handleEndGame(); // Về phòng chờ
        } else {
            handleStartGame(); // Chơi tiếp (mặc định nếu hòa hoặc không ai chọn)
        }
    }
  }, [endGameTimeLeft, isGameOver, isHost, voteCounts, handleEndGame, handleStartGame]);

  const castVote = async (choice) => {
      setMyVote(choice);
      try {
          await fetch("http://localhost:5000/api/rooms/submit-endgame-vote", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomId: meta.roomId, playerId: session.playerId, vote: choice })
          });
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
        
        {isGameOver ? (
            <div style={{ marginBottom: 40 }}>
                <Trophy size={64} color="#FFD700" style={{ marginBottom: 20 }} />
                <h1 style={{ fontSize: 32, color: "var(--primary)", marginBottom: 10, textTransform: "uppercase" }}>
                    PHE {gameState.winner === "citizens" ? "DÂN LÀNG" : "GIÁN ĐIỆP"} CHIẾN THẮNG!
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Trò chơi đã kết thúc.</p>
                
                <div style={{ marginTop: 30, backgroundColor: "white", padding: 20, borderRadius: 16, boxShadow: "var(--shadow)" }}>
                    <h3 style={{ marginBottom: 15 }}>Bạn muốn làm gì tiếp theo? ({endGameTimeLeft}s)</h3>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button 
                            className={`btn ${myVote === 'lobby' ? 'btn-secondary' : 'btn-outline'}`} 
                            style={{ flex: 1, height: 'auto', padding: '15px 10px', fontSize: 14 }}
                            onClick={() => castVote('lobby')}
                        >
                            <Home size={20} style={{ marginBottom: 5 }} />
                            <div>Về Phòng Chờ</div>
                            <div style={{ fontSize: 12, marginTop: 5 }}>({voteCounts.lobby} phiếu)</div>
                        </button>
                        <button 
                            className={`btn ${myVote === 'play_again' ? 'btn-primary' : 'btn-outline'}`} 
                            style={{ flex: 1, height: 'auto', padding: '15px 10px', fontSize: 14 }}
                            onClick={() => castVote('play_again')}
                        >
                            <RotateCcw size={20} style={{ marginBottom: 5 }} />
                            <div>Chơi Tiếp</div>
                            <div style={{ fontSize: 12, marginTop: 5 }}>({voteCounts.play_again} phiếu)</div>
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            <div style={{ marginBottom: 40 }}>
                <UserMinus size={64} color="#D9534F" style={{ marginBottom: 20 }} />
                <h2 style={{ fontSize: 24, marginBottom: 10 }}>KẾT QUẢ BẦU CHỌN</h2>
                
                {eliminatedPlayer ? (
                    <div style={{ backgroundColor: "#FFE5E5", padding: 20, borderRadius: 16, border: "2px solid #D9534F", display: "inline-block" }}>
                        <div style={{ fontSize: 48, marginBottom: 10 }}>
                            {AVATARS[eliminatedPlayer.avatarId]?.emoji}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: "bold", color: "#D9534F" }}>
                            {eliminatedPlayer.username} đã bị loại!
                        </div>
                    </div>
                ) : (
                    <div style={{ backgroundColor: "#EEEEEE", padding: 20, borderRadius: 16, display: "inline-block" }}>
                        <div style={{ fontSize: 20, fontWeight: "bold", color: "var(--text-main)" }}>
                            Hòa phiếu! Không ai bị loại.
                        </div>
                    </div>
                )}
            </div>
        )}

        {!isGameOver && (
            <div style={{ fontSize: 18, color: "var(--text-muted)", marginBottom: 30 }}>
                Vòng tiếp theo sẽ bắt đầu sau <span style={{ fontWeight: "bold", color: "var(--primary)", fontSize: 24 }}>{timeLeft}s</span>
            </div>
        )}

        {isHost && !isGameOver && (
            <button 
                className="btn" 
                style={{ backgroundColor: "#FFE5E5", color: "#D9534F", width: "100%", maxWidth: 300 }} 
                onClick={handleEndGame}
            >
                <StopCircle size={18} style={{ marginRight: 8 }} /> HỦY VÀ VỀ PHÒNG CHỜ
            </button>
        )}

    </motion.div>
  );
}
