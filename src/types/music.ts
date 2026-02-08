// Music types for Maestro AI

export type VoicePart = 'soprano' | 'alto' | 'tenor' | 'bass';
export type InstrumentType = 'choir' | 'organ' | 'strings' | 'orchestra';

export type NoteValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface Note {
  pitch: string; // e.g., "C4", "D#5"
  duration: number; // in beats
  octave: number;
}

export interface Chord {
  name: string;
  notes: string[];
  type: 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'major7' | 'minor7';
}

export interface VoicePartData {
  notes: string[];
  abc: string;
  muted: boolean;
  solo: boolean;
}

export interface Song {
  id: string;
  title: string;
  composer?: string;
  key: string;
  tempo: number;
  timeSignature: string;
  parts: {
    soprano?: string; // ABC notation
    alto?: string;
    tenor?: string;
    bass?: string;
  };
  // Extracted notes for playback
  partNotes?: {
    soprano?: string[];
    alto?: string[];
    tenor?: string[];
    bass?: string[];
  };
}

export interface MusicTheoryConcept {
  id: string;
  name: string;
  description: string;
  chordExample?: Chord;
  scaleNotes?: string[];
  relatedConcepts?: string[];
}

// Tambo component props
export interface PanicPracticeModeProps {
  songTitle: string;
  voicePart: VoicePart;
  tempo?: number;
  abcNotation?: string;
}

export interface ComposerModeProps {
  melody?: string; // Space-separated notes like "C E G C"
  abc_notation?: string; // Full ABC notation string for complex compositions
  timeSignature?: string;
  key?: string;
  tempo?: number;
}

export interface TheoryTeacherModeProps {
  concept: string;
  chord?: Chord;
  highlightNotes?: string[];
  explanation?: string;
}

// Chat message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  component?: {
    type: 'panic-practice' | 'composer' | 'theory-teacher';
    props: PanicPracticeModeProps | ComposerModeProps | TheoryTeacherModeProps;
  };
  timestamp: Date;
}

