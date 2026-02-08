import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat } from 'lucide-react';
import { useAudioEngine } from '@/hooks/useAudioEngine';

interface AudioPlayerProps {
  notes?: string[];
  tempo?: number;
  title?: string;
  onLoop?: () => void;
}

export function AudioPlayer({
  notes = ['C4', 'E4', 'G4', 'C5'],
  tempo = 120,
  title = 'Melody',
}: AudioPlayerProps) {
  const { isPlaying, playMelody, stopAll, setVolume } = useAudioEngine();
  const [volume, setVolumeState] = useState(70);
  const [isLooping, setIsLooping] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlayPause = async () => {
    if (isPlaying) {
      stopAll();
      setProgress(0);
    } else {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            if (isLooping) {
              handlePlayPause();
            }
            return 0;
          }
          return prev + (100 / (notes.length * (60 / tempo) * 4));
        });
      }, 100);

      await playMelody(notes, tempo);
      clearInterval(interval);
      setProgress(0);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setVolumeState(vol);
    setVolume(vol);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="relative h-1 bg-muted rounded-full mb-4 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={isLooping ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsLooping(!isLooping)}
              >
                <Repeat className={`w-4 h-4 ${isLooping ? 'text-primary' : ''}`} />
              </Button>
              <div className="flex items-center gap-2 w-28">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Notes preview */}
          <div className="mt-4 flex gap-1 flex-wrap">
            {notes.map((note, i) => (
              <motion.span
                key={`${note}-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`
                  px-2 py-1 text-xs rounded-md font-mono
                  ${i === Math.floor((progress / 100) * notes.length) && isPlaying
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {note}
              </motion.span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
