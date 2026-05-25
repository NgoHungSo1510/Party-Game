/**
 * TRUTH OR DARE — Game Plugin Registration
 * Thật hay Thách — trò chơi kinh điển cho party!
 */

// TODO: Implement TruthOrDareGame component
// import TruthOrDareGame from "./TruthOrDareGame";

export default {
  id: "truth-or-dare",
  name: "Thật Hay Thách 🎭",
  description: "Chọn Thật hoặc Thách! Trả lời câu hỏi thật lòng hoặc thực hiện thử thách điên rồ.",
  emoji: "🎭",
  thumbnail: null,
  minPlayers: 2,
  maxPlayers: 20,
  color: "#E84393",
  tags: ["party", "vui nhộn", "classic"],

  GameComponent: () => {
    return (
      <div style={{ 
        display: "flex", flexDirection: "column", alignItems: "center", 
        justifyContent: "center", minHeight: "100vh", padding: 40,
        background: "linear-gradient(135deg, #E84393 0%, #FD79A8 100%)"
      }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🎭</div>
        <h1 style={{ color: "white", fontSize: 32, marginBottom: 10 }}>Thật Hay Thách</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18 }}>🚧 Đang phát triển...</p>
      </div>
    );
  },

  apiPrefix: "/api/games/truth-or-dare",
};
