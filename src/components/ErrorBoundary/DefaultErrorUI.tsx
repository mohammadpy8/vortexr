type Props = {
  error: Error;
  reset: () => void;
};

/**
 * Built-in error fallback UI.
 * Shows the error message, stack trace (collapsible), and action buttons.
 */
export function DefaultErrorUI({ error, reset }: Props) {
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
      <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>⚠️</div>

      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111", margin: 0 }}>Something went wrong</h2>

      <p style={{ color: "#666", margin: 0, maxWidth: "480px", lineHeight: 1.6 }}>
        {error.message || "An unexpected error occurred."}
      </p>

      <details
        style={{
          maxWidth: "560px",
          width: "100%",
          background: "#f5f5f5",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <summary
          style={{
            fontSize: "0.8rem",
            color: "#888",
            userSelect: "none",
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
        >
          STACK TRACE
        </summary>
        <pre
          style={{
            marginTop: "0.75rem",
            fontSize: "0.72rem",
            color: "#555",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.6,
            overflow: "auto",
            maxHeight: "200px",
          }}
        >
          {error.stack}
        </pre>
      </details>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1.25rem",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: "0.5rem 1.25rem",
            background: "#f0f0f0",
            color: "#333",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          ← Go Home
        </a>
      </div>
    </div>
  );
}
