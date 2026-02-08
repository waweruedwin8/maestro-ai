import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Headphones } from 'lucide-react';
import { VoicePart } from '@/types/music';

interface VoiceState {
  muted: boolean;
  volume: number;
  solo: boolean;
}

interface AccompanimentState {
  muted: boolean;
  volume: number;
}

interface VoiceMixerProps {
  voiceStates: Record<VoicePart, VoiceState>;
  onToggleMute: (part: VoicePart) => void;
  onToggleSolo: (part: VoicePart) => void;
  onVolumeChange: (part: VoicePart, volume: number) => void;
  enabledParts?: VoicePart[];
  // Accompaniment support
  accompanimentState?: AccompanimentState;
  onAccompanimentToggleMute?: () => void;
  onAccompanimentVolumeChange?: (volume: number) => void;
}

const VOICE_COLORS: Record<VoicePart, string> = {
  soprano: 'hsl(340 75% 55%)', // Rose
  alto: 'hsl(280 65% 60%)', // Purple
  tenor: 'hsl(210 80% 55%)', // Blue
  bass: 'hsl(175 60% 45%)', // Teal
};

const VOICE_LABELS: Record<VoicePart, string> = {
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass',
};

export function VoiceMixer({
  voiceStates,
  onToggleMute,
  onToggleSolo,
  onVolumeChange,
  enabledParts = ['soprano', 'alto', 'tenor', 'bass'],
  accompanimentState,
  onAccompanimentToggleMute,
  onAccompanimentVolumeChange,
}: VoiceMixerProps) {
  const hasSolo = Object.values(voiceStates).some((s) => s.solo);

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-primary" />
          Voice Mixer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Voice parts */}
          {enabledParts.map((part, index) => {
            const state = voiceStates[part];
            const isActive = !state.muted && (!hasSolo || state.solo);

            return (
              <motion.div
                key={part}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center gap-3 p-2 rounded-lg transition-all
                  ${isActive ? 'bg-muted/50' : 'bg-muted/20 opacity-50'}
                `}
              >
                {/* Voice label with color indicator */}
                <div className="flex items-center gap-2 min-w-[80px]">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: VOICE_COLORS[part] }}
                  />
                  <span className="text-sm font-medium">{VOICE_LABELS[part]}</span>
                </div>

                {/* Volume slider */}
                <div className="flex-1 px-2">
                  <Slider
                    value={[state.volume]}
                    max={100}
                    step={1}
                    onValueChange={(v) => onVolumeChange(part, v[0])}
                    disabled={state.muted}
                    className="w-full"
                  />
                </div>

                {/* Mute button */}
                <Button
                  variant={state.muted ? 'destructive' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToggleMute(part)}
                >
                  {state.muted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>

                {/* Solo button */}
                <Button
                  variant={state.solo ? 'default' : 'ghost'}
                  size="icon"
                  className={`h-8 w-8 ${state.solo ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={() => onToggleSolo(part)}
                >
                  <Headphones className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}

          {/* Accompaniment (Organ) channel */}
          {accompanimentState && onAccompanimentToggleMute && onAccompanimentVolumeChange && (
            <>
              <div className="border-t border-border/50 pt-2 mt-2" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: enabledParts.length * 0.1 }}
                className={`
                  flex items-center gap-3 p-2 rounded-lg transition-all
                  ${!accompanimentState.muted ? 'bg-muted/50' : 'bg-muted/20 opacity-50'}
                `}
              >
                <div className="flex items-center gap-2 min-w-[80px]">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: 'hsl(45 80% 55%)' }}
                  />
                  <span className="text-sm font-medium">Organ</span>
                </div>

                <div className="flex-1 px-2">
                  <Slider
                    value={[accompanimentState.volume]}
                    max={100}
                    step={1}
                    onValueChange={(v) => onAccompanimentVolumeChange(v[0])}
                    disabled={accompanimentState.muted}
                    className="w-full"
                  />
                </div>

                <Button
                  variant={accompanimentState.muted ? 'destructive' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={onAccompanimentToggleMute}
                >
                  {accompanimentState.muted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>

                {/* Placeholder for alignment with solo buttons */}
                <div className="w-8" />
              </motion.div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <VolumeX className="w-3 h-3" /> Mute
          </span>
          <span className="flex items-center gap-1">
            <Headphones className="w-3 h-3" /> Solo
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
