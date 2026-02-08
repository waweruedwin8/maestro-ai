// Music Theory Course Types

export type SkillLevel = 'beginner' | 'intermediate' | 'expert';

export interface TheoryLesson {
  id: string;
  title: string;
  description: string;
  level: SkillLevel;
  category: TheoryCategory;
  duration: string; // e.g., "10 min"
  objectives: string[];
  content: TheoryLessonContent;
  quiz?: TheoryQuiz;
  relatedLessons?: string[];
}

export interface TheoryLessonContent {
  sections: TheorySection[];
  practiceExercises?: PracticeExercise[];
}

export interface TheorySection {
  heading: string;
  text: string;
  examples?: TheoryExample[];
  audioExample?: string; // ABC notation for audio playback
  interactiveElement?: 'piano' | 'staff' | 'interval-trainer';
}

export interface TheoryExample {
  type: 'notation' | 'audio' | 'image';
  data: string; // ABC notation, URL, or description
  caption?: string;
}

export interface PracticeExercise {
  id: string;
  type: 'identify' | 'build' | 'listen' | 'write';
  question: string;
  correctAnswer: string;
  options?: string[];
  hint?: string;
}

export interface TheoryQuiz {
  questions: QuizQuestion[];
  passingScore: number; // percentage
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'audio-identify';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type TheoryCategory = 
  | 'notation'
  | 'rhythm'
  | 'scales'
  | 'intervals'
  | 'chords'
  | 'harmony'
  | 'ear-training'
  | 'form'
  | 'counterpoint';

export interface TheoryCategoryInfo {
  id: TheoryCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface UserProgress {
  lessonId: string;
  completed: boolean;
  score?: number;
  lastAccessed: Date;
  notes?: string;
}

// Predefined curriculum structure
export const THEORY_CATEGORIES: TheoryCategoryInfo[] = [
  {
    id: 'notation',
    name: 'Music Notation',
    description: 'Reading and writing musical symbols',
    icon: '🎼',
    color: 'hsl(210 80% 55%)',
  },
  {
    id: 'rhythm',
    name: 'Rhythm & Meter',
    description: 'Understanding time signatures, note values, and rhythmic patterns',
    icon: '🥁',
    color: 'hsl(340 75% 55%)',
  },
  {
    id: 'scales',
    name: 'Scales & Modes',
    description: 'Major, minor, and modal scales',
    icon: '🎹',
    color: 'hsl(45 80% 55%)',
  },
  {
    id: 'intervals',
    name: 'Intervals',
    description: 'The distance between two notes',
    icon: '📏',
    color: 'hsl(280 65% 60%)',
  },
  {
    id: 'chords',
    name: 'Chords',
    description: 'Building and identifying triads and seventh chords',
    icon: '🎸',
    color: 'hsl(175 60% 45%)',
  },
  {
    id: 'harmony',
    name: 'Harmony',
    description: 'Chord progressions and harmonic analysis',
    icon: '🎵',
    color: 'hsl(120 50% 45%)',
  },
  {
    id: 'ear-training',
    name: 'Ear Training',
    description: 'Developing your musical ear',
    icon: '👂',
    color: 'hsl(30 80% 55%)',
  },
  {
    id: 'form',
    name: 'Musical Form',
    description: 'Structure and organization of music',
    icon: '📐',
    color: 'hsl(200 70% 50%)',
  },
  {
    id: 'counterpoint',
    name: 'Counterpoint',
    description: 'Writing multiple melodic lines',
    icon: '🎻',
    color: 'hsl(0 70% 55%)',
  },
];

// Beginner curriculum
export const BEGINNER_LESSONS: TheoryLesson[] = [
  {
    id: 'b-notation-1',
    title: 'The Musical Staff',
    description: 'Learn to read the treble and bass clefs',
    level: 'beginner',
    category: 'notation',
    duration: '15 min',
    objectives: [
      'Identify the treble and bass clefs',
      'Name notes on the staff',
      'Understand ledger lines',
    ],
    content: {
      sections: [
        {
          heading: 'Introduction to the Staff',
          text: 'Music is written on a set of five horizontal lines called a staff (or stave). Notes are placed on these lines and in the spaces between them to indicate pitch. The higher a note is placed on the staff, the higher its pitch. Think of it like a ladder—notes climb up for higher sounds and step down for lower sounds.',
          interactiveElement: 'staff',
        },
        {
          heading: 'The Treble Clef (G Clef)',
          text: 'The treble clef (𝄞) is used for higher-pitched instruments like violin, flute, and right-hand piano. The curl of the clef wraps around the second line from the bottom, which is the G note. A helpful way to remember the line notes is "Every Good Boy Does Fine" (E-G-B-D-F from bottom to top), and the spaces spell "FACE" (F-A-C-E).',
          examples: [
            {
              type: 'notation',
              data: 'X:1\nK:C clef=treble\nE F G A B c d e|',
              caption: 'Notes ascending on the treble clef staff',
            },
          ],
        },
        {
          heading: 'The Bass Clef (F Clef)',
          text: 'The bass clef (𝄢) is used for lower-pitched instruments like cello, tuba, and left-hand piano. The two dots surround the fourth line, which is F. Remember the line notes as "Good Boys Do Fine Always" (G-B-D-F-A) and spaces as "All Cows Eat Grass" (A-C-E-G).',
          examples: [
            {
              type: 'notation',
              data: 'X:1\nK:C clef=bass\nG, A, B, C D E F G|',
              caption: 'Notes on the bass clef staff',
            },
          ],
        },
        {
          heading: 'Ledger Lines',
          text: 'When notes go above or below the five-line staff, we add short horizontal lines called ledger lines. Middle C is written on a ledger line between the treble and bass clefs. These extend the range of the staff without needing to switch clefs constantly.',
        },
      ],
      practiceExercises: [
        {
          id: 'ex-1',
          type: 'identify',
          question: 'Which line does the treble clef curl around?',
          correctAnswer: 'G',
          options: ['E', 'F', 'G', 'A'],
        },
        {
          id: 'ex-2',
          type: 'identify',
          question: 'What word do the spaces in treble clef spell?',
          correctAnswer: 'FACE',
          options: ['FADE', 'FACE', 'CAFE', 'ACED'],
        },
      ],
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          question: 'How many lines are in a musical staff?',
          type: 'multiple-choice',
          options: ['3', '4', '5', '6'],
          correctAnswer: '5',
          explanation: 'A standard musical staff consists of 5 horizontal lines with 4 spaces between them.',
        },
        {
          id: 'q2',
          question: 'Which clef is also called the G clef?',
          type: 'multiple-choice',
          options: ['Bass clef', 'Treble clef', 'Alto clef', 'Tenor clef'],
          correctAnswer: 'Treble clef',
          explanation: 'The treble clef is called the G clef because its curl wraps around the G line.',
        },
      ],
      passingScore: 70,
    },
  },
  {
    id: 'b-rhythm-1',
    title: 'Note Values & Rests',
    description: 'Understanding how long notes last',
    level: 'beginner',
    category: 'rhythm',
    duration: '20 min',
    objectives: [
      'Identify whole, half, quarter, and eighth notes',
      'Understand equivalent rest values',
      'Count basic rhythms',
    ],
    content: {
      sections: [
        {
          heading: 'Note Duration Hierarchy',
          text: 'Notes have different durations measured in beats. In common time (4/4), a whole note lasts 4 beats, a half note lasts 2 beats, a quarter note lasts 1 beat, and an eighth note lasts half a beat. Each note value is exactly half the duration of the one before it.',
          audioExample: 'X:1\nM:4/4\nL:1/4\nK:C\nC4 | C2 C2 | C C C C | C/2C/2 C/2C/2 C/2C/2 C/2C/2 |',
        },
        {
          heading: 'Understanding Rests',
          text: 'For every note value, there is an equivalent rest symbol indicating silence for that duration. A whole rest hangs from the 4th line (looks like an upside-down hat), a half rest sits on the 3rd line (looks like a hat), quarter rests look like a zigzag, and eighth rests have a single flag.',
        },
        {
          heading: 'Dotted Notes',
          text: 'A dot after a note adds half of its original value. A dotted half note = 3 beats (2 + 1). A dotted quarter note = 1.5 beats (1 + 0.5). Dots are a shorthand that avoid writing tied notes.',
        },
        {
          heading: 'Ties vs Slurs',
          text: 'A tie connects two notes of the same pitch, combining their durations into one longer sound. A slur connects notes of different pitches and indicates they should be played smoothly (legato). Same symbol, different meanings!',
        },
      ],
      practiceExercises: [
        {
          id: 'ex-r1',
          type: 'identify',
          question: 'How many quarter notes equal one whole note?',
          correctAnswer: '4',
          options: ['2', '3', '4', '8'],
        },
      ],
    },
  },
  {
    id: 'b-rhythm-2',
    title: 'Time Signatures Explained',
    description: 'Understanding the musical meter',
    level: 'beginner',
    category: 'rhythm',
    duration: '15 min',
    objectives: [
      'Read time signatures correctly',
      'Count beats in different meters',
      'Recognize common vs cut time',
    ],
    content: {
      sections: [
        {
          heading: 'What is a Time Signature?',
          text: 'A time signature appears at the beginning of music as two stacked numbers. The top number tells you how many beats are in each measure. The bottom number tells you what note value gets one beat. For example, 4/4 means 4 beats per measure and a quarter note gets one beat.',
        },
        {
          heading: 'Common Time (4/4)',
          text: '4/4 is the most common time signature, also written as a "C" symbol. You count "1-2-3-4" repeatedly. Most pop, rock, and classical music uses 4/4. The emphasis usually falls on beats 1 and 3.',
          audioExample: 'X:1\nM:4/4\nL:1/4\nK:C\nCDEF|GABC\'|',
        },
        {
          heading: 'Waltz Time (3/4)',
          text: '3/4 has 3 beats per measure with emphasis on beat 1, creating the "OOM-pah-pah" waltz feel. Many waltzes, minuets, and folk songs use this meter.',
          audioExample: 'X:1\nM:3/4\nL:1/4\nK:C\nCEG|cGE|',
        },
        {
          heading: 'Other Common Meters',
          text: '2/4 is march time (strong-weak). 6/8 feels like two groups of three (compound duple). Cut time (₵ or 2/2) moves faster with the half note getting the beat. Each meter creates a different feel for the music.',
        },
      ],
    },
  },
  {
    id: 'b-scales-1',
    title: 'The Major Scale',
    description: 'Building and playing major scales',
    level: 'beginner',
    category: 'scales',
    duration: '15 min',
    objectives: [
      'Understand the whole-step/half-step pattern',
      'Build a C major scale',
      'Play major scales on the piano',
    ],
    content: {
      sections: [
        {
          heading: 'The Major Scale Pattern',
          text: 'A major scale follows a specific pattern of whole steps (W) and half steps (H): W-W-H-W-W-W-H. This pattern creates the familiar "Do-Re-Mi-Fa-Sol-La-Ti-Do" sound. The C major scale uses only white keys: C-D-E-F-G-A-B-C.',
          audioExample: 'X:1\nK:C\nL:1/4\nC D E F G A B c|',
          interactiveElement: 'piano',
        },
        {
          heading: 'Understanding Steps',
          text: 'A half step is the smallest distance between two notes (like E to F, or any key to its immediate neighbor on piano). A whole step equals two half steps (like C to D). On piano, half steps have no key between them; whole steps have one key between.',
        },
        {
          heading: 'Building Other Major Scales',
          text: 'To build any major scale, start on your root note and follow W-W-H-W-W-W-H. For G major, this gives us G-A-B-C-D-E-F#-G (we need F# to maintain the pattern). Each major scale has a unique set of sharps or flats.',
          audioExample: 'X:1\nK:G\nL:1/4\nG A B c d e ^f g|',
        },
        {
          heading: 'Scale Degrees',
          text: 'Each note in a scale has a number (degree): 1 (tonic/home), 2, 3, 4, 5 (dominant), 6, 7 (leading tone), 8 (octave). These numbers help us discuss melody and harmony regardless of the key.',
        },
      ],
    },
  },
  {
    id: 'b-intervals-1',
    title: 'Introduction to Intervals',
    description: 'Understanding the distance between notes',
    level: 'beginner',
    category: 'intervals',
    duration: '15 min',
    objectives: [
      'Define what an interval is',
      'Count interval sizes',
      'Identify seconds, thirds, fourths, and fifths',
    ],
    content: {
      sections: [
        {
          heading: 'What is an Interval?',
          text: 'An interval is the distance in pitch between two notes. We measure intervals by counting letter names from one note to another, including both the starting and ending notes. C to E is a third (C-D-E = 3 letters). C to G is a fifth (C-D-E-F-G = 5 letters).',
          interactiveElement: 'piano',
        },
        {
          heading: 'Melodic vs Harmonic Intervals',
          text: 'When two notes are played one after another, it is a melodic interval (horizontal). When played together simultaneously, it is a harmonic interval (vertical). The size is counted the same way for both.',
        },
        {
          heading: 'Interval Sizes',
          text: 'Unison (same note), 2nd (one step apart), 3rd (skip one letter), 4th, 5th, 6th, 7th, 8ve (octave = same letter, different pitch). An octave spans 8 letter names and sounds like the same note higher or lower.',
        },
        {
          heading: 'Hearing Intervals',
          text: 'Each interval has a characteristic sound. A perfect 5th sounds open and stable (Star Wars theme). A major 3rd sounds happy (first two notes of a major chord). A minor 2nd sounds tense and dissonant (Jaws theme).',
        },
      ],
    },
  },
  {
    id: 'b-chords-1',
    title: 'Major & Minor Triads',
    description: 'Building your first chords',
    level: 'beginner',
    category: 'chords',
    duration: '20 min',
    objectives: [
      'Build major triads',
      'Build minor triads',
      'Hear the difference between major and minor',
    ],
    content: {
      sections: [
        {
          heading: 'What is a Triad?',
          text: 'A triad is a three-note chord built by stacking two intervals of a third. The bottom note is the root, the middle note is the third, and the top note is the fifth. Triads are the foundation of Western harmony.',
          interactiveElement: 'piano',
        },
        {
          heading: 'Major Triads',
          text: 'A major triad has a major 3rd on the bottom and a minor 3rd on top (root + 4 half steps + 3 half steps). C major = C-E-G. Major triads sound bright, happy, and stable. Play C-E-G together to hear it.',
          audioExample: 'X:1\nK:C\nL:1/4\n[CEG]4|',
        },
        {
          heading: 'Minor Triads',
          text: 'A minor triad has a minor 3rd on the bottom and a major 3rd on top (root + 3 half steps + 4 half steps). C minor = C-Eb-G. Minor triads sound dark, sad, or introspective. The only difference from major is the lowered 3rd!',
          audioExample: 'X:1\nK:C\nL:1/4\n[C_EG]4|',
        },
        {
          heading: 'The Sound Difference',
          text: 'Major = happy, bright, resolved. Minor = sad, dark, emotional. This single half-step change in the third creates completely different moods. Most songs use a mix of both to create emotional contrast.',
        },
      ],
    },
  },
  {
    id: 'b-chords-2',
    title: 'Reading Chord Symbols',
    description: 'Understanding chord notation in lead sheets',
    level: 'beginner',
    category: 'chords',
    duration: '15 min',
    objectives: [
      'Read basic chord symbols',
      'Know the difference between C, Cm, and C7',
      'Use chord symbols to accompany songs',
    ],
    content: {
      sections: [
        {
          heading: 'Basic Chord Symbols',
          text: 'A letter alone (C, D, G) means a major triad. A letter with lowercase "m" (Cm, Dm, Gm) means minor. This shorthand allows musicians to quickly read and play chord accompaniments.',
        },
        {
          heading: 'Seventh Chord Symbols',
          text: 'Adding "7" creates a dominant 7th chord (C7 = C-E-G-Bb). "maj7" means major 7th (Cmaj7 = C-E-G-B). "m7" means minor 7th (Cm7 = C-Eb-G-Bb). These add richness to basic triads.',
        },
        {
          heading: 'Other Common Symbols',
          text: 'Diminished (°) lowers the 5th. Augmented (+) raises the 5th. "sus4" replaces the 3rd with a 4th (Csus4 = C-F-G). Slash chords like C/E mean "C chord with E in the bass."',
        },
      ],
    },
  },
];

