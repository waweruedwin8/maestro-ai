import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Minus, Plus, Music } from 'lucide-react';
import { useMetronome } from '@/hooks/useMetronome';
import * as Tone from 'tone';

interface MetronomeProps {
  initialBpm?: number;
  compact?: boolean;
  onBpmChange?: (bpm: number) => void;
}

type TimeSignature = '2/4' | '3/4' | '4/4' | '5/4' | '6/8' | '12/8';

const TIME_SIGNATURES: { value: TimeSignature; label: string; beats: number }[] = [
  { value: '2/4', label: '2/4', beats: 2 },
  { value: '3/4', label: '3/4', beats: 3 },
  { value: '4/4', label: '4/4', beats: 4 },
  { value: '5/4', label: '5/4', beats: 5 },
  { value: '6/8', label: '6/8', beats: 6 },
  { value: '12/8', label: '12/8', beats: 12 },
];

const PITCH_PIPE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function Metronome({ initialBpm = 120, compact = false, onBpmChange }: MetronomeProps) {
  const { isPlaying, bpm, currentBeat, toggle, setBpm: setMetronomeBpm } = useMetronome(initialBpm);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');

  // Wrapper to notify parent of BPM changes
  const setBpm = (newBpm: number) => {
    setMetronomeBpm(newBpm);
    onBpmChange?.(newBpm);
  };
  const [activePitchNote, setActivePitchNote] = useState<string | null>(null);
  
  const pitchSynthRef = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    pitchSynthRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 0.5,
      },
    }).toDestination();
    pitchSynthRef.current.volume.value = -10;

    return () => {
      if (pitchSynthRef.current) {
        pitchSynthRef.current.dispose();
      }
    };
  }, []);

  const getBeatsForTimeSignature = useCallback(() => {
    return TIME_SIGNATURES.find(ts => ts.value === timeSignature)?.beats || 4;
  }, [timeSignature]);

  const beats = Array.from({ length: getBeatsForTimeSignature() }, (_, i) => i);

  const handlePitchPlay = async (note: string) => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    
    if (pitchSynthRef.current) {
      // Stop any currently playing note
      pitchSynthRef.current.triggerRelease();
      
      if (activePitchNote === note) {
        // If same note, just stop
        setActivePitchNote(null);
      } else {
        // Play new note
        setActivePitchNote(note);
        pitchSynthRef.current.triggerAttack(`${note}4`);
      }
    }
  };

  const handlePitchStop = () => {
    if (pitchSynthRef.current) {
      pitchSynthRef.current.triggerRelease();
    }
    setActivePitchNote(null);
  };

  if (compact) {
    return (
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Button
              variant={isPlaying ? 'destructive' : 'default'}
              size="sm"
              onClick={toggle}
              className="gap-1"
            >
              {isPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {bpm} BPM
            </Button>
            <div className="flex gap-1">
              {beats.slice(0, 4).map((beat) => (
                <div
                  key={beat}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isPlaying && currentBeat === beat
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Metronome & Pitch Pipe</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Beat indicators */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {beats.map((beat) => (
              <motion.div
                key={beat}
                animate={{
                  scale: isPlaying && currentBeat === beat ? 1.3 : 1,
                  backgroundColor:
                    isPlaying && currentBeat === beat
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted))',
                }}
                transition={{ duration: 0.1 }}
                className={`
                  w-4 h-4 rounded-full
                  ${beat === 0 ? 'ring-2 ring-primary/30' : ''}
                `}
              />
            ))}
          </div>

          {/* Time Signature & BPM Display */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Select value={timeSignature} onValueChange={(v) => setTimeSignature(v as TimeSignature)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SIGNATURES.map((ts) => (
                  <SelectItem key={ts.value} value={ts.value}>
                    {ts.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-center">
              <span className="text-3xl font-display font-bold text-foreground">
                {bpm}
              </span>
              <span className="text-sm text-muted-foreground ml-1">BPM</span>
            </div>
          </div>

          {/* BPM Controls */}
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setBpm(bpm - 5)}
              disabled={bpm <= 40}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Slider
              value={[bpm]}
              min={40}
              max={240}
              step={1}
              onValueChange={(v) => setBpm(v[0])}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setBpm(bpm + 5)}
              disabled={bpm >= 240}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Play/Stop Button */}
          <Button
            variant={isPlaying ? 'destructive' : 'default'}
            className="w-full gap-2 mb-4"
            onClick={toggle}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </Button>

          {/* Quick tempo presets */}
          <div className="flex gap-2 mb-4">
            {[60, 80, 100, 120, 140].map((preset) => (
              <Button
                key={preset}
                variant={bpm === preset ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setBpm(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>

          {/* Pitch Pipe */}
          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Pitch Pipe</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {PITCH_PIPE_NOTES.map((note) => (
                <Button
                  key={note}
                  variant={activePitchNote === note ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs px-1 ${note.includes('#') ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700' : ''}`}
                  onMouseDown={() => handlePitchPlay(note)}
                  onMouseUp={handlePitchStop}
                  onMouseLeave={handlePitchStop}
                  onTouchStart={() => handlePitchPlay(note)}
                  onTouchEnd={handlePitchStop}
                >
                  {note}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press and hold to hear pitch
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
