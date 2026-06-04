import { create } from "zustand";
import {
  HOTSPOTS_PER_ROUND,
  LEVELS,
  LEVEL_ORDER,
  POINTS_CORRECT,
  POINTS_WRONG,
  hotspotsTotalViolations,
  sampleLevelHotspots,
  type Hotspot,
  type LevelId,
  type ViolationCategory,
} from "./data";
import { playCorrect, playWrong, setMuted as setAudioMuted } from "./audio";

export type GamePhase = "menu" | "playing" | "summary";

export interface AnswerRecord {
  hotspotId: string;
  guess: ViolationCategory;
  correct: boolean;
}

export interface LevelResult {
  levelId: LevelId;
  score: number;
  answered: Record<string, AnswerRecord>;
  violationsFound: number;
  totalViolations: number;
  hotspotCount: number;
  // The exact hotspots that were live in this round, so the summary
  // screen can show the right teaching points (variants vary per round).
  sampledHotspots: Hotspot[];
  completedAt: number;
}

interface GameState {
  phase: GamePhase;
  currentLevelId: LevelId | null;
  // Active round state
  score: number;
  startedAt: number;
  inspectingId: string | null;
  answered: Record<string, AnswerRecord>;
  // The randomized hotspots for the current round.
  sampledHotspots: Hotspot[];
  feedback: {
    hotspotId: string;
    correct: boolean;
    explanation: string;
    correctAnswer: string;
  } | null;
  // Persistent across rounds
  levelResults: Partial<Record<LevelId, LevelResult>>;
  muted: boolean;
  // Actions
  startLevel: (id: LevelId) => void;
  endGame: () => void;
  resetMenu: () => void;
  resetAllProgress: () => void;
  setInspecting: (id: string | null) => void;
  submitAnswer: (hotspotId: string, guess: ViolationCategory) => void;
  dismissFeedback: () => void;
  toggleMuted: () => void;
  // Selectors
  violationsFound: () => number;
  totalViolations: () => number;
  totalAnswered: () => number;
  cumulativeScore: () => number;
  currentHotspots: () => Hotspot[];
}

export const useGame = create<GameState>((set, get) => ({
  phase: "menu",
  currentLevelId: null,
  score: 0,
  startedAt: 0,
  inspectingId: null,
  answered: {},
  sampledHotspots: [],
  feedback: null,
  levelResults: {},
  muted: false,
  startLevel: (id) =>
    set({
      phase: "playing",
      currentLevelId: id,
      score: 0,
      answered: {},
      sampledHotspots: sampleLevelHotspots(id, HOTSPOTS_PER_ROUND),
      startedAt: Date.now(),
      inspectingId: null,
      feedback: null,
    }),
  endGame: () => {
    const state = get();
    const id = state.currentLevelId;
    if (!id) {
      set({ phase: "summary", inspectingId: null, feedback: null });
      return;
    }
    const sampled = state.sampledHotspots;
    const violationsFound = Object.values(state.answered).filter(
      (r) =>
        r.correct &&
        sampled.find((h) => h.id === r.hotspotId)?.category !== "none",
    ).length;
    const result: LevelResult = {
      levelId: id,
      score: state.score,
      answered: { ...state.answered },
      violationsFound,
      totalViolations: hotspotsTotalViolations(sampled),
      hotspotCount: sampled.length,
      sampledHotspots: sampled,
      completedAt: Date.now(),
    };
    set({
      phase: "summary",
      inspectingId: null,
      feedback: null,
      levelResults: { ...state.levelResults, [id]: result },
    });
  },
  resetMenu: () =>
    set({
      phase: "menu",
      currentLevelId: null,
      inspectingId: null,
      feedback: null,
    }),
  resetAllProgress: () =>
    set({
      phase: "menu",
      currentLevelId: null,
      inspectingId: null,
      feedback: null,
      levelResults: {},
      score: 0,
      answered: {},
      sampledHotspots: [],
    }),
  setInspecting: (id) => set({ inspectingId: id }),
  submitAnswer: (hotspotId, guess) => {
    const state = get();
    const id = state.currentLevelId;
    if (!id) return;
    const hotspot = state.sampledHotspots.find((h) => h.id === hotspotId);
    if (!hotspot) return;
    if (state.answered[hotspotId]) return;
    const correct = guess === hotspot.category;
    const newAnswered = {
      ...state.answered,
      [hotspotId]: { hotspotId, guess, correct },
    };
    set({
      answered: newAnswered,
      score: state.score + (correct ? POINTS_CORRECT : POINTS_WRONG),
      feedback: {
        hotspotId,
        correct,
        explanation: hotspot.explanation,
        correctAnswer: hotspot.correctAnswer,
      },
      inspectingId: null,
    });
    if (correct) playCorrect();
    else playWrong();
  },
  toggleMuted: () => {
    const next = !get().muted;
    setAudioMuted(next);
    set({ muted: next });
  },
  dismissFeedback: () => {
    const state = get();
    set({ feedback: null });
    const id = state.currentLevelId;
    if (!id) return;
    const sampled = state.sampledHotspots;
    const allAnswered = Object.keys(state.answered).length >= sampled.length;
    const allRealViolationsCaught =
      Object.values(state.answered).filter(
        (r) =>
          r.correct &&
          sampled.find((h) => h.id === r.hotspotId)?.category !== "none",
      ).length >= hotspotsTotalViolations(sampled);
    if (allAnswered || allRealViolationsCaught) {
      get().endGame();
    }
  },
  violationsFound: () => {
    const state = get();
    if (!state.currentLevelId) return 0;
    return Object.values(state.answered).filter(
      (r) =>
        r.correct &&
        state.sampledHotspots.find((h) => h.id === r.hotspotId)?.category !==
          "none",
    ).length;
  },
  totalViolations: () => {
    const state = get();
    return state.currentLevelId
      ? hotspotsTotalViolations(state.sampledHotspots)
      : 0;
  },
  totalAnswered: () => Object.keys(get().answered).length,
  cumulativeScore: () => {
    const results = get().levelResults;
    return LEVEL_ORDER.reduce((sum, id) => sum + (results[id]?.score ?? 0), 0);
  },
  currentHotspots: () => get().sampledHotspots,
}));
