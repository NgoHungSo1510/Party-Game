/**
 * ====================================
 * GAME REGISTRY — Đăng ký tất cả Game Plugins
 * ====================================
 * 
 * Khi thêm game mới, chỉ cần:
 * 1. Tạo folder trong games/ với index.js theo GameContract
 * 2. Import và đăng ký vào object bên dưới
 * 3. Done! Shell App tự load.
 */

import spyFinder from "./spy-finder";
import quiz from "./quiz";
import truthOrDare from "./truth-or-dare";
import werewolf from "./werewolf";
// import drawingGuess from "./drawing-guess";

const GAME_REGISTRY = {
  "spy-finder": spyFinder,
  "quiz": quiz,
  "truth-or-dare": truthOrDare,
  "werewolf": werewolf,
  // "drawing-guess": drawingGuess,
};

/**
 * Lấy thông tin 1 game theo ID
 */
export function getGame(gameId) {
  return GAME_REGISTRY[gameId] || null;
}

/**
 * Lấy danh sách tất cả games đã đăng ký
 */
export function getAllGames() {
  return Object.values(GAME_REGISTRY);
}

export default GAME_REGISTRY;
