import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/constants";
import "./werewolf.css";
import RoomHeader from "../../components/room/RoomHeader";
import WerewolfWaitingPhase from "./components/WerewolfWaitingPhase";
import WerewolfSettings from "./components/WerewolfSettings";
import RoleReveal from "./components/RoleReveal";
import MayorElection from "./components/MayorElection";
import MayorResult from "./components/MayorResult";
import NightScreen from "./components/NightScreen";
import DawnAnnouncement from "./components/DawnAnnouncement";
import DayDiscussion from "./components/DayDiscussion";
import DayVote from "./components/DayVote";
import VoteResult from "./components/VoteResult";
import GameOver from "./components/GameOver";
import SpectatorOverlay from "./components/SpectatorOverlay";

export default function WerewolfGame({ roomId, session, roomData, onLeave, onBackToLobby }) {
  const navigate = useNavigate();
  const playerId = session?.playerId;
  
  const [showSettings, setShowSettings] = useState(false);

  if (!roomData) return null;

  const meta = roomData.meta || {};
  const players = roomData.players || {};
  const isHost = meta.hostPlayerId === playerId;
  const phase = meta.phase || "waiting";
  
  const me = players[playerId] || {};
  const isAlive = me.isAlive !== false;
  const numPlayers = Object.keys(players).length;

  // Xử lý kick
  useEffect(() => {
    if (roomData && session && players && numPlayers > 0 && !players[playerId]) {
      localStorage.removeItem("spyfinder_session");
      alert("Bạn đã bị kick khỏi phòng!");
      if (onLeave) onLeave();
      else navigate("/");
    }
  }, [players, session, roomData, navigate, numPlayers, onLeave, playerId]);

  const handleToggleReady = async () => {
    try {
      const isReady = !players[playerId]?.isReady;
      const response = await fetch(`${API_BASE_URL}/api/rooms/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId, isReady })
      });
      if (!response.ok) alert(`Lỗi API: ${response.status}`);
    } catch (e) {
      console.error(e);
      alert("Không thể kết nối đến Backend!");
    }
  };

  const handleKick = async (targetId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/kick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId, targetId })
      });
      if (!response.ok) alert(`Lỗi kick: ${response.status}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeave = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/rooms/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
    } catch (e) {
      console.error(e);
    }
    const currentSession = localStorage.getItem("spyfinder_session");
    if (currentSession) {
      localStorage.setItem("spyfinder_last_session", currentSession);
    }
    localStorage.removeItem("spyfinder_session");
    if (onLeave) onLeave();
    else navigate("/");
  };

  const handleStartGame = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/werewolf/start-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Lỗi khi bắt đầu game!");
      }
    } catch (error) {
      alert("Lỗi kết nối Backend!");
    }
  };

  const handleResetGame = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy ván chơi này và đưa mọi người về sảnh chờ?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/games/werewolf/end-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
      if (!response.ok) alert("Lỗi khi reset game!");
    } catch (e) {
      alert("Lỗi kết nối Backend!");
    }
  };

  const isPlaying = phase !== "waiting" && phase !== "lobby";

  // Render Spectator Banner if dead (except waiting / reveal / game_over)
  const showSpectatorBanner = !isAlive && 
    phase !== "waiting" && 
    phase !== "lobby" &&
    phase !== "role_reveal" && 
    phase !== "game_over";

  const renderContent = () => {
    switch (phase) {
      case "game_active":
      case "waiting":
      case "lobby":
        return (
          <WerewolfWaitingPhase 
            roomId={roomId}
            session={session}
            roomData={roomData}
            isHost={isHost}
            me={me}
            setShowSettings={setShowSettings}
            handleToggleReady={handleToggleReady}
            handleKick={handleKick}
            handleLeave={handleLeave}
            handleBackToLobby={onBackToLobby}
            handleStartGame={handleStartGame}
          />
        );
      case "role_reveal":
        return (
          <RoleReveal 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            isHost={isHost}
          />
        );
      case "mayor_election":
        return (
          <MayorElection 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
          />
        );
      case "mayor_result":
        return (
          <MayorResult 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            isHost={isHost}
          />
        );
      case "night":
        return (
          <NightScreen 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            isHost={isHost}
          />
        );
      case "dawn":
        return (
          <DawnAnnouncement 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            isHost={isHost}
          />
        );
      case "day_discussion":
        return (
          <DayDiscussion 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            isHost={isHost}
          />
        );
      case "day_vote":
        return (
          <DayVote 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            isHost={isHost}
          />
        );
      case "day_result":
        return (
          <VoteResult 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            isHost={isHost}
          />
        );
      case "game_over":
        return (
          <GameOver 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            isHost={isHost}
          />
        );
      default:
        return (
          <WerewolfWaitingPhase 
            roomId={roomId}
            session={session}
            roomData={roomData}
            isHost={isHost}
            me={me}
            setShowSettings={setShowSettings}
            handleToggleReady={handleToggleReady}
            handleKick={handleKick}
            handleLeave={handleLeave}
            handleBackToLobby={onBackToLobby}
            handleStartGame={handleStartGame}
          />
        );
    }
  };

  return (
    <div className="werewolf-theme" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: 0 }}>
      {/* Global Room Header */}
      <RoomHeader session={session} roomId={roomId} me={me} title="MA SÓI 🐺" isHost={isHost && !isPlaying} />

      {/* Khu vực chứa Nút Reset Game (hiện cho mọi người để giữ bố cục, nhưng chỉ Host thấy nút) */}
      {isPlaying && (
        <div style={{ padding: "10px 20px 0", display: "flex", justifyContent: "flex-end", minHeight: "44px" }}>
          {isHost && (
            <button 
              onClick={handleResetGame} 
              style={{ 
                background: "rgba(231, 76, 60, 0.2)", color: "#e74c3c", border: "1px solid #e74c3c", 
                padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "5px"
              }}
            >
              🔄 Thoát Về Sảnh (Reset)
            </button>
          )}
        </div>
      )}

      {/* Ghost Banner */}
      {showSpectatorBanner && <SpectatorOverlay />}

      {/* Main Screen Wrapper */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: "20px", padding: "0 20px 20px" }}>
        {renderContent()}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center",
          alignItems: "center", zIndex: 1000, padding: 20
        }}>
          <WerewolfSettings 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            isHost={isHost}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  );
}
