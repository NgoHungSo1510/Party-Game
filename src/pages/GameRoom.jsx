import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { getGame } from "../games/registry";
import { API_BASE_URL } from "../utils/constants";

/**
 * GameRoom — Shell App
 * 
 * Đây là "vỏ bọc" load đúng Game Plugin dựa vào
 * `roomData.meta.selectedGame`. Shell KHÔNG biết logic game,
 * chỉ lo:
 *   1. Đọc selectedGame từ Firebase
 *   2. Tìm game trong Registry
 *   3. Render GameComponent với props chuẩn
 */
export default function GameRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [session, setSession] = useState(null);

  // Load session
  useEffect(() => {
    const localSession = localStorage.getItem("spyfinder_session");
    if (!localSession) {
      navigate("/");
      return;
    }
    setSession(JSON.parse(localSession));
  }, [navigate]);

  // Listen to room for selectedGame
  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        // Nếu game bị hủy (quay lại lobby)
        if (data.meta?.phase === "lobby") {
          navigate(`/lobby/${roomId}`);
        }
      } else {
        alert("Phòng không tồn tại!");
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [roomId, navigate]);

  const handleLeave = () => {
    const currentSession = localStorage.getItem("spyfinder_session");
    if (currentSession) {
      localStorage.setItem("spyfinder_last_session", currentSession);
    }
    localStorage.removeItem("spyfinder_session");
    navigate("/");
  };

  const handleBackToLobby = async () => {
    if (roomData?.meta?.hostPlayerId === session?.playerId) {
      try {
        await fetch(`${API_BASE_URL}/api/lobby/back-to-lobby`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, playerId: session.playerId })
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Chỉ chủ phòng mới có thể đưa mọi người về sảnh chung!");
    }
  };

  if (!roomData || !session) {
    return (
      <div style={{ 
        display: "flex", alignItems: "center", justifyContent: "center", 
        minHeight: "100vh", fontSize: 18, color: "var(--text-muted)" 
      }}>
        Đang tải game...
      </div>
    );
  }

  const selectedGameId = roomData.meta?.selectedGame;

  if (!selectedGameId) {
    return (
      <div style={{ 
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", 
        minHeight: "100vh", gap: 15, padding: 20
      }}>
        <div style={{ fontSize: 48 }}>🤔</div>
        <h2>Chưa chọn trò chơi</h2>
        <button className="btn btn-primary" onClick={handleBackToLobby}>
          Quay lại Lobby
        </button>
      </div>
    );
  }

  const game = getGame(selectedGameId);

  if (!game) {
    return (
      <div style={{ 
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", 
        minHeight: "100vh", gap: 15, padding: 20
      }}>
        <div style={{ fontSize: 48 }}>❌</div>
        <h2>Game "{selectedGameId}" không tồn tại!</h2>
        <button className="btn btn-primary" onClick={handleBackToLobby}>
          Quay lại Lobby
        </button>
      </div>
    );
  }

  const GameComponent = game.GameComponent;

  return (
    <GameComponent
      roomId={roomId}
      session={session}
      roomData={roomData}
      onLeave={handleLeave}
      onBackToLobby={handleBackToLobby}
    />
  );
}
