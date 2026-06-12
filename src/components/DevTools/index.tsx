import React, { useContext, useState, useEffect } from "react";
import { usePathname } from "../../hooks/usePathname";
import { useNavigation } from "../../hooks/useNavigation";
import { useRouteMeta } from "../../hooks/useRouteMeta";
import { useRouterContext } from "../../core/context";
import { PrefetchContext } from "../Router";
import { matchPath } from "../../utils/matcher";

type Tab = "route" | "history" | "cache";

/**
 * vortexr DevTools panel.
 * Only renders in development (process.env.NODE_ENV !== "production").
 *
 * Shows:
 *   Route tab    → matched route, params, guards, loader, action, meta
 *   History tab  → navigation history log
 *   Cache tab    → prefetch cache entries and freshness
 *
 * @example
 * // Add to your App root:
 * export default function App() {
 *   return (
 *     <>
 *       <Router routes={routes} />
 *       <VortexrDevTools />
 *     </>
 *   );
 * }
 */
export function VortexrDevTools() {
  if (process.env.NODE_ENV === "production") return null;
  return <DevToolsPanel />;
}

function DevToolsPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("route");
  const [navHistory, setNavHistory] = useState<string[]>([]);

  const pathname = usePathname();
  const { state } = useNavigation();
  const meta = useRouteMeta();
  const { params } = useRouterContext();
  const flatRoutes = useContext(PrefetchContext);

  const matched = flatRoutes.find((r) => matchPath(r.path, pathname).matched);

  useEffect(() => {
    setNavHistory((prev) => {
      const next = [...prev, pathname];
      return next.slice(-20); // keep last 20
    });
  }, [pathname]);

  const badge: React.CSSProperties = {
    display: "inline-block",
    padding: "1px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
    marginLeft: "4px",
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 99999,
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "42px",
          height: "42px",
          fontSize: "18px",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="vortexr DevTools"
      >
        🌀
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "70px",
            right: "16px",
            zIndex: 99998,
            width: "380px",
            maxHeight: "520px",
            background: "#1a1a2e",
            color: "#e0e0e0",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            fontFamily: "monospace",
            fontSize: "12px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid #2a2a4a",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#16213e",
            }}
          >
            <span style={{ fontWeight: 700, color: "#7b8cde" }}>🌀 vortexr devtools</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span
                style={{
                  ...badge,
                  background: state === "loading" ? "#f59e0b" : "#10b981",
                  color: "#fff",
                }}
              >
                {state}
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "16px" }}
              >
                ×
              </button>
            </div>
          </div>

          <div style={{ display: "flex", borderBottom: "1px solid #2a2a4a" }}>
            {(["route", "history", "cache"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: tab === t ? "#0f3460" : "transparent",
                  color: tab === t ? "#7b8cde" : "#666",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: tab === t ? 700 : 400,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ overflowY: "auto", flex: 1, padding: "12px 14px" }}>
            {tab === "route" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Row label="pathname" value={pathname} highlight />
                <Row label="pattern" value={matched?.path ?? "—"} />

                <Section title="params">
                  {Object.keys(params).length === 0 ? (
                    <Muted>none</Muted>
                  ) : (
                    Object.entries(params).map(([k, v]) => <Row key={k} label={`:${k}`} value={v} />)
                  )}
                </Section>

                <Section title="guards">
                  {!matched?.guards.length ? (
                    <Muted>none</Muted>
                  ) : (
                    matched.guards.map((g, i) => (
                      <Chip key={i} color="#10b981">
                        {g.name || `guard_${i}`}
                      </Chip>
                    ))
                  )}
                </Section>

                <Section title="features">
                  <Chip color={matched?.loader ? "#0070f3" : "#444"}>loader</Chip>
                  <Chip color={matched?.action ? "#7928ca" : "#444"}>action</Chip>
                  <Chip color={matched?.staleTime ? "#f59e0b" : "#444"}>
                    {matched?.staleTime ? `stale:${matched.staleTime}ms` : "no cache"}
                  </Chip>
                  <Chip color={matched?.prefetch && matched.prefetch !== "none" ? "#ec4899" : "#444"}>
                    prefetch:{matched?.prefetch ?? "none"}
                  </Chip>
                </Section>

                {meta && Object.keys(meta).length > 0 && (
                  <Section title="meta">
                    {Object.entries(meta).map(([k, v]) => (
                      <Row key={k} label={k} value={String(v)} />
                    ))}
                  </Section>
                )}
              </div>
            )}

            {tab === "history" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {navHistory.length === 0 && <Muted>No navigation yet</Muted>}
                {[...navHistory].reverse().map((path, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "4px 0",
                      borderBottom: "1px solid #1a1a3a",
                      opacity: i === 0 ? 1 : 0.6 - i * 0.03,
                    }}
                  >
                    <span style={{ color: i === 0 ? "#7b8cde" : "#555", fontSize: "10px" }}>
                      {i === 0 ? "▶" : `${i}`}
                    </span>
                    <span style={{ color: i === 0 ? "#e0e0e0" : "#888" }}>{path}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "cache" && <CacheTab flatRoutes={flatRoutes} />}
          </div>
        </div>
      )}
    </>
  );
}

import { isFresh } from "../../utils/prefetch";
import type { FlatRoute } from "../../types";

function CacheTab({ flatRoutes }: { flatRoutes: FlatRoute[] }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 500);
    return () => clearInterval(id);
  }, []);

  const cacheable = flatRoutes.filter((r) => r.loader && r.staleTime);

  if (cacheable.length === 0) {
    return <Muted>No routes with staleTime defined</Muted>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {cacheable.map((r) => {
        const fresh = isFresh(r.path);
        return (
          <div
            key={r.path}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 8px",
              background: "#0f1929",
              borderRadius: "6px",
            }}
          >
            <span style={{ color: "#aaa" }}>{r.path}</span>
            <span
              style={{
                ...(badge as React.CSSProperties),
                background: fresh ? "#10b981" : "#6b7280",
                color: "#fff",
              }}
            >
              {fresh ? "fresh" : "stale"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "1px 6px",
  borderRadius: "4px",
  fontSize: "10px",
  fontWeight: 700,
};

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
      <span style={{ color: "#555", minWidth: "80px", flexShrink: 0 }}>{label}</span>
      <span style={{ color: highlight ? "#7b8cde" : "#ccc", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          color: "#555",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "4px",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{ ...(badge as React.CSSProperties), background: color + "22", color, border: `1px solid ${color}44` }}
    >
      {children}
    </span>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#444", fontStyle: "italic" }}>{children}</span>;
}
