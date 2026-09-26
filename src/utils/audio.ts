// Lightweight synthetic sound effects using Web Audio API
// No audio files downloaded, zero network overhead, ultra-fast on mobile phones!

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playCutePop(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Graceful fallback if audio is not permitted
  }
}

export function playSparkleChime(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.25);
    });
  } catch {}
}

export function playBedtimeLullaby(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Calming low bell notes
    const chords = [392, 440, 523.25, 440];
    chords.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.35);
      
      gain.gain.setValueAtTime(0.08, now + i * 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.35 + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.35);
      osc.stop(now + i * 0.35 + 0.65);
    });
  } catch {}
}

let currentWelcomeMelodyGain: GainNode | null = null;
let currentWelcomeOscillators: OscillatorNode[] = [];
let welcomeMelodyTimeout: ReturnType<typeof setTimeout> | null = null;

export function stopWelcomeMelody() {
  if (welcomeMelodyTimeout) {
    clearTimeout(welcomeMelodyTimeout);
    welcomeMelodyTimeout = null;
  }
  if (currentWelcomeMelodyGain) {
    try {
      const ctx = currentWelcomeMelodyGain.context;
      const now = ctx.currentTime;
      currentWelcomeMelodyGain.gain.setValueAtTime(currentWelcomeMelodyGain.gain.value, now);
      currentWelcomeMelodyGain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      setTimeout(() => {
        currentWelcomeOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        currentWelcomeOscillators = [];
        currentWelcomeMelodyGain = null;
      }, 160);
    } catch {
      currentWelcomeOscillators = [];
      currentWelcomeMelodyGain = null;
    }
  }
}

/**
 * Enchanted Fairytale Welcome Melody for Children
 * Multi-layered synthesis (celesta melody, warm harmonic bell pads, cascading stardust sparkles)
 */
export function playWelcomeFairytaleMelody(enabled = true, onFinish?: () => void): boolean {
  if (!enabled) return false;
  try {
    stopWelcomeMelody();
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const masterGain = ctx.createGain();
    currentWelcomeMelodyGain = masterGain;
    currentWelcomeOscillators = [];

    const now = ctx.currentTime + 0.05;

    // Master volume envelope: gentle rise, singing sustain, gentle fade out
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.24, now + 0.25);
    masterGain.gain.setValueAtTime(0.24, now + 3.4);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.3);

    masterGain.connect(ctx.destination);

    // Warm filter for dream-like, gentle storybook atmosphere
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.connect(masterGain);

    // 1. Fairytale Celesta / Music Box Lead Melody (Pentatonic Enchanted Theme)
    const leadNotes = [
      { time: 0.0, freq: 523.25, dur: 0.35, vol: 0.45 }, // C5
      { time: 0.28, freq: 659.25, dur: 0.35, vol: 0.5 },  // E5
      { time: 0.56, freq: 783.99, dur: 0.38, vol: 0.55 }, // G5
      { time: 0.90, freq: 880.00, dur: 0.35, vol: 0.5 },  // A5
      { time: 1.22, freq: 1046.50, dur: 0.50, vol: 0.65 },// C6
      { time: 1.70, freq: 1174.66, dur: 0.38, vol: 0.55 },// D6
      { time: 2.05, freq: 1046.50, dur: 0.40, vol: 0.55 },// C6
      { time: 2.45, freq: 783.99, dur: 0.40, vol: 0.5 },  // G5
      { time: 2.85, freq: 880.00, dur: 0.35, vol: 0.5 },  // A5
      { time: 3.15, freq: 1046.50, dur: 0.95, vol: 0.7 }, // C6
    ];

    leadNotes.forEach((n) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      const noteStart = now + n.time;
      noteGain.gain.setValueAtTime(0.0001, noteStart);
      noteGain.gain.exponentialRampToValueAtTime(n.vol, noteStart + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + n.dur);

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(noteStart);
      osc.stop(noteStart + n.dur + 0.05);
      currentWelcomeOscillators.push(osc);
    });

    // 2. Chime Harmonics / Vibraphone undertone (Warm chord progression)
    const bellNotes = [
      { time: 0.0, freq: 261.63, dur: 1.3, vol: 0.22 }, // C4
      { time: 0.0, freq: 392.00, dur: 1.3, vol: 0.20 }, // G4
      { time: 1.2, freq: 349.23, dur: 1.4, vol: 0.22 }, // F4
      { time: 1.2, freq: 440.00, dur: 1.4, vol: 0.22 }, // A4
      { time: 2.6, freq: 261.63, dur: 1.6, vol: 0.26 }, // C4
      { time: 2.6, freq: 523.25, dur: 1.6, vol: 0.24 }, // C5
    ];

    bellNotes.forEach((b) => {
      const osc = ctx.createOscillator();
      const bGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(b.freq, now + b.time);

      const bStart = now + b.time;
      bGain.gain.setValueAtTime(0.0001, bStart);
      bGain.gain.exponentialRampToValueAtTime(b.vol, bStart + 0.08);
      bGain.gain.exponentialRampToValueAtTime(0.0001, bStart + b.dur);

      osc.connect(bGain);
      bGain.connect(filter);

      osc.start(bStart);
      osc.stop(bStart + b.dur + 0.05);
      currentWelcomeOscillators.push(osc);
    });

    // 3. Falling Stars / Fairy Dust Twinkles (High cascading glissando)
    const sparkles = [
      { time: 0.50, freq: 1318.51 }, // E6
      { time: 0.58, freq: 1567.98 }, // G6
      { time: 0.66, freq: 1760.00 }, // A6
      { time: 0.74, freq: 2093.00 }, // C7
      { time: 2.45, freq: 1046.50 }, // C6
      { time: 2.53, freq: 1318.51 }, // E6
      { time: 2.61, freq: 1567.98 }, // G6
      { time: 2.69, freq: 2093.00 }, // C7
      { time: 2.77, freq: 2637.02 }, // E7
    ];

    sparkles.forEach((s) => {
      const osc = ctx.createOscillator();
      const sGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(s.freq, now + s.time);

      const sStart = now + s.time;
      sGain.gain.setValueAtTime(0.0001, sStart);
      sGain.gain.exponentialRampToValueAtTime(0.18, sStart + 0.02);
      sGain.gain.exponentialRampToValueAtTime(0.0001, sStart + 0.22);

      osc.connect(sGain);
      sGain.connect(masterGain);

      osc.start(sStart);
      osc.stop(sStart + 0.25);
      currentWelcomeOscillators.push(osc);
    });

    welcomeMelodyTimeout = setTimeout(() => {
      currentWelcomeOscillators = [];
      currentWelcomeMelodyGain = null;
      if (onFinish) onFinish();
    }, 4400);

    return true;
  } catch {
    return false;
  }
}
