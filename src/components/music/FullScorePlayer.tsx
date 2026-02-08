import { useState, useEffect, useRef, useMemo } from 'react';
import abcjs from 'abcjs';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Music, Play, Square, Download, Volume2 } from 'lucide-react';
import { VoicePart, SONG_LIBRARY } from '@/types/music';
import { VoiceMixer } from './VoiceMixer';
import { useChoirSampler } from '@/hooks/useChoirSampler';
import { parseABCNotation, ParsedNote } from '@/utils/abcParser';
import { combinePartsToFullScore } from '@/utils/scoreUtils';

interface FullScorePlayerProps {
  songId?: string;
  onSongChange?: (songId: string) => void;
}

export function FullScorePlayer({
  songId,
  onSongChange,
}: FullScorePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSongId, setSelectedSongId] = useState(songId || SONG_LIBRARY[0].id);
  const [masterVolume, setMasterVolume] = useState(80);
  const [selectedPart, setSelectedPart] = useState<VoicePart | 'all'>('all');

  const {
    isLoaded,
    isPlaying,
    voiceStates,
    accompanimentState,
    playVoice,
    playAllVoices,
    stopAll,
    toggleMute,
    toggleSolo,
    setVoiceVolume,
    setMasterVolume: setMasterVol,
    toggleAccompanimentMute,
    setAccompanimentVolume,
  } = useChoirSampler();

  const song = SONG_LIBRARY.find((s) => s.id === selectedSongId) || SONG_LIBRARY[0];

  // Get available parts for this song
  const availableParts = song
    ? (Object.keys(song.parts).filter((p) => song.parts[p as VoicePart]) as VoicePart[])
    : [];

  // Parse ABC notation into playable notes with correct durations
  const parsedParts = useMemo(() => {
    if (!song) return {};
    const parts: Partial<Record<VoicePart, ParsedNote[]>> = {};
    const voiceParts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

    voiceParts.forEach((part) => {
      const abc = song.parts[part];
      if (abc) {
        parts[part] = parseABCNotation(abc, part).notes;
      }
    });

    return parts;
  }, [song]);

  // Render the score - combined full score when "all" is selected
  useEffect(() => {
    if (containerRef.current && song) {
      containerRef.current.innerHTML = '';

      let notation: string;

      if (selectedPart === 'all') {
        // Combine all parts into a multi-voice full score
        notation = combinePartsToFullScore(song);
      } else {
        notation = song.parts[selectedPart] || song.parts.soprano || '';
      }

      if (notation) {
        try {
          abcjs.renderAbc(containerRef.current, notation, {
            responsive: 'resize',
            add_classes: true,
            staffwidth: 600,
            scale: selectedPart === 'all' ? 0.85 : 1.0,
            paddingtop: 15,
            paddingbottom: 15,
          });
        } catch (error) {
          console.error('ABC rendering error:', error);
        }
      }
    }
  }, [song, selectedPart]);

  const handleSongChange = (newSongId: string) => {
    setSelectedSongId(newSongId);
    onSongChange?.(newSongId);
    stopAll();
  };

  const handlePlay = async () => {
    if (isPlaying) {
      stopAll();
      return;
    }

    if (Object.keys(parsedParts).length === 0) return;

    if (selectedPart === 'all') {
      // Play all available voices with organ accompaniment
      await playAllVoices(parsedParts, song.tempo, !accompanimentState.muted);
    } else {
      // Play single voice with proper durations
      const notes = parsedParts[selectedPart];
      if (notes) {
        await playVoice(selectedPart, notes, song.tempo);
      }
    }
  };

  const handleMasterVolumeChange = (value: number[]) => {
    setMasterVolume(value[0]);
    setMasterVol(value[0]);
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
        a.download = `${song.title}-score.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Main Score Card */}
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-display">{song.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {song.composer} • {song.key} Major • {song.timeSignature} • {song.tempo} BPM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedSongId} onValueChange={handleSongChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select song" />
                </SelectTrigger>
                <SelectContent>
                  {SONG_LIBRARY.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Part selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Display:</span>
            <Select
              value={selectedPart}
              onValueChange={(v) => setSelectedPart(v as VoicePart | 'all')}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Full Score</SelectItem>
                {availableParts.map((part) => (
                  <SelectItem key={part} value={part}>
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPart === 'all' && (
              <span className="text-xs text-muted-foreground italic">
                All SATB voices shown
              </span>
            )}
          </div>

          {/* Sheet music display */}
          <div
            ref={containerRef}
            className="bg-white rounded-lg p-4 min-h-[200px] overflow-x-auto"
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
          />

          {/* Playback controls */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <Button
                variant={isPlaying ? 'destructive' : 'default'}
                onClick={handlePlay}
                disabled={!isLoaded}
                className="gap-2 min-w-[120px]"
              >
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play{' '}
                    {selectedPart === 'all'
                      ? 'All'
                      : selectedPart.charAt(0).toUpperCase() + selectedPart.slice(1)}
                  </>
                )}
              </Button>

              {/* Master volume */}
              <div className="flex items-center gap-2 min-w-[140px]">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[masterVolume]}
                  max={100}
                  step={1}
                  onValueChange={handleMasterVolumeChange}
                  className="w-24"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                SVG
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Mixer with Accompaniment */}
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
    </motion.div>
  );
}
