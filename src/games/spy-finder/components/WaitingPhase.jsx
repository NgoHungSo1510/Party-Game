import { Users, Settings, LogOut, CheckCircle, Circle, BookOpen, Play, X } from "lucide-react";
import { motion } from "framer-motion";
import { AVATARS } from "../../../utils/constants";

export default function WaitingPhase({ 
  roomData, session, isHost, me, allReady, numPlayers, 
  selectedTopics, setShowTopics, setShowSettings, 
  handleStartGame, handleToggleReady, handleKick, handleLeave, handleBackToLobby
}) {
  const { meta, players } = roomData;

  // TEST MODE: Bỏ điều kiện numPlayers >= 3 để có thể test với 1 hoặc 2 người
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <Users size={20} /> Người chơi: {numPlayers}/{meta.maxPlayers}
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button 
            onClick={() => setShowTopics(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", display: "flex", alignItems: "center", gap: 5, fontWeight: "bold" }}
          >
            <BookOpen size={20} /> Chủ đề ({selectedTopics.length}/2)
          </button>
          {isHost && (
            <button 
              onClick={() => setShowSettings(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-main)", display: "flex", alignItems: "center", gap: 5 }}
            >
              <Settings size={20} /> Cài đặt
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 30 }}>
        {Object.entries(players || {}).map(([id, player]) => {
          const avatar = AVATARS[player.avatarId] || AVATARS["avatar_1"];
          const isMe = id === session.playerId;
          const isHostPlayer = id === meta.hostPlayerId;
          return (
            <motion.div 
              key={id} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              style={{
                backgroundColor: "white", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", alignItems: "center",
                boxShadow: "var(--shadow)", border: `2px solid ${player.isReady ? "var(--secondary)" : "transparent"}`,
                position: "relative"
              }}
            >
              {/* Kick button - chỉ host thấy, không hiện trên bản thân */}
              {isHost && !isMe && (
                <button
                  onClick={() => handleKick(id)}
                  title={`Kick ${player.username}`}
                  style={{
                    position: "absolute", top: 6, right: 6,
                    background: "#FF6B6B", border: "none", borderRadius: "50%",
                    width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0, color: "white"
                  }}
                >
                  <X size={13} />
                </button>
              )}
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 25, backgroundColor: avatar.color + "30",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `2px solid ${avatar.color}`
                }}>
                  {avatar.emoji}
                </div>
              </div>
              <div style={{ fontWeight: "bold", marginTop: 8, fontSize: 14, textAlign: "center" }}>
                {player.username} {isMe && "(Bạn)"} {isHostPlayer && "👑"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12, color: player.isReady ? "var(--secondary)" : "var(--text-muted)" }}>
                {player.isReady ? <CheckCircle size={14} /> : <Circle size={14} />}
                {player.isReady ? "Sẵn sàng" : "Đang chờ..."}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {allReady ? (
            <button className="btn btn-primary" style={{ height: 50, backgroundColor: "#FFD700", color: "#000", opacity: 0.8 }} disabled>
              <Play size={18} style={{ marginRight: 8 }} /> ĐANG BẮT ĐẦU VÁN...
            </button>
        ) : (
            <button className={`btn ${me?.isReady ? "btn-secondary" : "btn-primary"}`} style={{ height: 50 }} onClick={handleToggleReady}>
              {me?.isReady ? "HỦY SẴN SÀNG" : "SẴN SÀNG"}
            </button>
        )}
        <button className="btn" style={{ backgroundColor: "#FFE5E5", color: "#D9534F" }} onClick={handleLeave}>
          <LogOut size={18} style={{ marginRight: 8 }} /> Thoát phòng
        </button>
        {isHost && (
          <button className="btn" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "2px solid #EAEAEA" }} onClick={handleBackToLobby}>
             Về Phòng Chờ Tổng
          </button>
        )}
      </div>
    </motion.div>
  );
}
