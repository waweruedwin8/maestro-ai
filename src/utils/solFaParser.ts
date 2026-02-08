// Tonic Sol-fa to Tone.js Mapping Engine
// Converts Sol-fa notation (d r m f s l t) to playable frequencies and durations
//
// System: Equal Temperament
// Rhythm base: pulse = 1 crotchet (quarter note)
//
// Sol-fa pitch map (chromatic):
//   d=Do, de=De, r=Ray, re=Re(Ma), m=Me, f=Fah, fe=Fe,
//   s=Soh, se=Se(La♭), l=Lah, ta=Ta, t=Te
//
// Duration notation:
//   pulse (space-separated) = 1 beat (4n)
//   -  = extend by 1 pulse
//   .  = half pulse (8n)
//   ,  = quarter pulse (16n)
//   '  = triplet (8t)
//
// Octave modifiers:
//   d'  = one octave up (superscript)
//   d,  = one octave down (subscript)

import { ParsedNote } from './abcParser';

// ── Pitch Map ────────────────────────────────────────────────────────

export interface SolFaPitch {
  ratio: number;
  stepsFromDo: number;
  name: string;
}

export const SOLFA_PITCH_MAP: Record<string, SolFaPitch> = {
  d:  { ratio: 1.0,   stepsFromDo: 0,  name: 'Do' },
  de: { ratio: 1.059, stepsFromDo: 1,  name: 'De' },
  r:  { ratio: 1.122, stepsFromDo: 2,  name: 'Ray' },
  re: { ratio: 1.189, stepsFromDo: 3,  name: 'Re' },
  ma: { ratio: 1.189, stepsFromDo: 3,  name: 'Ma' },
  m:  { ratio: 1.259, stepsFromDo: 4,  name: 'Me' },
  f:  { ratio: 1.334, stepsFromDo: 5,  name: 'Fah' },
  fe: { ratio: 1.414, stepsFromDo: 6,  name: 'Fe' },
  s:  { ratio: 1.498, stepsFromDo: 7,  name: 'Soh' },
  se: { ratio: 1.587, stepsFromDo: 8,  name: 'Se' },
  la: { ratio: 1.587, stepsFromDo: 8,  name: 'La' },
  l:  { ratio: 1.681, stepsFromDo: 9,  name: 'Lah' },
  ta: { ratio: 1.781, stepsFromDo: 10, name: 'Ta' },
  t:  { ratio: 1.887, stepsFromDo: 11, name: 'Te' },
};

// ── Duration Map ─────────────────────────────────────────────────────

export interface SolFaDuration {
  code: string;
  beats: number;
  description: string;
}

export const SOLFA_DURATION_MAP: Record<string, SolFaDuration> = {
  pulse: { code: '4n',  beats: 1,    description: '1 Beat (Crotchet)' },
  '-':   { code: '4n',  beats: 1,    description: 'Extend by 1 pulse' },
  '.':   { code: '8n',  beats: 0.5,  description: 'Half pulse (Quaver)' },
  ',':   { code: '16n', beats: 0.25, description: 'Quarter pulse (Semiquaver)' },
  "'":   { code: '8t',  beats: 1/3,  description: 'Triplet (one third pulse)' },
};

// ── Key Frequencies ──────────────────────────────────────────────────
// Base frequencies for "Do" in each key (octave 4 by default)

const KEY_BASE_FREQUENCIES: Record<string, number> = {
  'C':  261.63,
  'C#': 277.18, 'Db': 277.18,
  'D':  293.66,
  'D#': 311.13, 'Eb': 311.13,
  'E':  329.63,
  'F':  349.23,
  'F#': 369.99, 'Gb': 369.99,
  'G':  196.00, // G3 as standard choir key
  'G#': 207.65, 'Ab': 207.65,
  'A':  220.00,
  'A#': 233.08, 'Bb': 233.08,
  'B':  246.94,
};

// ── Note Names (for converting frequency back to note name) ────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ── Core Functions ───────────────────────────────────────────────────

/**
 * Calculate frequency from Sol-fa syllable relative to a root key.
 * Formula: Frequency = BaseFrequency × 2^(steps_from_do / 12)
 */
export function solFaToFrequency(
  syllable: string,
  rootKey: string = 'C',
  octaveShift: number = 0
): number {
  const pitch = SOLFA_PITCH_MAP[syllable.toLowerCase()];
  if (!pitch) return 0;

  const baseFreq = KEY_BASE_FREQUENCIES[rootKey] || 261.63;
  const frequency = baseFreq * Math.pow(2, pitch.stepsFromDo / 12);

  // Apply octave shift
  return frequency * Math.pow(2, octaveShift);
}

/**
 * Convert a frequency to the nearest Tone.js note name (e.g., "C4", "G#5")
 */
export function frequencyToNoteName(freq: number): string {
  if (freq <= 0) return 'C4';

  // Calculate MIDI note number
  const midiNote = 12 * Math.log2(freq / 440) + 69;
  const roundedMidi = Math.round(midiNote);

  const noteName = NOTE_NAMES[roundedMidi % 12];
  const octave = Math.floor(roundedMidi / 12) - 1;

  return `${noteName}${octave}`;
}

