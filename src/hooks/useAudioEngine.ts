import { useCallback, useRef, useState, useEffect } from 'react';
import * as Tone from 'tone';
import { NoteWithDuration } from '@/utils/abcDurationParser';

interface UseAudioEngineReturn {
  isPlaying: boolean;
  isLoaded: boolean;
  playNote: (note: string, duration?: string) => void;
  playChord: (notes: string[], duration?: string) => void;
  playMelody: (notes: string[], tempo?: number) => Promise<void>;
  playMelodyWithDurations: (notes: NoteWithDuration[], tempo?: number) => Promise<void>;
  stopAll: () => void;
  setVolume: (volume: number) => void;
}

export function useAudioEngine(): UseAudioEngineReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const sequenceRef = useRef<Tone.Part | null>(null);

  useEffect(() => {
    // Initialize the synth
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.8,
      },
    }).toDestination();

    synthRef.current.volume.value = -6;
    setIsLoaded(true);

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
    };
  }, []);

  const playNote = useCallback((note: string, duration: string = '8n') => {
    if (!synthRef.current) return;
    
    // Start audio context if needed
    if (Tone.getContext().state !== 'running') {
      Tone.start();
    }

    const normalizedNote = normalizeNote(note);
    synthRef.current.triggerAttackRelease(normalizedNote, duration);
  }, []);

  const playChord = useCallback((notes: string[], duration: string = '2n') => {
    if (!synthRef.current) return;

    if (Tone.getContext().state !== 'running') {
      Tone.start();
    }

    const normalizedNotes = notes.map(normalizeNote);
    synthRef.current.triggerAttackRelease(normalizedNotes, duration);
  }, []);

  // Legacy method for simple melodies (all same duration)
  const playMelody = useCallback(async (notes: string[], tempo: number = 120) => {
    if (!synthRef.current || notes.length === 0) return;

    // Stop any existing playback
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
    }

    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }

    setIsPlaying(true);
    Tone.getTransport().bpm.value = tempo;

    const normalizedNotes = notes.map(normalizeNote);
    
    return new Promise<void>((resolve) => {
      let index = 0;
      
      const events = normalizedNotes.map((note, i) => ({
        time: i * 0.25, // 4n spacing in seconds at tempo
        note,
      }));

      sequenceRef.current = new Tone.Part((time, event) => {
        if (event.note && synthRef.current) {
          synthRef.current.triggerAttackRelease(event.note, '8n', time);
        }
        index++;
        if (index >= normalizedNotes.length) {
          setTimeout(() => {
            setIsPlaying(false);
            resolve();
          }, 500);
        }
      }, events);

      sequenceRef.current.start(0);
      Tone.getTransport().start();
    });
  }, []);

  // New method for melodies with varying durations (syncopation, dotted notes, etc.)
  const playMelodyWithDurations = useCallback(async (notes: NoteWithDuration[], tempo: number = 120) => {
    if (!synthRef.current || notes.length === 0) return;

    // Stop any existing playback
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
    }
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;

    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }

    setIsPlaying(true);
    Tone.getTransport().bpm.value = tempo;

    // Calculate cumulative time positions for each note
    const secondsPerBeat = 60 / tempo;
    let currentTime = 0;
    
    const events = notes.map((noteData) => {
      const event = {
        time: currentTime,
        note: noteData.note,
        duration: noteData.duration,
      };
      // Add this note's duration to get next note's start time
      currentTime += noteData.durationValue * secondsPerBeat;
      return event;
    });

    const totalDuration = currentTime;

    return new Promise<void>((resolve) => {
      let playedCount = 0;

      sequenceRef.current = new Tone.Part((time, event) => {
        if (event.note !== 'rest' && synthRef.current) {
          synthRef.current.triggerAttackRelease(
            normalizeNote(event.note), 
            event.duration, 
            time
          );
        }
        playedCount++;
        if (playedCount >= notes.length) {
          // Wait for the last note to finish playing
          setTimeout(() => {
            setIsPlaying(false);
            Tone.getTransport().stop();
            resolve();
          }, (noteData => {
            const lastNote = notes[notes.length - 1];
            return lastNote.durationValue * secondsPerBeat * 1000 + 200;
          })());
        }
      }, events);

      sequenceRef.current.start(0);
      Tone.getTransport().start();
    });
  }, []);

  const stopAll = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      Tone.getTransport().stop();
      Tone.getTransport().position = 0;
    }
    if (synthRef.current) {
      synthRef.current.releaseAll();
    }
    setIsPlaying(false);
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (synthRef.current) {
      // Convert 0-100 to dB (-60 to 0)
      const db = volume === 0 ? -Infinity : -60 + (volume / 100) * 60;
      synthRef.current.volume.value = db;
    }
  }, []);

  return {
    isPlaying,
    isLoaded,
    playNote,
    playChord,
    playMelody,
    playMelodyWithDurations,
    stopAll,
    setVolume,
  };
}

// Normalize note format (e.g., "C" -> "C4", "D#" -> "D#4")
function normalizeNote(note: string): string {
  const match = note.match(/^([A-G]#?)(\d)?$/i);
  if (!match) return 'C4';
  const noteName = match[1].toUpperCase();
  const octave = match[2] || '4';
  return `${noteName}${octave}`;
}
