/**
 * Web Audio API synthesized timer chime & haptic feedback.
 * Completely offline, zero audio files required.
 */

let audioCtx: AudioContext | null = null;
let keepAliveAudio: HTMLAudioElement | null = null;

export type AlarmSoundType = 'chime' | 'digital' | 'bell' | 'gentle';

// 1 second of absolute silence in WAV format to keep the audio session alive in the background/locked screen
const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Starts a silent audio loop to prevent iOS/Android from sleeping the JS thread 
 * and allowing alarms to sound even when the screen is locked.
 */
export function startBackgroundAudioSession(): void {
  try {
    if (!keepAliveAudio) {
      keepAliveAudio = new Audio(SILENT_WAV);
      keepAliveAudio.loop = true;
      keepAliveAudio.volume = 0.01;
    }
    // Required to be called on user interaction!
    keepAliveAudio.play().catch(() => {});
    
    // Also warm up web audio
    getAudioContext();
  } catch (e) {
    console.warn('Background audio session failed', e);
  }
}

export function stopBackgroundAudioSession(): void {
  if (keepAliveAudio) {
    keepAliveAudio.pause();
  }
}

/**
 * Plays the selected alarm sound
 */
export function playTimerCompletionSound(soundType: AlarmSoundType = 'chime'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Force resume in case it suspended while locked
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (soundType === 'digital') {
      // Classic digital watch beep (fast repeating high pitch)
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now + i * 0.2);
        gain.gain.setValueAtTime(0, now + i * 0.2);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.2 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.1);
      }
    } else if (soundType === 'bell') {
      // Ringing bell sound (multiple frequencies)
      const freqs = [500, 750, 1000];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.5);
      });
    } else if (soundType === 'gentle') {
      // Gentle soft chord (marimba/vibraphone like)
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 2.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 2.0);
      });
    } else {
      // Default: 'chime' (Kitchen Timer Ping)
      // First tone (E5 ~ 659 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Second chime (A5 ~ 880 Hz) after 150ms
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.4, now + 0.20);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.9);

      // Repeat ping 3 times for kitchen alert
      [0.8, 1.6].forEach((offset) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(880, now + offset);
        g.gain.setValueAtTime(0, now + offset);
        g.gain.linearRampToValueAtTime(0.3, now + offset + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.5);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + offset);
        o.stop(now + offset + 0.5);
      });
    }
  } catch (e) {
    console.warn('Audio synthesis failed:', e);
  }

  // Multi-pulse vibration pattern for heavy alert
  triggerHaptic([300, 100, 300, 100, 300, 100, 500, 100, 300]);
}

/**
 * Short subtle click sound for UI feedback
 */
export function playClickSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // Ignore audio interaction block before user gesture
  }
}

/**
 * Trigger mobile haptic vibration if supported
 */
export function triggerHaptic(pattern: number | number[] = 40): void {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration refusal on unsupported devices
    }
  }
}