/**
 * Convert a Sol-fa syllable to a Tone.js note name.
 */
export function solFaToNoteName(
  syllable: string,
  rootKey: string = 'C',
  octaveShift: number = 0
): string {
  const freq = solFaToFrequency(syllable, rootKey, octaveShift);
  return frequencyToNoteName(freq);
}

// ── Sol-fa String Parser ─────────────────────────────────────────────
// Parses a Sol-fa notation string into an array of ParsedNotes.
//
// Format: "d : - | r . m , f | s : - : - |"
//   - Syllables separated by spaces
//   - `:` separates beat groups
//   - `|` is a bar line (ignored for parsing)
//   - `-` extends the previous note
//   - `.` before a syllable = half-beat subdivision
//   - `,` before a syllable = quarter-beat subdivision
//   - `'` after a syllable = octave up, `,` after = octave down (context-dependent)

export interface SolFaParseOptions {
  rootKey?: string;
  tempo?: number;
  defaultOctave?: number;
}

/**
 * Parse a Tonic Sol-fa string into playable ParsedNote array.
 *
 * Example inputs:
 *   "d r m f s l t d'"           → scale ascending
 *   "d : - | r . m , f | s"     → with extensions and subdivisions
 *   "d d d : - | m m m : -"     → repeated notes with holds
 */
export function parseSolFaString(
  solfa: string,
  options: SolFaParseOptions = {}
): ParsedNote[] {
  const { rootKey = 'C', defaultOctave = 0 } = options;
  const notes: ParsedNote[] = [];
  let currentTime = 0;

  // Clean input: remove bar lines, normalize whitespace
  const cleaned = solfa
    .replace(/\|/g, '')
    .replace(/:/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return notes;

  const tokens = cleaned.split(' ').filter(Boolean);
  let currentSubdivision = 1; // 1 = full beat, 0.5 = half, 0.25 = quarter

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];

    // Check for subdivision markers
    if (token === '.') {
      currentSubdivision = 0.5;
      continue;
    }
    if (token === ',') {
      currentSubdivision = 0.25;
      continue;
    }
    if (token === "'") {
      currentSubdivision = 1 / 3; // triplet
      continue;
    }

    // Handle dash (extend previous note)
    if (token === '-') {
      if (notes.length > 0) {
        const lastNote = notes[notes.length - 1];
        const extendBeats = currentSubdivision;
        lastNote.durationBeats += extendBeats;
        // Update Tone.js duration string
        lastNote.duration = beatsToToneJs(lastNote.durationBeats);
        currentTime += extendBeats;
      }
      currentSubdivision = 1; // reset after use
      continue;
    }

    // Parse octave modifiers from token
    let octaveShift = defaultOctave;
    let syllable = token;

    // Count trailing ' and , for octave shifts
    while (syllable.endsWith("'")) {
      octaveShift++;
      syllable = syllable.slice(0, -1);
    }
    while (syllable.endsWith(',')) {
      octaveShift--;
      syllable = syllable.slice(0, -1);
    }

    // Look up the syllable
    const lowerSyllable = syllable.toLowerCase();
    if (!SOLFA_PITCH_MAP[lowerSyllable]) {
      // Skip unknown tokens
      currentSubdivision = 1;
      continue;
    }

    const noteName = solFaToNoteName(lowerSyllable, rootKey, octaveShift);
    const beats = currentSubdivision;

    notes.push({
      pitch: noteName,
      duration: beatsToToneJs(beats),
      durationBeats: beats,
      time: currentTime,
    });

    currentTime += beats;
    currentSubdivision = 1; // reset subdivision after each note
  }

  return notes;
}

/**
 * Convert a beat count to the nearest Tone.js duration string.
 */
function beatsToToneJs(beats: number): string {
  const map: [number, string][] = [
    [8, '1n'],     // breve
    [6, '1n'],     // dotted whole
    [4, '1n'],     // whole
    [3, '2n.'],    // dotted half
    [2, '2n'],     // half
    [1.5, '4n.'],  // dotted quarter
    [1, '4n'],     // quarter
    [0.75, '8n.'], // dotted eighth
    [0.5, '8n'],   // eighth
    [1/3, '8t'],   // triplet
    [0.375, '16n.'], // dotted sixteenth
    [0.25, '16n'],   // sixteenth
    [0.125, '32n'],  // thirty-second
  ];

  let best = '4n';
  let minDiff = Infinity;
  for (const [b, notation] of map) {
    const diff = Math.abs(beats - b);
    if (diff < minDiff) {
      minDiff = diff;
      best = notation;
    }
  }
  return best;
}

/**
 * Get all available Sol-fa syllables with their properties.
 */
export function getSolFaSyllables(): Array<{ syllable: string; name: string; steps: number }> {
  return Object.entries(SOLFA_PITCH_MAP).map(([syllable, data]) => ({
    syllable,
    name: data.name,
    steps: data.stepsFromDo,
  }));
}
