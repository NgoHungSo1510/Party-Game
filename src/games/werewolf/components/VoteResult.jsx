import { useState, useEffect } from "react";
import { API_BASE_URL, AVATARS } from "../../../utils/constants";
import { useGameAudio } from "../hooks/useGameAudio";

export default function VoteResult({ roomId, playerId, roomData, isHost }) {
  const players = roomData.players || {};
  const dayState = roomData.dayState || {};
  const voteChart = dayState.voteChart || {};
  const eliminatedPlayerId = dayState.eliminatedPlayerId || "none";

  const isMeEliminated = eliminatedPlayerId === playerId;
  const eliminatedPlayer = players[eliminatedPlayerId] || null;
  const [timeLeft, setTimeLeft] = useState(5);

  const voteResultStartedAt = dayState.voteResultStartedAt || Date.now();
  const { play, vibrate } = useGameAudio();

  useEffect(() => {
    // Phát âm thanh khi kết quả vote hiện ra
    if (eliminatedPlayerId !== "none") {
      play("death");
      vibrate([500, 200, 500]); // Rung dramatic khi có người bị treo cổ
    } else {
      // Có thể dùng một âm thanh khác như búa gõ nếu không ai chết (chưa có trong list, tạm dùng vote-done nếu có)
      // Tạm thời nếu ko ai chết thì không phát gì thêm để giữ yên tĩnh
    }

    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - voteResultStartedAt) / 1000);
      const remaining = Math.max(0, 5 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && isHost) {
        handleNextNight();
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [voteResultStartedAt, isHost]);

  const handleNextNight = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/games/werewolf/continue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerId })
      });
    } catch (error) {
      console.error("Lỗi chuyển sang đêm tiếp theo:", error);
    }
  };

  // Tính toán số lượng vote nhiều nhất để vẽ tỷ lệ thanh bar
  const maxVoteCount = Math.max(...Object.values(voteChart), 1);

  return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <h2 className="ww-glow-text" style={{ fontSize: "20px", marginBottom: "15px" }}>
        📊 KẾT QUẢ BIỂU QUYẾT
      </h2>

      {/* Thông báo kết quả lớn */}
      <div className="ww-card" style={{ 
        border: eliminatedPlayerId !== "none" ? "1px solid rgba(231, 76, 60, 0.3)" : "1px solid rgba(46, 204, 113, 0.3)",
        background: eliminatedPlayerId !== "none" ? "rgba(231, 76, 60, 0.05)" : "rgba(46, 204, 113, 0.05)",
        padding: "20px",
        marginBottom: "20px"
      }}>
        {eliminatedPlayerId !== "none" && eliminatedPlayer ? (
          <div>
            <span style={{ fontSize: "50px" }}>💀</span>
            <p className="ww-glow-text-red" style={{ fontSize: "18px", fontWeight: 900, color: "var(--ww-wolf)", marginTop: "10px" }}>
              LÀNG QUYẾT ĐỊNH TREO CỔ: {eliminatedPlayer.username.toUpperCase()}!
            </p>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: "50px" }}>🕊️</span>
            <p className="ww-glow-text" style={{ fontSize: "18px", fontWeight: 900, color: "#2ecc71", marginTop: "10px" }}>
              HÔM NAY KHÔNG AI BỊ TREO CỔ!
            </p>
            <p style={{ fontSize: "12px", color: "var(--ww-text-muted)", marginTop: "5px" }}>
              Mọi người quyết định bỏ qua hoặc hòa phiếu.
            </p>
          </div>
        )}
      </div>

      {/* Cảnh báo tự tử cho bản thân */}
      {isMeEliminated && (
        <div className="ww-card" style={{ 
          background: "rgba(231, 76, 60, 0.1)", 
          borderColor: "rgba(231, 76, 60, 0.3)",
          color: "var(--ww-wolf)",
          padding: "15px",
          marginBottom: "20px"
        }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "5px" }}>⚠️ BẠN ĐÃ BỊ LOẠI</h3>
          <p style={{ fontSize: "12px", color: "var(--ww-text)" }}>
            Bạn đã bị treo cổ bởi biểu quyết của làng! Từ giờ bạn sẽ trở thành Khán giả (Spectator).
          </p>
        </div>
      )}

      {/* Bảng phân tích phiếu bầu dạng biểu đồ bar ngang */}
      <div className="ww-card" style={{ padding: "15px", textAlign: "left", marginBottom: "20px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--ww-text-muted)" }}>
          CHI TIẾT PHIẾU BẦU TREO CỔ:
        </h4>

        {Object.entries(voteChart).map(([tid, count]) => {
          const isSkip = tid === "skip";
          const p = isSkip ? { username: "Bỏ qua treo cổ" } : (players[tid] || {});
          const avatar = isSkip ? { emoji: "🚫" } : (AVATARS[p.avatarId] || { emoji: "👤" });
          const barWidth = `${(count / maxVoteCount) * 100}%`;

          return (
            <div key={tid} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{avatar.emoji}</span>
                  <span>{p.username}</span>
                </span>
                <span style={{ color: "var(--ww-accent)" }}>{count} phiếu</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: barWidth, height: "100%", background: isSkip ? "linear-gradient(90deg, #95a5a6, #bdc3c7)" : "linear-gradient(90deg, #6c5ce7, #8e44ad)", borderRadius: "4px" }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hành động */}
      <div className="ww-card" style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "12px" }}>
        <p style={{ color: "var(--ww-accent)", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold" }}>
          <span className="ww-pulse-animation" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--ww-accent)", display: "inline-block" }}></span>
          CÒN LẠI {timeLeft}s SẼ BẮT ĐẦU ĐÊM TIẾP THEO
        </p>
      </div>
    </div>
  );
}
