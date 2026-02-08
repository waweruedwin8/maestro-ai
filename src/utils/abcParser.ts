// ABC Notation Parser - Extract notes with accurate pitch and duration
// Based on ABC notation standard: https://abcnotation.com/wiki/abc:standard:v2.1
// Fixed duration mapping: properly maps ABC length fractions to Tone.js notation

import { VoicePart } from '@/types/music';

export interface ParsedNote {
  pitch: string;        // e.g., "D5", "F#4"
  duration: string;     // Tone.js duration: "8n", "4n", "2n", "1n", dotted: "4n.", "2n.", etc.
  durationBeats: number; // Duration in quarter-note beats (for scheduling)
  time: number;         // Start time in quarter-note beats from beginning
}

export interface ParsedVoicePart {
  notes: ParsedNote[];
  totalBeats: number;
}

// Voice ranges for realistic octave placement
const VOICE_RANGES: Record<VoicePart, { min: number; max: number; default: number }> = {
  soprano: { min: 4, max: 6, default: 5 },
  alto: { min: 3, max: 5, default: 4 },
  tenor: { min: 3, max: 5, default: 4 },
  bass: { min: 2, max: 4, default: 3 },
};

// ── Duration Engine ──────────────────────────────────────────────────
// Maps fraction-of-whole-note to Tone.js notation string and beat count.
//
// Musical note values (in quarter-note beats):
//   Breve (double whole)  = 8 beats
//   Dotted whole          = 6 beats
//   Semibreve (whole)     = 4 beats
//   Dotted half (minim)   = 3 beats
//   Minim (half)          = 2 beats
//   Dotted crotchet       = 1.5 beats
//   Crotchet (quarter)    = 1 beat
//   Dotted quaver         = 0.75 beats
//   Quaver (eighth)       = 0.5 beats
//   Dotted semiquaver     = 0.375 beats
//   Semiquaver (16th)     = 0.25 beats
//   Demisemiquaver (32nd) = 0.125 beats

interface DurationResult {
  toneJs: string;
  beats: number;
}

// Sorted descending by beat value for best-match lookup
const DURATION_TABLE: DurationResult[] = [
  { toneJs: '1n',   beats: 8 },     // breve (approximated as whole in Tone.js)
  { toneJs: '1n',   beats: 6 },     // dotted whole (Tone.js doesn't have "0n.")
  { toneJs: '1n',   beats: 4 },     // whole note / semibreve
  { toneJs: '2n.',  beats: 3 },     // dotted half / dotted minim
  { toneJs: '2n',   beats: 2 },     // half note / minim
  { toneJs: '4n.',  beats: 1.5 },   // dotted quarter / dotted crotchet
  { toneJs: '4n',   beats: 1 },     // quarter note / crotchet
  { toneJs: '8n.',  beats: 0.75 },  // dotted eighth / dotted quaver
  { toneJs: '8n',   beats: 0.5 },   // eighth note / quaver
  { toneJs: '16n.', beats: 0.375 }, // dotted sixteenth / dotted semiquaver
  { toneJs: '16n',  beats: 0.25 },  // sixteenth note / semiquaver
  { toneJs: '32n',  beats: 0.125 }, // thirty-second / demisemiquaver
];

function durationFromABCLength(lengthMultiplier: number, baseUnit: number): DurationResult {
  // baseUnit is the denominator of L: field (e.g., 8 for L:1/8)
  // lengthMultiplier is the effective multiplier (e.g., 4 for A4)
  // fractionOfWhole = how much of a whole note this represents
  const fractionOfWhole = lengthMultiplier / baseUnit;
  // Convert to quarter-note beats (1 whole = 4 beats)
  const beats = fractionOfWhole * 4;

  // Find closest match in duration table
  let bestMatch = DURATION_TABLE[DURATION_TABLE.length - 1];
  let minDiff = Infinity;

  for (const entry of DURATION_TABLE) {
    const diff = Math.abs(beats - entry.beats);
    if (diff < minDiff) {
      minDiff = diff;
      bestMatch = entry;
    }
  }

  // Return the Tone.js notation and the ACTUAL beat count (not the matched one)
  // so scheduling is precise
  return { toneJs: bestMatch.toneJs, beats };
}

// ── ABC Length Parsing ───────────────────────────────────────────────
// Handles: A (=1), A2 (=2), A/2 (=0.5), A/ (=0.5), A3/2 (=1.5), A// (=0.25)

function parseLengthMultiplier(lengthStr: string): number {
  if (!lengthStr || lengthStr.trim() === '') return 1;

  // Check for fraction notation: num/den, /den, //, num
  const hasSlash = lengthStr.includes('/');

  if (!hasSlash) {
    // Simple integer multiplier: A2, A4, A8, etc.
    const n = parseInt(lengthStr);
    return isNaN(n) ? 1 : n;
  }

  // Handle slash notation
  const slashIdx = lengthStr.indexOf('/');
  const numStr = lengthStr.slice(0, slashIdx);
  const denStr = lengthStr.slice(slashIdx + 1);

  const numerator = numStr ? parseInt(numStr) : 1;

  // Count consecutive slashes for shorthand: / = /2, // = /4
  let slashCount = 0;
  for (let i = slashIdx; i < lengthStr.length && lengthStr[i] === '/'; i++) {
    slashCount++;
  }

  let denominator: number;
  if (denStr && denStr.match(/^\d+$/)) {
    denominator = parseInt(denStr);
  } else {
    // Shorthand: / = /2, // = /4, /// = /8
    denominator = Math.pow(2, slashCount);
  }

  return isNaN(numerator) || isNaN(denominator) || denominator === 0
    ? 1
    : numerator / denominator;
}

