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
          text: 'Music is written on a set of five horizontal lines called a staff. Notes are placed on these lines and in the spaces between them to indicate pitch.',
          interactiveElement: 'staff',
        },
        {
          heading: 'The Treble Clef',
          text: 'The treble clef (𝄞) is used for higher-pitched instruments and voices. The curl of the clef wraps around the G line, which is why it\'s also called the G clef.',
          examples: [
            {
              type: 'notation',
              data: 'X:1\nK:C clef=treble\nE F G A B c d e|',
              caption: 'Notes on the treble clef staff',
            },
          ],
        },
        {
          heading: 'The Bass Clef',
          text: 'The bass clef (𝄢) is used for lower-pitched instruments and voices. The two dots surround the F line, hence it\'s also called the F clef.',
          examples: [
            {
              type: 'notation',
              data: 'X:1\nK:C clef=bass\nG, A, B, C D E F G|',
              caption: 'Notes on the bass clef staff',
            },
          ],
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
          explanation: 'A standard musical staff consists of 5 horizontal lines.',
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
          text: 'Notes have different durations. A whole note lasts 4 beats, a half note 2 beats, a quarter note 1 beat, and an eighth note half a beat.',
          audioExample: 'X:1\nM:4/4\nL:1/4\nK:C\nC4 | C2 C2 | C C C C | C/2 C/2 C/2 C/2 C/2 C/2 C/2 C/2 |',
        },
        {
          heading: 'Rests',
          text: 'For every note value, there is an equivalent rest that indicates silence for that duration.',
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
          text: 'A major scale follows the pattern: Whole-Whole-Half-Whole-Whole-Whole-Half (W-W-H-W-W-W-H)',
          audioExample: 'X:1\nK:C\nL:1/4\nC D E F G A B c|',
          interactiveElement: 'piano',
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
      'Identify seconds, thirds, and fifths',
    ],
    content: {
      sections: [
        {
          heading: 'What is an Interval?',
          text: 'An interval is the distance in pitch between two notes. We measure intervals by counting the letter names from one note to another.',
          interactiveElement: 'piano',
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
          text: 'A triad is a three-note chord built in thirds. The most common types are major (happy sound) and minor (sad sound).',
          interactiveElement: 'piano',
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
          heading: 'Compound vs Simple Meter',
          text: 'In compound meter, each beat divides naturally into three parts, creating a lilting, dance-like feel.',
          audioExample: 'X:1\nM:6/8\nL:1/8\nK:C\nCDE FGA | GFE DCB, |',
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
          text: 'Minor keys have three scale forms: natural, harmonic (raised 7th), and melodic (raised 6th and 7th ascending).',
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
          text: 'Seventh chords add a fourth note to the triad, creating richer harmonies used extensively in jazz and classical music.',
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
          text: 'We use Roman numerals to show the function of each chord in a key, with uppercase for major and lowercase for minor.',
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
          heading: 'Song References',
          text: 'Each interval has a characteristic sound. Using familiar songs can help you recognize intervals quickly.',
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
          text: 'Good voice leading creates smooth melodic lines in each voice while maintaining proper harmonic relationships.',
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
      'Write first species counterpoint',
      'Understand consonance and dissonance treatment',
      'Create independent melodic lines',
    ],
    content: {
      sections: [
        {
          heading: 'First Species: Note Against Note',
          text: 'In first species counterpoint, each note in the counterpoint aligns with one note in the cantus firmus, creating a simple harmonic relationship.',
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
          text: 'Sonata form consists of an exposition (presenting themes), development (exploring and transforming themes), and recapitulation (returning to original material).',
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
          text: 'Extended chords add the 9th, 11th, and 13th above the root, creating the lush harmonies characteristic of jazz and contemporary music.',
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
          text: 'Advanced dictation requires hearing each voice independently while understanding their harmonic relationship.',
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
