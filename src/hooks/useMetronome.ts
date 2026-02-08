import { useCallback, useRef, useState, useEffect } from 'react';
import * as Tone from 'tone';

interface UseMetronomeReturn {
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  start: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  toggle: () => void;
}

export function useMetronome(initialBpm: number = 120): UseMetronomeReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpmState] = useState(initialBpm);
  const [currentBeat, setCurrentBeat] = useState(0);
  
  const clickSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);
  const beatRef = useRef(0);

  useEffect(() => {
    // Create click sound
    clickSynthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();

    clickSynthRef.current.volume.value = -10;

    return () => {
      if (clickSynthRef.current) {
        clickSynthRef.current.dispose();
      }
      if (loopRef.current) {
        loopRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  const start = useCallback(async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }

    if (loopRef.current) {
      loopRef.current.dispose();
    }

    beatRef.current = 0;
    setCurrentBeat(0);

    loopRef.current = new Tone.Loop((time) => {
      if (clickSynthRef.current) {
        // Higher pitch on beat 1
        const pitch = beatRef.current % 4 === 0 ? 'C3' : 'G2';
        clickSynthRef.current.triggerAttackRelease(pitch, '16n', time);
      }
      
      // Update beat state on the main thread
      const beat = beatRef.current;
      Tone.getDraw().schedule(() => {
        setCurrentBeat(beat % 4);
      }, time);
      
      beatRef.current++;
    }, '4n');

    loopRef.current.start(0);
    Tone.getTransport().start();
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.stop();
    }
    Tone.getTransport().stop();
    setIsPlaying(false);
    setCurrentBeat(0);
    beatRef.current = 0;
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  const setBpm = useCallback((newBpm: number) => {
    const clampedBpm = Math.max(40, Math.min(240, newBpm));
    setBpmState(clampedBpm);
  }, []);

  return {
    isPlaying,
    bpm,
    currentBeat,
    start,
    stop,
    setBpm,
    toggle,
  };
}
