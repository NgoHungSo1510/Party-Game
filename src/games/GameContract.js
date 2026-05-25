/**
 * ====================================
 * GAME CONTRACT — Hợp đồng Plugin Game
 * ====================================
 * 
 * Mỗi game plugin PHẢI export một object theo format này.
 * Shell App (GameRoom.jsx) sẽ dựa vào contract này để:
 *   1. Hiển thị thông tin game ở Lobby (tên, mô tả, icon...)
 *   2. Load đúng component khi vào chơi
 *   3. Backend mount đúng routes
 * 
 * ===== PROPS MÀ SHELL SẼ TRUYỀN VÀO GameComponent =====
 * {
 *   roomId:       string    — ID phòng hiện tại
 *   session:      object    — { playerId, username, avatarId, currentRoomId }
 *   roomData:     object    — Toàn bộ data phòng từ Firebase realtime
 *   onLeave:      function  — Gọi khi người chơi muốn rời phòng hoàn toàn
 *   onBackToLobby: function — Gọi khi muốn quay về Lobby chọn game khác
 * }
 */

const GameContractExample = {
  // ===== METADATA (Hiển thị ở Lobby) =====
  id: "example-game",              // Unique ID, dùng làm key
  name: "Tên Game",                // Tên hiển thị
  description: "Mô tả ngắn...",   // Mô tả 1-2 dòng
  emoji: "🎮",                     // Emoji icon
  thumbnail: null,                 // URL ảnh thumbnail (optional)
  minPlayers: 2,                   // Số người tối thiểu
  maxPlayers: 12,                  // Số người tối đa
  color: "#FF6B6B",                // Màu chủ đạo
  tags: [],                        // Tags phân loại: ["suy luận", "party", ...]
  
  // ===== FRONTEND =====
  GameComponent: null,             // React Component chính
  
  // ===== BACKEND =====
  apiPrefix: "/api/games/example", // Route prefix trên server
};

export default GameContractExample;