// Song library - sample pieces for demonstration
export const SONG_LIBRARY: Song[] = [
  {
    id: 'sample-1',
    title: 'Sample 1 - Hymn in D',
    composer: 'Sample',
    key: 'D',
    tempo: 100,
    timeSignature: '4/4',
    parts: {
      soprano: `X:1
T:Sample 1 - Soprano
K:D
M:4/4
L:1/8
Q:1/4=100
|: D4 D4 | D2 D2 F2 A2 | A4 G4 | F4 z4 |
D4 D4 | D2 D2 F2 A2 | B4 A4 | A4 z4 |
A4 A4 | A2 B2 c2 d2 | d4 c4 | B4 z4 |
d4 d4 | d2 c2 B2 A2 | A4 G2 F2 | D8 :|`,
      alto: `X:1
T:Sample 1 - Alto
K:D
M:4/4
L:1/8
Q:1/4=100
|: A,4 A,4 | A,2 A,2 D2 F2 | F4 E4 | D4 z4 |
A,4 A,4 | A,2 A,2 D2 F2 | G4 F4 | F4 z4 |
F4 F4 | F2 G2 A2 A2 | A4 A4 | G4 z4 |
A4 A4 | A2 A2 G2 F2 | F4 E2 D2 | A,8 :|`,
      tenor: `X:1
T:Sample 1 - Tenor
K:D
M:4/4
L:1/8
Q:1/4=100
|: F,4 F,4 | F,2 F,2 A,2 D2 | D4 C2 B,2 | A,4 z4 |
F,4 F,4 | F,2 F,2 A,2 D2 | D4 D4 | D4 z4 |
D4 D4 | D2 D2 E2 F2 | F4 E4 | D4 z4 |
F4 F4 | F2 E2 D2 D2 | D4 C2 A,2 | F,8 :|`,
      bass: `X:1
T:Sample 1 - Bass
K:D
M:4/4
L:1/8
Q:1/4=100
|: D,4 D,4 | D,2 D,2 D,2 D,2 | A,,4 A,,4 | D,4 z4 |
D,4 D,4 | D,2 D,2 D,2 D,2 | G,4 D,4 | D,4 z4 |
D,4 D,4 | D,2 G,2 A,2 D2 | D4 A,4 | G,4 z4 |
D4 D4 | D2 A,2 B,2 D2 | D4 A,2 D,2 | D,8 :|`,
    },
    partNotes: {
      soprano: ['D5', 'D5', 'D5', 'D5', 'D5', 'D5', 'F5', 'A5', 'A5', 'G5', 'F5', 'D5', 'D5', 'D5', 'D5', 'F5', 'A5', 'B5', 'A5', 'A5'],
      alto: ['A4', 'A4', 'A4', 'A4', 'A4', 'D5', 'F5', 'F5', 'E5', 'D5', 'A4', 'A4', 'A4', 'D5', 'F5', 'G5', 'F5', 'F5'],
      tenor: ['F4', 'F4', 'F4', 'F4', 'A4', 'D5', 'D5', 'C5', 'B4', 'A4', 'F4', 'F4', 'A4', 'D5', 'D5', 'D5', 'D5'],
      bass: ['D3', 'D3', 'D3', 'D3', 'D3', 'D3', 'A2', 'A2', 'D3', 'D3', 'D3', 'D3', 'D3', 'G3', 'D3', 'D3'],
    },
  },
  {
    id: 'sample-2',
    title: 'Sample 2 - Chorale in G',
    composer: 'Sample',
    key: 'G',
    tempo: 88,
    timeSignature: '4/4',
    parts: {
      soprano: `X:1
T:Sample 2 - Soprano
K:G
M:4/4
L:1/8
Q:1/4=88
|: G4 A4 | B4 c4 | d4 B4 | A4 G4 |
G4 A4 | B4 d4 | e4 d4 | d4 z4 |
d4 e4 | f4 e4 | d4 c4 | B4 A4 |
G4 A4 | B4 c4 | B4 A4 | G8 :|`,
      alto: `X:1
T:Sample 2 - Alto
K:G
M:4/4
L:1/8
Q:1/4=88
|: D4 F4 | G4 A4 | B4 G4 | F4 E4 |
D4 F4 | G4 B4 | c4 B4 | B4 z4 |
B4 c4 | d4 c4 | B4 A4 | G4 F4 |
D4 F4 | G4 A4 | G4 F4 | D8 :|`,
      tenor: `X:1
T:Sample 2 - Tenor
K:G
M:4/4
L:1/8
Q:1/4=88
|: B,4 D4 | D4 E4 | G4 D4 | D4 B,4 |
B,4 D4 | D4 G4 | G4 G4 | G4 z4 |
G4 G4 | A4 G4 | G4 F4 | D4 D4 |
B,4 D4 | D4 E4 | D4 D4 | B,8 :|`,
      bass: `X:1
T:Sample 2 - Bass
K:G
M:4/4
L:1/8
Q:1/4=88
|: G,4 D,4 | G,4 C,4 | G,4 G,4 | D,4 G,4 |
G,4 D,4 | G,4 G,4 | C4 G,4 | G,4 z4 |
G,4 C4 | D4 C4 | G,4 D,4 | G,4 D,4 |
G,4 D,4 | G,4 C,4 | G,4 D,4 | G,8 :|`,
    },
    partNotes: {
      soprano: ['G5', 'A5', 'B5', 'C6', 'D6', 'B5', 'A5', 'G5', 'G5', 'A5', 'B5', 'D6', 'E6', 'D6', 'D6'],
      alto: ['D5', 'F5', 'G5', 'A5', 'B5', 'G5', 'F5', 'E5', 'D5', 'F5', 'G5', 'B5', 'C6', 'B5', 'B5'],
      tenor: ['B4', 'D5', 'D5', 'E5', 'G5', 'D5', 'D5', 'B4', 'B4', 'D5', 'D5', 'G5', 'G5', 'G5', 'G5'],
      bass: ['G3', 'D3', 'G3', 'C3', 'G3', 'G3', 'D3', 'G3', 'G3', 'D3', 'G3', 'G3', 'C4', 'G3', 'G3'],
    },
  },
  {
    id: 'sample-3',
    title: 'Sample 3 - Anthem in A',
    composer: 'Sample',
    key: 'A',
    tempo: 96,
    timeSignature: '3/4',
    parts: {
      soprano: `X:1
T:Sample 3 - Soprano
K:A
M:3/4
L:1/8
Q:1/4=96
|: A4 B2 | c4 B2 | A4 G2 | F4 E2 |
A4 B2 | c4 d2 | e4 d2 | c4 z2 |
c4 d2 | e4 f2 | e4 d2 | c4 B2 |
A4 B2 | c4 B2 | A4 G2 | A6 :|`,
      alto: `X:1
T:Sample 3 - Alto
K:A
M:3/4
L:1/8
Q:1/4=96
|: E4 F2 | A4 G2 | F4 E2 | D4 C2 |
E4 F2 | A4 A2 | c4 B2 | A4 z2 |
A4 B2 | c4 c2 | c4 B2 | A4 G2 |
E4 F2 | A4 G2 | F4 E2 | E6 :|`,
      tenor: `X:1
T:Sample 3 - Tenor
K:A
M:3/4
L:1/8
Q:1/4=96
|: C4 D2 | E4 E2 | C4 C2 | A,4 A,2 |
C4 D2 | E4 F2 | A4 G2 | E4 z2 |
E4 G2 | A4 A2 | A4 G2 | E4 E2 |
C4 D2 | E4 E2 | C4 C2 | C6 :|`,
      bass: `X:1
T:Sample 3 - Bass
K:A
M:3/4
L:1/8
Q:1/4=96
|: A,4 A,2 | A,4 E,2 | A,4 A,2 | D,4 A,,2 |
A,4 A,2 | A,4 D,2 | A,4 E,2 | A,4 z2 |
A,4 G,2 | A,4 F,2 | A,4 E,2 | A,4 E,2 |
A,4 A,2 | A,4 E,2 | A,4 E,2 | A,6 :|`,
    },
    partNotes: {
      soprano: ['A5', 'B5', 'C6', 'B5', 'A5', 'G5', 'F5', 'E5', 'A5', 'B5', 'C6', 'D6', 'E6', 'D6', 'C6'],
      alto: ['E5', 'F5', 'A5', 'G5', 'F5', 'E5', 'D5', 'C5', 'E5', 'F5', 'A5', 'A5', 'C6', 'B5', 'A5'],
      tenor: ['C5', 'D5', 'E5', 'E5', 'C5', 'C5', 'A4', 'A4', 'C5', 'D5', 'E5', 'F5', 'A5', 'G5', 'E5'],
      bass: ['A3', 'A3', 'A3', 'E3', 'A3', 'A3', 'D3', 'A2', 'A3', 'A3', 'A3', 'D3', 'A3', 'E3', 'A3'],
    },
  },
  {
    id: 'amazing-grace',
    title: 'Amazing Grace',
    composer: 'John Newton',
    key: 'G',
    tempo: 80,
    timeSignature: '3/4',
    parts: {
      soprano: `X:1
T:Amazing Grace - Soprano
K:G
M:3/4
L:1/4
Q:1/4=80
|: D | G2 B | A2 G | E2 D | G2 B | A2 d | B3 |
d2 B | G2 E | D2 D | G2 B | A2 G | E2 D | G2 :|`,
      alto: `X:1
T:Amazing Grace - Alto
K:G
M:3/4
L:1/4
Q:1/4=80
|: B, | D2 G | F2 E | C2 B, | D2 G | F2 A | G3 |
B2 G | E2 C | B,2 B, | D2 G | F2 E | C2 B, | D2 :|`,
      tenor: `X:1
T:Amazing Grace - Tenor
K:G
M:3/4
L:1/4
Q:1/4=80
|: G, | B,2 D | D2 B, | G,2 G, | B,2 D | D2 F | D3 |
G2 D | B,2 G, | G,2 G, | B,2 D | D2 B, | G,2 G, | B,2 :|`,
      bass: `X:1
T:Amazing Grace - Bass
K:G
M:3/4
L:1/4
Q:1/4=80
|: G,, | G,,2 G, | D,2 E, | C,2 G,, | G,,2 G, | D,2 D, | G,3 |
G,2 G, | E,2 C, | G,,2 G,, | G,,2 G, | D,2 E, | C,2 G,, | G,,2 :|`,
    },
    partNotes: {
      soprano: ['D4', 'G4', 'B4', 'A4', 'G4', 'E4', 'D4', 'G4', 'B4', 'A4', 'D5', 'B4', 'D5', 'B4', 'G4', 'E4', 'D4', 'D4', 'G4', 'B4', 'A4', 'G4', 'E4', 'D4', 'G4'],
      alto: ['B3', 'D4', 'G4', 'F4', 'E4', 'C4', 'B3', 'D4', 'G4', 'F4', 'A4', 'G4', 'B4', 'G4', 'E4', 'C4', 'B3', 'B3', 'D4', 'G4', 'F4', 'E4', 'C4', 'B3', 'D4'],
      tenor: ['G3', 'B3', 'D4', 'D4', 'B3', 'G3', 'G3', 'B3', 'D4', 'D4', 'F4', 'D4', 'G4', 'D4', 'B3', 'G3', 'G3', 'G3', 'B3', 'D4', 'D4', 'B3', 'G3', 'G3', 'B3'],
      bass: ['G2', 'G2', 'G3', 'D3', 'E3', 'C3', 'G2', 'G2', 'G3', 'D3', 'D3', 'G3', 'G3', 'G3', 'E3', 'C3', 'G2', 'G2', 'G2', 'G3', 'D3', 'E3', 'C3', 'G2', 'G2'],
    },
  },
];

