/**
 * SPY FINDER — Game Plugin Registration
 * Tìm ra kẻ gián điệp giấu mình trong nhóm!
 */
import SpyFinderGame from "./SpyFinderGame";

export default {
  id: "spy-finder",
  name: "Spy Finder 🕵️",
  description: "Tìm ra kẻ gián điệp giấu mình trong nhóm! Mỗi người nhận từ khóa bí mật, hãy đặt câu hỏi để lật mặt kẻ gian.",
  emoji: "🕵️‍♂️",
  thumbnail: null,
  minPlayers: 4,
  maxPlayers: 12,
  color: "#FF6B6B",
  tags: ["suy luận", "ẩn vai", "classic"],

  GameComponent: SpyFinderGame,

  apiPrefix: "/api/games/spy-finder",
};
