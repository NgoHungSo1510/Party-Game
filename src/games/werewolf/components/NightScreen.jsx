import { useEffect } from "react";
import { API_BASE_URL } from "../../../utils/constants";
import BlackScreen from "./BlackScreen";
import WolfPanel from "./WolfPanel";
import GuardPanel from "./GuardPanel";
import WitchPanel from "./WitchPanel";
import SeerPanel from "./SeerPanel";
import { useGameAudio } from "../hooks/useGameAudio";

export default function NightScreen({ roomId, playerId, roomData, isHost }) {
  const nightState = roomData.nightState || {};
  const currentStep = nightState.currentStep || 0;
  const stepStartedAt = nightState.stepStartedAt || Date.now();
  
  const me = roomData.players?.[playerId] || {};
  const myRole = me.role || "villager";
  const isAlive = me.isAlive !== false;

  const { playNightStep, vibrate } = useGameAudio();

  // Xử lý phát âm thanh + rung mỗi khi đổi step đêm
  // Vì NightScreen luôn render cho mọi user (dù họ đang xem BlackScreen hay Role Panel),
  // nên âm thanh sẽ phát cho TẤT CẢ mọi người.
  useEffect(() => {
    // 1. Luôn phát voice + background sound cho tất cả user
    playNightStep(currentStep);

    // 2. CHỈ RUNG NẾU LÀ ROLE ĐANG ĐƯỢC GỌI VÀ CÒN SỐNG
    if (!isAlive) return;
    
    if (currentStep === 1 && myRole === "wolf") {
      vibrate([150, 100, 150]); // Rung cho sói
    } else if (currentStep === 3 && myRole === "guard") {
      vibrate([150, 100, 150]); // Rung cho bảo vệ
    } else if (currentStep === 5 && myRole === "witch") {
      vibrate([150, 100, 150]); // Rung cho phù thủy
    } else if (currentStep === 7 && myRole === "seer") {
      vibrate([150, 100, 150]); // Rung cho tiên tri
    }
  }, [currentStep, playNightStep, vibrate, myRole, isAlive]);

  const handleStepTimerEnd = async () => {
    if (!isHost) return;
    try {
      if (currentStep >= 8) {
        // Hết đêm -> Tính bình minh
        await fetch(`${API_BASE_URL}/api/games/werewolf/resolve-dawn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, playerId })
        });
      } else {
        // Tăng step ban đêm
        await fetch(`${API_BASE_URL}/api/games/werewolf/advance-step`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId })
        });
      }
    } catch (error) {
      console.error("Lỗi khi chuyển giao step đêm:", error);
    }
  };

  // Logic render từng Panel hoặc che mắt bằng BlackScreen
  const renderNightStep = () => {
    // Sói thức dậy ở Step 1
    if (currentStep === 1) {
      if (myRole === "wolf" && isAlive) {
        return (
          <WolfPanel 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            stepStartedAt={stepStartedAt}
            isHost={isHost}
            onTimerEnd={handleStepTimerEnd}
          />
        );
      }
    }
    // Bảo Vệ thức dậy ở Step 3
    else if (currentStep === 3) {
      if (myRole === "guard" && isAlive) {
        return (
          <GuardPanel 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            stepStartedAt={stepStartedAt}
            isHost={isHost}
            onTimerEnd={handleStepTimerEnd}
          />
        );
      }
    }
    // Phù Thủy thức dậy ở Step 5
    else if (currentStep === 5) {
      if (myRole === "witch" && isAlive) {
        return (
          <WitchPanel 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            stepStartedAt={stepStartedAt}
            isHost={isHost}
            onTimerEnd={handleStepTimerEnd}
          />
        );
      }
    }
    // Tiên Tri thức dậy ở Step 7
    else if (currentStep === 7) {
      if (myRole === "seer" && isAlive) {
        return (
          <SeerPanel 
            roomId={roomId}
            playerId={playerId}
            roomData={roomData}
            stepStartedAt={stepStartedAt}
            isHost={isHost}
            onTimerEnd={handleStepTimerEnd}
          />
        );
      }
    }

    // Tất cả các trường hợp còn lại hoặc khi vai trò đã chết / không được chọn
    // Render màn hình đen che mắt, auto-run countdown
    return (
      <BlackScreen 
        currentStep={currentStep}
        stepStartedAt={stepStartedAt}
        roomData={roomData}
        isHost={isHost}
        onTimerEnd={handleStepTimerEnd}
      />
    );
  };

  return (
    <div className="ww-card" style={{ padding: "10px 0" }}>
      {renderNightStep()}
    </div>
  );
}