// ── Note Parsing ─────────────────────────────────────────────────────

function parseABCNote(
  noteStr: string,
  keySignature: string,
  voicePart: VoicePart
): { pitch: string; lengthMultiplier: number } | null {
  // Match pattern: optional accidental, note letter, optional octave modifiers, optional length
  // Length can be: 2, /2, 3/2, /, //
  const match = noteStr.match(/^([_=^]?)([A-Ga-g])([,']*)([\d]*\/?\/?\d*)/);
  if (!match) return null;

  const [, accidental, letter, octaveModifiers = '', lengthStr] = match;

  // Determine base octave from letter case
  // Lowercase = octave 5, Uppercase = octave 4 in ABC standard
  let octave = letter === letter.toLowerCase() ? 5 : 4;

  // Apply octave modifiers: ' raises, , lowers
  for (const mod of octaveModifiers) {
    if (mod === "'") octave++;
    if (mod === ",") octave--;
  }

  // Get base note letter (uppercase)
  let noteName = letter.toUpperCase();

  // Apply accidentals
  if (accidental === '^') noteName += '#';
  else if (accidental === '_') noteName += 'b';
  // '=' means natural, no modification needed

  // Apply key signature accidentals if no explicit accidental
  if (!accidental && keySignature) {
    const sharpKeys: Record<string, string[]> = {
      'G': ['F'],
      'D': ['F', 'C'],
      'A': ['F', 'C', 'G'],
      'E': ['F', 'C', 'G', 'D'],
      'B': ['F', 'C', 'G', 'D', 'A'],
      'F#': ['F', 'C', 'G', 'D', 'A', 'E'],
    };
    const flatKeys: Record<string, string[]> = {
      'F': ['B'],
      'Bb': ['B', 'E'],
      'Eb': ['B', 'E', 'A'],
      'Ab': ['B', 'E', 'A', 'D'],
    };

    if (sharpKeys[keySignature]?.includes(noteName)) {
      noteName += '#';
    } else if (flatKeys[keySignature]?.includes(noteName)) {
      noteName += 'b';
    }
  }

  // Clamp octave to voice range
  const range = VOICE_RANGES[voicePart];
  octave = Math.max(range.min, Math.min(range.max, octave));

  // Parse length multiplier (handles fractions, dotted, etc.)
  const lengthMultiplier = parseLengthMultiplier(lengthStr);

  return {
    pitch: `${noteName}${octave}`,
    lengthMultiplier,
  };
}

// ── Main Parser ──────────────────────────────────────────────────────

export function parseABCNotation(abc: string, voicePart: VoicePart): ParsedVoicePart {
  const notes: ParsedNote[] = [];
  let currentTime = 0;

  // Extract header fields
  const keyMatch = abc.match(/K:\s*([A-G][#b]?)/i);
  const keySignature = keyMatch ? keyMatch[1].toUpperCase() : 'C';

  const lengthMatch = abc.match(/L:\s*1\/(\d+)/);
  const baseUnit = lengthMatch ? parseInt(lengthMatch[1]) : 8; // default L:1/8

  // Remove header lines (lines starting with single letter followed by :)
  const musicLines = abc
    .split('\n')
    .filter((line) => !line.match(/^[A-Za-z]:/))
    .join(' ');

  // Remove bar lines, repeat markers, and decorations
  const cleanedMusic = musicLines
    .replace(/\|:/g, '')
    .replace(/:\|/g, '')
    .replace(/\|\|/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\[|\]/g, '') // remove chord brackets
    .replace(/!.*?!/g, '') // remove decorations like !ff!
    .replace(/%.*$/gm, ''); // remove comments

  // Match individual notes and rests
  // Notes: optional accidental + letter + octave modifiers + length (including fractions)
  // Rests: z followed by optional length
  const notePattern = /([_=^]?[A-Ga-g][,']*[\d]*\/?\/?\d*)|z([\d]*\/?\/?\d*)/g;
  let match;

  while ((match = notePattern.exec(cleanedMusic)) !== null) {
    if (match[1]) {
      // It's a note
      const parsed = parseABCNote(match[1], keySignature, voicePart);
      if (parsed) {
        const dur = durationFromABCLength(parsed.lengthMultiplier, baseUnit);
        notes.push({
          pitch: parsed.pitch,
          duration: dur.toneJs,
          durationBeats: dur.beats,
          time: currentTime,
        });
        currentTime += dur.beats;
      }
    } else if (match[0].startsWith('z')) {
      // It's a rest - advance time but don't create a note
      const restLengthStr = match[2] || '1';
      const restMultiplier = parseLengthMultiplier(restLengthStr);
      const dur = durationFromABCLength(restMultiplier, baseUnit);
      currentTime += dur.beats;
    }
  }

  return {
    notes,
    totalBeats: currentTime,
  };
}

// Generate correctly pitched notes for each voice part from ABC
export function generatePartNotes(abc: string, voicePart: VoicePart): ParsedNote[] {
  return parseABCNotation(abc, voicePart).notes;
}

// Convert ParsedNote array to simple pitch array (for backward compatibility)
export function extractPitchesFromParsed(parsedNotes: ParsedNote[]): string[] {
  return parsedNotes.map((n) => n.pitch);
}
