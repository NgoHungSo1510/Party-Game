import { useState, useEffect } from "react";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";
import { ROLE_CARDS } from "../utils/werewolfConstants";
import { Clock, Play, LogOut } from "lucide-react";

export default function GameOver({ roomId, playerId, roomData, isHost }) {
  const result = roomData.gameResult || {};
  const winner = result.winner || "villagers";
  const revealedRoles = result.revealedRoles || {};
  const players = roomData.players || {};
  const votes = result.votes || {};
  
  const [timeLeft, setTimeLeft] = useState(20);
  const [myVote, setMyVote] = useState(votes[playerId]);

  const playAgainCount = Object.values(votes).filter(v => v === "play_again").length;
  const lobbyCount = Object.values(votes).filter(v => v === "lobby").length;
  const totalPlayers = Object.keys(players).length;

  const [startedAt] = useState(() => result.startedAt || Date.now());

  useEffect(() => {
    // Nếu kết quả không có startedAt, coi như bắt đầu ngay lúc render (local)
    // Tốt nhất backend nên thêm startedAt vào gameResult
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, 20 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && isHost) {
        // Force process khi hết 20s
        handleVote(myVote || "play_again", true);
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [isHost, startedAt, myVote]);

  const handleVote = async (voteType, force = false) => {
    if (!force) setMyVote(voteType);
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/end-game-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId, vote: voteType, force })
      });
    } catch (error) {
      console.error("Lỗi vote kết thúc:", error);
    }
  };

  const isWolvesWin = winner === "wolves";

  return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      {/* Crown / Winner visual */}
      <div 
        className="ww-pulse-animation" 
        style={{ 
          width: "110px", height: "110px", borderRadius: "50%", 
          background: isWolvesWin ? "rgba(231, 76, 60, 0.1)" : "rgba(52, 152, 219, 0.1)", 
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
          border: `1.5px dashed ${isWolvesWin ? "var(--ww-wolf)" : "var(--ww-villager)"}`
        }}
      >
        <span style={{ fontSize: "55px" }}>{isWolvesWin ? "🐺" : "🏆"}</span>
      </div>

      <h1 className={isWolvesWin ? "ww-glow-text-red" : "ww-glow-text"} style={{ 
        fontSize: "26px", 
        fontWeight: 950, 
        color: isWolvesWin ? "var(--ww-wolf)" : "var(--ww-villager)", 
        marginBottom: "8px",
        textTransform: "uppercase" 
      }}>
        {isWolvesWin ? "MA SÓI CHIẾN THẮNG!" : "DÂN LÀNG CHIẾN THẮNG!"}
      </h1>
      <p style={{ color: "var(--ww-text-muted)", fontSize: "14px", marginBottom: "25px" }}>
        Ván chơi kết thúc sau những đêm cân não đẫm máu.
      </p>

      {/* Role Reveal Table */}
      <div className="ww-card" style={{ padding: "15px", textAlign: "left", marginBottom: "25px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px", color: "var(--ww-text-muted)" }}>
          LẬT BÀI VAI TRÒ CHI TIẾT:
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
          {Object.entries(players).map(([pid, p]) => {
            const roleKey = revealedRoles[pid] || p.role || "villager";
            const roleInfo = ROLE_CARDS[roleKey] || ROLE_CARDS.villager;
            const avatar = AVATARS[p.avatarId] || { emoji: "👤" };
            const isAlive = p.isAlive !== false;
            const pVote = votes[pid];

            return (
              <div 
                key={pid} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "10px 12px",
                  background: isAlive ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.3)",
                  border: `1px solid ${isAlive ? "rgba(255,255,255,0.05)" : "transparent"}`,
                  borderRadius: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "24px" }}>{avatar.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: pid === playerId ? "var(--ww-accent)" : "#fff" }}>
                      {p.username} {pid === playerId ? "(Bạn)" : ""}
                      {p.isMayor && (
                        <span style={{ 
                          marginLeft: "5px", fontSize: "10px", background: "#2ecc71", 
                          padding: "2px 6px", borderRadius: "10px", color: "#fff", border: "1px solid #fff"
                        }}>
                          Trưởng Làng
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center", marginTop: "2px" }}>
                      <span className="ww-badge" style={{ 
                        background: isAlive ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)",
                        color: isAlive ? "#2ecc71" : "#e74c3c",
                        border: `1px solid ${isAlive ? "rgba(46, 204, 113, 0.3)" : "rgba(231, 76, 60, 0.3)"}`,
                        fontSize: "10px", padding: "1px 6px", display: "inline-block"
                      }}>
                        {isAlive ? "Còn sống" : "Đã chết"}
                      </span>
                      {pVote && (
                        <span style={{ fontSize: "10px", color: "var(--ww-text-muted)" }}>
                          • {pVote === "play_again" ? "Sẽ chơi tiếp" : "Về phòng chờ"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tiết lộ vai trò */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "20px" }}>{roleInfo.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: "14px", color: roleInfo.color }}>
                      {roleInfo.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hành động kết thúc */}
      <div className="ww-card" style={{ padding: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "15px" }}>
          <Clock size={20} color="var(--ww-accent)" />
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--ww-accent)" }}>{timeLeft}s</span>
        </div>
        
        <p style={{ fontSize: "13px", color: "var(--ww-text-muted)", marginBottom: "15px" }}>
          Hãy chọn chơi ván mới hoặc quay về phòng chờ. Sau 20s sẽ tự động chơi tiếp!
        </p>

        <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
          <button 
            className="ww-btn" 
            style={{ 
              background: myVote === "play_again" ? "#2ecc71" : "var(--ww-primary)",
              color: myVote === "play_again" ? "#000" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
            onClick={() => handleVote("play_again")}
          >
            <Play size={18} /> {myVote === "play_again" ? "ĐÃ CHỌN CHƠI TIẾP" : "CHƠI TIẾP NGAY"} ({playAgainCount}/{totalPlayers})
          </button>
          
          <button 
            className="ww-btn" 
            style={{ 
              background: myVote === "lobby" ? "rgba(231, 76, 60, 0.2)" : "rgba(255,255,255,0.05)",
              border: myVote === "lobby" ? "1px solid #e74c3c" : "1px solid rgba(255,255,255,0.2)",
              color: myVote === "lobby" ? "#e74c3c" : "var(--ww-text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
            onClick={() => handleVote("lobby")}
          >
            <LogOut size={18} /> {myVote === "lobby" ? "ĐÃ CHỌN VỀ LOBBY" : "VỀ PHÒNG CHỜ (LOBBY)"} ({lobbyCount}/{totalPlayers})
          </button>
        </div>
      </div>
    </div>
  );
}
