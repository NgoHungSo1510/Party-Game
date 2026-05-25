import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../utils/constants";
import { Lock } from "lucide-react";

export default function WerewolfSettings({ roomId, playerId, roomData, isHost, onClose }) {
  const settings = roomData.settings || {
    wolfCount: 1,
    enableSeer: true,
    enableWitch: true,
    enableGuard: true,
    discussionTimerSec: 180,
    voteTimerSec: 60,
    wolfTimerSec: 120,
    roleTimerSec: 30
  };

  const [wolfCount, setWolfCount] = useState(settings.wolfCount || 1);
  const [enableSeer, setEnableSeer] = useState(settings.enableSeer !== false);
  const [enableWitch, setEnableWitch] = useState(settings.enableWitch !== false);
  const [enableGuard, setEnableGuard] = useState(settings.enableGuard !== false);
  const [discussionTimerSec, setDiscussionTimerSec] = useState(settings.discussionTimerSec || 180);
  const [voteTimerSec, setVoteTimerSec] = useState(settings.voteTimerSec || 60);

  const players = roomData.players || {};
  const playerCount = Object.keys(players).length;

  // Tính toán số Dân Làng
  const specialRolesCount = (enableSeer ? 1 : 0) + (enableWitch ? 1 : 0) + (enableGuard ? 1 : 0);
  const villagerCount = playerCount - wolfCount - specialRolesCount;

  // Tự động lưu settings lên Firebase (chỉ Host được gửi)
  useEffect(() => {
    if (!isHost) return;

    const delayDebounce = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/games/werewolf/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerId,
          settings: {
            wolfCount,
            enableSeer,
            enableWitch,
            enableGuard,
            discussionTimerSec,
            voteTimerSec,
            wolfTimerSec: 120,
            roleTimerSec: 30
          }
        })
      }).catch(err => console.error("Lỗi cập nhật settings:", err));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [wolfCount, enableSeer, enableWitch, enableGuard, discussionTimerSec, voteTimerSec, isHost, roomId, playerId]);

  // Đồng bộ hóa settings từ Firebase cho non-host
  useEffect(() => {
    if (isHost) return;
    if (roomData.settings) {
      setWolfCount(roomData.settings.wolfCount || 1);
      setEnableSeer(roomData.settings.enableSeer !== false);
      setEnableWitch(roomData.settings.enableWitch !== false);
      setEnableGuard(roomData.settings.enableGuard !== false);
      setDiscussionTimerSec(roomData.settings.discussionTimerSec || 180);
      setVoteTimerSec(roomData.settings.voteTimerSec || 60);
    }
  }, [roomData.settings, isHost]);

  // Điều kiện mở khóa vai trò đặc biệt
  const maxSpecialRoles = playerCount <= 3 ? 0 : playerCount === 4 ? 1 : playerCount === 5 ? 2 : 3;

  // Tự động tắt vai trò nếu vượt quá giới hạn (ví dụ khi số người chơi giảm)
  useEffect(() => {
    if (!isHost) return;
    let currentSpecialCount = (enableSeer ? 1 : 0) + (enableWitch ? 1 : 0) + (enableGuard ? 1 : 0);
    if (currentSpecialCount > maxSpecialRoles) {
      if (enableGuard && currentSpecialCount > maxSpecialRoles) { setEnableGuard(false); currentSpecialCount--; }
      if (enableWitch && currentSpecialCount > maxSpecialRoles) { setEnableWitch(false); currentSpecialCount--; }
      if (enableSeer && currentSpecialCount > maxSpecialRoles) { setEnableSeer(false); currentSpecialCount--; }
    }
  }, [maxSpecialRoles, enableSeer, enableWitch, enableGuard, isHost]);

  // Xử lý khi bật/tắt vai trò đặc biệt
  const handleToggleRole = (role, currentVal, setRole) => {
    if (!isHost) return;
    
    // Nếu đang bật -> cho phép tắt thoải mái
    if (currentVal) {
      setRole(false);
      return;
    }
    
    // Nếu đang tắt -> muốn bật lên, cần kiểm tra giới hạn
    if (specialRolesCount >= maxSpecialRoles) {
      if (playerCount <= 3) alert("Cần tối thiểu 4 người chơi để mở khóa 1 vai trò đặc biệt!");
      else if (playerCount === 4) alert("Cần tối thiểu 5 người chơi để mở khóa 2 vai trò đặc biệt!");
      else if (playerCount === 5) alert("Cần tối thiểu 6 người chơi để mở khóa 3 vai trò đặc biệt!");
      return;
    }
    
    setRole(true);
  };

  const renderRoleRow = (label, currentVal, setRole) => {
    const isLocked = !currentVal && specialRolesCount >= maxSpecialRoles;
    
    return (
      <div 
        style={{ 
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px",
          opacity: isLocked ? 0.5 : 1,
          filter: isLocked ? "blur(0.5px)" : "none",
          transition: "all 0.3s ease"
        }}
      >
        <span>{label}</span>
        {isHost ? (
          <div 
            onClick={() => handleToggleRole(label, currentVal, setRole)}
            style={{ 
              display: "flex", alignItems: "center", cursor: "pointer",
              background: currentVal ? "var(--ww-guard)" : "rgba(255,255,255,0.1)",
              padding: "4px 12px", borderRadius: "14px", transition: "all 0.2s ease"
            }}
          >
            {isLocked ? (
               <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#fff", fontSize: 12 }}>
                 <Lock size={12} /> Khóa
               </div>
            ) : (
               <span style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>
                 {currentVal ? "Bật" : "Tắt"}
               </span>
            )}
          </div>
        ) : (
          <span>{currentVal ? "✅ Bật" : "❌ Tắt"}</span>
        )}
      </div>
    );
  };

  return (
    <div className="ww-card" style={{ maxWidth: "420px", width: "100%", margin: "0 auto", position: "relative" }}>
      {onClose && (
        <button 
          onClick={onClose}
          style={{ position: "absolute", top: 15, right: 15, background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 20, zIndex: 10 }}
        >
          ✕
        </button>
      )}

      <h2 className="ww-glow-text" style={{ textAlign: "center", marginBottom: "20px", fontSize: "22px" }}>
        🐺 THIẾT LẬP GAME
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <p style={{ color: "var(--ww-text-muted)", fontSize: "14px", marginBottom: "8px" }}>
          Tổng số người chơi: <span className="ww-glow-text-gold" style={{ fontWeight: 700 }}>{playerCount}</span>
        </p>

        {/* Số Ma Sói */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <span>🐺 Ma Sói:</span>
          {isHost ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button 
                onClick={() => setWolfCount(c => Math.max(1, c - 1))}
                style={{ width: "30px", height: "30px", borderRadius: "50%", border: "none", cursor: "pointer", fontWeight: 700 }}
              >
                -
              </button>
              <span style={{ fontSize: "18px", fontWeight: 700, width: "20px", textAlign: "center" }}>{wolfCount}</span>
              <button 
                onClick={() => setWolfCount(c => Math.min(Math.max(1, Math.floor((playerCount - 1) / 2)), c + 1))}
                style={{ width: "30px", height: "30px", borderRadius: "50%", border: "none", cursor: "pointer", fontWeight: 700 }}
              >
                +
              </button>
            </div>
          ) : (
            <span style={{ fontSize: "18px", fontWeight: 700 }}>{wolfCount}</span>
          )}
        </div>

        {/* Vai trò đặc biệt */}
        {renderRoleRow("🔮 Tiên Tri", enableSeer, setEnableSeer)}
        {renderRoleRow("🧙 Phù Thủy", enableWitch, setEnableWitch)}
        {renderRoleRow("🛡️ Bảo Vệ", enableGuard, setEnableGuard)}

        {/* Dân làng (tự động) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span>👤 Dân Làng (tự động):</span>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--ww-villager)" }}>
            {villagerCount >= 0 ? villagerCount : 0}
          </span>
        </div>

        {/* Timers */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "14px", display: "block", marginBottom: "5px" }}>⏱️ Thời gian thảo luận (giây):</label>
          {isHost ? (
            <input 
              type="number" 
              className="input"
              value={discussionTimerSec} 
              onChange={(e) => setDiscussionTimerSec(parseInt(e.target.value) || 120)}
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 12px", width: "100%", borderRadius: "8px" }}
            />
          ) : (
            <span style={{ fontWeight: 700 }}>{discussionTimerSec}s</span>
          )}
        </div>

        <div>
          <label style={{ fontSize: "14px", display: "block", marginBottom: "5px" }}>⏱️ Thời gian vote treo cổ (giây):</label>
          {isHost ? (
            <input 
              type="number" 
              className="input"
              value={voteTimerSec} 
              onChange={(e) => setVoteTimerSec(parseInt(e.target.value) || 30)}
              style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 12px", width: "100%", borderRadius: "8px" }}
            />
          ) : (
            <span style={{ fontWeight: 700 }}>{voteTimerSec}s</span>
          )}
        </div>
      </div>

      {isHost ? (
        <button className="ww-btn" onClick={onClose} style={{ marginTop: "10px" }}>
          LƯU THIẾT LẬP
        </button>
      ) : (
        <div style={{ textAlign: "center", fontStyle: "italic", color: "var(--ww-text-muted)", fontSize: "14px" }}>
          Chỉ chủ phòng mới có thể sửa thiết lập.
        </div>
      )}
    </div>
  );
}
