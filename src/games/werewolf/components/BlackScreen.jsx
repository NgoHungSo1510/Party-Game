import { useState, useEffect } from "react";
import { NIGHT_STEPS } from "../utils/werewolfConstants";

export default function BlackScreen({ currentStep, stepStartedAt, roomData, isHost, onTimerEnd }) {
  const stepConfig = NIGHT_STEPS[currentStep] || NIGHT_STEPS[0];
  
  // Lấy duration từ settings nếu có
  const settings = roomData.settings || {};
  let duration = stepConfig.duration;
  if (stepConfig.id === "WOLF_TURN") duration = settings.wolfTimerSec || 120;
  else if (stepConfig.id === "GUARD_TURN" || stepConfig.id === "WITCH_TURN" || stepConfig.id === "SEER_TURN") {
    duration = settings.roleTimerSec || 30;
  }

  const [timeLeft, setTimeLeft] = useState(duration);

  // Tính toán countdown thực tế dựa trên timestamp để giữ đồng bộ
  useEffect(() => {
    let timer;
    let hasEnded = false;
    
    const calculateTimeLeft = () => {
      const elapsed = Math.floor((Date.now() - stepStartedAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && !hasEnded) {
        hasEnded = true;
        if (timer) clearInterval(timer);
        if (isHost) {
          onTimerEnd();
        }
      }
    };

    calculateTimeLeft();
    if (!hasEnded) {
      timer = setInterval(calculateTimeLeft, 1000);
    }

    return () => clearInterval(timer);
  }, [currentStep, stepStartedAt, duration, isHost]);

  return (
    <div className="ww-blackout">


      <h1 className="ww-glow-text" style={{ fontSize: "22px", fontWeight: 700, whiteSpace: "pre-line", lineHeight: "1.6", marginBottom: "40px" }}>
        {stepConfig.message}
      </h1>

      <div style={{ fontSize: "72px", fontWeight: 900, color: "var(--ww-accent)", textShadow: "0 0 20px rgba(241, 196, 15, 0.4)" }}>
        {timeLeft}
      </div>

      <p style={{ color: "var(--ww-text-muted)", fontSize: "12px", marginTop: "40px", fontStyle: "italic" }}>
        Đừng ti hí! Nhắm mắt để đảm bảo tính công bằng của trò chơi.
      </p>
    </div>
  );
}
