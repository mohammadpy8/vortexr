/**
 * Built-in 404 page.
 * Shown when no route matches the current path.
 */
export function DefaultNotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: "2rem",
        gap: "1rem",
      }}
    >
      <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>🔍</div>
      <h1 style={{ fontSize: "5rem", margin: 0, fontWeight: 800, color: "#111" }}>404</h1>
      <p style={{ color: "#666", fontSize: "1.1rem", margin: 0 }}>This page doesn't exist — yet.</p>
      <a
        href="/"
        style={{
          marginTop: "0.5rem",
          padding: "0.5rem 1.25rem",
          background: "#0070f3",
          color: "#fff",
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "0.9rem",
          textDecoration: "none",
        }}
      >
        ← Go Home
      </a>
    </div>
  );
}
