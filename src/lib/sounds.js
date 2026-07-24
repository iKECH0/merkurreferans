"use client";

// A simple synthesizer using the Web Audio API so we don't need external MP3 files.
let audioCtx = null;

const initAudio = () => {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem("merkur_muted") === "true") return null;
  
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a simple tone
const playTone = (frequency, type = 'sine', duration = 0.1, volume = 0.1) => {
  const ctx = initAudio();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
};

export const sounds = {
  // A pleasant "ding" for correct answers
  correct: () => {
    playTone(600, 'sine', 0.15, 0.2);
    setTimeout(() => playTone(800, 'sine', 0.2, 0.2), 100);
  },
  
  // A low "buzz" for wrong answers
  wrong: () => {
    playTone(300, 'sawtooth', 0.3, 0.1);
    setTimeout(() => playTone(250, 'sawtooth', 0.3, 0.1), 150);
  },
  
  // A subtle click/pop for Schulte table numbers
  click: (pitchMultiplier = 1) => {
    playTone(400 * pitchMultiplier, 'sine', 0.1, 0.1);
  },
  
  // Epic level up / game over success melody
  success: () => {
    const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5 (A major chord)
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'square', 0.2, 0.1), i * 150);
    });
  },
  
  // Coin/XP gain sound (classic level up ding-ding-ding)
  xpGain: () => {
    playTone(800, 'sine', 0.1, 0.2);
    setTimeout(() => playTone(1200, 'sine', 0.1, 0.2), 100);
    setTimeout(() => playTone(1600, 'sine', 0.3, 0.2), 200);
  }
};
