import React from "react";
import { Users, Settings, LogOut, CheckCircle, Circle, Play, X, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { AVATARS } from "../../../utils/constants";
import { useGameAudio } from "../../../hooks/useGameAudio";
import "../werewolf.css";

export default function WerewolfWaitingPhase({ 
  roomData, session, isHost, me, 
  setShowSettings, handleToggleReady, handleKick, handleLeave, handleBackToLobby, handleStartGame
}) {
  const { meta, players } = roomData;
  const { unlock } = useGameAudio();
  const numPlayers = Object.keys(players || {}).length;
  const allReady = Object.values(players || {}).every(p => p.isReady || p.role === "spectator");
  
  // Ma Sói cần ít nhất 3 người chơi để test
  const canStart = numPlayers >= 3 && allReady;

  React.useEffect(() => {
    if (isHost && canStart) {
      const timer = setTimeout(() => {
        handleStartGame();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isHost, canStart]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }} className="ww-glow-text">
          <Users size={20} /> Người chơi: {numPlayers}/{meta?.maxPlayers || 16}
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          {isHost && (
            <button 
              onClick={() => setShowSettings(true)}
              className="ww-btn-secondary"
              style={{ background: "rgba(108, 92, 231, 0.2)", border: "1px solid rgba(108, 92, 231, 0.5)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: "12px", fontWeight: "bold" }}
            >
              <Settings size={18} /> Thiết lập
            </button>
          )}
        </div>
      </div>

      <div className="ww-grid-2" style={{ marginBottom: 30 }}>
        {Object.entries(players || {}).map(([id, player]) => {
          const avatar = AVATARS[player.avatarId] || AVATARS["avatar_1"];
          const isMe = id === session?.playerId;
          const isHostPlayer = id === meta?.hostPlayerId;
          
          return (
            <motion.div 
              key={id} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className={`ww-choice-card ${player.isReady ? 'selected' : ''}`}
            >
              {isHost && !isMe && (
                <button
                  onClick={() => handleKick(id)}
                  title={`Kick ${player.username}`}
                  style={{
                    position: "absolute", top: 6, right: 6,
                    background: "#e74c3c", border: "none", borderRadius: "50%",
                    width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0, color: "white", zIndex: 10
                  }}
                >
                  <X size={13} />
                </button>
              )}
              
              <div className="ww-avatar-emoji">{avatar.emoji}</div>
              <div style={{ fontWeight: "bold", marginTop: 4, fontSize: 14, textAlign: "center" }}>
                {player.username} {isMe && "(Bạn)"} {isHostPlayer && "👑"}
              </div>
              <div className="ww-badge" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, backgroundColor: player.isReady ? "var(--ww-guard)" : "rgba(255,255,255,0.1)", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>
                {player.isReady ? <CheckCircle size={14} /> : <Circle size={14} />}
                {player.isReady ? "Sẵn sàng" : "Đang chờ..."}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {isHost && canStart ? (
          <button className="ww-btn" style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FFD700", color: "#000" }} onClick={() => { unlock(); handleStartGame(); }}>
            <Play size={18} /> BẮT ĐẦU VÁN CHƠI
          </button>
        ) : (
          <button className={`ww-btn ${me?.isReady ? 'ww-btn-secondary' : ''}`} style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={() => { unlock(); handleToggleReady(); }}>
            {me?.isReady ? "HỦY SẴN SÀNG" : "SẴN SÀNG"}
          </button>
        )}
        
        <button className="ww-btn ww-btn-wolf" style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleLeave}>
          <LogOut size={18} /> Thoát phòng
        </button>

        <div style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "rgba(243, 156, 18, 0.1)",
          border: "1px solid rgba(243, 156, 18, 0.3)",
          borderRadius: "8px",
          color: "#f39c12",
          fontSize: "13px",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        }}>
          <Volume2 size={18} />
          <span><b>Bật âm lượng</b> để nhận thông báo ban đêm!</span>
        </div>
        
        {isHost && (
          <button className="ww-btn-secondary" style={{ padding: "12px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "var(--ww-text-muted)" }} onClick={handleBackToLobby}>
             🔙 Về Phòng Chờ Tổng
          </button>
        )}
      </div>
    </motion.div>
  );
}