// Intermediate curriculum
export const INTERMEDIATE_LESSONS: TheoryLesson[] = [
  {
    id: 'i-rhythm-1',
    title: 'Compound Meter',
    description: 'Understanding 6/8, 9/8, and 12/8 time',
    level: 'intermediate',
    category: 'rhythm',
    duration: '25 min',
    objectives: [
      'Distinguish simple and compound meter',
      'Count in compound time signatures',
      'Write rhythms in 6/8',
    ],
    content: {
      sections: [
        {
          heading: 'Simple vs Compound Meter',
          text: 'In simple meter (2/4, 3/4, 4/4), each beat naturally divides into 2 equal parts. In compound meter (6/8, 9/8, 12/8), each beat divides into 3 equal parts, creating a lilting, dance-like feel often heard in Irish jigs, ballads, and sicilianas.',
          audioExample: 'X:1\nM:6/8\nL:1/8\nK:C\nCDE FGA | GFE DCB, |',
        },
        {
          heading: 'Counting in 6/8',
          text: 'In 6/8, there are 2 main beats per measure (not 6). Each beat contains 3 eighth notes. Count: "1-la-li 2-la-li" or "1-and-a 2-and-a". The dotted quarter note gets one beat because it equals three eighth notes.',
        },
        {
          heading: '9/8 and 12/8',
          text: '9/8 has 3 beats of 3 eighth notes each (like 3/4 but with triplet subdivision). 12/8 has 4 beats of 3 eighths each (like 4/4 with triplet feel). Blues shuffles often use 12/8 feel.',
        },
        {
          heading: 'Converting Between Feels',
          text: 'A triplet in simple meter sounds like the subdivision in compound meter. Writing "swing eighths" in jazz approximates 12/8 feel in 4/4. Understanding compound meter helps you play with authentic rhythmic feel.',
        },
      ],
    },
  },
  {
    id: 'i-rhythm-2',
    title: 'Syncopation & Rhythmic Displacement',
    description: 'Creating rhythmic interest through off-beat accents',
    level: 'intermediate',
    category: 'rhythm',
    duration: '20 min',
    objectives: [
      'Identify syncopated rhythms',
      'Perform off-beat accents',
      'Write syncopated passages',
    ],
    content: {
      sections: [
        {
          heading: 'What is Syncopation?',
          text: 'Syncopation places emphasis on normally weak beats or between beats, creating rhythmic tension and energy. Instead of accenting beats 1 and 3, syncopation might stress beats 2 and 4, or the "and" of beats.',
        },
        {
          heading: 'Common Syncopation Patterns',
          text: 'Ties across bar lines, accents on off-beats, and rests on strong beats all create syncopation. The pattern "quarter-eighth, quarter-eighth" in 4/4 (also called "big-little-big-little") is classic syncopation.',
          audioExample: 'X:1\nM:4/4\nL:1/8\nK:C\nC2 G C2 G C2 | D>CD>CD>CD2 |',
        },
        {
          heading: 'Syncopation in Genres',
          text: 'Jazz, funk, reggae, and Latin music rely heavily on syncopation. Reggae emphasizes beats 2 and 4. Funk puts the emphasis on "the one" but syncopates everything else. Classical music uses syncopation for surprise and energy.',
        },
      ],
    },
  },
  {
    id: 'i-scales-1',
    title: 'Minor Scales',
    description: 'Natural, harmonic, and melodic minor',
    level: 'intermediate',
    category: 'scales',
    duration: '30 min',
    objectives: [
      'Build the three forms of minor scales',
      'Understand when to use each form',
      'Relate minor to its relative major',
    ],
    content: {
      sections: [
        {
          heading: 'The Three Minor Scales',
          text: 'Minor keys have three scale forms: natural minor (Aeolian mode), harmonic minor (raised 7th), and melodic minor (raised 6th and 7th ascending, natural descending). Each serves different musical purposes.',
        },
        {
          heading: 'Natural Minor',
          text: 'The natural minor uses the same notes as its relative major, starting on scale degree 6. A natural minor shares notes with C major: A-B-C-D-E-F-G-A. The pattern is W-H-W-W-H-W-W.',
          audioExample: 'X:1\nK:Am\nL:1/4\nA B c d e f g a|',
        },
        {
          heading: 'Harmonic Minor',
          text: 'Harmonic minor raises the 7th degree to create a leading tone. A harmonic minor: A-B-C-D-E-F-G#-A. This creates an exotic sound with an augmented 2nd between 6 and 7, common in classical and metal.',
          audioExample: 'X:1\nK:Am\nL:1/4\nA B c d e f ^g a|',
        },
        {
          heading: 'Melodic Minor',
          text: 'Melodic minor raises both 6 and 7 ascending (to smooth the augmented 2nd), then uses natural minor descending. A melodic minor ascending: A-B-C-D-E-F#-G#-A. Jazz uses melodic minor ascending for both directions.',
          audioExample: 'X:1\nK:Am\nL:1/4\nA B c d e ^f ^g a|',
        },
        {
          heading: 'Relative Major/Minor',
          text: 'Every major key has a relative minor starting on its 6th degree (C major → A minor). They share the same key signature. Every minor key has a relative major a minor 3rd higher (A minor → C major).',
        },
      ],
    },
  },
  {
    id: 'i-scales-2',
    title: 'Introduction to Modes',
    description: 'The seven diatonic modes',
    level: 'intermediate',
    category: 'scales',
    duration: '25 min',
    objectives: [
      'Name and play all seven modes',
      'Recognize modal characteristics',
      'Use modes in improvisation',
    ],
    content: {
      sections: [
        {
          heading: 'What Are Modes?',
          text: 'Modes are scales derived from the major scale by starting on different degrees. Each mode has a unique character based on its pattern of whole and half steps. They predate major/minor and are used extensively in jazz, folk, and film music.',
        },
        {
          heading: 'The Seven Diatonic Modes',
          text: 'Starting from C major: Ionian (C-C, the major scale), Dorian (D-D, minor with raised 6), Phrygian (E-E, minor with lowered 2), Lydian (F-F, major with raised 4), Mixolydian (G-G, major with lowered 7), Aeolian (A-A, natural minor), Locrian (B-B, diminished, rarely used).',
        },
        {
          heading: 'Mode Characters',
          text: 'Dorian sounds jazzy and slightly sad. Phrygian sounds Spanish/exotic. Lydian sounds dreamy and floating. Mixolydian sounds bluesy and rock. Each mode evokes different emotions and cultural associations.',
        },
        {
          heading: 'Using Modes',
          text: 'To use D Dorian over a Dm7 chord, play the notes D-E-F-G-A-B-C-D. The raised 6th (B natural instead of Bb) gives Dorian its characteristic sound. Miles Davis\'s "So What" is a famous Dorian tune.',
        },
      ],
    },
  },
  {
    id: 'i-intervals-1',
    title: 'Interval Quality',
    description: 'Major, minor, perfect, augmented, diminished',
    level: 'intermediate',
    category: 'intervals',
    duration: '25 min',
    objectives: [
      'Identify interval quality accurately',
      'Calculate any interval from any note',
      'Distinguish perfect from imperfect intervals',
    ],
    content: {
      sections: [
        {
          heading: 'Perfect Intervals',
          text: 'Unisons, 4ths, 5ths, and octaves are "perfect" intervals. They occur naturally between the 1st and 4th, 1st and 5th, etc. of a major scale. Perfect intervals sound very stable and consonant.',
        },
        {
          heading: 'Major and Minor Intervals',
          text: '2nds, 3rds, 6ths, and 7ths come in major and minor qualities. Major intervals occur naturally in the major scale from the tonic. Minor intervals are one half step smaller than major. A major 3rd = 4 half steps; minor 3rd = 3 half steps.',
        },
        {
          heading: 'Augmented and Diminished',
          text: 'Augmented intervals are one half step larger than major or perfect. Diminished intervals are one half step smaller than minor or perfect. An augmented 4th (tritone) = 6 half steps = a diminished 5th.',
        },
        {
          heading: 'Calculating Intervals',
          text: 'First count letter names for the number (C to E = 3rd). Then count half steps to determine quality. C to E = 4 half steps = major 3rd. C to Eb = 3 half steps = minor 3rd. C to E# = 5 half steps = augmented 3rd.',
        },
      ],
    },
  },
  {
    id: 'i-chords-1',
    title: 'Seventh Chords',
    description: 'Major 7th, minor 7th, and dominant 7th',
    level: 'intermediate',
    category: 'chords',
    duration: '25 min',
    objectives: [
      'Build four-note chords',
      'Identify seventh chord qualities',
      'Use seventh chords in progressions',
    ],
    content: {
      sections: [
        {
          heading: 'Adding the Seventh',
          text: 'Seventh chords add a fourth note (the 7th) to the triad. This creates richer, more colorful harmonies. Jazz, R&B, and classical music use seventh chords extensively.',
        },
        {
          heading: 'Major 7th Chords',
          text: 'A major 7th chord = major triad + major 7th. Cmaj7 = C-E-G-B. The major 7th is just one half step below the root. Major 7th chords sound dreamy, sophisticated, and slightly unresolved.',
          audioExample: 'X:1\nK:C\nL:1/4\n[CEGB]4|',
        },
        {
          heading: 'Dominant 7th Chords',
          text: 'A dominant 7th chord = major triad + minor 7th. C7 = C-E-G-Bb. This creates tension that wants to resolve down a 5th (C7 → F). Dominant 7ths are essential for blues and jazz.',
          audioExample: 'X:1\nK:C\nL:1/4\n[CEG_B]4|',
        },
        {
          heading: 'Minor 7th Chords',
          text: 'A minor 7th chord = minor triad + minor 7th. Cm7 = C-Eb-G-Bb. Minor 7ths sound mellow and are the most common chord quality in jazz. The ii-V-I progression uses minor 7th on the ii chord.',
          audioExample: 'X:1\nK:C\nL:1/4\n[C_EG_B]4|',
        },
        {
          heading: 'Other Seventh Chord Types',
          text: 'Half-diminished (m7b5) = diminished triad + minor 7th, sounds tense. Diminished 7th = diminished triad + diminished 7th, sounds very tense and symmetrical. Minor-major 7th = minor triad + major 7th, sounds mysterious.',
        },
      ],
    },
  },
  {
    id: 'i-harmony-1',
    title: 'Chord Progressions',
    description: 'Common patterns in Western music',
    level: 'intermediate',
    category: 'harmony',
    duration: '30 min',
    objectives: [
      'Analyze chord progressions with Roman numerals',
      'Identify I-IV-V-I and ii-V-I progressions',
      'Write chord progressions',
    ],
    content: {
      sections: [
        {
          heading: 'Roman Numeral Analysis',
          text: 'We use Roman numerals to show the function of each chord in a key. Uppercase = major (I, IV, V), lowercase = minor (ii, iii, vi). This lets us discuss progressions independent of key. "I-V-vi-IV" means the same pattern in any key.',
        },
        {
          heading: 'The I-IV-V Progression',
          text: 'The I-IV-V progression (tonic-subdominant-dominant) is the foundation of Western music. In C: C-F-G. Adding the I at the end (I-IV-V-I) creates a complete harmonic journey. Countless rock, folk, and pop songs use only these three chords.',
        },
        {
          heading: 'The ii-V-I Progression',
          text: 'The ii-V-I is the most important progression in jazz. In C: Dm7-G7-Cmaj7. The ii chord sets up the V (dominant), which resolves strongly to I. It creates smooth voice leading and is used in countless jazz standards.',
        },
        {
          heading: 'The I-V-vi-IV Progression',
          text: 'This four-chord progression appears in hundreds of pop songs: "Let It Be," "No Woman No Cry," "With or Without You." In C: C-G-Am-F. It cycles through stable (I), tension (V), relative minor emotion (vi), and subdominant warmth (IV).',
        },
        {
          heading: 'Secondary Dominants',
          text: 'A secondary dominant is a V chord that "belongs to" a chord other than I. V/V (five of five) in C is D7, resolving to G. These add color and harmonic motion, briefly tonicizing other chords.',
        },
      ],
    },
  },
  {
    id: 'i-ear-1',
    title: 'Interval Recognition',
    description: 'Training your ear to identify intervals',
    level: 'intermediate',
    category: 'ear-training',
    duration: '20 min',
    objectives: [
      'Identify intervals by ear',
      'Use song references for intervals',
      'Practice interval dictation',
    ],
    content: {
      sections: [
        {
          heading: 'Why Train Your Ear?',
          text: 'Ear training connects what you hear to what you know intellectually. It allows you to transcribe music, play by ear, improvise, and catch mistakes. Interval recognition is the foundation of melodic ear training.',
        },
        {
          heading: 'Song References',
          text: 'Associate each interval with a famous song: Minor 2nd = "Jaws" theme. Major 2nd = "Happy Birthday" first two notes. Minor 3rd = "Smoke on the Water." Major 3rd = "Oh When the Saints." Perfect 4th = "Here Comes the Bride." Perfect 5th = "Star Wars" theme. Major 6th = "NBC" chimes. Octave = "Somewhere Over the Rainbow."',
        },
        {
          heading: 'Ascending vs Descending',
          text: 'Intervals sound different going up vs down. Practice both directions. "Somewhere Over the Rainbow" starts with an ascending octave. "What a Wonderful World" starts with a descending 5th.',
        },
        {
          heading: 'Practice Method',
          text: 'Start with just 2-3 intervals, master those, then add more. Sing intervals back after hearing them. Use apps like Teoria or Musictheory.net for drills. Practice daily in short sessions.',
        },
      ],
    },
  },
  {
    id: 'i-ear-2',
    title: 'Chord Quality Recognition',
    description: 'Hearing major, minor, diminished, and augmented',
    level: 'intermediate',
    category: 'ear-training',
    duration: '20 min',
    objectives: [
      'Distinguish chord qualities by ear',
      'Identify seventh chord types',
      'Recognize chord inversions',
    ],
    content: {
      sections: [
        {
          heading: 'Major vs Minor',
          text: 'Major chords sound bright, happy, stable. Minor chords sound dark, sad, introspective. Focus on the 3rd of the chord—that single note determines the character. Practice with familiar songs in major vs minor.',
        },
        {
          heading: 'Diminished and Augmented',
          text: 'Diminished triads sound tense and unstable, like something scary is about to happen. Augmented triads sound unresolved and "floaty," often used in transitions. Neither has a stable perfect 5th.',
        },
        {
          heading: 'Seventh Chord Sounds',
          text: 'Major 7th = dreamy, sophisticated. Dominant 7th = bluesy, wants to resolve. Minor 7th = smooth, jazzy. Diminished 7th = dramatic tension. Each creates a distinct emotional color.',
        },
        {
          heading: 'Inversions',
          text: 'An inversion changes which note is lowest without changing chord quality. Root position sounds most stable. First inversion sounds lighter. Second inversion sounds unstable and often cadential. Learn to identify the bass note separately.',
        },
      ],
    },
  },
];

