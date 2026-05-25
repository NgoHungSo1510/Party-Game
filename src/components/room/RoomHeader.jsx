import { AVATARS } from "../../utils/constants";

export default function RoomHeader({ session, roomId, me, title, isHost }) {
  const myAvatar = AVATARS[me?.avatarId] || AVATARS["avatar_1"];

  return (
    <div style={{ 
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 20px", backgroundColor: "var(--primary)", color: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)", zIndex: 10
    }}>
      {/* Left: User profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ 
          width: 36, height: 36, borderRadius: 18, 
          backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", 
          border: `2px solid ${myAvatar?.color || '#ccc'}`, fontSize: 18 
        }}>
          {myAvatar?.emoji || '👤'}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>{session?.username || "Người chơi"}</span>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
            {isHost ? "Chủ phòng 👑" : "Thành viên"}
          </span>
        </div>
      </div>

      {/* Right: Game Name and Room Code (student card style) */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        <span style={{ fontWeight: 800, fontSize: "16px", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {title || "PARTY GAME"}
        </span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: 600, letterSpacing: 0.5 }}>
          ID: {roomId}
        </span>
      </div>
    </div>
  );
}
