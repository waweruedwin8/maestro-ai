import { useEffect, useRef, useState, useCallback } from 'react';
import abcjs from 'abcjs';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music2, Play, Square, Download, Wand2, ArrowUpDown } from 'lucide-react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Metronome } from './Metronome';
import { parseAbcWithDurations, NoteWithDuration } from '@/utils/abcDurationParser';

interface LiveStaffEditorProps {
  initialMelody?: string;
  initialAbcNotation?: string; // Full ABC notation from AI
  keySignature?: string;
  tempo?: number;
  timeSignature?: string;
  onMelodyChange?: (melody: string) => void;
}

// Semitone intervals from C
const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

const SEMITONE_TO_NOTE: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function LiveStaffEditor({
  initialMelody = 'C D E F G A B c',
  initialAbcNotation,
  keySignature = 'C',
  tempo = 120,
  timeSignature = '4/4',
  onMelodyChange,
}: LiveStaffEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [melody, setMelody] = useState(initialMelody);
  const [abcNotation, setAbcNotation] = useState(initialAbcNotation || '');
  const [useFullAbc, setUseFullAbc] = useState(!!initialAbcNotation);
  const [currentKey, setCurrentKey] = useState(keySignature);
  const [currentTempo, setCurrentTempo] = useState(tempo);
  const [currentTimeSignature, setCurrentTimeSignature] = useState(timeSignature);
  const { playMelody, playMelodyWithDurations, isPlaying, stopAll } = useAudioEngine();
  
  // Track the original key for transposition calculations
  const [originalMelody, setOriginalMelody] = useState(initialMelody);
  const [originalKey, setOriginalKey] = useState(keySignature);

  // Parse a note string to get note name and octave
  const parseNoteString = useCallback((token: string): { note: string; accidental: string; octave: number } | null => {
    const match = token.match(/^([A-G])(#|b)?(\d)?$/i);
    if (!match) return null;
    return {
      note: match[1].toUpperCase(),
      accidental: match[2] || '',
      octave: parseInt(match[3] || '4'),
    };
  }, []);

  // Transpose a single note by semitones
  const transposeNote = useCallback((noteStr: string, semitones: number): string => {
    const parsed = parseNoteString(noteStr);
    if (!parsed) return noteStr;
    
    const noteName = parsed.note + parsed.accidental;
    const currentSemitone = NOTE_SEMITONES[noteName];
    if (currentSemitone === undefined) return noteStr;
    
    // Calculate new semitone position
    let newSemitone = (currentSemitone + semitones) % 12;
    if (newSemitone < 0) newSemitone += 12;
    
    // Calculate octave change
    const octaveShift = Math.floor((currentSemitone + semitones) / 12);
    const newOctave = parsed.octave + octaveShift;
    
    const newNote = SEMITONE_TO_NOTE[newSemitone];
    return `${newNote}${newOctave}`;
  }, [parseNoteString]);

  // Transpose the entire melody based on key change
  const transposeMelody = useCallback((melodyStr: string, fromKey: string, toKey: string): string => {
    const fromSemitone = NOTE_SEMITONES[fromKey] || 0;
    const toSemitone = NOTE_SEMITONES[toKey] || 0;
    const semitoneShift = toSemitone - fromSemitone;
    
    if (semitoneShift === 0) return melodyStr;
    
    const tokens = melodyStr.split(/\s+/);
    const transposedTokens = tokens.map(token => {
      const parsed = parseNoteString(token);
      if (parsed) {
        return transposeNote(token, semitoneShift);
      }
      return token;
    });
    
    return transposedTokens.join(' ');
  }, [parseNoteString, transposeNote]);

  // Generate ABC notation from melody string
  const generateABC = useCallback((melodyString: string, key: string) => {
    const rawInput = melodyString.trim();
    if (!rawInput) return '';

    // Check if it's already valid ABC-ish notation (has note letters)
    const hasNotes = /[A-Ga-g]/.test(rawInput);
    if (!hasNotes) return '';

    // Try to parse as note names first (e.g., "C E G C" or "C4 E4 G4")
    const tokens = rawInput.split(/\s+/);
    const abcTokens: string[] = [];

    for (const token of tokens) {
      // Match note pattern: optional accidental, letter, optional octave number
      const match = token.match(/^([A-G])(#|b)?(\d)?$/i);
      if (match) {
        const letter = match[1];
        const accidental = match[2] || '';
        const octave = parseInt(match[3] || '4');

        // Build ABC note
        let abcNote = '';
        if (accidental === '#') abcNote += '^';
        else if (accidental === 'b') abcNote += '_';

        // ABC: uppercase = octave 4, lowercase = octave 5
        if (octave >= 5) {
          abcNote += letter.toLowerCase();
          // Add apostrophes for octaves above 5
          for (let i = 5; i < octave; i++) abcNote += "'";
        } else {
          abcNote += letter.toUpperCase();
          // Add commas for octaves below 4
          for (let i = 4; i > octave; i--) abcNote += ",";
        }

        abcTokens.push(abcNote);
      } else {
        // Try as raw ABC token
        abcTokens.push(token);
      }
    }

    if (abcTokens.length === 0) return '';

    // Group notes into bars of 4
    const bars: string[] = [];
    for (let i = 0; i < abcTokens.length; i += 4) {
      const bar = abcTokens.slice(i, i + 4).join(' ');
      bars.push(bar);
    }

    return `X:1
T:Your Composition
K:${key}
M:${currentTimeSignature}
L:1/4
Q:1/4=${currentTempo}
| ${bars.join(' | ')} |]`;
  }, [currentTempo, currentTimeSignature]);

  // Extract notes from ABC notation for playback
  const extractNotesFromABC = useCallback((abc: string): string[] => {
    const notes: string[] = [];
    // Match ABC notes like C, c, D', d,, ^C (sharp), _D (flat), with optional duration
    const notePattern = /(\^|_)?([A-Ga-g])([,']*)?(\d*\/?\d*)?/g;
    let match;
    
    // Get lines after headers (music body)
    const lines = abc.split('\n').filter(line => !line.match(/^[A-Za-z]:|^%%/));
    const musicBody = lines.join(' ');
    
    while ((match = notePattern.exec(musicBody)) !== null) {
      const accidental = match[1];
      const noteLetter = match[2];
      const octaveModifier = match[3] || '';
      
      // Skip rests
      if (noteLetter.toLowerCase() === 'z') continue;
      
      // Determine octave based on case and modifiers
      let octave = noteLetter === noteLetter.toLowerCase() ? 5 : 4;
      
      // , lowers octave, ' raises octave
      for (const char of octaveModifier) {
        if (char === ',') octave--;
        if (char === "'") octave++;
      }
      
      let normalizedNote = noteLetter.toUpperCase();
      if (accidental === '^') normalizedNote += '#';
      else if (accidental === '_') normalizedNote += 'b';
      
      notes.push(`${normalizedNote}${octave}`);
    }
    
    return notes;
  }, []);

  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      setRenderError(null);
      
      // Use full ABC notation if provided, otherwise generate from melody
      const abc = useFullAbc && abcNotation ? abcNotation : generateABC(melody, currentKey);
      
      if (!abc || abc.trim() === '') {
        // Show default empty staff
        const defaultAbc = `X:1\nT:Your Composition\nK:${currentKey}\nM:${currentTimeSignature}\nL:1/4\n| z4 |]`;
        try {
          abcjs.renderAbc(containerRef.current, defaultAbc, {
            responsive: 'resize',
            add_classes: true,
            staffwidth: 600,
            scale: 1.3,
            paddingtop: 10,
            paddingbottom: 10,
          });
        } catch (error) {
          console.error('ABC default rendering error:', error);
          setRenderError('Unable to render staff. Please check your notation.');
        }
        return;
      }
      
      try {
        const result = abcjs.renderAbc(containerRef.current, abc, {
          responsive: 'resize',
          add_classes: true,
          staffwidth: 600,
          scale: 1.3,
          paddingtop: 10,
          paddingbottom: 10,
        });
        
        // abcjs.renderAbc always returns an array, check if it has content
        if (!result) {
          setRenderError('Unable to render notation. Try simpler input like "C D E F".');
        }
      } catch (error) {
        console.error('ABC rendering error:', error);
        setRenderError('Notation error. Please check your input format.');
        
        // Try to render a fallback empty staff
        try {
          const fallbackAbc = `X:1\nT:Composition\nK:${currentKey}\nM:${currentTimeSignature}\nL:1/4\n| z4 |]`;
          abcjs.renderAbc(containerRef.current, fallbackAbc, {
            responsive: 'resize',
            add_classes: true,
            staffwidth: 600,
            scale: 1.3,
          });
        } catch (fallbackError) {
          console.error('Fallback rendering failed:', fallbackError);
        }
      }
    }
  }, [melody, currentKey, generateABC, useFullAbc, abcNotation, currentTimeSignature]);

  const handleMelodyChange = (value: string) => {
    setMelody(value);
    setOriginalMelody(value);
    setOriginalKey(currentKey);
    setUseFullAbc(false); // Switch to melody mode when user edits
    onMelodyChange?.(value);
  };

  // Parse melody into playable notes with durations for accurate rhythmic playback
  const getPlayableNotesWithDurations = useCallback((): NoteWithDuration[] => {
    // If using full ABC notation (from AI), parse with durations
    if (useFullAbc && abcNotation) {
      return parseAbcWithDurations(abcNotation);
    }
    
    // For simple melody input, generate ABC and parse it
    const abc = generateABC(melody, currentKey);
    if (abc) {
      return parseAbcWithDurations(abc);
    }
    
    // Fallback: parse as simple notes with quarter note duration
    const tokens = melody.split(/\s+/);
    const notes: NoteWithDuration[] = [];
    
    for (const token of tokens) {
      const match = token.match(/^([A-G])(#|b)?(\d)?$/i);
      if (match) {
        const letter = match[1].toUpperCase();
        const accidental = match[2] || '';
        const octave = match[3] || '4';
        notes.push({
          note: `${letter}${accidental}${octave}`,
          duration: '4n',
          durationValue: 1,
        });
      }
    }
    
    return notes;
  }, [melody, useFullAbc, abcNotation, generateABC, currentKey]);

  const handlePlay = async () => {
    if (isPlaying) {
      stopAll();
      return;
    }
    
    const notesWithDurations = getPlayableNotesWithDurations();
    const playableNotes = notesWithDurations.filter(n => n.note !== 'rest');
    
    if (playableNotes.length > 0) {
      // Use duration-aware playback for accurate rhythm
      await playMelodyWithDurations(notesWithDurations, currentTempo);
    }
  };

  const handleKeyChange = (newKey: string) => {
    if (useFullAbc && abcNotation) {
      // Transpose the ABC notation
      const transposedAbc = transposeAbcNotation(abcNotation, currentKey, newKey);
      setAbcNotation(transposedAbc);
    } else {
      // Transpose melody to new key
      const transposed = transposeMelody(melody, currentKey, newKey);
      setMelody(transposed);
      onMelodyChange?.(transposed);
    }
    setCurrentKey(newKey);
  };

  // Transpose ABC notation by changing the key and transposing note letters
  const transposeAbcNotation = useCallback((abc: string, fromKey: string, toKey: string): string => {
    const fromSemitone = NOTE_SEMITONES[fromKey] || 0;
    const toSemitone = NOTE_SEMITONES[toKey] || 0;
    const semitoneShift = toSemitone - fromSemitone;
    
    if (semitoneShift === 0) return abc;
    
    // Update the K: line
    let result = abc.replace(/K:\s*([A-G][#b]?)/i, `K:${toKey}`);
    
    // Transpose individual notes in the music body
    const lines = result.split('\n');
    const transposedLines = lines.map(line => {
      if (line.match(/^[A-Za-z]:|^%%/)) return line; // Skip headers
      
      // Transpose notes in music body
      return line.replace(/(\^|_)?([A-Ga-g])([,']*)?/g, (match, accidental, note, modifier) => {
        if (note.toLowerCase() === 'z') return match; // Skip rests
        
        const isLowerCase = note === note.toLowerCase();
        const baseNote = note.toUpperCase();
        let noteName = baseNote;
        if (accidental === '^') noteName += '#';
        else if (accidental === '_') noteName = baseNote + 'b';
        
        const currentSemitone = NOTE_SEMITONES[noteName] ?? NOTE_SEMITONES[baseNote] ?? 0;
        let newSemitone = (currentSemitone + semitoneShift) % 12;
        if (newSemitone < 0) newSemitone += 12;
        
        const newNoteName = SEMITONE_TO_NOTE[newSemitone];
        let newAccidental = '';
        let newNote = newNoteName;
        
        if (newNoteName.includes('#')) {
          newAccidental = '^';
          newNote = newNoteName.replace('#', '');
        }
        
        if (isLowerCase) newNote = newNote.toLowerCase();
        
        return `${newAccidental}${newNote}${modifier || ''}`;
      });
    });
    
    return transposedLines.join('\n');
  }, []);

  const handleTranspose = (direction: 'up' | 'down') => {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const currentIndex = keys.indexOf(currentKey);
    const newIndex = direction === 'up' 
      ? (currentIndex + 1) % 12 
      : (currentIndex - 1 + 12) % 12;
    const newKey = keys[newIndex];
    handleKeyChange(newKey);
  };

  const handleHarmonize = async () => {
    // Simple harmonization - add thirds
    const notesWithDurations = getPlayableNotesWithDurations();
    const playableNotes = notesWithDurations.filter(n => n.note !== 'rest');
    
    const harmonized = playableNotes.map((noteData) => {
      const match = noteData.note.match(/^([A-G])#?(\d)?$/i);
      if (!match) return noteData.note;
      
      const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const noteIndex = noteNames.indexOf(match[1].toUpperCase());
      const thirdIndex = (noteIndex + 2) % 7;
      const octave = match[2] || '4';
      
      return `${noteData.note} ${noteNames[thirdIndex]}${octave}`;
    });
    const newMelody = harmonized.join(' ');
    setMelody(newMelody);
    setOriginalMelody(newMelody);
    setOriginalKey(currentKey);
    setUseFullAbc(false); // Switch to melody mode
    onMelodyChange?.(newMelody);
    
    // Auto-play the harmonized melody using the simple playMelody
    stopAll();
    await playMelody(harmonized.flatMap(h => h.split(' ')), currentTempo);
  };

  const handleDownload = () => {
    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `composition-${currentKey}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-musical-gold/20">
                <Music2 className="w-5 h-5 text-musical-gold" />
              </div>
              <CardTitle className="text-lg font-display">Live Staff Editor</CardTitle>
            </div>
            <Select value={currentKey} onValueChange={handleKeyChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((key) => (
                  <SelectItem key={key} value={key}>
                    {key} Major
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Melody input */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              Enter notes (e.g., C D E F G A B C5 or C4 E4 G4 C5)
            </label>
            <Input
              value={melody}
              onChange={(e) => handleMelodyChange(e.target.value)}
              placeholder="C D E F G A B c"
              className="font-mono text-lg"
            />
          </div>

          {/* Staff display */}
          <div className="relative">
            <div 
              ref={containerRef} 
              className="bg-white rounded-lg p-4 min-h-[120px] mb-4 overflow-hidden"
              style={{ backgroundColor: '#ffffff', color: '#000000' }}
            />
            {renderError && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
                <div className="text-center p-4">
                  <p className="text-destructive text-sm">{renderError}</p>
                  <p className="text-muted-foreground text-xs mt-2">Try: C D E F G A B c</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isPlaying ? 'destructive' : 'default'}
              onClick={handlePlay}
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </Button>
            
            <Button variant="secondary" onClick={handleHarmonize} className="gap-2">
              <Wand2 className="w-4 h-4" />
              Harmonize
            </Button>
            
            <Button variant="outline" onClick={() => handleTranspose('up')} className="gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Transpose Up
            </Button>
            
            <Button variant="outline" onClick={() => handleTranspose('down')} className="gap-2">
              <ArrowUpDown className="w-4 h-4 rotate-180" />
              Transpose Down
            </Button>
            
            <Button variant="ghost" className="gap-2 ml-auto" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metronome and Pitch Pipe below the score */}
      <Metronome initialBpm={currentTempo} />
    </motion.div>
  );
}