// Theory concepts
export const THEORY_CONCEPTS: MusicTheoryConcept[] = [
  {
    id: 'minor-chord',
    name: 'Minor Chord',
    description: 'A minor chord sounds "sad" because of the flattened third. The interval between the root and third is a minor third (3 semitones) instead of a major third (4 semitones).',
    chordExample: {
      name: 'A minor',
      notes: ['A', 'C', 'E'],
      type: 'minor',
    },
    relatedConcepts: ['major-chord', 'intervals', 'chord-progressions'],
  },
  {
    id: 'major-chord',
    name: 'Major Chord',
    description: 'A major chord sounds "happy" or "bright" because of the major third interval. The root, major third, and perfect fifth create a stable, consonant sound.',
    chordExample: {
      name: 'C major',
      notes: ['C', 'E', 'G'],
      type: 'major',
    },
    relatedConcepts: ['minor-chord', 'intervals', 'triads'],
  },
  {
    id: 'dominant7',
    name: 'Dominant 7th Chord',
    description: 'The dominant 7th chord creates tension that wants to resolve. It\'s built on the 5th scale degree and adds a minor 7th to a major triad.',
    chordExample: {
      name: 'G7',
      notes: ['G', 'B', 'D', 'F'],
      type: 'dominant7',
    },
    relatedConcepts: ['chord-progressions', 'resolution', 'voice-leading'],
  },
];

