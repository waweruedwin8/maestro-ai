/**
 * ABC Duration Parser
 * Extracts notes with their durations from ABC notation for accurate playback
 */

export interface NoteWithDuration {
  note: string;      // e.g., "C5", "D#4"
  duration: string;  // Tone.js duration format: "4n", "8n", "16n", "4n.", etc.
  durationValue: number; // Relative duration value (1 = quarter note)
}

// ABC note duration patterns
// Default L:1/8 means note letters = 1/8 note
// Duration modifiers: 2 = double, /2 = half, 3/2 = dotted, etc.

/**
 * Parse ABC notation and extract notes with their durations
 */
export function parseAbcWithDurations(abc: string): NoteWithDuration[] {
  const notes: NoteWithDuration[] = [];
  
  // Extract base note length from L: field
  const lengthMatch = abc.match(/L:\s*(\d+)\/(\d+)/);
  const baseNumerator = lengthMatch ? parseInt(lengthMatch[1]) : 1;
  const baseDenominator = lengthMatch ? parseInt(lengthMatch[2]) : 8;
  const baseLength = baseNumerator / baseDenominator; // e.g., 1/8 = 0.125
  
  // Get the music body (lines after headers)
  const lines = abc.split('\n').filter(line => !line.match(/^[A-Za-z]:|^%%|^\s*$/));
  const musicBody = lines.join(' ');
  
  // Match ABC notes with accidentals and duration modifiers
  // Pattern: optional accidental (^ _ =) + note letter + octave modifiers (', ) + duration
  const notePattern = /(\^{1,2}|_{1,2}|=)?([A-Ga-gz])([,']*)?(\d*\/?\d*)?/g;
  let match;
  
  while ((match = notePattern.exec(musicBody)) !== null) {
    const accidental = match[1] || '';
    const noteLetter = match[2];
    const octaveModifier = match[3] || '';
    const durationStr = match[4] || '';
    
    // Skip rests for note extraction but respect their timing
    if (noteLetter.toLowerCase() === 'z') {
      const restDuration = parseDuration(durationStr, baseLength);
      // Add a rest placeholder
      notes.push({
        note: 'rest',
        duration: restDuration.toneFormat,
        durationValue: restDuration.value,
      });
      continue;
    }
    
    // Determine octave based on case and modifiers
    // lowercase = octave 5, uppercase = octave 4
    let octave = noteLetter === noteLetter.toLowerCase() ? 5 : 4;
    
    // , lowers octave, ' raises octave
    for (const char of octaveModifier) {
      if (char === ',') octave--;
      if (char === "'") octave++;
    }
    
    // Handle accidentals
    let normalizedNote = noteLetter.toUpperCase();
    if (accidental.includes('^')) {
      normalizedNote += '#';
    } else if (accidental.includes('_')) {
      // Flat - convert to sharp equivalent for Tone.js
      normalizedNote = flatToSharp(normalizedNote);
    }
    // = means natural (no modification needed)
    
    // Parse duration
    const duration = parseDuration(durationStr, baseLength);
    
    notes.push({
      note: `${normalizedNote}${octave}`,
      duration: duration.toneFormat,
      durationValue: duration.value,
    });
  }
  
  return notes;
}

/**
 * Parse ABC duration string to Tone.js format
 */
function parseDuration(durationStr: string, baseLength: number): { toneFormat: string; value: number } {
  let multiplier = 1;
  
  if (durationStr) {
    if (durationStr.includes('/')) {
      // Handle fractions like /2, /4, 3/2
      const parts = durationStr.split('/');
      const numerator = parts[0] ? parseInt(parts[0]) : 1;
      const denominator = parts[1] ? parseInt(parts[1]) : 2;
      multiplier = numerator / denominator;
    } else if (durationStr.match(/^\d+$/)) {
      // Pure number like 2, 4 means multiply duration
      multiplier = parseInt(durationStr);
    }
  }
  
  // Check for broken rhythm markers (> and <)
  // > after note = 1.5x duration, < after = 0.5x duration
  // This is handled separately in the main pattern
  
  const actualDuration = baseLength * multiplier * 4; // Convert to quarter note = 1
  
  return {
    toneFormat: durationToToneFormat(actualDuration),
    value: actualDuration,
  };
}

/**
 * Convert numeric duration to Tone.js format
 */
function durationToToneFormat(duration: number): string {
  // Duration is relative to quarter note = 1
  // Tone.js: 1n = whole, 2n = half, 4n = quarter, 8n = eighth, 16n = sixteenth
  
  // Handle dotted notes (1.5x base duration)
  const isDotted = Math.abs(duration - Math.round(duration * 2) / 2) < 0.01 && 
                   duration !== Math.floor(duration);
  
  if (isDotted) {
    // Find base note value and add dot
    const baseDuration = duration / 1.5;
    if (Math.abs(baseDuration - 1) < 0.01) return '4n.';
    if (Math.abs(baseDuration - 0.5) < 0.01) return '8n.';
    if (Math.abs(baseDuration - 0.25) < 0.01) return '16n.';
    if (Math.abs(baseDuration - 2) < 0.01) return '2n.';
  }
  
  // Standard note values
  if (duration >= 4) return '1n';
  if (duration >= 2) return '2n';
  if (duration >= 1) return '4n';
  if (duration >= 0.5) return '8n';
  if (duration >= 0.25) return '16n';
  if (duration >= 0.125) return '32n';
  return '16n'; // Default to sixteenth for very short notes
}

/**
 * Convert flat note to sharp equivalent
 */
function flatToSharp(note: string): string {
  const flatToSharpMap: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'D': 'C#', 'E': 'D#', 'G': 'F#', 'A': 'G#', 'B': 'A#', // For processing with _
  };
  // If the note is flat, convert it
  if (note.endsWith('b')) {
    return flatToSharpMap[note] || note;
  }
  return note;
}

/**
 * Get total duration of a parsed ABC piece in seconds
 */
export function getTotalDuration(notes: NoteWithDuration[], tempo: number): number {
  const quarterNoteSeconds = 60 / tempo;
  return notes.reduce((total, note) => total + note.durationValue * quarterNoteSeconds, 0);
}
