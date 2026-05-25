/**
 * QUIZ GAME — Game Plugin Registration
 * Trắc nghiệm kiến thức theo chủ đề, xếp hạng sau 10 câu!
 */

// TODO: Implement QuizGame component
// import QuizGame from "./QuizGame";

export default {
  id: "quiz",
  name: "Quiz Battle ❓",
  description: "Trả lời 10 câu hỏi trắc nghiệm theo chủ đề. Ai nhanh và đúng nhất sẽ chiến thắng!",
  emoji: "❓",
  thumbnail: null,
  minPlayers: 2,
  maxPlayers: 20,
  color: "#4ECDC4",
  tags: ["trí tuệ", "kiến thức", "xếp hạng"],

  // Tạm thời dùng placeholder component
  GameComponent: () => {
    return (
      <div style={{ 
        display: "flex", flexDirection: "column", alignItems: "center", 
        justifyContent: "center", minHeight: "100vh", padding: 40,
        background: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)"
      }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>❓</div>
        <h1 style={{ color: "white", fontSize: 32, marginBottom: 10 }}>Quiz Battle</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18 }}>🚧 Đang phát triển...</p>
      </div>
    );
  },

  apiPrefix: "/api/games/quiz",
};
