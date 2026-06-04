import { useGame } from "./store";
import {
  CATEGORY_LABELS,
  LEVELS,
  LEVEL_ORDER,
  levelRoundSize,
  levelScenarioPoolSize,
  type LevelId,
} from "./data";

export function MenuScreen() {
  const startLevel = useGame((s) => s.startLevel);
  const levelResults = useGame((s) => s.levelResults);
  const cumulativeScore = useGame((s) => s.cumulativeScore());
  const resetAllProgress = useGame((s) => s.resetAllProgress);

  const completedCount = LEVEL_ORDER.filter((id) => levelResults[id]).length;
  const totalCaught = LEVEL_ORDER.reduce(
    (n, id) => n + (levelResults[id]?.violationsFound ?? 0),
    0,
  );
  const totalScenarioPool = LEVEL_ORDER.reduce(
    (n, id) => n + levelScenarioPoolSize(id),
    0,
  );

  return (
    <div style={overlayStyle}>
      <div style={{ ...cardStyle, maxWidth: 820, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ fontSize: 12, color: "var(--accent)", letterSpacing: 2, fontWeight: 600 }}>
          INFECTION PREVENTION TRAINING
        </div>
        <h1 style={{ fontSize: 36, margin: "8px 0 14px", lineHeight: 1.15 }}>
          IP Specialist:<br />Hospital Rounds
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 18 }}>
          You're rounding through the hospital as the Infection Prevention specialist.
          Walk each unit, inspect anything that looks off, and classify each scenario.
          Catch every violation — but don't over-call. Spotting <i>good</i> practice matters too.
        </p>

        <div style={{ display: "flex", gap: 18, marginBottom: 18, flexWrap: "wrap" }}>
          <Stat label="Cumulative Score" value={String(cumulativeScore)} highlight />
          <Stat label="Levels Completed" value={`${completedCount} / ${LEVEL_ORDER.length}`} />
          <Stat label="Violations Caught" value={String(totalCaught)} />
          <Stat label="Scenario Pool" value={`${totalScenarioPool} scenarios`} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {(["hand_hygiene", "ppe", "sterilization"] as const).map((c) => (
            <span key={c} style={pillStyle}>{CATEGORY_LABELS[c]}</span>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>
          SELECT A LEVEL
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          {LEVEL_ORDER.map((id) => {
            const level = LEVELS[id];
            const result = levelResults[id];
            return (
              <button
                key={id}
                onClick={() => startLevel(id)}
                style={levelCardStyle(level.layout.accentColor, !!result)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{level.label}</div>
                  {result && (
                    <div style={{ fontSize: 12, color: "var(--good)", fontWeight: 600 }}>
                      ✓ {result.score}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
                  {level.blurb}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 10, letterSpacing: 1 }}>
                  {levelRoundSize(id)} HOTSPOTS / ROUND · POOL OF {levelScenarioPoolSize(id)} SCENARIOS
                  {result && (
                    <> · LAST: {result.violationsFound}/{result.totalViolations}</>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--panel-border)", borderRadius: 8, padding: 14, marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6 }}>CONTROLS</div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", fontSize: 14 }}>
            <Kbd>WASD</Kbd><span style={{ color: "var(--muted)" }}>Move</span>
            <Kbd>Mouse</Kbd><span style={{ color: "var(--muted)" }}>Look around (click to lock cursor)</span>
            <Kbd>E</Kbd><span style={{ color: "var(--muted)" }}>Inspect a yellow marker</span>
            <Kbd>Esc</Kbd><span style={{ color: "var(--muted)" }}>Release cursor</span>
          </div>
        </div>

        {completedCount > 0 && (
          <div style={{ textAlign: "right" }}>
            <button onClick={resetAllProgress} style={ghostBtnStyle}>
              Reset All Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function SummaryScreen() {
  const score = useGame((s) => s.score);
  const answered = useGame((s) => s.answered);
  const violationsFound = useGame((s) => s.violationsFound());
  const totalViolations = useGame((s) => s.totalViolations());
  const cumulativeScore = useGame((s) => s.cumulativeScore());
  const levelResults = useGame((s) => s.levelResults);
  const startLevel = useGame((s) => s.startLevel);
  const resetMenu = useGame((s) => s.resetMenu);
  const currentLevelId = useGame((s) => s.currentLevelId);
  const sampledHotspots = useGame((s) => s.sampledHotspots);

  if (!currentLevelId) return null;
  const level = LEVELS[currentLevelId];

  const remainingLevels = LEVEL_ORDER.filter(
    (id) => id !== currentLevelId && !levelResults[id],
  );
  const nextLevelId: LevelId | null = remainingLevels[0] ?? null;
  const allDone = LEVEL_ORDER.every((id) => levelResults[id]);

  return (
    <div style={overlayStyle}>
      <div style={{ ...cardStyle, maxWidth: 820, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ fontSize: 12, color: level.layout.accentColor, letterSpacing: 2, fontWeight: 600 }}>
          {level.label.toUpperCase()} — ROUND COMPLETE
        </div>
        <h1 style={{ fontSize: 30, margin: "8px 0 18px" }}>Rounds Report</h1>
        <div style={{ display: "flex", gap: 18, marginBottom: 18, flexWrap: "wrap" }}>
          <Stat label="Level Score" value={String(score)} highlight />
          <Stat label="Cumulative Score" value={String(cumulativeScore)} />
          <Stat label="Violations Caught" value={`${violationsFound} / ${totalViolations}`} />
          <Stat label="Hotspots Inspected" value={`${Object.keys(answered).length} / ${sampledHotspots.length}`} />
        </div>

        {/* Cumulative per-level summary */}
        <div style={{ borderTop: "1px solid var(--panel-border)", paddingTop: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10 }}>
            CAMPAIGN PROGRESS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {LEVEL_ORDER.map((id) => {
              const lr = levelResults[id];
              const lv = LEVELS[id];
              return (
                <div
                  key={id}
                  style={{
                    border: "1px solid var(--panel-border)",
                    borderLeft: `3px solid ${lv.layout.accentColor}`,
                    borderRadius: 6,
                    padding: "8px 12px",
                    background: lr ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.02)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{lv.label}</div>
                    <div style={{ fontSize: 13, color: lr ? "var(--good)" : "var(--muted)", fontWeight: 600 }}>
                      {lr ? `${lr.score} pts` : "Not played"}
                    </div>
                  </div>
                  {lr && (
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {lr.violationsFound}/{lr.totalViolations} violations · {Object.keys(lr.answered).length}/{lr.hotspotCount} inspected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--panel-border)", paddingTop: 16 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 1.5, fontWeight: 600, marginBottom: 12 }}>
            FINDINGS RECAP — {level.label.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sampledHotspots.map((h) => {
              const a = answered[h.id];
              const isViolation = h.category !== "none";
              const status = !a
                ? { label: "Not inspected", color: "var(--muted)" }
                : a.correct
                  ? { label: isViolation ? "Caught" : "Correctly cleared", color: "var(--good)" }
                  : { label: isViolation ? "Missed" : "False alarm", color: "var(--bad)" };
              return (
                <div
                  key={h.id}
                  style={{
                    border: "1px solid var(--panel-border)",
                    borderRadius: 8,
                    padding: 12,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <div style={{ fontWeight: 600 }}>{h.label}</div>
                    <div style={{ fontSize: 12, color: status.color, fontWeight: 600 }}>{status.label}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                    {h.correctAnswer}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text)", marginTop: 8, lineHeight: 1.5 }}>
                    {h.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          {nextLevelId && !allDone && (
            <button onClick={() => startLevel(nextLevelId)} style={primaryBtnStyle}>
              Next Level: {LEVELS[nextLevelId].shortLabel} →
            </button>
          )}
          {allDone && (
            <div style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "1px solid var(--good)",
              color: "var(--good)",
              fontWeight: 600,
            }}>
              🏆 All levels complete — Cumulative {cumulativeScore}
            </div>
          )}
          <button onClick={() => startLevel(currentLevelId)} style={ghostBtnStyle}>
            Replay {level.shortLabel}
          </button>
          <button onClick={resetMenu} style={ghostBtnStyle}>Main Menu</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: highlight ? "var(--accent)" : "var(--text)" }}>{value}</div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        border: "1px solid var(--panel-border)",
        borderRadius: 4,
        background: "rgba(255,255,255,0.05)",
        fontFamily: "Menlo, monospace",
        fontSize: 12,
        justifySelf: "start",
      }}
    >
      {children}
    </span>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(11,18,32,0.85), rgba(11,18,32,0.95))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 10,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--panel)",
  border: "1px solid var(--panel-border)",
  borderRadius: 14,
  padding: 30,
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
};

const pillStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid var(--panel-border)",
  background: "rgba(54,196,255,0.08)",
  color: "var(--accent)",
};

function levelCardStyle(accent: string, completed: boolean): React.CSSProperties {
  return {
    textAlign: "left",
    padding: 16,
    borderRadius: 10,
    border: `1px solid ${completed ? "var(--good)" : "var(--panel-border)"}`,
    borderLeft: `4px solid ${accent}`,
    background: completed ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.03)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "background 0.15s, transform 0.1s",
  };
}

const primaryBtnStyle: React.CSSProperties = {
  padding: "12px 24px",
  borderRadius: 8,
  border: "1px solid var(--accent)",
  background: "var(--accent)",
  color: "#0b1220",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

const ghostBtnStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: 8,
  border: "1px solid var(--panel-border)",
  background: "transparent",
  color: "var(--text)",
  fontSize: 14,
  cursor: "pointer",
};
