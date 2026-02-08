// Score Utilities - Combine ABC parts into full scores and other helpers

import { Song, VoicePart } from '@/types/music';

/**
 * Combine individual SATB ABC notation parts into a single multi-voice ABC string
 * that abcjs can render as a full score with multiple staves.
 */
export function combinePartsToFullScore(song: Song): string {
  const voiceConfig: Array<{
    id: string;
    part: VoicePart;
    clef: string;
    label: string;
  }> = [
    { id: 'S', part: 'soprano', clef: 'treble', label: 'Soprano' },
    { id: 'A', part: 'alto', clef: 'treble', label: 'Alto' },
    { id: 'T', part: 'tenor', clef: 'treble-8', label: 'Tenor' },
    { id: 'B', part: 'bass', clef: 'bass', label: 'Bass' },
  ];

  // Determine which parts exist
  const activeParts = voiceConfig.filter((v) => song.parts[v.part]);

  if (activeParts.length === 0) return '';
  if (activeParts.length === 1) {
    // Single part - just return it as-is
    return song.parts[activeParts[0].part] || '';
  }

  // Build combined ABC header
  let combined = `X:1\n`;
  combined += `T:${song.title}\n`;
  if (song.composer) combined += `C:${song.composer}\n`;
  combined += `M:${song.timeSignature}\n`;

  // Determine base unit from first part
  const firstPart = song.parts[activeParts[0].part] || '';
  const lengthMatch = firstPart.match(/L:\s*1\/(\d+)/);
  const baseUnit = lengthMatch ? lengthMatch[1] : '8';
  combined += `L:1/${baseUnit}\n`;
  combined += `Q:1/4=${song.tempo}\n`;
  combined += `K:${song.key}\n`;

  // Staves layout: group S+A on treble, T+B on bass
  const staveIds = activeParts.map((v) => v.id);
  if (staveIds.length >= 4) {
    combined += `%%staves {${staveIds[0]} ${staveIds[1]}} {${staveIds[2]} ${staveIds[3]}}\n`;
  } else if (staveIds.length >= 2) {
    combined += `%%staves ${staveIds.map((id) => `[${id}]`).join(' ')}\n`;
  }

  // Add each voice
  for (const voice of activeParts) {
    const abc = song.parts[voice.part];
    if (!abc) continue;

    // Extract music body (lines after headers)
    const musicBody = abc
      .split('\n')
      .filter((line) => !line.match(/^[A-Za-z]:|^%%/))
      .join('\n')
      .trim();

    combined += `V:${voice.id} clef=${voice.clef} name="${voice.label}"\n`;
    combined += `${musicBody}\n`;
  }

  return combined;
}

/**
 * Extract just the music body from an ABC notation string (strip headers).
 */
export function extractMusicBody(abc: string): string {
  return abc
    .split('\n')
    .filter((line) => !line.match(/^[A-Za-z]:|^%%/))
    .join('\n')
    .trim();
}

/**
 * Get the total number of measures in an ABC string.
 */
export function countMeasures(abc: string): number {
  const musicBody = extractMusicBody(abc);
  // Count bar lines
  const bars = musicBody.match(/\|/g);
  return bars ? bars.length : 0;
}
