import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { API_BASE_URL, AVATARS } from "../utils/constants";
import { getAllGames } from "../games/registry";
import { Users, LogOut, CheckCircle, Circle, Play, X, Settings } from "lucide-react";
import RoomHeader from "../components/room/RoomHeader";
import GameSelectionModal from "../components/room/GameSelectionModal";

export default function Lobby() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [session, setSession] = useState(null);
  const [myGameVote, setMyGameVote] = useState(null);

  const games = getAllGames();

  useEffect(() => {
    const localSession = localStorage.getItem("spyfinder_session");
    if (!localSession) {
      navigate("/");
      return;
    }
    setSession(JSON.parse(localSession));
  }, [navigate]);

  useEffect(() => {
    if (!roomId) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        if (data.meta?.selectedGame && data.meta?.phase === "game_active") {
          navigate(`/game/${roomId}`);
        }
      } else {
        alert("Phòng không tồn tại!");
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [roomId, navigate]);

  useEffect(() => {
    if (session && roomData?.gameVotes?.[session.playerId]) {
      setMyGameVote(roomData.gameVotes[session.playerId]);
    }
  }, [session, roomData?.gameVotes]);

  useEffect(() => {
    const players = roomData?.players;
    const numPlayers = Object.keys(players || {}).length;
    if (roomData && session && players && numPlayers > 0 && !players[session.playerId]) {
      localStorage.removeItem("spyfinder_session");
      alert("Bạn đã bị kick khỏi phòng!");
      navigate("/");
    }
  }, [roomData?.players, session, navigate]);

  const handleStartVote = async () => {
    if (!session) return;
    try {
      await fetch(`${API_BASE_URL}/api/lobby/start-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId: session.playerId })
      });
    } catch (e) {
      console.error("Start vote error:", e);
    }
  };

  const handleCancelVote = async () => {
    if (!session) return;
    try {
      await fetch(`${API_BASE_URL}/api/lobby/cancel-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId: session.playerId })
      });
      setMyGameVote(null);
    } catch (e) {
      console.error("Cancel vote error:", e);
    }
  };

  const handleVoteGame = async (gameId) => {
    if (!session) return;
    setMyGameVote(gameId);
    try {
      await fetch(`${API_BASE_URL}/api/lobby/vote-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId: session.playerId, gameId })
      });
    } catch (e) {
      console.error("Vote game error:", e);
    }
  };

  const handleConfirmGame = async () => {
    if (!session) return;
    try {
      await fetch(`${API_BASE_URL}/api/lobby/confirm-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId: session.playerId })
      });
    } catch (e) {
      console.error("Confirm game error:", e);
    }
  };

  const handleLeave = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/rooms/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId: session?.playerId })
      });
    } catch (e) {
      console.error(e);
    }
    const currentSession = localStorage.getItem("spyfinder_session");
    if (currentSession) {
      localStorage.setItem("spyfinder_last_session", currentSession);
    }
    localStorage.removeItem("spyfinder_session");
    navigate("/");
  };
  
  const handleKick = async (targetId) => {
    try {
        await fetch(`${API_BASE_URL}/api/rooms/kick`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, playerId: session.playerId, targetId })
        });
    } catch(e) {
        console.error(e);
    }
  };

  if (!roomData || !session) {
    return <div style={{ padding: 20, textAlign: "center", marginTop: 50 }}>Đang tải phòng chờ...</div>;
  }

  const meta = roomData.meta;
  const players = roomData.players || {};
  const isHost = meta?.hostPlayerId === session?.playerId;
  const numPlayers = Object.keys(players).length;
  const gameVotes = roomData.gameVotes || {};
  const me = players[session.playerId];

  const voteCounts = {};
  Object.values(gameVotes).forEach(gId => {
    voteCounts[gId] = (voteCounts[gId] || 0) + 1;
  });

  let topGameId = null;
  let topVotes = 0;
  Object.entries(voteCounts).forEach(([gId, count]) => {
    if (count > topVotes) {
      topVotes = count;
      topGameId = gId;
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <RoomHeader session={session} roomId={roomId} me={me} title="PARTY GAME LOBBY" />

      <div style={{ flex: 1, padding: 20, position: "relative" }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={20} /> Người chơi: {numPlayers}/{meta.maxPlayers}
            </h2>
            <div style={{ display: "flex", gap: 10 }}>
              {isHost && !meta.isVotingGame && (
                <button 
                  onClick={handleStartVote}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", display: "flex", alignItems: "center", gap: 5, fontWeight: "bold" }}
                >
                  <Play size={20} /> CHỌN TRÒ CHƠI
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 30 }}>
            {Object.entries(players || {}).map(([id, player]) => {
              const avatar = AVATARS[player.avatarId] || AVATARS["avatar_1"];
              const isMe = id === session.playerId;
              const isHostPlayer = id === meta.hostPlayerId;
              const hasVoted = !!gameVotes[id];
              return (
                <motion.div 
                  key={id} initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  style={{
                    backgroundColor: "white", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", alignItems: "center",
                    boxShadow: "var(--shadow)", border: `2px solid ${hasVoted ? "var(--primary)" : "transparent"}`,
                    position: "relative"
                  }}
                >
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
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12, color: hasVoted ? "var(--primary)" : "var(--text-muted)" }}>
                    {hasVoted ? <CheckCircle size={14} /> : <Circle size={14} />}
                    {hasVoted ? "Đã vote game" : "Đang chờ..."}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {!isHost && (
              <div style={{ padding: 12, backgroundColor: "#FFF3CD", color: "#856404", borderRadius: 12, textAlign: "center", fontSize: 14 }}>
                ⏳ Đang đợi chủ phòng mở vote chọn trò chơi...
              </div>
            )}
            <button className="btn" style={{ backgroundColor: "#FFE5E5", color: "#D9534F" }} onClick={handleLeave}>
              <LogOut size={18} style={{ marginRight: 8 }} /> Thoát phòng
            </button>
          </div>
        </motion.div>

        {meta.isVotingGame && (
          <GameSelectionModal 
            games={games}
            myGameVote={myGameVote}
            voteCounts={voteCounts}
            topGameId={topGameId}
            topVotes={topVotes}
            handleVoteGame={handleVoteGame}
            handleConfirmGame={handleConfirmGame}
            handleCancelVote={handleCancelVote}
            isHost={isHost}
            numPlayers={numPlayers}
            totalVotes={Object.keys(gameVotes).length}
            voteEndTime={meta.voteEndTime}
          />
        )}
      </div>
    </div>
  );
}
