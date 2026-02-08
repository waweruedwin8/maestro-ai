import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Piano as PianoIcon } from 'lucide-react';
import { useAudioEngine } from '@/hooks/useAudioEngine';

interface InteractivePianoProps {
  highlightNotes?: string[];
  octaves?: number;
  startOctave?: number;
  onNotePlay?: (note: string) => void;
}

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEY_POSITIONS: Record<string, number> = {
  'C#': 0, 'D#': 1, 'F#': 3, 'G#': 4, 'A#': 5,
};

export function InteractivePiano({
  highlightNotes = [],
  octaves = 2,
  startOctave = 4,
  onNotePlay,
}: InteractivePianoProps) {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const { playNote } = useAudioEngine();

  const handleNoteDown = useCallback((note: string) => {
    setActiveNotes((prev) => new Set(prev).add(note));
    playNote(note, '4n');
    onNotePlay?.(note);
  }, [playNote, onNotePlay]);

  const handleNoteUp = useCallback((note: string) => {
    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  }, []);

  const isHighlighted = (note: string) => {
    const noteWithoutOctave = note.replace(/\d/, '');
    return highlightNotes.some((n) => {
      const nWithoutOctave = n.replace(/\d/, '');
      return nWithoutOctave === noteWithoutOctave;
    });
  };

  // Calculate key width for consistent sizing
  const keyWidth = 40; // pixels per white key
  const blackKeyWidth = 24;

  const renderOctave = (octave: number, octaveIndex: number) => {
    const octaveOffset = octaveIndex * WHITE_KEYS.length * keyWidth;

    return (
      <div key={octave} className="relative" style={{ width: WHITE_KEYS.length * keyWidth }}>
        {/* White keys */}
        <div className="flex">
          {WHITE_KEYS.map((key, keyIndex) => {
            const note = `${key}${octave}`;
            const isActive = activeNotes.has(note);
            const highlighted = isHighlighted(note);

            return (
              <motion.button
                key={note}
                onMouseDown={() => handleNoteDown(note)}
                onMouseUp={() => handleNoteUp(note)}
                onMouseLeave={() => handleNoteUp(note)}
                onTouchStart={() => handleNoteDown(note)}
                onTouchEnd={() => handleNoteUp(note)}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative border border-border/50 rounded-b-md
                  transition-all duration-75 select-none
                  ${isActive 
                    ? 'bg-primary/30 shadow-inner' 
                    : highlighted
                      ? 'bg-primary/20 shadow-md'
                      : 'bg-white hover:bg-gray-50 shadow-md'
                  }
                `}
                style={{ 
                  width: keyWidth,
                  height: 128,
                  zIndex: 1,
                }}
              >
                <span className={`
                  absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono
                  ${highlighted ? 'text-primary font-bold' : 'text-gray-400'}
                `}>
                  {key}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Black keys - positioned absolutely within each octave */}
        {Object.entries(BLACK_KEY_POSITIONS).map(([key, whiteKeyIndex]) => {
          const note = `${key}${octave}`;
          const isActive = activeNotes.has(note);
          const highlighted = isHighlighted(note);

          // Position black key between white keys
          // It's placed after the white key at whiteKeyIndex
          const leftPosition = (whiteKeyIndex + 1) * keyWidth - blackKeyWidth / 2;

          return (
            <motion.button
              key={note}
              onMouseDown={() => handleNoteDown(note)}
              onMouseUp={() => handleNoteUp(note)}
              onMouseLeave={() => handleNoteUp(note)}
              onTouchStart={() => handleNoteDown(note)}
              onTouchEnd={() => handleNoteUp(note)}
              whileTap={{ scale: 0.98 }}
              className={`
                absolute top-0 rounded-b-md
                transition-all duration-75 select-none
                ${isActive 
                  ? 'bg-primary shadow-inner' 
                  : highlighted
                    ? 'bg-primary/80 shadow-lg'
                    : 'bg-gray-900 hover:bg-gray-800 shadow-lg'
                }
              `}
              style={{
                left: leftPosition,
                width: blackKeyWidth,
                height: 80,
                zIndex: 2,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-musical-blue/20">
              <PianoIcon className="w-5 h-5 text-musical-blue" />
            </div>
            <CardTitle className="text-lg font-display">Interactive Piano</CardTitle>
            {highlightNotes.length > 0 && (
              <div className="ml-auto flex gap-1">
                {highlightNotes.map((note) => (
                  <span
                    key={note}
                    className="px-2 py-1 text-xs rounded-md bg-primary/20 text-primary font-mono"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto pb-4">
            <div className="flex justify-center" style={{ minWidth: octaves * WHITE_KEYS.length * keyWidth }}>
              {Array.from({ length: octaves }, (_, i) => startOctave + i).map(
                (octave, index) => renderOctave(octave, index)
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Click or tap keys to play • Highlighted notes are part of the chord
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
