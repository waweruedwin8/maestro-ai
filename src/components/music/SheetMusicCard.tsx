import { useEffect, useRef, useState, useMemo } from 'react';
import abcjs from 'abcjs';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Play, Square, Download } from 'lucide-react';
import { VoicePart, SONG_LIBRARY, Song } from '@/types/music';

type DisplayMode = VoicePart | 'full' | 'organ';

interface SheetMusicCardProps {
  songTitle?: string;
  voicePart?: VoicePart;
  abcNotation?: string;
  onPartChange?: (part: VoicePart) => void;
  onDisplayModeChange?: (mode: DisplayMode) => void;
  onPlay?: (notes: string[]) => void;
  isPlaying?: boolean;
}

export function SheetMusicCard({
  songTitle = 'Hallelujah Chorus',
  voicePart = 'soprano',
  abcNotation,
  onPartChange,
  onDisplayModeChange,
  onPlay,
  isPlaying = false,
}: SheetMusicCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPart, setCurrentPart] = useState<VoicePart>(voicePart);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(voicePart);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Find song from library
  const song: Song | undefined = SONG_LIBRARY.find(
    (s) => s.title.toLowerCase() === songTitle.toLowerCase()
  ) || SONG_LIBRARY[0];

  // Get available parts for this song
  const availableParts = song ? (Object.keys(song.parts) as VoicePart[]) : ['soprano'];

  // Generate combined ABC notation for full score
  const generateFullScoreABC = useMemo(() => {
    if (!song) return '';
    
    const parts: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
    const availablePartNotations = parts
      .filter(part => song.parts[part])
      .map(part => {
        const partABC = song.parts[part] || '';
        // Extract just the notes (after the header)
        const lines = partABC.split('\n');
        const noteLines = lines.filter(line => !line.startsWith('X:') && !line.startsWith('T:') && 
          !line.startsWith('K:') && !line.startsWith('M:') && !line.startsWith('L:') && 
          !line.startsWith('Q:') && line.trim());
        return {
          part,
          notes: noteLines.join('\n'),
        };
      });

    if (availablePartNotations.length === 0) return '';

    // Create a multi-voice score
    return `X:1
T:${song.title} - Full Score
K:${song.key}
M:${song.timeSignature}
L:1/8
Q:1/4=${song.tempo}
%%staves {(S A) (T B)}
V:S clef=treble name="Soprano" snm="S"
V:A clef=treble name="Alto" snm="A"
V:T clef=bass name="Tenor" snm="T"
V:B clef=bass name="Bass" snm="B"
${availablePartNotations.map(({ part, notes }) => `[V:${part.charAt(0).toUpperCase()}]${notes}`).join('\n')}`;
  }, [song]);

  // Get organ notation (bass line for accompaniment)
  const getOrganABC = useMemo(() => {
    if (!song || !song.parts.bass) return '';
    return song.parts.bass;
  }, [song]);

  // Get ABC notation based on display mode
  const notation = useMemo(() => {
    if (abcNotation) return abcNotation;
    if (!song) return '';

    switch (displayMode) {
      case 'full':
        return generateFullScoreABC;
      case 'organ':
        return getOrganABC;
      default:
        return song.parts[displayMode] || song.parts.soprano || '';
    }
  }, [abcNotation, song, displayMode, generateFullScoreABC, getOrganABC]);

  useEffect(() => {
    if (containerRef.current && notation) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      setRenderError(null);
      
      try {
        // Render the sheet music with proper options
        abcjs.renderAbc(containerRef.current, notation, {
          responsive: 'resize',
          add_classes: true,
          staffwidth: displayMode === 'full' ? 700 : 500,
          scale: displayMode === 'full' ? 0.8 : 1.0,
          paddingtop: 15,
          paddingbottom: 15,
          paddingleft: 10,
          paddingright: 10,
        });
      } catch (error) {
        console.error('ABC rendering error:', error);
        setRenderError('Error rendering sheet music');
      }
    }
  }, [notation, displayMode]);

  const handlePartChange = (part: VoicePart) => {
    setCurrentPart(part);
    setDisplayMode(part); // Sync display mode with voice part
    onPartChange?.(part);
  };

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    // If a voice part is selected, also update currentPart
    if (mode !== 'full' && mode !== 'organ') {
      setCurrentPart(mode);
      onPartChange?.(mode);
    }
    onDisplayModeChange?.(mode);
  };

  const handlePlay = () => {
    if (displayMode === 'full' || displayMode === 'organ') {
      // For full/organ, play bass as reference
      if (song?.partNotes?.bass) {
        onPlay?.(song.partNotes.bass);
      }
    } else if (song?.partNotes?.[displayMode]) {
      onPlay?.(song.partNotes[displayMode]!);
    }
  };

  const handleDownloadSVG = () => {
    // Create a simple PDF download using the SVG
    if (containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song?.title || 'sheet-music'}-${displayMode}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const hasPlayableNotes = displayMode === 'full' || displayMode === 'organ'
    ? song?.partNotes?.bass && song.partNotes.bass.length > 0
    : song?.partNotes?.[displayMode] && song.partNotes[displayMode]!.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-display">{song?.title || songTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {song?.composer} • {song?.key} Major • {song?.tempo} BPM
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={displayMode} onValueChange={(v) => handleDisplayModeChange(v as DisplayMode)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Score</SelectItem>
                  <SelectItem value="organ">Organ/Accomp.</SelectItem>
                  {availableParts.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part.charAt(0).toUpperCase() + part.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Sheet music container with white background for visibility */}
          <div 
            ref={containerRef} 
            className="sheet-music-container bg-white rounded-lg p-4 min-h-[180px] overflow-x-auto"
            style={{ 
              backgroundColor: '#ffffff',
              color: '#000000',
            }}
          />
          
          {renderError && (
            <div className="mt-2 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {renderError}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button
                variant={isPlaying ? 'destructive' : 'default'}
                onClick={handlePlay}
                className="gap-2"
                disabled={!hasPlayableNotes}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play {displayMode === 'full' ? 'Score' : displayMode === 'organ' ? 'Organ' : displayMode.charAt(0).toUpperCase() + displayMode.slice(1)}
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSVG}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download SVG
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
