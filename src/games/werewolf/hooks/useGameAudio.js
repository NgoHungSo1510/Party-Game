import { Howl, Howler } from 'howler';
import { useRef, useEffect, useCallback } from 'react';

// Sử dụng file giả lập (placeholder) 3s
// Trong thực tế, bạn sẽ thay các file này bằng file MP3/WAV thật
// Lưu ý: Các file này cần được đặt trong /public/sounds/werewolf/
const SOUND_FILES = {
  // --- Voice Files ---
  wolfVoice: '/sounds/werewolf/Wolf-voice.mp3',
  prophetVoice: '/sounds/werewolf/Prophet-voice.mp3',
  securityVoice: '/sounds/werewolf/Security-voice.mp3',
  sleepVoice: '/sounds/werewolf/Sleep-voice.mp3',
  wakeupVoice: '/sounds/werewolf/Wakeup-voice.mp3',
  witchVoice: '/sounds/werewolf/Witch-voice.mp3',
  
  // --- Background/SFX Files ---
  wolfBg: '/sounds/werewolf/Wolf-background.mp3',
  prophetBg: '/sounds/werewolf/Prophet-background.mp3',
  securityBg: '/sounds/werewolf/Security-background.mp3',
  wakeupBg: '/sounds/werewolf/Wakeup-background.mp3',
  witchBg: '/sounds/werewolf/Witch-background.mp3',

  // --- Fallbacks/Extras (nếu thiếu file thì tạm để null, ta sẽ handle sau) ---
  death: null, 
  victory: null, 
  voteDone: null
};

// Map night step -> [voiceKey, backgroundKey]
const STEP_SOUNDS = {
  0: ['sleepVoice', null],         // Đêm bắt đầu -> nhắm mắt
  1: ['wolfVoice', 'wolfBg'],      // Sói thức
  2: ['sleepVoice', null],         // Sói ngủ
  3: ['securityVoice', 'securityBg'],// Bảo vệ thức
  4: ['sleepVoice', null],         // Bảo vệ ngủ
  5: ['witchVoice', 'witchBg'],    // Phù thủy thức
  6: ['sleepVoice', null],         // Phù thủy ngủ
  7: ['prophetVoice', 'prophetBg'],  // Tiên tri thức
  8: ['wakeupVoice', 'wakeupBg'],  // Trời sáng
};

export function useGameAudio() {
  const unlockedRef = useRef(false);
  const soundsRef = useRef({});

  // Khởi tạo sounds (Lazy init để tránh lỗi khi render ở server-side hoặc load không cần thiết)
  useEffect(() => {
    Object.keys(SOUND_FILES).forEach(key => {
      if (SOUND_FILES[key]) {
        soundsRef.current[key] = new Howl({
          src: [SOUND_FILES[key]],
          html5: true, // Bypass iOS Silent Mode
          preload: true,
          volume: 1.0,
        });
      }
    });

    return () => {
      // Cleanup khi unmount
      Object.values(soundsRef.current).forEach(howl => howl.unload());
    };
  }, []);

  // Unlock audio context — gọi 1 lần khi user tap nút "Sẵn sàng" hoặc "Bắt đầu"
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    
    // Howler tự xử lý unlock qua touchend/click, nhưng chủ động gọi resume()
    // cho chắc chắn trên iOS Safari.
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
            console.log("Audio Context unlocked!");
            unlockedRef.current = true;
        }).catch(err => console.error("Cannot resume audio context", err));
    } else {
        unlockedRef.current = true;
    }

    // Thủ thuật nhỏ: play 1 file rỗng/silent siêu ngắn bằng HTML5 audio 
    // để chắc chắn "chiếm" được media channel của iOS.
    const silentHowl = new Howl({
        src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'], 
        html5: true,
        volume: 0.01
    });
    silentHowl.play();
  }, []);

  // Phát sound tương ứng với night step (tối đa 3s)
  const playNightStep = useCallback((stepIndex) => {
    const keys = STEP_SOUNDS[stepIndex];
    if (!keys) return;

    // Dừng tất cả âm thanh đang phát trước khi phát âm thanh mới
    Howler.stop();

    const [voiceKey, bgKey] = keys;
    
    const playAndFade = (key) => {
      if (soundsRef.current[key]) {
        const soundId = soundsRef.current[key].play();
        
        // Đảm bảo âm thanh chỉ phát tối đa 3 giây
        setTimeout(() => {
            if (soundsRef.current[key]) {
               soundsRef.current[key].fade(1, 0, 500, soundId); // Fade out mượt mà trong 0.5s
               setTimeout(() => soundsRef.current[key].stop(soundId), 500);
            }
        }, 3000); // 3 giây giới hạn
      }
    };

    if (voiceKey) playAndFade(voiceKey);
    if (bgKey) playAndFade(bgKey);
    
  }, []);

  // Phát sound tùy ý
  const play = useCallback((soundKey) => {
    if (soundsRef.current[soundKey]) {
      soundsRef.current[soundKey].play();
    }
  }, []);

  // Vẫn giữ lại vibrate như fallback/bonus
  const vibrate = useCallback((pattern = [100, 50, 100]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return { unlock, playNightStep, play, vibrate };
}
