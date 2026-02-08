import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, ArrowRight } from 'lucide-react';
import { Chord, MusicTheoryConcept, THEORY_CONCEPTS } from '@/types/music';
import { useAudioEngine } from '@/hooks/useAudioEngine';

interface TheoryCardProps {
  concept?: string;
  chord?: Chord;
  explanation?: string;
  relatedConcepts?: string[];
  onConceptClick?: (concept: string) => void;
}

export function TheoryCard({
  concept = 'minor-chord',
  chord,
  explanation,
  relatedConcepts,
  onConceptClick,
}: TheoryCardProps) {
  const { playChord } = useAudioEngine();

  // Find concept from library
  const theoryConcept = THEORY_CONCEPTS.find((c) => c.id === concept) || THEORY_CONCEPTS[0];
  const displayChord = chord || theoryConcept?.chordExample;
  const displayExplanation = explanation || theoryConcept?.description;
  const displayRelated = relatedConcepts || theoryConcept?.relatedConcepts;

  const handlePlayChord = () => {
    if (displayChord?.notes) {
      // Add octave to notes
      const notesWithOctave = displayChord.notes.map((n) => `${n}4`);
      playChord(notesWithOctave, '2n');
    }
  };

  const getChordTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'text-musical-gold';
      case 'minor':
        return 'text-musical-blue';
      case 'diminished':
        return 'text-destructive';
      case 'augmented':
        return 'text-musical-rose';
      case 'dominant7':
      case 'major7':
      case 'minor7':
        return 'text-musical-purple';
      default:
        return 'text-primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-musical-teal/20">
                <BookOpen className="w-5 h-5 text-musical-teal" />
              </div>
              <div>
                <CardTitle className="text-lg font-display">
                  {theoryConcept?.name || 'Music Theory'}
                </CardTitle>
                {displayChord && (
                  <p className={`text-sm font-medium ${getChordTypeColor(displayChord.type)}`}>
                    {displayChord.name} ({displayChord.type})
                  </p>
                )}
              </div>
            </div>
            {displayChord && (
              <Button variant="secondary" size="sm" onClick={handlePlayChord} className="gap-2">
                <Play className="w-3 h-3" />
                Hear It
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Explanation */}
          <p className="text-sm text-foreground leading-relaxed mb-4">
            {displayExplanation}
          </p>

          {/* Chord notes */}
          {displayChord && (
            <div className="mb-4">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Chord Notes
              </h4>
              <div className="flex gap-2">
                {displayChord.notes.map((note, i) => (
                  <motion.span
                    key={note}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-3 py-2 rounded-lg bg-primary/20 text-primary font-mono font-bold"
                  >
                    {note}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Related concepts */}
          {displayRelated && displayRelated.length > 0 && (
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Related Concepts
              </h4>
              <div className="flex flex-wrap gap-2">
                {displayRelated.map((related) => (
                  <Button
                    key={related}
                    variant="ghost"
                    size="sm"
                    onClick={() => onConceptClick?.(related)}
                    className="gap-1 text-xs"
                  >
                    {related.replace(/-/g, ' ')}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
