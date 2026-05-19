import { motion, AnimatePresence } from "framer-motion";

export default function CountdownOverlay({ showCountdown, countdownValue }) {
  return (
    <AnimatePresence>
      {showCountdown && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 50
          }}
        >
          <motion.div 
            key={countdownValue}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 120, fontWeight: 900, color: "var(--primary)", textShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
          >
            {countdownValue}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
