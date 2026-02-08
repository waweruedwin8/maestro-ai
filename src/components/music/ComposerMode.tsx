import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LiveStaffEditor } from './LiveStaffEditor';
import { VoiceMixer } from './VoiceMixer';
import { Metronome } from './Metronome';
import { ComposerPlaybackControls, PlaybackMode } from './ComposerPlaybackControls';
import { ComposerModeProps, VoicePart } from '@/types/music';
import { useChoirSampler } from '@/hooks/useChoirSampler';
import { parseABCNotation } from '@/utils/abcParser';

export function ComposerMode({
  melody = 'C D E F G A B C5',
  abc_notation,
  timeSignature = '4/4',
  key = 'C',
  tempo = 120,
}: ComposerModeProps) {
  const [currentMelody, setCurrentMelody] = useState(melody);
  const [currentAbcNotation, setCurrentAbcNotation] = useState(abc_notation || '');
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('melody');
  const [currentTempo, setCurrentTempo] = useState(tempo);

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

  // Parse ABC notation for playback
  const parsedParts = useMemo(() => {
    if (!currentAbcNotation) return {};
    const parts: Partial<Record<VoicePart, ReturnType<typeof parseABCNotation>['notes']>> = {};
    
    // For AI-generated composition, parse as soprano melody
    const { notes } = parseABCNotation(currentAbcNotation, 'soprano');
    if (notes.length > 0) {
      parts.soprano = notes;
    }
    
    return parts;
  }, [currentAbcNotation]);

  // Available parts for this composition
  const availableParts = useMemo(() => {
    return Object.keys(parsedParts) as VoicePart[];
  }, [parsedParts]);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      stopAll();
      return;
    }

    if (playbackMode === 'all') {
      await playAllVoices(parsedParts, currentTempo, true);
    } else if (playbackMode === 'organ') {
      const bassNotes = parsedParts.bass || parsedParts.soprano;
      if (bassNotes && bassNotes.length > 0) {
        await playOrganOnly(bassNotes, currentTempo);
      }
    } else if (playbackMode === 'melody') {
      const notes = parsedParts.soprano;
      if (notes && notes.length > 0) {
        await playVoice('soprano', notes, currentTempo);
      }
    } else {
      const notes = parsedParts[playbackMode as VoicePart];
      if (notes && notes.length > 0) {
        await playVoice(playbackMode as VoicePart, notes, currentTempo);
      }
    }
  }, [isPlaying, playbackMode, parsedParts, currentTempo, playAllVoices, playOrganOnly, playVoice, stopAll]);

  const handleHarmonize = () => {
    // Harmonization is handled by LiveStaffEditor
  };

  const handleTranspose = (direction: 'up' | 'down') => {
    // Transposition is handled by LiveStaffEditor
  };

  const handleMelodyChange = (newMelody: string) => {
    setCurrentMelody(newMelody);
  };

  const hasPlayableNotes = Object.keys(parsedParts).length > 0 && 
    Object.values(parsedParts).some(notes => notes && notes.length > 0);

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
        <div className="px-3 py-1 rounded-full bg-musical-gold/20 text-musical-gold text-sm font-medium">
          ✍️ Composer Mode
        </div>
        <span className="text-sm text-muted-foreground">
          {abc_notation ? 'AI-generated composition' : 'Bring your musical ideas to life'}
        </span>
      </motion.div>

      {/* Live staff editor - pass ABC notation if provided */}
      <LiveStaffEditor
        initialMelody={melody}
        initialAbcNotation={abc_notation}
        keySignature={key}
        tempo={tempo}
        timeSignature={timeSignature}
        onMelodyChange={handleMelodyChange}
      />

      {/* Advanced playback controls with voice selection */}
      {abc_notation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ComposerPlaybackControls
            isPlaying={isPlaying}
            isLoaded={isLoaded}
            playbackMode={playbackMode}
            onPlaybackModeChange={setPlaybackMode}
            onPlay={handlePlay}
            onHarmonize={handleHarmonize}
            onTranspose={handleTranspose}
            availableParts={availableParts}
            hasNotes={hasPlayableNotes}
          />
        </motion.div>
      )}

      {/* Voice mixer and metronome - show when we have complex notation */}
      {abc_notation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <VoiceMixer
            voiceStates={voiceStates}
            onToggleMute={toggleMute}
            onToggleSolo={toggleSolo}
            onVolumeChange={setVoiceVolume}
            enabledParts={availableParts.length > 0 ? availableParts : ['soprano']}
            accompanimentState={accompanimentState}
            onAccompanimentToggleMute={toggleAccompanimentMute}
            onAccompanimentVolumeChange={setAccompanimentVolume}
          />
          <Metronome 
            initialBpm={currentTempo} 
            onBpmChange={setCurrentTempo}
          />
        </motion.div>
      )}

      {/* Composition tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-2">💡 Note Entry</h4>
          <p className="text-xs text-muted-foreground">
            Type notes like "C D E F" or "C4 E4 G4" for specific octaves. Use # for sharps.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-2">🎵 Harmonize</h4>
          <p className="text-xs text-muted-foreground">
            Click Harmonize to automatically add chord tones to your melody.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-2">🔄 Transpose</h4>
          <p className="text-xs text-muted-foreground">
            Shift your composition to a different key with one click.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
