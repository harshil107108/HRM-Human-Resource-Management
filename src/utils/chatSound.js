/**
 * Real-time Chat Audio Feedback using Web Audio API
 * Generates pleasant, rich, crystalline chimes for incoming messages and snappy feedback for sent messages.
 * Does not depend on external mp3 assets, zero latency, works across all browsers.
 */

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * Modern crystal chime played when a new message is received and chat is closed or in background.
 */
export const playIncomingMessageSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, now);
    masterGain.connect(ctx.destination);

    // Filter to keep tone warm and silky
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(5000, now);
    filter.connect(masterGain);

    // 2-note ascending chord (E6 -> A6)
    const notes = [
      { freq: 1318.51, delay: 0.0, duration: 0.28, vol: 0.6 },
      { freq: 1760.00, delay: 0.08, duration: 0.45, vol: 0.8 },
    ];

    notes.forEach(({ freq, delay, duration, vol }) => {
      const start = now + delay;
      const end = start + duration;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(start);
      osc.stop(end);
    });
  } catch (err) {
    console.warn("[Sound] Incoming chat sound skipped:", err);
  }
};

/**
 * Snappy, soft pop played when current user successfully sends a message.
 */
export const playOutgoingMessageSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (err) {
    console.warn("[Sound] Outgoing chat sound skipped:", err);
  }
};
