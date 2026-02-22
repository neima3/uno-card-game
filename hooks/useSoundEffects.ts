"use client";

import { useCallback, useRef } from "react";

type SoundType = "play" | "draw" | "skip" | "reverse" | "wild" | "win" | "uno" | "error";

const soundFrequencies: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }[]> = {
  play: [{ frequency: 440, duration: 0.1, type: "sine" }],
  draw: [{ frequency: 330, duration: 0.15, type: "triangle" }],
  skip: [
    { frequency: 523, duration: 0.1, type: "square" },
    { frequency: 392, duration: 0.1, type: "square" },
  ],
  reverse: [
    { frequency: 392, duration: 0.1, type: "sine" },
    { frequency: 523, duration: 0.1, type: "sine" },
  ],
  wild: [
    { frequency: 262, duration: 0.1, type: "sine" },
    { frequency: 330, duration: 0.1, type: "sine" },
    { frequency: 392, duration: 0.1, type: "sine" },
    { frequency: 523, duration: 0.15, type: "sine" },
  ],
  win: [
    { frequency: 523, duration: 0.15, type: "sine" },
    { frequency: 659, duration: 0.15, type: "sine" },
    { frequency: 784, duration: 0.15, type: "sine" },
    { frequency: 1047, duration: 0.3, type: "sine" },
  ],
  uno: [
    { frequency: 880, duration: 0.1, type: "square" },
    { frequency: 1100, duration: 0.15, type: "square" },
  ],
  error: [{ frequency: 200, duration: 0.2, type: "sawtooth" }],
};

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    try {
      const audioContext = getAudioContext();
      const notes = soundFrequencies[type];
      
      let currentTime = audioContext.currentTime;
      
      notes.forEach(({ frequency, duration, type: oscillatorType }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = oscillatorType;
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        
        gainNode.gain.setValueAtTime(0.1, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
        
        currentTime += duration;
      });
    } catch (error) {
      console.warn("Sound effect failed:", error);
    }
  }, [getAudioContext]);

  return { playSound };
}