// Expert curriculum
export const EXPERT_LESSONS: TheoryLesson[] = [
  {
    id: 'e-harmony-1',
    title: 'Voice Leading',
    description: 'Smooth chord connections in four-part harmony',
    level: 'expert',
    category: 'harmony',
    duration: '40 min',
    objectives: [
      'Apply voice leading rules',
      'Avoid parallel fifths and octaves',
      'Write smooth SATB progressions',
    ],
    content: {
      sections: [
        {
          heading: 'The Principles of Voice Leading',
          text: 'Good voice leading creates smooth melodic lines in each voice while maintaining proper harmonic relationships. The goal is minimal motion—keep common tones, move other voices by step when possible.',
        },
        {
          heading: 'The Four-Part Texture',
          text: 'SATB (Soprano, Alto, Tenor, Bass) writing follows specific rules: each voice stays in its range, voices don\'t cross, intervals between adjacent voices stay reasonable (generally not more than an octave, except between tenor and bass).',
        },
        {
          heading: 'Forbidden Parallels',
          text: 'Parallel fifths and octaves are avoided in classical voice leading because they undermine voice independence—the two voices sound like one. Move in contrary or oblique motion instead. Parallel thirds and sixths are encouraged.',
        },
        {
          heading: 'Doubling Rules',
          text: 'In root position, double the root. In first inversion, double the soprano or the root, not the bass. Never double the leading tone. In diminished chords, double the third. These rules maintain voice independence.',
        },
        {
          heading: 'Cadential Voice Leading',
          text: 'At cadences, the leading tone (7th scale degree) must resolve up to the tonic. The 4th scale degree typically resolves down to the 3rd. Perfect authentic cadences (V-I with soprano on 1) are the strongest.',
        },
      ],
    },
  },
  {
    id: 'e-harmony-2',
    title: 'Modulation Techniques',
    description: 'Changing keys smoothly within a piece',
    level: 'expert',
    category: 'harmony',
    duration: '35 min',
    objectives: [
      'Identify common modulation types',
      'Use pivot chords effectively',
      'Analyze modulations in real music',
    ],
    content: {
      sections: [
        {
          heading: 'What is Modulation?',
          text: 'Modulation is the process of changing from one key to another within a piece. Unlike temporary tonicization, a true modulation establishes the new key through cadential confirmation. Modulation adds variety and emotional journey.',
        },
        {
          heading: 'Pivot Chord Modulation',
          text: 'The most common technique uses a pivot chord—a chord that exists in both the old and new keys. The chord "pivots" from its old function to its new function. For example, C major\'s Am can become ii in G major.',
        },
        {
          heading: 'Direct Modulation',
          text: 'Also called phrase modulation, this abruptly shifts to a new key at a phrase boundary without a pivot. Common in pop music—jumping up a half or whole step for the final chorus. Effective but less smooth.',
        },
        {
          heading: 'Sequential Modulation',
          text: 'A pattern repeated at a different pitch level can gradually shift the tonal center. Sequences can move through multiple keys quickly, creating harmonic momentum. Common in development sections.',
        },
        {
          heading: 'Chromatic and Enharmonic Modulation',
          text: 'Using chromatic voice leading or enharmonic reinterpretation of a chord (C# = Db) allows modulation to distant keys. Diminished 7th chords are enharmonically ambiguous, allowing modulation anywhere.',
        },
      ],
    },
  },
  {
    id: 'e-counterpoint-1',
    title: 'Species Counterpoint',
    description: 'Writing melody against melody',
    level: 'expert',
    category: 'counterpoint',
    duration: '45 min',
    objectives: [
      'Write first and second species counterpoint',
      'Understand consonance and dissonance treatment',
      'Create independent melodic lines',
    ],
    content: {
      sections: [
        {
          heading: 'What is Counterpoint?',
          text: 'Counterpoint is the art of combining multiple independent melodic lines that work together harmonically. Unlike homophony (melody + accompaniment), counterpoint treats each voice as equally important. Bach is the master.',
        },
        {
          heading: 'The Cantus Firmus',
          text: 'Species counterpoint uses a cantus firmus (fixed melody) in whole notes. You write a counterpoint against it following specific rules. The CF should have one climax, mostly stepwise motion, and proper shape.',
        },
        {
          heading: 'First Species: Note Against Note',
          text: 'In first species, each note aligns with one CF note. Use only consonances (unisons, 3rds, 5ths, 6ths, octaves). Begin and end on perfect consonances. Avoid parallel 5ths/8ves. Prefer contrary motion.',
        },
        {
          heading: 'Second Species: Two Against One',
          text: 'Two notes against each CF note. Dissonance allowed on weak beats as passing tones. Strong beats must be consonant. Creates more melodic interest while maintaining harmonic clarity.',
        },
        {
          heading: 'Higher Species',
          text: 'Third species: 4 notes per CF note with more dissonance options. Fourth species: suspensions create tension-resolution patterns. Fifth species (florid): combines all previous species freely. Each builds on previous skills.',
        },
      ],
    },
  },
  {
    id: 'e-form-1',
    title: 'Sonata Form',
    description: 'The structure of classical compositions',
    level: 'expert',
    category: 'form',
    duration: '35 min',
    objectives: [
      'Identify exposition, development, and recapitulation',
      'Analyze modulations in sonata form',
      'Understand thematic development',
    ],
    content: {
      sections: [
        {
          heading: 'The Three Main Sections',
          text: 'Sonata form consists of exposition (presenting themes), development (exploring and transforming themes), and recapitulation (returning to original material). This form dominated classical symphonies, sonatas, and concertos.',
        },
        {
          heading: 'The Exposition',
          text: 'The exposition presents two contrasting themes in different keys. Theme 1 is in the tonic, followed by a transition that modulates. Theme 2 is typically in the dominant (or relative major if minor key). A closing theme ends the section.',
        },
        {
          heading: 'The Development',
          text: 'The development takes thematic material and transforms it—fragmentation, sequence, new keys, combination of themes. It\'s the most harmonically unstable section, exploring remote keys and building tension for the return.',
        },
        {
          heading: 'The Recapitulation',
          text: 'The recap restates exposition material, but now both themes stay in the tonic key. The transition is rewritten to avoid modulation. This "resolves" the tonal conflict of the exposition.',
        },
        {
          heading: 'Coda and Extensions',
          text: 'An optional coda adds final material after the recap. Some sonata forms include a slow introduction before the exposition. Later composers expanded and modified the form creatively while maintaining its basic principles.',
        },
      ],
    },
  },
  {
    id: 'e-form-2',
    title: 'Fugue Structure',
    description: 'The architecture of imitative polyphony',
    level: 'expert',
    category: 'form',
    duration: '40 min',
    objectives: [
      'Identify subject and answer',
      'Recognize episodes and entries',
      'Analyze a complete fugue',
    ],
    content: {
      sections: [
        {
          heading: 'What is a Fugue?',
          text: 'A fugue is a contrapuntal composition where a theme (subject) is introduced and then imitated by other voices at different pitch levels. Bach\'s Well-Tempered Clavier contains 48 fugues, two in each major and minor key.',
        },
        {
          heading: 'Subject and Answer',
          text: 'The subject is the main theme, stated first by one voice. The answer is the subject transposed to the dominant (5th higher). A "real" answer is exact transposition; a "tonal" answer adjusts intervals to maintain harmonic sense.',
        },
        {
          heading: 'Exposition',
          text: 'The exposition introduces the subject in each voice successively. A 3-voice fugue: Voice 1 states subject, Voice 2 enters with answer while Voice 1 plays countersubject, Voice 3 enters with subject while others continue.',
        },
        {
          heading: 'Episodes',
          text: 'Episodes are passages between subject entries. They develop motifs from the subject, modulate to new keys, and create contrast. Episodes often use sequences to build momentum and prepare new entries.',
        },
        {
          heading: 'Stretto and Other Devices',
          text: 'Stretto overlaps subject entries before each completes—increases intensity. Augmentation doubles note values. Diminution halves them. Inversion flips intervals. These devices showcase the subject\'s versatility.',
        },
      ],
    },
  },
  {
    id: 'e-chords-1',
    title: 'Extended Harmony',
    description: '9th, 11th, and 13th chords',
    level: 'expert',
    category: 'chords',
    duration: '30 min',
    objectives: [
      'Build extended chords',
      'Voice extended chords effectively',
      'Use extensions in jazz progressions',
    ],
    content: {
      sections: [
        {
          heading: 'Beyond the Seventh',
          text: 'Extended chords add the 9th, 11th, and 13th above the root. These are the 2nd, 4th, and 6th raised by an octave. C13 contains: C-E-G-Bb-D-F-A. In practice, we voice selectively—not all notes are played.',
        },
        {
          heading: 'Ninth Chords',
          text: 'The 9th adds color above the 7th. Dominant 9 (C9) = C7 + D. Major 9 (Cmaj9) = Cmaj7 + D. Minor 9 (Cm9) = Cm7 + D. Altered 9ths (b9, #9) are common in jazz—Jimi Hendrix\'s "Purple Haze" features the #9.',
        },
        {
          heading: 'Eleventh and Thirteenth Chords',
          text: 'The 11th (4th up an octave) is often avoided in dominant chords because it clashes with the 3rd—use sus4 instead. The 13th (6th up an octave) adds brightness. Full 13th chords are common in jazz endings.',
        },
        {
          heading: 'Voicing Extended Chords',
          text: 'You rarely play all notes. Root and 5th are often omitted (bass handles root; 5th adds little color). Essential: 3rd (determines major/minor), 7th, and the extensions you want. Spread voices for clarity.',
        },
        {
          heading: 'Alterations',
          text: 'Altered dominants modify the 5th and 9th: 7#5, 7b5, 7#9, 7b9, 7alt (all alterations). These create maximum tension before resolution. "The Altered Scale" (melodic minor up a half step from root) covers all alterations.',
        },
      ],
    },
  },
  {
    id: 'e-ear-1',
    title: 'Advanced Dictation',
    description: 'Four-part harmonic dictation',
    level: 'expert',
    category: 'ear-training',
    duration: '35 min',
    objectives: [
      'Transcribe four-part harmony',
      'Identify chord inversions by ear',
      'Notate complex rhythms',
    ],
    content: {
      sections: [
        {
          heading: 'Hearing Multiple Voices',
          text: 'Advanced dictation requires hearing each voice independently while understanding their harmonic relationship. Start by identifying bass and soprano (outer voices), then fill in the inner voices.',
        },
        {
          heading: 'Bass Line First',
          text: 'The bass line determines inversions and root movement. Listen for bass patterns: descending fifths (circle progression), stepwise bass (passing chords), pedal tones (static bass while harmony moves).',
        },
        {
          heading: 'Soprano Line Second',
          text: 'The melody is usually in soprano. After bass, transcribe this line. Now you have the harmonic framework—the "shell" of each chord. Inner voices fill in the remaining tones.',
        },
        {
          heading: 'Identifying Chords',
          text: 'With bass and soprano, deduce the chord. If bass is C and soprano is E, it\'s likely C major in root position or Am in first inversion. Context and surrounding chords confirm the analysis.',
        },
        {
          heading: 'Transcription Strategy',
          text: 'First listening: overall form and key. Second: bass line and cadences. Third: soprano melody. Fourth: chord qualities. Fifth: inner voices. Multiple passes build accuracy—don\'t try to get everything at once.',
        },
      ],
    },
  },
  {
    id: 'e-counterpoint-2',
    title: 'Invertible Counterpoint',
    description: 'Counterpoint that works when inverted',
    level: 'expert',
    category: 'counterpoint',
    duration: '35 min',
    objectives: [
      'Write counterpoint at the octave',
      'Write counterpoint at the tenth and twelfth',
      'Use invertible counterpoint in fugues',
    ],
    content: {
      sections: [
        {
          heading: 'What is Invertible Counterpoint?',
          text: 'Invertible (or double) counterpoint is written so two voices can swap positions—what was on top moves to the bottom and vice versa. This requires following special rules so the inverted version remains correct.',
        },
        {
          heading: 'Counterpoint at the Octave',
          text: 'When inverted at the octave, intervals invert numerically: 2nds become 7ths, 3rds become 6ths, 4ths become 5ths. Since 5ths become 4ths (which must be treated as dissonances in the bass), avoid 5ths in octave-invertible counterpoint.',
        },
        {
          heading: 'Counterpoint at the Tenth',
          text: 'Inversion at the 10th (octave + 3rd): 3rds become octaves, 6ths become 5ths. This is useful when one voice should harmonize a third above/below. Avoid parallel 3rds and 6ths as they become parallel octaves and 5ths.',
        },
        {
          heading: 'Counterpoint at the Twelfth',
          text: 'Inversion at the 12th (octave + 5th) is used for triple fugue subjects. 5ths become octaves, so use 5ths sparingly. Bach used this extensively in his complex fugues.',
        },
        {
          heading: 'Application in Fugue',
          text: 'Invertible counterpoint allows a fugue subject and countersubject to swap places in different entries. This creates variety while maintaining thematic unity. It\'s essential for triple and quadruple fugues.',
        },
      ],
    },
  },
];

