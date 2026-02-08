import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SheetMusicCard } from './SheetMusicCard';
import { Metronome } from './Metronome';
import { VoiceMixer } from './VoiceMixer';
import { VoicePart, SONG_LIBRARY, PanicPracticeModeProps } from '@/types/music';
import { useChoirSampler } from '@/hooks/useChoirSampler';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square } from 'lucide-react';
import { parseABCNotation } from '@/utils/abcParser';

type PlaybackMode = VoicePart | 'all' | 'organ';

export function PanicPracticeMode({
  songTitle = 'Hallelujah Chorus',
  voicePart = 'soprano',
  tempo,
}: PanicPracticeModeProps) {
  const [currentPart, setCurrentPart] = useState<VoicePart>(voicePart);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(voicePart);

  const song = SONG_LIBRARY.find(
    (s) => s.title.toLowerCase() === songTitle.toLowerCase()
  ) || SONG_LIBRARY[0];

  const {
    isLoaded,
    isPlaying,
    voiceStates,
    accompanimentState,
    playVoice,
    playAllVoices,
    playOrganOnly,
    stopAll,
    toggleMute,
    toggleSolo,
    setVoiceVolume,
    toggleAccompanimentMute,
    setAccompanimentVolume,
  } = useChoirSampler();

  // Get available parts for this song
  const availableParts = song
    ? (Object.keys(song.parts).filter((p) => song.parts[p as VoicePart]) as VoicePart[])
    : [];

  // Parse ABC notation for all parts
  const parsedParts = useMemo(() => {
    if (!song) return {};
    const parts: Partial<Record<VoicePart, ReturnType<typeof parseABCNotation>['notes']>> = {};
    const voiceParts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
    voiceParts.forEach((part) => {
      const abc = song.parts[part];
      if (abc) {
        parts[part] = parseABCNotation(abc, part).notes;
      }
    });
    return parts;
  }, [song]);

  const handlePlay = async () => {
    if (isPlaying) {
      stopAll();
      return;
    }

    const effectiveTempo = tempo || song?.tempo || 100;

    if (playbackMode === 'all') {
      // Play all voices + organ accompaniment
      await playAllVoices(parsedParts, effectiveTempo, true);
    } else if (playbackMode === 'organ') {
      // Play organ only (doubles bass line)
      const bassNotes = parsedParts.bass;
      if (bassNotes && bassNotes.length > 0) {
        await playOrganOnly(bassNotes, effectiveTempo);
      }
    } else {
      // Play single voice
      const notes = parsedParts[playbackMode];
      if (notes && notes.length > 0) {
        await playVoice(playbackMode, notes, effectiveTempo);
      }
    }
  };

  const handlePartChange = (part: VoicePart) => {
    setCurrentPart(part);
    if (isPlaying) {
      stopAll();
    }
  };

  const handlePlaybackModeChange = (mode: string) => {
    setPlaybackMode(mode as PlaybackMode);
    if (isPlaying) {
      stopAll();
    }
  };

  const getPlayButtonLabel = () => {
    if (isPlaying) return 'Stop Playback';
    if (playbackMode === 'all') return 'Play All';
    if (playbackMode === 'organ') return 'Play Organ';
    return `Play ${playbackMode.charAt(0).toUpperCase() + playbackMode.slice(1)} Part`;
  };

  const hasPlayableNotes = playbackMode === 'all'
    ? Object.keys(parsedParts).length > 0
    : playbackMode === 'organ'
      ? parsedParts.bass && parsedParts.bass.length > 0
      : parsedParts[playbackMode as VoicePart] && parsedParts[playbackMode as VoicePart]!.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-2"
      >
        <div className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-medium">
          🎭 Panic Practice Mode
        </div>
        <span className="text-sm text-muted-foreground">
          Focus on your {currentPart.charAt(0).toUpperCase() + currentPart.slice(1)} part
        </span>
      </motion.div>

      {/* Main sheet music */}
      <SheetMusicCard
        songTitle={songTitle}
        voicePart={currentPart}
        onPartChange={handlePartChange}
        onPlay={() => handlePlay()}
        isPlaying={isPlaying}
      />

      {/* Playback controls */}
      <div className="flex gap-3 items-center">
        <Select value={playbackMode} onValueChange={handlePlaybackModeChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Select playback" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Voices + Organ</SelectItem>
            <SelectItem value="organ">Organ Only</SelectItem>
            {availableParts.map((part) => (
              <SelectItem key={part} value={part}>
                {part.charAt(0).toUpperCase() + part.slice(1)} Only
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={isPlaying ? 'destructive' : 'default'}
          onClick={handlePlay}
          disabled={!isLoaded || !hasPlayableNotes}
          className="gap-2 flex-1"
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4" />
              {getPlayButtonLabel()}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {getPlayButtonLabel()}
            </>
          )}
        </Button>
      </div>

      {/* Voice mixer and metronome side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VoiceMixer
          voiceStates={voiceStates}
          onToggleMute={toggleMute}
          onToggleSolo={toggleSolo}
          onVolumeChange={setVoiceVolume}
          enabledParts={availableParts}
          accompanimentState={accompanimentState}
          onAccompanimentToggleMute={toggleAccompanimentMute}
          onAccompanimentVolumeChange={setAccompanimentVolume}
        />
        <Metronome initialBpm={tempo || song?.tempo || 100} />
      </div>

      {/* Quick tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-lg bg-muted/50 border border-border/50"
      >
        <h4 className="text-sm font-medium text-foreground mb-2">Quick Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Select "All Voices + Organ" to hear the full arrangement</li>
          <li>• Use "Organ Only" for harmonic context while singing your part</li>
          <li>• Use the voice mixer to focus on your part (Solo) or mute others</li>
          <li>• Start at a slower tempo and gradually increase</li>
          <li>• Focus on the tricky intervals first</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
