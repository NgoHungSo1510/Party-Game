import { useState, useEffect, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../../firebase";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";

export default function WolfPanel({ roomId, playerId, roomData, stepStartedAt, isHost, onTimerEnd }) {
  const players = roomData.players || {};
  const settings = roomData.settings || {};
  const duration = settings.wolfTimerSec || 120;
  
  const [timeLeft, setTimeLeft] = useState(duration);
  const [selectedTargetId, setSelectedTargetId] = useState(roomData.nightState?.wolfVotes?.[playerId] || null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  
  const chatEndRef = useRef(null);

  // Lọc đồng đội sói
  const wolves = Object.entries(players).filter(([_, p]) => p.role === "wolf");
  const targetPlayers = Object.entries(players).filter(([id, p]) => p.isAlive && p.role !== "wolf");

  // Đọc phiếu bầu của sói
  const wolfVotes = roomData.nightState?.wolfVotes || {};

  // Countdown timer
  useEffect(() => {
    let timer;
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - stepStartedAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        if (isHost) {
          onTimerEnd();
        }
      }
    };

    calculateTimeLeft();
    timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [stepStartedAt, duration, isHost]);

  // Listen to secret wolf chat
  useEffect(() => {
    const chatRef = ref(db, `rooms/${roomId}/wolfChat`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setChatMessages(Object.values(data).sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setChatMessages([]);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleVote = async (targetId) => {
    if (hasConfirmed) return;
    setSelectedTargetId(targetId);
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/wolf-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerId,
          targetId
        })
      });
    } catch (error) {
      console.error("Lỗi vote cắn:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/wolf-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerId,
          text: inputText.trim()
        })
      });
      setInputText("");
    } catch (error) {
      console.error("Lỗi gửi chat:", error);
    }
  };

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 className="ww-glow-text-red" style={{ fontSize: "20px", color: "var(--ww-wolf)", fontWeight: 900 }}>
          🐺 CHIẾN ĐỘI MA SÓI
        </h2>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--ww-accent)" }}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      <div className="ww-card" style={{ background: "rgba(231, 76, 60, 0.05)", border: "1px solid rgba(231, 76, 60, 0.2)" }}>
        <p style={{ fontSize: "13px", color: "var(--ww-text-muted)", marginBottom: "10px" }}>
          Đồng đội của bạn: {" "}
          {wolves.map(([id, p]) => (
            <span key={id} style={{ fontWeight: 700, color: "var(--ww-wolf)", marginRight: "10px" }}>
              {p.username} {id === playerId ? "(Bạn)" : ""}
            </span>
          ))}
        </p>
        <p style={{ fontSize: "14px", fontWeight: 700 }}>
          Thảo luận bí mật và chọn 1 mục tiêu dân làng để cắn đêm nay:
        </p>
      </div>

      {/* Grid danh sách mục tiêu */}
      <div className="ww-grid-2" style={{ marginBottom: "20px" }}>
        {/* Lựa chọn Không cắn */}
        <div 
          className={`ww-choice-card ${selectedTargetId === "skip" ? "selected-wolf" : ""}`}
          onClick={() => handleVote("skip")}
          style={{ 
            gridColumn: "1 / -1", 
            border: selectedTargetId === "skip" ? "2px solid var(--ww-wolf)" : "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.02)"
          }}
        >
          {Object.entries(wolfVotes).filter(([_, tid]) => tid === "skip").length > 0 && (
            <div style={{ position: "absolute", top: "5px", right: "8px", display: "flex", gap: "2px" }}>
              {Object.entries(wolfVotes).filter(([_, tid]) => tid === "skip").map(([wid, _], idx) => (
                <span key={idx} title={`${players[wid]?.username || "Sói"} vote`} style={{ fontSize: "10px", background: "rgba(231, 76, 60, 0.3)", color: "var(--ww-wolf)", padding: "1px 4px", borderRadius: "4px", fontWeight: "bold" }}>
                  🐺
                </span>
              ))}
            </div>
          )}
          <span className="ww-avatar-emoji">🚫</span>
          <span style={{ fontWeight: 700, fontSize: "14px" }}>
            KHÔNG CẮN (Bỏ qua)
          </span>
        </div>

        {targetPlayers.map(([id, p]) => {
          const avatar = AVATARS[p.avatarId] || { emoji: "👤", color: "#3498db" };
          const isSelected = selectedTargetId === id;
          
          // Đếm xem có bao nhiêu sói đang vote người này
          const votingWolves = Object.entries(wolfVotes)
            .filter(([_, tid]) => tid === id)
            .map(([wid, _]) => players[wid]?.username || "Sói");

          return (
            <div 
              key={id}
              className={`ww-choice-card ${isSelected ? "selected-wolf" : ""}`}
              onClick={() => handleVote(id)}
              style={{ border: isSelected ? "2px solid var(--ww-wolf)" : undefined }}
            >
              {/* Chỉ báo các sói khác đang vote người này */}
              {votingWolves.length > 0 && (
                <div style={{ 
                  position: "absolute", top: "5px", right: "8px", 
                  display: "flex", gap: "2px" 
                }}>
                  {votingWolves.map((wname, idx) => (
                    <span key={idx} title={`${wname} vote`} style={{ fontSize: "10px", background: "rgba(231, 76, 60, 0.3)", color: "var(--ww-wolf)", padding: "1px 4px", borderRadius: "4px", fontWeight: "bold" }}>
                      🐺
                    </span>
                  ))}
                </div>
              )}

              <span className="ww-avatar-emoji">{avatar.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: "14px" }}>
                {p.username}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chat mật đội Sói */}
      <div className="ww-card" style={{ padding: "15px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--ww-wolf)" }}>
          💬 Chat Mật Đội Sói (Tĩnh lặng)
        </h4>
        
        <div className="ww-chat-area">
          {chatMessages.length === 0 ? (
            <div style={{ margin: "auto", fontSize: "12px", color: "var(--ww-text-muted)", fontStyle: "italic" }}>
              Hãy bàn luận kế hoạch tác chiến tại đây...
            </div>
          ) : (
            chatMessages.map((msg, idx) => {
              const isMine = msg.senderId === playerId;
              return (
                <div 
                  key={idx} 
                  className={`ww-chat-bubble ${isMine ? "mine" : "others"}`}
                >
                  {!isMine && <div className="ww-chat-sender">{msg.senderName}</div>}
                  <div>{msg.text}</div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px" }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Nhập nội dung nhắn..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ 
              background: "rgba(0,0,0,0.3)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              color: "#fff", 
              padding: "10px 12px",
              borderRadius: "10px",
              fontSize: "14px"
            }}
          />
          <button 
            type="submit" 
            className="ww-btn" 
            style={{ width: "70px", padding: "10px", borderRadius: "10px" }}
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}
