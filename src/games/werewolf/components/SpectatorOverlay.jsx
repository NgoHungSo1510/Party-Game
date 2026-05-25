export default function SpectatorOverlay() {
  return (
    <div style={{ 
      position: "sticky",
      top: 0,
      zIndex: 999,
      background: "rgba(231, 76, 60, 0.15)",
      borderBottom: "1px solid rgba(231, 76, 60, 0.3)",
      backdropFilter: "blur(6px)",
      webkitBackdropFilter: "blur(6px)",
      color: "var(--ww-wolf)",
      padding: "10px 16px",
      textAlign: "center",
      fontSize: "13px",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      borderRadius: "0 0 16px 16px",
      marginBottom: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
    }}>
      <span style={{ fontSize: "16px" }}>👻</span>
      <span>BẠN ĐÃ CHẾT (HOẶC LÀ QUAN SÁT VIÊN) — KHÔNG THỂ HÀNH ĐỘNG NỮA</span>
    </div>
  );
}
