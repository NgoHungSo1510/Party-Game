import { useState, useEffect } from "react";
import { ShieldAlert, Clock, StopCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import { AVATARS } from "../../utils/constants";

export default function PlayingPhase({ roomData, session, handleNextTurn, handleEndGame }) {
  const [showRole, setShowRole] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Ticket States
  const [ticketState, setTicketState] = useState("hidden");
  const [animatedTicketId, setAnimatedTicketId] = useState(null);
  
  const { players, gameState, settings } = roomData;
  const turnPlayerId = gameState?.currentTurnPlayerId;
  const turnPlayer = players[turnPlayerId];
  const isMyTurn = turnPlayerId === session.playerId;
  const me = players[session.playerId];
  
  const myRole = me?.role;
  const myKeyword = me?.keyword;
  
  const turnTimerSeconds = settings?.turnTimerSeconds || 60;
  
  const isHost = roomData.meta?.hostPlayerId === session.playerId;
  const amIAlive = me?.isAlive && me?.role !== "spectator";
  
  useEffect(() => {
      const timerStartedAt = gameState?.timerStartedAt;
      if (!timerStartedAt) return;
      
      const interval = setInterval(() => {
          const now = Date.now();
          const elapsed = (now - timerStartedAt) / 1000;
          let remaining = turnTimerSeconds - elapsed;
          if (remaining < 0) remaining = 0;
          setTimeLeft(remaining);
      }, 100);
      
      return () => clearInterval(interval);
  }, [gameState?.timerStartedAt, turnTimerSeconds]);
  
  // Ticket Animation Logic
  useEffect(() => {
    const activeTicket = gameState?.activeTicket;
    if (activeTicket && activeTicket.drawnAt) {
      if (activeTicket.drawnAt !== animatedTicketId) {
        setAnimatedTicketId(activeTicket.drawnAt);
        setTicketState("animating");
        const timer = setTimeout(() => {
          setTicketState("minimized");
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setTicketState("hidden");
    }
  }, [gameState?.activeTicket, animatedTicketId]);
  
  const progress = Math.max(0, timeLeft / turnTimerSeconds);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Xóa màu phân biệt role, dùng chung 1 màu
  const roleColor = "#5C6BC0"; 
  
  const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
        
        {/* NỬA TRÊN */}
        <div style={{ position: "relative", flex: 1, borderBottom: "2px dashed #ccc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            
            {/* TICKET PILL (Minimized) */}
            {ticketState === "minimized" && gameState?.activeTicket && (
                <motion.div 
                   initial={{ scale: 0, opacity: 0 }} 
                   animate={{ scale: 1, opacity: 1 }}
                   onClick={() => setTicketState("expanded")}
                   style={{
                      position: "absolute", right: 20, top: 20, 
                      backgroundColor: "white", borderRadius: 30, padding: "8px 16px",
                      display: "flex", alignItems: "center", gap: 8,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer",
                      border: "2px solid var(--primary)", color: "var(--primary)", fontWeight: "bold", zIndex: 10
                   }}
                >
                   <span style={{ fontSize: 20 }}>{gameState.activeTicket.imageUrl || "🎴"}</span>
                   <span style={{ fontSize: 14 }}>Thẻ bài</span>
                </motion.div>
            )}

            <h3 style={{ color: "var(--text-muted)", marginBottom: 15 }}>
                Lượt {gameState?.turnCount} • {isMyTurn ? "TỚI LƯỢT CỦA BẠN" : `Lượt của ${turnPlayer?.username}`}
            </h3>
            
            <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                {/* SVG Vòng tròn đếm thời gian chung */}
                <svg width="140" height="140" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                    <circle 
                        cx="70" cy="70" r={radius} 
                        stroke="#EEEEEE" strokeWidth="8" fill="none" 
                    />
                    <circle 
                        cx="70" cy="70" r={radius} 
                        stroke={timeLeft < 10 ? "#D9534F" : "var(--primary)"} 
                        strokeWidth="8" fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: "stroke-dashoffset 0.1s linear" }}
                    />
                </svg>
                
                <div style={{ 
                    width: 100, height: 100, borderRadius: 50, 
                    backgroundColor: AVATARS[turnPlayer?.avatarId]?.color + "30",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
                    border: `4px solid ${isMyTurn ? "var(--primary)" : AVATARS[turnPlayer?.avatarId]?.color}`,
                    zIndex: 2
                }}>
                    {AVATARS[turnPlayer?.avatarId]?.emoji}
                </div>
            </div>

            {/* Đồng hồ hiển thị thời gian số */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 24, fontWeight: "bold", color: timeLeft < 10 ? "#D9534F" : "var(--text-main)", marginBottom: 15 }}>
                <Clock size={24} /> {formatTime(timeLeft)}
            </div>

            {isMyTurn && amIAlive && (
                <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleNextTurn}>
                    KẾT THÚC LƯỢT
                </button>
            )}
        </div>

        {/* NỬA DƯỚI */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
            {!amIAlive ? (
                <div style={{ backgroundColor: "#333", padding: 30, borderRadius: 24, color: "white", textAlign: "center", width: "100%", maxWidth: 300 }}>
                    <ShieldAlert size={48} style={{ margin: "0 auto", marginBottom: 20, opacity: 0.5 }} />
                    <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>BẠN ĐANG LÀ KHÁN GIẢ</div>
                    <div style={{ fontSize: 14, opacity: 0.7 }}>Hãy chờ đợi ván đấu kết thúc.</div>
                </div>
            ) : (
                <div 
                    onPointerDown={() => setShowRole(true)}
                    onPointerUp={() => setShowRole(false)}
                    onPointerLeave={() => setShowRole(false)}
                    style={{
                        width: "100%", maxWidth: 300, padding: 30, borderRadius: 24,
                        backgroundColor: showRole ? roleColor : "#444",
                        color: "white", textAlign: "center", cursor: "pointer",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                        transition: "all 0.2s", userSelect: "none"
                    }}
                >
                    {showRole ? (
                        <>
                            <div style={{ fontSize: 16, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10, opacity: 0.8 }}>TỪ KHÓA CỦA BẠN</div>
                            
                            {myRole === "mrWhite" ? (
                                <>
                                    <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 5 }}>MR. WHITE</div>
                                    <div style={{ fontSize: 13, lineHeight: 1.4, opacity: 0.9, backgroundColor: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 8 }}>
                                        Bạn không biết từ khóa. Hãy cố gắng sống sót. Nếu bị vote loại, bạn phải đoán từ khóa của Dân Làng để chiến thắng!
                                    </div>
                                </>
                            ) : (
                                <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 10 }}>{myKeyword}</div>
                            )}
                            
                            {myRole !== "mrWhite" && (
                                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 15 }}>
                                    (Không tiết lộ màu hay thông tin này)
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <ShieldAlert size={48} style={{ margin: "0 auto", marginBottom: 20, opacity: 0.5 }} />
                            <div style={{ fontSize: 18, fontWeight: "bold" }}>THẺ BẢN THÂN</div>
                            <div style={{ fontSize: 14, opacity: 0.7, marginTop: 10 }}>Đè giữ để xem từ khóa</div>
                        </>
                    )}
                </div>
            )}

            {isHost && (
                <button 
                    className="btn" 
                    style={{ backgroundColor: "#FFE5E5", color: "#D9534F", width: "100%", maxWidth: 300, marginTop: 30 }} 
                    onClick={handleEndGame}
                >
                    <StopCircle size={18} style={{ marginRight: 8 }} /> KẾT THÚC VÁN (VỀ PHÒNG CHỜ)
                </button>
            )}
        </div>

    </motion.div>

    {/* TICKET MODAL (Animating or Expanded) */}
    {(ticketState === "animating" || ticketState === "expanded") && gameState?.activeTicket && (
      <div 
        style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.6)" }} 
        onClick={() => ticketState === "expanded" && setTicketState("minimized")}
      >
        <motion.div 
          initial={{ scale: 0.5, opacity: 0, rotate: -5 }} 
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white", padding: 30, borderRadius: 24, textAlign: "center",
            width: "80%", maxWidth: 320, boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            border: "4px solid var(--primary)", position: "relative"
          }}
        >
          {ticketState === "expanded" && (
              <button 
                onClick={() => setTicketState("minimized")}
                style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", color: "#888" }}
              >
                <X size={24} />
              </button>
          )}
          
          <div style={{ fontSize: 80, marginBottom: 15, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>
              {gameState.activeTicket.imageUrl || "🃏"}
          </div>
          
          <h2 style={{ color: "var(--primary)", fontSize: 24, marginBottom: 10, textTransform: "uppercase" }}>
              {gameState.activeTicket.name}
          </h2>
          
          <p style={{ fontSize: 16, color: "var(--text-main)", lineHeight: 1.5 }}>
              {gameState.activeTicket.description}
          </p>
          
          {ticketState === "animating" && (
              <div style={{ marginTop: 20, fontSize: 14, color: "#888", fontStyle: "italic" }}>
                  Đang thu nhỏ...
              </div>
          )}
        </motion.div>
      </div>
    )}
  </>
  );
}
