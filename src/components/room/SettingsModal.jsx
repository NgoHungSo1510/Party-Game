import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsModal({ 
  localSettings, setLocalSettings, 
  numPlayers, handleSaveSettings, setShowSettings 
}) {
  const chatBubbleStyle = {
    position: "relative",
    backgroundColor: "white",
    width: "100%",
    borderRadius: 24,
    borderBottomLeftRadius: 4,
    padding: 24,
    maxHeight: "75vh",
    overflowY: "auto",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: "flex", alignItems: "center", padding: 20 }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "var(--radius)" }} onClick={() => setShowSettings(false)} />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={chatBubbleStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, margin: 0 }}>Cài đặt ván chơi</h3>
          <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={24} /></button>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}>Số lượng Gián điệp ({localSettings.spyCount})</label>
          <input 
            type="range" min="1" max={Math.max(1, Math.floor(numPlayers / 3))} 
            value={localSettings.spyCount} 
            onChange={(e) => setLocalSettings({...localSettings, spyCount: parseInt(e.target.value)})} 
            style={{ width: "100%" }} 
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <label style={{ fontWeight: "bold" }}>Bật Mr. White</label>
          <input 
            type="checkbox" 
            checked={localSettings.mrWhiteEnabled} 
            onChange={(e) => setLocalSettings({...localSettings, mrWhiteEnabled: e.target.checked})} 
            style={{ transform: "scale(1.5)" }} 
          />
        </div>

        <button className="btn btn-primary" onClick={handleSaveSettings}>LƯU CÀI ĐẶT</button>
      </motion.div>
    </motion.div>
  );
}