// Common problems by level
export const COMMON_PROBLEMS: Record<SkillLevel, string[]> = {
  beginner: [
    'Confusing treble and bass clef note names',
    'Counting rests incorrectly',
    'Not understanding time signature meaning',
    'Confusing sharps and flats',
    'Difficulty hearing major vs minor',
    'Trouble with syncopation',
  ],
  intermediate: [
    'Building minor scales incorrectly',
    'Confusing interval quality (major/minor/perfect)',
    'Voice leading parallel fifths/octaves',
    'Seventh chord inversions',
    'Hearing chord quality in progressions',
    'Understanding compound meter subdivision',
  ],
  expert: [
    'Analyzing complex modulations',
    'Writing effective counterpoint',
    'Voicing extended chords',
    'Hearing all voices in four-part harmony',
    'Understanding augmented 6th chords',
    'Analyzing contemporary harmonic language',
  ],
};

// Get all lessons for a level
export function getLessonsForLevel(level: SkillLevel): TheoryLesson[] {
  switch (level) {
    case 'beginner':
      return BEGINNER_LESSONS;
    case 'intermediate':
      return INTERMEDIATE_LESSONS;
    case 'expert':
      return EXPERT_LESSONS;
    default:
      return [];
  }
}

// Get lessons for a category
export function getLessonsForCategory(category: TheoryCategory): TheoryLesson[] {
  return [...BEGINNER_LESSONS, ...INTERMEDIATE_LESSONS, ...EXPERT_LESSONS].filter(
    (lesson) => lesson.category === category
  );
}
