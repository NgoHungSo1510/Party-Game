import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AVATARS, API_BASE_URL } from "../../../utils/constants";
import { StopCircle, Trophy, UserMinus, RotateCcw, Home, Eye } from "lucide-react";

export default function ResultPhase({ roomData, session, handleNextRound, handleEndGame, handleStartGame }) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [endGameTimeLeft, setEndGameTimeLeft] = useState(10);
  const [myVote, setMyVote] = useState(null);
  
  const { meta, players, votes, gameState, endGameVotes, topics } = roomData;
  const isHost = meta.hostPlayerId === session.playerId;
  
  const eliminatedId = votes?.eliminatedPlayerId;
  const eliminatedPlayer = eliminatedId ? players[eliminatedId] : null;
  const isGameOver = !!gameState?.winner;
  const winner = gameState?.winner;

  // Mr White special role logic
  const isMrWhiteEliminated = eliminatedPlayer?.role === "mrWhite";
  const [mrWhiteStep, setMrWhiteStep] = useState(isMrWhiteEliminated ? 1 : 0);
  const [mrWhiteTimeLeft, setMrWhiteTimeLeft] = useState(10);
  const [showAnswerForWhite, setShowAnswerForWhite] = useState(false);

  useEffect(() => {
    if (mrWhiteStep === 1) {
      if (mrWhiteTimeLeft > 0) {
        const timer = setTimeout(() => setMrWhiteTimeLeft(mrWhiteTimeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setMrWhiteStep(2);
      }
    }
  }, [mrWhiteStep, mrWhiteTimeLeft]);

  // Countdown for intermediate rounds
  useEffect(() => {
    if (isGameOver || mrWhiteStep > 0) return; // Pause if Mr White modal is active

    if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isHost) {
        handleNextRound();
    }
  }, [timeLeft, isGameOver, isHost, handleNextRound, mrWhiteStep]);

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
    if (!isGameOver || mrWhiteStep > 0) return; // Pause if Mr White modal is active
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
  }, [endGameTimeLeft, isGameOver, isHost, voteCounts, handleEndGame, handleStartGame, mrWhiteStep]);

  const castVote = async (choice) => {
      setMyVote(choice);
      try {
          await fetch(`${API_BASE_URL}/api/rooms/submit-endgame-vote`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomId: meta.roomId, playerId: session.playerId, vote: choice })
          });
      } catch (e) {
          console.error(e);
      }
  };

  const word1 = topics?.currentKeywords?.word1 || "???";
  const word2 = topics?.currentKeywords?.word2 || "???";

  const getRoleDisplayName = (role) => {
      if (role === "spy") return "Gián điệp";
      if (role === "mrWhite") return "Mr. White";
      return "Dân làng";
  };

  const aliveWinners = Object.values(players || {}).filter(p => {
      if (!p.isAlive) return false;
      if (winner === "citizens") return p.role !== "spy";
      return p.role === "spy";
  });

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
        
        {isGameOver ? (
            <div style={{ marginBottom: 40 }}>
                <Trophy size={64} color="#FFD700" style={{ marginBottom: 20 }} />
                <h1 style={{ fontSize: 32, color: "var(--primary)", marginBottom: 10, textTransform: "uppercase" }}>
                    PHE {winner === "citizens" ? "DÂN LÀNG" : "GIÁN ĐIỆP"} CHIẾN THẮNG!
                </h1>
                
                <div style={{ backgroundColor: "#F9F9F9", padding: "15px 20px", borderRadius: 12, display: "inline-block", margin: "10px 0 20px", border: "1px solid #EEE" }}>
                    <h3 style={{ fontSize: 16, marginBottom: 10, color: "var(--text-main)" }}>Từ khóa ván này</h3>
                    <div style={{ display: "flex", gap: 20, justifyContent: "center", fontSize: 16 }}>
                        <div><strong>Dân làng:</strong> <span style={{ color: "var(--primary)", fontWeight: "bold" }}>{word1}</span></div>
                        <div><strong>Gián điệp:</strong> <span style={{ color: "#D9534F", fontWeight: "bold" }}>{word2}</span></div>
                    </div>
                </div>

                <div style={{ marginBottom: 30 }}>
                    <h3 style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 15 }}>
                        Danh sách {winner === "citizens" ? "Dân làng" : "Gián điệp"} còn sống:
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 15 }}>
                        {aliveWinners.map((p, idx) => (
                            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "white", padding: "12px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", minWidth: 90 }}>
                                <div style={{ fontSize: 36, marginBottom: 5 }}>{AVATARS[p.avatarId]?.emoji || "👤"}</div>
                                <div style={{ fontSize: 14, fontWeight: "bold", color: "var(--text-main)" }}>{p.username}</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{getRoleDisplayName(p.role)}</div>
                            </div>
                        ))}
                    </div>
                </div>                
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

        {mrWhiteStep > 0 && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ backgroundColor: "white", padding: 30, borderRadius: 20, textAlign: "center", maxWidth: 400, width: "100%" }}>
                    <div style={{ fontSize: 64, marginBottom: 10 }}>🕵️‍♂️</div>
                    <h2 style={{ color: "var(--primary)", fontSize: 24, marginBottom: 15, textTransform: "uppercase" }}>
                        MR WHITE ĐÃ BỊ LOẠI!
                    </h2>
                    <p style={{ fontSize: 16, color: "var(--text-main)", marginBottom: 20, lineHeight: 1.5 }}>
                        <strong>Luật đặc biệt:</strong> Nếu Mr White đoán chính xác từ khóa của Dân Làng, Mr White sẽ lật ngược thế cờ và <strong>GIÀNH CHIẾN THẮNG</strong>!
                    </p>

                    {mrWhiteStep === 1 ? (
                        <div style={{ fontSize: 48, fontWeight: "bold", color: "var(--primary)" }}>
                            {mrWhiteTimeLeft}s
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                            {session.playerId === eliminatedId ? (
                                <>
                                    {!showAnswerForWhite ? (
                                        <button className="btn btn-primary" onClick={() => setShowAnswerForWhite(true)}>
                                            <Eye size={20} style={{ marginRight: 8 }} /> HIỆN TỪ KHÓA
                                        </button>
                                    ) : (
                                        <div style={{ backgroundColor: "#F9F9F9", padding: 15, borderRadius: 12, border: "2px dashed var(--primary)" }}>
                                            <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 5 }}>Từ khóa của Dân Làng là:</div>
                                            <div style={{ fontSize: 24, fontWeight: "bold", color: "var(--primary)" }}>{word1}</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ color: "var(--text-muted)", fontStyle: "italic", padding: "10px 0" }}>
                                    Đang chờ Mr White xem đáp án...
                                </div>
                            )}

                            {isHost && (
                                <button className="btn btn-outline" style={{ marginTop: 15 }} onClick={() => setMrWhiteStep(0)}>
                                    TIẾP TỤC TRÒ CHƠI
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        )}

    </motion.div>
  );
}
