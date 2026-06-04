import { useEffect, useState } from "react";
import { useGame } from "./store";
import { CATEGORY_LABELS, type ViolationCategory } from "./data";

function useEscape(handler: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        handler();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler, enabled]);
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function HUD() {
  const phase = useGame((s) => s.phase);
  const score = useGame((s) => s.score);
  const startedAt = useGame((s) => s.startedAt);
  const violationsFound = useGame((s) => s.violationsFound());
  const totalViolations = useGame((s) => s.totalViolations());
  const totalAnswered = useGame((s) => s.totalAnswered());
  const inspectingId = useGame((s) => s.inspectingId);
  const feedback = useGame((s) => s.feedback);
  const endGame = useGame((s) => s.endGame);
  const muted = useGame((s) => s.muted);
  const toggleMuted = useGame((s) => s.toggleMuted);
  const sampledHotspots = useGame((s) => s.sampledHotspots);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (phase !== "playing") return;
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, [phase]);

  if (phase !== "playing") return null;

  return (
    <div className="no-select" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={panelStyle}>
          <div style={labelStyle}>SCORE</div>
          <div style={bigNumStyle}>{score}</div>
        </div>
        <div style={panelStyle}>
          <div style={labelStyle}>VIOLATIONS FOUND</div>
          <div style={bigNumStyle}>
            {violationsFound} <span style={{ color: "var(--muted)", fontSize: 18 }}>/ {totalViolations}</span>
          </div>
        </div>
        <div style={panelStyle}>
          <div style={labelStyle}>INSPECTED</div>
          <div style={bigNumStyle}>
            {totalAnswered} <span style={{ color: "var(--muted)", fontSize: 18 }}>/ {sampledHotspots.length}</span>
          </div>
        </div>
        <div style={panelStyle}>
          <div style={labelStyle}>TIME</div>
          <div style={bigNumStyle}>{formatTime(now - startedAt)}</div>
        </div>
        <button
          onClick={toggleMuted}
          aria-label={muted ? "Unmute audio" : "Mute audio"}
          title={muted ? "Unmute audio" : "Mute audio"}
          style={{
            ...panelStyle,
            cursor: "pointer",
            pointerEvents: "auto",
            color: "var(--text)",
            background: "transparent",
            fontSize: 18,
            lineHeight: 1,
            minWidth: 44,
          }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button
          onClick={endGame}
          style={{
            ...panelStyle,
            cursor: "pointer",
            pointerEvents: "auto",
            color: "var(--bad)",
            border: "1px solid var(--bad)",
            background: "transparent",
          }}
        >
          End Round
        </button>
      </div>

      {/* Crosshair */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 8,
          height: 8,
          marginLeft: -4,
          marginTop: -4,
          borderRadius: 4,
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
        }}
      />

      {/* Bottom hint */}
      {!inspectingId && !feedback && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 16,
            ...panelStyle,
          }}
        >
          <Hint k="WASD" v="Move" />
          <Hint k="Mouse" v="Look" />
          <Hint k="E" v="Inspect (when near a marker)" />
          <Hint k="Esc" v="Release mouse" />
        </div>
      )}

      {inspectingId && <InspectModal />}
      {feedback && <FeedbackModal />}
    </div>
  );
}

function Hint({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
      <span
        style={{
          padding: "2px 8px",
          border: "1px solid var(--panel-border)",
          borderRadius: 4,
          background: "rgba(255,255,255,0.05)",
          color: "var(--text)",
          fontFamily: "Menlo, monospace",
          fontSize: 12,
        }}
      >
        {k}
      </span>
      <span style={{ color: "var(--muted)" }}>{v}</span>
    </div>
  );
}

const CATEGORY_ORDER: ViolationCategory[] = [
  "hand_hygiene",
  "ppe",
  "sterilization",
  "none",
];

function InspectModal() {
  const inspectingId = useGame((s) => s.inspectingId);
  const setInspecting = useGame((s) => s.setInspecting);
  const submit = useGame((s) => s.submitAnswer);
  useEscape(() => setInspecting(null), true);
  const hotspots = useGame((s) => s.sampledHotspots);
  const h = hotspots.find((x) => x.id === inspectingId);
  if (!h) return null;
  return (
    <Modal>
      <div style={{ fontSize: 12, color: "var(--accent)", letterSpacing: 1.5, fontWeight: 600 }}>
        INSPECTION
      </div>
      <h2 style={{ fontSize: 22, margin: "6px 0 10px", color: "var(--text)" }}>{h.label}</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 18 }}>{h.scene}</p>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
        Classify what you're seeing:
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            onClick={() => submit(h.id, c)}
            style={choiceBtnStyle}
            onMouseDown={(e) => e.currentTarget.style.background = "rgba(54,196,255,0.18)"}
            onMouseUp={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button onClick={() => setInspecting(null)} style={ghostBtnStyle}>
          Cancel (Esc)
        </button>
      </div>
    </Modal>
  );
}

function FeedbackModal() {
  const feedback = useGame((s) => s.feedback);
  const dismiss = useGame((s) => s.dismissFeedback);
  useEscape(dismiss, !!feedback);
  if (!feedback) return null;
  return (
    <Modal>
      <div
        style={{
          fontSize: 12,
          color: feedback.correct ? "var(--good)" : "var(--bad)",
          letterSpacing: 1.5,
          fontWeight: 600,
        }}
      >
        {feedback.correct ? "CORRECT" : "INCORRECT"}
      </div>
      <h2 style={{ fontSize: 22, margin: "6px 0 12px", color: "var(--text)" }}>
        Correct answer: {feedback.correctAnswer}
      </h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 18 }}>
        {feedback.explanation}
      </p>
      <div style={{ textAlign: "right" }}>
        <button onClick={dismiss} style={primaryBtnStyle} autoFocus>
          Continue
        </button>
      </div>
    </Modal>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(5, 10, 22, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          width: "min(560px, 92vw)",
          background: "var(--panel)",
          border: "1px solid var(--panel-border)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: "rgba(15, 26, 46, 0.85)",
  border: "1px solid var(--panel-border)",
  borderRadius: 8,
  padding: "8px 14px",
  backdropFilter: "blur(6px)",
  color: "var(--text)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: 1.5,
  color: "var(--muted)",
  fontWeight: 600,
};

const bigNumStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "var(--text)",
  lineHeight: 1.1,
};

const choiceBtnStyle: React.CSSProperties = {
  padding: "14px 14px",
  borderRadius: 8,
  border: "1px solid var(--panel-border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text)",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.15s",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "1px solid var(--accent)",
  background: "var(--accent)",
  color: "#0b1220",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const ghostBtnStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid var(--panel-border)",
  background: "transparent",
  color: "var(--muted)",
  fontSize: 13,
  cursor: "pointer",
};