// Note to frequency mapping
export const NOTE_FREQUENCIES: Record<string, number> = {
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91,
};

// Helper to parse note string to pitch
export function parseNote(note: string): { note: string; octave: number } | null {
  const match = note.match(/^([A-G]#?)(\d)?$/i);
  if (!match) return null;
  return {
    note: match[1].toUpperCase(),
    octave: match[2] ? parseInt(match[2]) : 4,
  };
}

// Convert melody string to notes array
export function parseMelody(melody: string): string[] {
  return melody.split(/\s+/).filter(n => parseNote(n) !== null);
}

// Extract notes from ABC notation
export function extractNotesFromABC(abc: string): string[] {
  const notes: string[] = [];
  // Match ABC notes like C, c, D', d,, etc.
  const notePattern = /([A-Ga-g])([,']*)?(\d*)/g;
  let match;
  
  while ((match = notePattern.exec(abc)) !== null) {
    const noteLetter = match[1];
    const octaveModifier = match[2] || '';
    
    // Determine octave based on case and modifiers
    let octave = noteLetter === noteLetter.toLowerCase() ? 5 : 4;
    
    // , lowers octave, ' raises octave
    for (const char of octaveModifier) {
      if (char === ',') octave--;
      if (char === "'") octave++;
    }
    
    const normalizedNote = noteLetter.toUpperCase();
    notes.push(`${normalizedNote}${octave}`);
  }
  
  return notes;
}
