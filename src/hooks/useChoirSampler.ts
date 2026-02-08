import { useCallback, useRef, useState, useEffect } from 'react';
import * as Tone from 'tone';
import { VoicePart } from '@/types/music';
import { ParsedNote } from '@/utils/abcParser';

interface VoiceState {
  muted: boolean;
  volume: number;
  solo: boolean;
}

interface AccompanimentState {
  muted: boolean;
  volume: number;
}

interface UseChoirSamplerReturn {
  isLoaded: boolean;
  isPlaying: boolean;
  voiceStates: Record<VoicePart, VoiceState>;
  accompanimentState: AccompanimentState;
  playVoice: (part: VoicePart, notes: ParsedNote[], tempo?: number) => Promise<void>;
  playVoiceSimple: (part: VoicePart, notes: string[], tempo?: number) => Promise<void>;
  playAllVoices: (parts: Partial<Record<VoicePart, ParsedNote[]>>, tempo?: number, withOrgan?: boolean) => Promise<void>;
  playOrganOnly: (notes: ParsedNote[], tempo?: number) => Promise<void>;
  stopAll: () => void;
  toggleMute: (part: VoicePart) => void;
  toggleSolo: (part: VoicePart) => void;
  setVoiceVolume: (part: VoicePart, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  toggleAccompanimentMute: () => void;
  setAccompanimentVolume: (volume: number) => void;
}

// Voice-specific envelope parameters for realistic choir sound
const VOICE_ENVELOPES: Record<VoicePart, { attack: number; decay: number; sustain: number; release: number }> = {
  soprano: { attack: 0.08, decay: 0.15, sustain: 0.7, release: 0.8 },
  alto: { attack: 0.07, decay: 0.18, sustain: 0.65, release: 0.7 },
  tenor: { attack: 0.06, decay: 0.15, sustain: 0.6, release: 0.6 },
  bass: { attack: 0.05, decay: 0.2, sustain: 0.55, release: 0.5 },
};

// Voice-specific oscillator types
const VOICE_OSCILLATOR_TYPES: Record<VoicePart, OscillatorType> = {
  soprano: 'sine',
  alto: 'sine',
  tenor: 'triangle',
  bass: 'triangle',
};

export function useChoirSampler(): UseChoirSamplerReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceStates, setVoiceStates] = useState<Record<VoicePart, VoiceState>>({
    soprano: { muted: false, volume: 80, solo: false },
    alto: { muted: false, volume: 80, solo: false },
    tenor: { muted: false, volume: 80, solo: false },
    bass: { muted: false, volume: 80, solo: false },
  });
  const [accompanimentState, setAccompanimentState] = useState<AccompanimentState>({
    muted: false,
    volume: 70,
  });

  const synthsRef = useRef<Record<VoicePart, Tone.PolySynth | null>>({
    soprano: null,
    alto: null,
    tenor: null,
    bass: null,
  });

  const organSynthRef = useRef<Tone.PolySynth | null>(null);

  const partsRef = useRef<Record<string, Tone.Part | null>>({
    soprano: null,
    alto: null,
    tenor: null,
    bass: null,
    organ: null,
  });

  const reverbRef = useRef<Tone.Reverb | null>(null);
  const chorusRef = useRef<Tone.Chorus | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Create reverb for cathedral-like ambience
    reverbRef.current = new Tone.Reverb({
      decay: 2.5,
      wet: 0.25,
    }).toDestination();

    // Create chorus for richness
    chorusRef.current = new Tone.Chorus({
      frequency: 2,
      delayTime: 3,
      depth: 0.4,
      wet: 0.15,
    }).connect(reverbRef.current);

    // Initialize synths for each voice part
    const voiceParts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

    voiceParts.forEach((part) => {
      const envelope = VOICE_ENVELOPES[part];
      const oscillatorType = VOICE_OSCILLATOR_TYPES[part];

      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: oscillatorType },
        envelope,
      });

      synth.volume.value = -8;
      synth.connect(chorusRef.current!);
      synthsRef.current[part] = synth;
    });

    // Initialize organ synth (FM synthesis for pipe organ character)
    organSynthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 3,
      oscillator: { type: 'sine' } as any,
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 1.0 },
      modulation: { type: 'square' } as any,
      modulationEnvelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.5 },
    });
    organSynthRef.current.volume.value = -12;
    organSynthRef.current.connect(reverbRef.current!);

    setIsLoaded(true);

    return () => {
      voiceParts.forEach((part) => {
        synthsRef.current[part]?.dispose();
      });
      Object.values(partsRef.current).forEach((part) => part?.dispose());
      organSynthRef.current?.dispose();
      reverbRef.current?.dispose();
      chorusRef.current?.dispose();
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, []);

  // Update synth volumes when voice states change
  useEffect(() => {
    const voiceParts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
    const hasSolo = voiceParts.some((p) => voiceStates[p].solo);

    voiceParts.forEach((part) => {
      const synth = synthsRef.current[part];
      if (!synth) return;

      const state = voiceStates[part];
      const shouldPlay = !state.muted && (!hasSolo || state.solo);
      const volumeDb = shouldPlay ? -40 + (state.volume / 100) * 35 : -Infinity;
      synth.volume.value = volumeDb;
    });
  }, [voiceStates]);

  // Update organ volume when accompaniment state changes
  useEffect(() => {
    if (!organSynthRef.current) return;
    const volumeDb = accompanimentState.muted
      ? -Infinity
      : -40 + (accompanimentState.volume / 100) * 35;
    organSynthRef.current.volume.value = volumeDb;
  }, [accompanimentState]);

  // ── Internal helpers ────────────────────────────────────────────────

  const clearPlaybackState = useCallback(() => {
    // Cancel any pending stop timeout
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    // Stop and dispose all parts
    Object.keys(partsRef.current).forEach((key) => {
      const part = partsRef.current[key];
      if (part) {
        part.stop();
        part.dispose();
        partsRef.current[key] = null;
      }
    });

    // Release all synths
    const voiceParts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
    voiceParts.forEach((part) => synthsRef.current[part]?.releaseAll());
    organSynthRef.current?.releaseAll();

    // Cancel all scheduled transport events and stop
    Tone.getTransport().cancel();
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
  }, []);

  const scheduleNotes = useCallback(
    (
      partKey: string,
      synth: Tone.PolySynth,
      notes: ParsedNote[],
      tempo: number
    ): number => {
      if (notes.length === 0) return 0;

      const secondsPerBeat = 60 / tempo;

      // Calculate total duration in seconds
      let maxEndTime = 0;
      notes.forEach((note) => {
        const endTime = (note.time + note.durationBeats) * secondsPerBeat;
        if (endTime > maxEndTime) maxEndTime = endTime;
      });

      // Create Tone.Part with note events
      partsRef.current[partKey] = new Tone.Part(
        (time, note: ParsedNote) => {
          synth.triggerAttackRelease(note.pitch, note.duration, time);
        },
        notes.map((n) => [n.time * secondsPerBeat, n])
      );

      partsRef.current[partKey]!.start(0);
      return maxEndTime;
    },
    []
  );

  // ── Play single voice ───────────────────────────────────────────────

  const playVoice = useCallback(
    async (part: VoicePart, notes: ParsedNote[], tempo: number = 100) => {
      const synth = synthsRef.current[part];
      if (!synth || notes.length === 0) return;

      if (Tone.getContext().state !== 'running') {
        await Tone.start();
      }

      clearPlaybackState();
      setIsPlaying(true);
      Tone.getTransport().bpm.value = tempo;

      const maxEndTime = scheduleNotes(part, synth, notes, tempo);
      Tone.getTransport().start();

      // Schedule auto-stop
      return new Promise<void>((resolve) => {
        stopTimeoutRef.current = window.setTimeout(() => {
          clearPlaybackState();
          setIsPlaying(false);
          resolve();
        }, (maxEndTime + 0.5) * 1000);
      });
    },
    [clearPlaybackState, scheduleNotes]
  );

  // ── Simple playback (backward compatibility) ────────────────────────

  const playVoiceSimple = useCallback(
    async (part: VoicePart, pitches: string[], tempo: number = 100) => {
      const notes: ParsedNote[] = pitches.map((pitch, index) => ({
        pitch,
        duration: '4n',
        durationBeats: 1,
        time: index,
      }));
      return playVoice(part, notes, tempo);
    },
    [playVoice]
  );

  // ── Play all voices ─────────────────────────────────────────────────

  const playAllVoices = useCallback(
    async (
      parts: Partial<Record<VoicePart, ParsedNote[]>>,
      tempo: number = 100,
      withOrgan: boolean = true
    ) => {
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
      }

      clearPlaybackState();
      setIsPlaying(true);
      Tone.getTransport().bpm.value = tempo;

      const voiceParts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
      let maxEndTime = 0;

      // Schedule each voice
      voiceParts.forEach((voicePart) => {
        const notes = parts[voicePart];
        const synth = synthsRef.current[voicePart];
        if (!notes || notes.length === 0 || !synth) return;

        const endTime = scheduleNotes(voicePart, synth, notes, tempo);
        if (endTime > maxEndTime) maxEndTime = endTime;
      });

      // Schedule organ (doubles bass line with organ timbre)
      if (withOrgan && organSynthRef.current && parts.bass && parts.bass.length > 0) {
        const organEndTime = scheduleNotes('organ', organSynthRef.current, parts.bass, tempo);
        if (organEndTime > maxEndTime) maxEndTime = organEndTime;
      }

      Tone.getTransport().start();

      // Schedule auto-stop
      stopTimeoutRef.current = window.setTimeout(() => {
        clearPlaybackState();
        setIsPlaying(false);
      }, (maxEndTime + 0.5) * 1000);
    },
    [clearPlaybackState, scheduleNotes]
  );

  // ── Play organ only ─────────────────────────────────────────────────

  const playOrganOnly = useCallback(
    async (notes: ParsedNote[], tempo: number = 100) => {
      if (!organSynthRef.current || notes.length === 0) return;

      if (Tone.getContext().state !== 'running') {
        await Tone.start();
      }

      clearPlaybackState();
      setIsPlaying(true);
      Tone.getTransport().bpm.value = tempo;

      // Temporarily ensure organ is audible
      organSynthRef.current.volume.value = -8;

      const maxEndTime = scheduleNotes('organ', organSynthRef.current, notes, tempo);
      Tone.getTransport().start();

      // Schedule auto-stop
      stopTimeoutRef.current = window.setTimeout(() => {
        clearPlaybackState();
        setIsPlaying(false);
        // Restore organ volume to state-driven level
        if (organSynthRef.current) {
          const volumeDb = accompanimentState.muted
            ? -Infinity
            : -40 + (accompanimentState.volume / 100) * 35;
          organSynthRef.current.volume.value = volumeDb;
        }
      }, (maxEndTime + 0.5) * 1000);
    },
    [clearPlaybackState, scheduleNotes, accompanimentState]
  );

  // ── Stop ────────────────────────────────────────────────────────────

  const stopAll = useCallback(() => {
    clearPlaybackState();
    setIsPlaying(false);
  }, [clearPlaybackState]);

  // ── Mixer Controls ──────────────────────────────────────────────────

  const toggleMute = useCallback((part: VoicePart) => {
    setVoiceStates((prev) => ({
      ...prev,
      [part]: { ...prev[part], muted: !prev[part].muted },
    }));
  }, []);

  const toggleSolo = useCallback((part: VoicePart) => {
    setVoiceStates((prev) => ({
      ...prev,
      [part]: { ...prev[part], solo: !prev[part].solo },
    }));
  }, []);

  const setVoiceVolume = useCallback((part: VoicePart, volume: number) => {
    setVoiceStates((prev) => ({
      ...prev,
      [part]: { ...prev[part], volume },
    }));
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    const db = volume === 0 ? -Infinity : -40 + (volume / 100) * 40;
    Tone.getDestination().volume.value = db;
  }, []);

  const toggleAccompanimentMute = useCallback(() => {
    setAccompanimentState((prev) => ({ ...prev, muted: !prev.muted }));
  }, []);

  const setAccompanimentVolume = useCallback((volume: number) => {
    setAccompanimentState((prev) => ({ ...prev, volume }));
  }, []);

  return {
    isLoaded,
    isPlaying,
    voiceStates,
    accompanimentState,
    playVoice,
    playVoiceSimple,
    playAllVoices,
    playOrganOnly,
    stopAll,
    toggleMute,
    toggleSolo,
    setVoiceVolume,
    setMasterVolume,
    toggleAccompanimentMute,
    setAccompanimentVolume,
  };
}
