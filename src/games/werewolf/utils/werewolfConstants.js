export const ROLE_CARDS = {
  wolf: {
    name: "Ma Sói",
    emoji: "🐺",
    team: "wolf",
    teamName: "Phe Ma Sói",
    description: "Đêm xuống, đội Sói thức dậy và chọn một nạn nhân để tấn công. Hãy phối hợp để tiêu diệt dân làng!",
    color: "#e74c3c"
  },
  seer: {
    name: "Tiên Tri",
    emoji: "🔮",
    team: "village",
    teamName: "Phe Dân Làng",
    description: "Mỗi đêm, Tiên Tri được soi một người để biết họ thuộc phe Ma Sói hay phe Dân Làng.",
    color: "#9b59b6"
  },
  witch: {
    name: "Phù Thủy",
    emoji: "🧙",
    team: "village",
    teamName: "Phe Dân Làng",
    description: "Có 1 bình thuốc cứu người sống dậy và 1 bình thuốc độc tiêu diệt kẻ thù. Mỗi bình chỉ được dùng một lần duy nhất.",
    color: "#1abc9c"
  },
  guard: {
    name: "Bảo Vệ",
    emoji: "🛡️",
    team: "village",
    teamName: "Phe Dân Làng",
    description: "Mỗi đêm chọn một người để bảo vệ khỏi Sói. Không được bảo vệ cùng một người hai đêm liên tiếp.",
    color: "#2ecc71"
  },
  villager: {
    name: "Dân Làng",
    emoji: "👤",
    team: "village",
    teamName: "Phe Dân Làng",
    description: "Không có năng lực đặc biệt nào ngoài bộ não nhạy bén. Hãy tinh tường tìm ra Ma Sói ẩn mình!",
    color: "#3498db"
  }
};

export const NIGHT_STEPS = {
  0: {
    id: "REST_START",
    name: "Trời tối",
    duration: 5,
    message: "🌙 Đêm đã buông xuống...\nMọi người hãy nhắm mắt đi ngủ."
  },
  1: {
    id: "WOLF_TURN",
    name: "Lượt Ma Sói",
    duration: 120, // default
    message: "🐺 Sói đang thức dậy..."
  },
  2: {
    id: "REST_WOLF",
    name: "Sói ngủ",
    duration: 5,
    message: "🐺 Ma Sói đã nhắm mắt đi ngủ..."
  },
  3: {
    id: "GUARD_TURN",
    name: "Lượt Bảo Vệ",
    duration: 30,
    message: "🛡️ Bảo Vệ đang thức dậy..."
  },
  4: {
    id: "REST_GUARD",
    name: "Bảo vệ ngủ",
    duration: 5,
    message: "🛡️ Bảo Vệ đã nhắm mắt đi ngủ..."
  },
  5: {
    id: "WITCH_TURN",
    name: "Lượt Phù Thủy",
    duration: 30,
    message: "🧙 Phù Thủy đang thức dậy..."
  },
  6: {
    id: "REST_WITCH",
    name: "Phù thủy ngủ",
    duration: 5,
    message: "🧙 Phù Thủy đã nhắm mắt đi ngủ..."
  },
  7: {
    id: "SEER_TURN",
    name: "Lượt Tiên Tri",
    duration: 30,
    message: "🔮 Tiên Tri đang thức dậy..."
  },
  8: {
    id: "REST_END",
    name: "Trời sáng",
    duration: 5,
    message: "☀️ Trời sáng rồi!\nMọi người hãy mở mắt thức dậy."
  }
};
