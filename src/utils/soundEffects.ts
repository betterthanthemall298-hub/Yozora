/**
 * Web Audio API based instant sound synthesizers for the Yozora Store.
 * 100% self-contained: works instantly on all devices without external MP3 files or network latency.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Celebratory 4-note chime for successful purchases.
 * Harmonic sequence: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz)
 */
export function playPurchaseSuccessSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0, duration: 0.35, gain: 0.15 },
      { freq: 659.25, time: 0.1, duration: 0.35, gain: 0.15 },
      { freq: 783.99, time: 0.2, duration: 0.45, gain: 0.18 },
      { freq: 1046.5, time: 0.32, duration: 0.65, gain: 0.22 }
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Soft attack & exponential decay
      gainNode.gain.setValueAtTime(0.001, now + time);
      gainNode.gain.exponentialRampToValueAtTime(gain, now + time + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration + 0.05);
    });
  } catch (err) {
    // Non-blocking fallback
    console.debug('Audio playback note:', err);
  }
}

/**
 * Mobile haptic vibration feedback
 */
export function triggerSuccessVibration(): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate([40, 50, 70]);
    }
  } catch {}
}
