import { X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TopicsModal({ 
  topics, selectedTopics, 
  toggleTopicSelection, handleSaveTopics, setShowTopics 
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
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "var(--radius)" }} onClick={() => setShowTopics(false)} />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={chatBubbleStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, margin: 0 }}>Chọn Chủ Đề ({selectedTopics.length}/2)</h3>
          <button onClick={() => setShowTopics(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={24} /></button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          {topics.map(topic => {
              const isSelected = selectedTopics.includes(topic.id);
              const isDisabled = !isSelected && selectedTopics.length >= 2;
              return (
                  <div 
                      key={topic.id} 
                      onClick={() => !isDisabled && toggleTopicSelection(topic.id)}
                      style={{ 
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 6px", 
                          borderRadius: 16, border: `2px solid ${isSelected ? "var(--primary)" : "#EAEAEA"}`,
                          backgroundColor: isSelected ? "var(--primary)10" : "white",
                          opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? "not-allowed" : "pointer",
                          position: "relative",
                          textAlign: "center",
                          minHeight: "85px"
                      }}
                  >
                      <span style={{ fontSize: 26 }}>{topic.imageUrl}</span>
                      <span style={{ fontWeight: "bold", fontSize: 12, lineHeight: 1.2, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {topic.name}
                      </span>
                      {isSelected && (
                        <div style={{ position: "absolute", top: 4, right: 4, backgroundColor: "white", borderRadius: "50%", display: "flex" }}>
                          <CheckCircle size={16} color="var(--primary)" />
                        </div>
                      )}
                  </div>
              );
          })}
        </div>

        <button className="btn btn-secondary" onClick={handleSaveTopics}>LƯU CHỦ ĐỀ</button>
      </motion.div>
    </motion.div>
  );
}
