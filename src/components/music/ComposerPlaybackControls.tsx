import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Wand2, ArrowUpDown } from 'lucide-react';
import { VoicePart } from '@/types/music';

export type PlaybackMode = VoicePart | 'all' | 'organ' | 'melody';

interface ComposerPlaybackControlsProps {
  isPlaying: boolean;
  isLoaded: boolean;
  playbackMode: PlaybackMode;
  onPlaybackModeChange: (mode: PlaybackMode) => void;
  onPlay: () => void;
  onHarmonize: () => void;
  onTranspose: (direction: 'up' | 'down') => void;
  availableParts?: VoicePart[];
  hasNotes: boolean;
}

export function ComposerPlaybackControls({
  isPlaying,
  isLoaded,
  playbackMode,
  onPlaybackModeChange,
  onPlay,
  onHarmonize,
  onTranspose,
  availableParts = [],
  hasNotes,
}: ComposerPlaybackControlsProps) {
  const getPlayButtonLabel = () => {
    if (isPlaying) return 'Stop';
    switch (playbackMode) {
      case 'all':
        return 'Play All Voices';
      case 'organ':
        return 'Play Organ';
      case 'melody':
        return 'Play Melody';
      default:
        return `Play ${playbackMode.charAt(0).toUpperCase() + playbackMode.slice(1)}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Main playback controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={playbackMode} onValueChange={(v) => onPlaybackModeChange(v as PlaybackMode)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Select playback" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="melody">Melody Only</SelectItem>
            <SelectItem value="all">All Voices + Organ</SelectItem>
            <SelectItem value="organ">Organ Only</SelectItem>
            {availableParts.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-1">
                  Individual Parts
                </div>
                {availableParts.map((part) => (
                  <SelectItem key={part} value={part}>
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>

        <Button
          variant={isPlaying ? 'destructive' : 'default'}
          onClick={onPlay}
          disabled={!hasNotes}
          className="gap-2 flex-1 min-w-[160px]"
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {getPlayButtonLabel()}
            </>
          )}
        </Button>
      </div>

      {/* Composition tools */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onHarmonize} className="gap-2">
          <Wand2 className="w-4 h-4" />
          Harmonize
        </Button>
        
        <Button variant="outline" onClick={() => onTranspose('up')} className="gap-2">
          <ArrowUpDown className="w-4 h-4" />
          Transpose Up
        </Button>
        
        <Button variant="outline" onClick={() => onTranspose('down')} className="gap-2">
          <ArrowUpDown className="w-4 h-4 rotate-180" />
          Transpose Down
        </Button>
      </div>
    </motion.div>
  );
}
