import { motion } from 'framer-motion';
import { InteractivePiano } from './InteractivePiano';
import { TheoryCard } from './TheoryCard';
import { TheoryTeacherModeProps, THEORY_CONCEPTS } from '@/types/music';

export function TheoryTeacherMode({
  concept = 'minor-chord',
  chord,
  highlightNotes,
  explanation,
}: TheoryTeacherModeProps) {
  // Find the concept or use provided data
  const theoryConcept = THEORY_CONCEPTS.find((c) => c.id === concept);
  const displayChord = chord || theoryConcept?.chordExample;
  const displayNotes = highlightNotes || displayChord?.notes || [];

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
        <div className="px-3 py-1 rounded-full bg-musical-teal/20 text-musical-teal text-sm font-medium">
          📚 Theory Teacher Mode
        </div>
        <span className="text-sm text-muted-foreground">
          Understanding music theory visually
        </span>
      </motion.div>

      {/* Interactive Piano with highlighted notes */}
      <InteractivePiano
        highlightNotes={displayNotes}
        octaves={2}
        startOctave={4}
      />

      {/* Theory explanation card */}
      <TheoryCard
        concept={concept}
        chord={displayChord}
        explanation={explanation}
      />

      {/* Audio comparison */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-4 rounded-lg bg-musical-gold/10 border border-musical-gold/20">
          <h4 className="text-sm font-medium text-musical-gold mb-2">Major Sound</h4>
          <p className="text-xs text-muted-foreground">
            The major third interval creates a "bright" and "happy" sound. Try playing C-E-G on the piano.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-musical-blue/10 border border-musical-blue/20">
          <h4 className="text-sm font-medium text-musical-blue mb-2">Minor Sound</h4>
          <p className="text-xs text-muted-foreground">
            The minor third interval creates a "dark" or "sad" sound. Try playing A-C-E on the piano.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
