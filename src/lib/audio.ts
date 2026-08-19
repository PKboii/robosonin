/* Tiny WebAudio feedback — lazy, gesture-gated, very quiet. */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  dur: number,
  gain: number,
  type: OscillatorType = "sine",
  when = 0,
  glideTo?: number
) {
  const c = ensureCtx();
  if (!c || muted) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** drawer open/close — soft wooden tick */
export const tick = () => tone(320, 0.09, 0.035, "triangle", 0, 210);

/** add to cart — warm two-note pop */
export const cartPop = () => {
  tone(440, 0.1, 0.05, "sine", 0, 520);
  tone(660, 0.14, 0.045, "sine", 0.07);
};

/** entering a new zone — barely-there chime */
export const zoneChime = () => tone(880, 0.22, 0.018, "sine", 0, 870);
