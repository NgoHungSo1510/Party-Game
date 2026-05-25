/**
 * DRAWING GUESS (Vẽ & Đoán) — Game Plugin Registration
 * Vẽ tranh cho đội bạn đoán — ai đoán nhanh nhất thắng!
 */

export default {
  id: "drawing-guess",
  name: "Vẽ & Đoán 🎨",
  description: "Một người vẽ, cả phòng đoán! Bạn có thể diễn tả từ khóa chỉ bằng nét vẽ không?",
  emoji: "🎨",
  thumbnail: null,
  minPlayers: 3,
  maxPlayers: 12,
  color: "#FDCB6E",
  tags: ["sáng tạo", "party", "vẽ"],

  GameComponent: () => {
    return (
      <div style={{ 
        display: "flex", flexDirection: "column", alignItems: "center", 
        justifyContent: "center", minHeight: "100vh", padding: 40,
        background: "linear-gradient(135deg, #FDCB6E 0%, #E17055 100%)"
      }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🎨</div>
        <h1 style={{ color: "white", fontSize: 32, marginBottom: 10 }}>Vẽ & Đoán</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18 }}>🚧 Đang phát triển...</p>
      </div>
    );
  },

  apiPrefix: "/api/games/drawing-guess",
};
