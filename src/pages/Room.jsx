import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, onValue, get } from "firebase/database";
import { API_BASE_URL } from "../utils/constants";
import RoomHeader from "../components/room/RoomHeader";
import WaitingPhase from "../components/room/WaitingPhase";
import PlayingPhase from "../components/room/PlayingPhase";
import SettingsModal from "../components/room/SettingsModal";
import TopicsModal from "../components/room/TopicsModal";
import CountdownOverlay from "../components/room/CountdownOverlay";
import VotingPhase from "../components/room/VotingPhase";
import ResultPhase from "../components/room/ResultPhase";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [session, setSession] = useState(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [localSettings, setLocalSettings] = useState({ spyCount: 1, mrWhiteEnabled: false, turnTimerSeconds: 60 });

  const [localPhase, setLocalPhase] = useState("waiting");
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const prevPhaseRef = useRef(null);
  const hasStartedGameRef = useRef(false);

  useEffect(() => {
    const currentPhase = roomData?.meta?.phase;
    if (!currentPhase) return;

    if (currentPhase === "playing" && (prevPhaseRef.current === "waiting" || prevPhaseRef.current === "setup")) {
        setShowCountdown(true);
        setCountdownValue(3);
        let count = 3;
        const timer = setInterval(() => {
            count--;
            setCountdownValue(count);
            if (count === 0) {
                clearInterval(timer);
                setShowCountdown(false);
                setLocalPhase("playing");
            }
        }, 1000);
    } else if (!showCountdown) {
        setLocalPhase(currentPhase);
        if (currentPhase === "waiting" || currentPhase === "result") {
            hasStartedGameRef.current = false;
        }
    }

    if (currentPhase) {
        prevPhaseRef.current = currentPhase;
    }
  }, [roomData?.meta?.phase, showCountdown]);

  useEffect(() => {
    const localSession = localStorage.getItem("spyfinder_session");
    if (!localSession) {
      navigate("/");
      return;
    }
    const sess = JSON.parse(localSession);
    setSession(sess);

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        if (data.settings) setLocalSettings(data.settings);
        if (data.topics?.submitted?.[sess.playerId]) {
            const sub = data.topics.submitted[sess.playerId];
            const sel = [];
            if (sub.topic1) sel.push(sub.topic1);
            if (sub.topic2) sel.push(sub.topic2);
            setSelectedTopics(sel);
        }
      } else {
        alert("Phòng này không tồn tại hoặc đã kết thúc!");
        navigate("/");
      }
    });

    get(ref(db, 'topicDatabase')).then((snap) => {
        if(snap.exists()) {
            const t = [];
            snap.forEach(c => { t.push({id: c.key, ...c.val()}) });
            setTopics(t);
        }
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  // Gọi API leave khi đóng tab hoặc refresh (best-effort)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sess = JSON.parse(localStorage.getItem("spyfinder_session") || "null");
      if (!sess) return;
      // Dùng sendBeacon để gửi request ngay cả khi tab đang đóng
      navigator.sendBeacon(
        `${API_BASE_URL}/api/rooms/leave`,
        new Blob([JSON.stringify({ roomId: sess.currentRoomId, playerId: sess.playerId })], { type: "application/json" })
      );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [roomId]);

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
    // Giữ lại profile (username + avatar), chỉ xóa session phòng
    // Lưu lại last session để auto-fill khi vào lại
    const currentSession = localStorage.getItem("spyfinder_session");
    if (currentSession) {
        localStorage.setItem("spyfinder_last_session", currentSession);
    }
    localStorage.removeItem("spyfinder_session");
    navigate("/");
  };

  const handleToggleReady = async () => {
    try {
      const isReady = !roomData.players[session.playerId]?.isReady;
      const response = await fetch(`${API_BASE_URL}/api/rooms/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId: session.playerId, isReady })
      });
      if (!response.ok) {
          alert(`Lỗi API: ${response.status} - Backend có đang chạy không?`);
      }
    } catch (e) {
      console.error(e);
      alert("Không thể kết nối đến Backend!");
    }
  };

  const handleSaveSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/rooms/settings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, playerId: session.playerId, settings: localSettings })
        });
        if (!response.ok) alert(`Lỗi API: ${response.status}`);
        setShowSettings(false);
      } catch (e) {
          console.error(e);
          alert("Lỗi kết nối Backend!");
      }
  };

  const handleSaveTopics = async (topicsToSave) => {
      try {
          const response = await fetch(`${API_BASE_URL}/api/rooms/submit-topics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, playerId: session.playerId, topics: topicsToSave })
          });
          if (!response.ok) alert(`Lỗi API: ${response.status}`);
      } catch(e) {
          console.error(e);
          alert("Lỗi kết nối Backend!");
      }
  };

  const toggleTopicSelection = (topicId) => {
      let newTopics = [...selectedTopics];
      if (newTopics.includes(topicId)) {
          newTopics = newTopics.filter(id => id !== topicId);
      } else {
          if (newTopics.length < 2) {
              newTopics.push(topicId);
          }
      }
      setSelectedTopics(newTopics);
      handleSaveTopics(newTopics);
  };

  const handleStartGame = async () => {
      try {
          const response = await fetch(`${API_BASE_URL}/api/rooms/start-game`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, playerId: session.playerId })
          });
          if (!response.ok) alert(`Lỗi API: ${response.status}`);
      } catch(e) {
          console.error(e);
          alert("Lỗi kết nối Backend! Hãy chắc chắn server backend đang chạy.");
      }
  };

  const handleNextTurn = async () => {
      try {
          const response = await fetch(`${API_BASE_URL}/api/rooms/next-turn`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, playerId: session.playerId })
          });
          if (!response.ok) alert(`Lỗi API: ${response.status}`);
      } catch(e) {
          console.error(e);
          alert("Lỗi kết nối Backend!");
      }
  };

  const handleEndGame = async () => {
      try {
          const response = await fetch(`${API_BASE_URL}/api/rooms/end-game`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, playerId: session.playerId })
          });
          if (!response.ok) alert(`Lỗi API: ${response.status}`);
      } catch(e) {
          console.error(e);
      }
  };

  const handleKick = async (targetId) => {
      try {
          const response = await fetch(`${API_BASE_URL}/api/rooms/kick`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, playerId: session.playerId, targetId })
          });
          if (!response.ok) alert(`Lỗi kick: ${response.status}`);
      } catch(e) {
          console.error(e);
      }
  };

  const handleNextRound = async () => {
      try {
          const response = await fetch(`${API_BASE_URL}/api/rooms/next-round`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, playerId: session.playerId })
          });
          if (!response.ok) alert(`Lỗi API: ${response.status}`);
      } catch(e) {
          console.error(e);
      }
  };

  const meta = roomData?.meta;
  const players = roomData?.players;
  const isHost = meta?.hostPlayerId === session?.playerId;
  const me = players?.[session?.playerId];
  const allReady = Object.values(players || {}).every(p => p.isReady);
  const numPlayers = Object.keys(players || {}).length;

  useEffect(() => {
      if (isHost && allReady && localPhase === "waiting" && !hasStartedGameRef.current && numPlayers > 0) {
          hasStartedGameRef.current = true;
          handleStartGame();
      }
  }, [isHost, allReady, localPhase, numPlayers]);

  // Detect if current player was kicked (no longer in players list)
  // Guard: numPlayers > 0 đảm bảo data đã load, tránh false-positive khi khởi tạo
  useEffect(() => {
      if (roomData && session && players && numPlayers > 0 && !players[session.playerId]) {
          // Player was removed (kicked)
          localStorage.removeItem("spyfinder_session");
          alert("Bạn đã bị kick khỏi phòng!");
          navigate("/");
      }
  }, [players, session, roomData, navigate, numPlayers]);

  if (!roomData || !session) {
    return <div style={{ padding: 20, textAlign: "center", marginTop: 50 }}>Đang tải dữ liệu phòng...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <RoomHeader session={session} roomId={roomId} me={me} />

      <div style={{ flex: 1, padding: 20, position: "relative" }}>
        {(localPhase === "waiting" || localPhase === "setup") && (
          <WaitingPhase 
            roomData={roomData}
            session={session}
            isHost={isHost}
            me={me}
            allReady={allReady}
            numPlayers={numPlayers}
            selectedTopics={selectedTopics}
            setShowTopics={setShowTopics}
            setShowSettings={setShowSettings}
            handleStartGame={handleStartGame}
            handleToggleReady={handleToggleReady}
            handleKick={handleKick}
            handleLeave={handleLeave}
          />
        )}
        
        {localPhase === "playing" && (
          <PlayingPhase 
            roomData={roomData}
            session={session}
            handleNextTurn={handleNextTurn}
            handleEndGame={handleEndGame}
          />
        )}
        
        {localPhase === "voting" && (
          <VotingPhase 
            roomData={roomData}
            session={session}
            handleEndGame={handleEndGame}
          />
        )}
        
        {localPhase === "result" && (
          <ResultPhase 
            roomData={roomData}
            session={session}
            handleNextRound={handleNextRound}
            handleEndGame={handleEndGame}
            handleStartGame={handleStartGame}
          />
        )}

        <CountdownOverlay showCountdown={showCountdown} countdownValue={countdownValue} />
      </div>

      {showSettings && (
        <SettingsModal 
          localSettings={localSettings}
          setLocalSettings={setLocalSettings}
          numPlayers={numPlayers}
          handleSaveSettings={handleSaveSettings}
          setShowSettings={setShowSettings}
        />
      )}

      {showTopics && (
        <TopicsModal 
          topics={topics}
          selectedTopics={selectedTopics}
          toggleTopicSelection={toggleTopicSelection}
          setShowTopics={setShowTopics}
        />
      )}
    </div>
  );
}
