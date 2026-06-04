let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambienceNodes: { stop: () => void } | null = null;
let muted = false;
const listeners = new Set<(m: boolean) => void>();

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

function dest(): AudioNode | null {
  return masterGain;
}

export function isMuted() {
  return muted;
}

export function setMuted(m: boolean) {
  muted = m;
  if (masterGain) masterGain.gain.value = m ? 0 : 1;
  listeners.forEach((l) => l(m));
}

export function toggleMuted() {
  setMuted(!muted);
}

export function subscribeMuted(cb: (m: boolean) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function envBeep(opts: {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  freqEnd?: number;
}) {
  const c = getCtx();
  const out = dest();
  if (!c || !out) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  const t0 = c.currentTime;
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.freqEnd), t0 + opts.duration);
  }
  const peak = opts.gain ?? 0.18;
  const a = opts.attack ?? 0.01;
  const r = opts.release ?? 0.08;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + a);
  g.gain.linearRampToValueAtTime(peak, t0 + Math.max(a, opts.duration - r));
  g.gain.linearRampToValueAtTime(0, t0 + opts.duration);
  osc.connect(g);
  g.connect(out);
  osc.start(t0);
  osc.stop(t0 + opts.duration + 0.02);
}

export function playCorrect() {
  envBeep({ freq: 660, duration: 0.14, type: "sine", gain: 0.22 });
  setTimeout(() => envBeep({ freq: 990, duration: 0.22, type: "sine", gain: 0.22 }), 110);
}

export function playWrong() {
  envBeep({ freq: 280, duration: 0.18, type: "square", gain: 0.14, freqEnd: 150 });
  setTimeout(
    () => envBeep({ freq: 200, duration: 0.22, type: "square", gain: 0.14, freqEnd: 110 }),
    140,
  );
}

export function playEnterRange() {
  envBeep({ freq: 880, duration: 0.09, type: "triangle", gain: 0.08, attack: 0.005, release: 0.05 });
}

export function startAmbience() {
  const c = getCtx();
  const out = dest();
  if (!c || !out) return;
  if (ambienceNodes) return;

  // Pink-ish noise via filtered white noise (HVAC hum)
  const bufferSize = 2 * c.sampleRate;
  const noiseBuffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 380;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.05;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(out);
  noise.start();

  // Low room hum
  const hum = c.createOscillator();
  hum.type = "sine";
  hum.frequency.value = 60;
  const humGain = c.createGain();
  humGain.gain.value = 0.025;
  hum.connect(humGain);
  humGain.connect(out);
  hum.start();

  // Periodic monitor beep
  let beepTimer: ReturnType<typeof setInterval> | null = null;
  const monitorBeep = () => {
    const o = c.createOscillator();
    const g = c.createGain();
    const t0 = c.currentTime;
    o.type = "sine";
    o.frequency.value = 1320;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.04, t0 + 0.01);
    g.gain.linearRampToValueAtTime(0, t0 + 0.12);
    o.connect(g);
    g.connect(out);
    o.start(t0);
    o.stop(t0 + 0.14);
  };
  beepTimer = setInterval(monitorBeep, 1400);

  ambienceNodes = {
    stop: () => {
      try {
        noise.stop();
      } catch { /* ignore */ }
      try {
        hum.stop();
      } catch { /* ignore */ }
      if (beepTimer) clearInterval(beepTimer);
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      hum.disconnect();
      humGain.disconnect();
    },
  };
}

export function stopAmbience() {
  if (ambienceNodes) {
    ambienceNodes.stop();
    ambienceNodes = null;
  }
}
