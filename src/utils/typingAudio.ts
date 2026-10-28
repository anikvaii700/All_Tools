// Web Audio API synthesizer for realistic typing feedback
// Zero external assets required, 100% offline, zero latency

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
};

/**
 * Play a crisp mechanical keyboard switch click for correct keystrokes
 */
export const playCorrectKeySound = (volume = 0.28) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Subtle natural pitch variance (+/- 8%) so each key sounds authentic
  const jitter = 0.92 + Math.random() * 0.16;

  // 1. High-frequency transient click
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();

  clickOsc.type = 'sine';
  clickOsc.frequency.setValueAtTime(1400 * jitter, now);
  clickOsc.frequency.exponentialRampToValueAtTime(350, now + 0.025);

  clickGain.gain.setValueAtTime(volume * 0.8, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);

  clickOsc.start(now);
  clickOsc.stop(now + 0.025);

  // 2. Plastic body resonance ("thock")
  const thockOsc = ctx.createOscillator();
  const thockGain = ctx.createGain();

  thockOsc.type = 'triangle';
  thockOsc.frequency.setValueAtTime(520 * jitter, now);
  thockOsc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

  thockGain.gain.setValueAtTime(volume * 0.5, now);
  thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  thockOsc.connect(thockGain);
  thockGain.connect(ctx.destination);

  thockOsc.start(now);
  thockOsc.stop(now + 0.045);
};

/**
 * Play deeper mechanical spacebar sound
 */
export const playSpaceKeySound = (volume = 0.32) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const jitter = 0.95 + Math.random() * 0.1;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320 * jitter, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.055);

  gain.gain.setValueAtTime(volume * 0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.055);
};

/**
 * Play a distinctly different sound for typing errors / wrong keys
 * Low warning buzz / bonk that immediately signals a mistake
 */
export const playWrongKeySound = (volume = 0.35) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Dissonant dual tone error sound (sawtooth + square)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(180, now);
  osc1.frequency.exponentialRampToValueAtTime(120, now + 0.09);

  osc2.type = 'square';
  osc2.frequency.setValueAtTime(245, now);
  osc2.frequency.exponentialRampToValueAtTime(155, now + 0.09);

  gain.gain.setValueAtTime(volume * 0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.09);
  osc2.stop(now + 0.09);
};

/**
 * Play soft backspace sound
 */
export const playBackspaceSound = (volume = 0.2) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(380, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

  gain.gain.setValueAtTime(volume * 0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.02);
};
