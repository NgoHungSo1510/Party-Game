import { AVATARS } from "../../utils/constants";

export default function RoomHeader({ session, roomId, me }) {
  const myAvatar = AVATARS[me?.avatarId] || AVATARS["avatar_1"];

  return (
    <div style={{ 
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px 20px", backgroundColor: "var(--primary)", color: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)", zIndex: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ 
          width: 36, height: 36, borderRadius: 18, 
          backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", 
          border: `2px solid ${myAvatar.color}`, fontSize: 18 
        }}>
          {myAvatar.emoji}
        </div>
        <span style={{ fontWeight: 600 }}>{session?.username}</span>
      </div>
      <div style={{ fontWeight: 800, letterSpacing: 1 }}>Phòng: {roomId}</div>
    </div>
  );
}
