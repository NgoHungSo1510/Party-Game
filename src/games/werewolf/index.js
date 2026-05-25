/**
 * WEREWOLF (Ma Sói) — Game Plugin Registration
 * Trò chơi ẩn vai kinh điển — Dân làng vs Ma sói!
 */

import WerewolfGame from "./WerewolfGame";

export default {
  id: "werewolf",
  name: "Ma Sói 🐺",
  description: "Đêm xuống, Ma Sói thức dậy... Hãy tìm ra kẻ thù trước khi quá muộn!",
  emoji: "🐺",
  thumbnail: null,
  minPlayers: 5,
  maxPlayers: 16,
  color: "#6C5CE7",
  tags: ["suy luận", "ẩn vai", "chiến thuật"],

  GameComponent: WerewolfGame,

  apiPrefix: "/api/games/werewolf",
};
