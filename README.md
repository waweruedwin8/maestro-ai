# 🎵 Maestro AI - Adaptive Music Workspace

<div align="center">

![Maestro AI Logo](https://img.shields.io/badge/Maestro_AI-🎼_Adaptive_Music_Workspace-6366f1?style=for-the-badge)

**An AI-powered music assistant for choral rehearsal, composition, and music theory education**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Preview-22c55e?style=for-the-badge)](https://id-preview--9de30b64-7e49-4aee-89ca-908de6ea0a61.lovable.app)
[![Built with React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff?style=flat-square&logo=vite)](https://vitejs.dev)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [API Reference](#-api-reference)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Hackathon Notes](#-hackathon-notes)

---

## 🎯 Overview

**Maestro AI** is an adaptive music workspace that uses generative UI principles to dynamically render the right musical tools based on user intent. Instead of navigating complex menus, users simply describe what they need in natural language, and the appropriate interactive component appears.

### Problem Statement

- Choir singers often struggle to learn their individual parts quickly before rehearsals
- Music educators need interactive tools to explain theory concepts visually
- Composers want to quickly prototype rhythmic ideas without complex notation software
- Existing music software has steep learning curves

### Solution

Maestro AI provides a conversational interface that:
1. **Understands intent** - Parses natural language to determine what tool the user needs
2. **Renders contextual UI** - Dynamically displays the appropriate musical component
3. **Provides real-time feedback** - Audio playback with accurate rhythmic representation

---

## 🌐 Live Demo

**Preview URL:** [https://id-preview--9de30b64-7e49-4aee-89ca-908de6ea0a61.lovable.app](https://id-preview--9de30b64-7e49-4aee-89ca-908de6ea0a61.lovable.app)

### Demo Walkthrough for Judges

1. **Open the app** - You'll see the Maestro AI chat interface
2. **Try practice mode**: Type "Help me practice the Alto line for Amazing Grace"
   - The Panic Practice Mode component will render with the alto part
   - Use the play button to hear the part with visual note highlighting
3. **Try composer mode**: Type "Create a syncopated rhythm in 6/16 with quavers and semiquavers"
   - The Composer Mode will render with ABC notation displayed on staff
   - Press Play to hear the exact rhythm you requested
4. **Try theory mode**: Type "Why does a minor chord sound sad?"
   - The Theory Teacher component will show an interactive piano with highlighted notes
5. **Upload a sheet**: Type "Upload a music sheet" then drag/drop a PDF or image

---

## ✨ Key Features

### 1. 🎭 Panic Practice Mode
Help choir singers quickly find and practice their specific voice part.

- **Voice Part Selection**: Soprano, Alto, Tenor, Bass
- **Tempo Control**: Adjust playback speed
- **Visual Score**: Real-time note highlighting during playback
- **Loop Sections**: Practice difficult passages repeatedly

### 2. ✍️ Composer Mode
Turn musical ideas into notation instantly.

- **ABC Notation Rendering**: Full staff display using abcjs
- **Duration-Aware Playback**: Syncopation, dotted notes, and complex rhythms play accurately
- **Transposition**: Shift compositions to any key
- **Harmonization**: Auto-add thirds to melodies
- **Export**: Download as SVG

### 3. 📚 Theory Teacher Mode
Interactive music theory explanations.

- **Interactive Piano**: Visual keyboard with highlighted notes
- **Chord Analysis**: Major, minor, dominant 7th explanations
- **Scale Visualization**: See intervals and patterns

### 4. 📄 Sheet Music Upload
Import existing music from various formats.

- **Supported Formats**: PDF, PNG, JPG, MIDI
- **AI Transcription**: Converts images to ABC notation
- **Part Extraction**: Identifies SATB voice parts

---

## 🔌 Powered By

<div align="center">

| Technology | Role | Description |
|:----------:|:----:|:------------|
| ![Tambo](https://img.shields.io/badge/Tambo-Generative_UI-6366f1?style=flat-square) | **UI Framework** | Enables dynamic component rendering based on AI intent analysis |
| ![abcjs](https://img.shields.io/badge/abcjs-Music_Notation-f59e0b?style=flat-square) | **Notation Engine** | Renders professional sheet music from ABC notation format |
| ![Tone.js](https://img.shields.io/badge/Tone.js-Audio_Engine-22c55e?style=flat-square) | **Audio Synthesis** | Web Audio API wrapper for precise rhythmic playback |
| ![Gemini](https://img.shields.io/badge/Gemini-AI_Brain-4285f4?style=flat-square&logo=google) | **AI Model** | Powers intent detection and music composition generation |
| ![Lovable](https://img.shields.io/badge/Lovable-Rapid_Prototyping-ec4899?style=flat-square) | **Development** | AI-assisted rapid application development platform |

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  MaestroChat.tsx                                             │
│  ├─ User Input → Edge Function → Gemini AI Analysis         │
│  ├─ Component Decision (panic-practice|composer|theory)     │
│  └─ Tambo-style Dynamic Component Rendering                  │
├─────────────────────────────────────────────────────────────┤
│  Interactive Components                                      │
│  ├─ PanicPracticeMode   → Voice part isolation + playback   │
│  ├─ ComposerMode        → LiveStaffEditor + audio engine    │
│  ├─ TheoryTeacherMode   → Interactive piano + explanations  │
│  └─ MusicSheetUpload    → PDF/Image → ABC transcription     │
├─────────────────────────────────────────────────────────────┤
│  Audio Engine (Tone.js)                                      │
│  ├─ useAudioEngine hook                                      │
│  ├─ playMelodyWithDurations() ← Accurate rhythmic playback  │
│  └─ parseAbcWithDurations() ← Duration extraction           │
├─────────────────────────────────────────────────────────────┤
│  Notation Rendering (abcjs)                                  │
│  ├─ ABC notation → SVG staff rendering                       │
│  └─ Multiple voice support (SATB)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Lovable Cloud)                    │
├─────────────────────────────────────────────────────────────┤
│  Edge Functions                                              │
│  ├─ maestro-chat        → Gemini AI intent + tool calls     │
│  └─ process-music-sheet → OCR/AI transcription              │
├─────────────────────────────────────────────────────────────┤
│  Database                                                    │
│  └─ uploaded_sheets     → Stored transcriptions             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | React 18 | UI Components |
| **Language** | TypeScript 5 | Type Safety |
| **Build Tool** | Vite 5 | Fast Development |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **UI Components** | shadcn/ui | Accessible Components |
| **Animation** | Framer Motion | Smooth Transitions |
| **Music Notation** | abcjs | Staff Rendering |
| **Audio Synthesis** | Tone.js | Web Audio Playback |
| **Backend** | Supabase | Database + Edge Functions |
| **AI** | Gemini 3 Flash | Intent Analysis |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **bun** package manager
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/waweruedwin8/maestro-ai.git
cd maestro-ai

# 2. Install dependencies
npm install
# or
bun install

# 3. Set up environment variables
# Create a .env file
# Required variables are auto-configured when using Lovable Cloud

# 4. Start development server
npm run dev
# or
bun dev

# 5. Open in browser
# Navigate to http://localhost:5173
```

### Environment Variables

When running locally without Lovable Cloud, you'll need:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

> **Note:** If using Lovable Cloud, these are automatically configured.

---

## 📁 Project Structure

```
maestro-ai/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   └── MaestroChat.tsx       # Main conversational interface
│   │   ├── music/
│   │   │   ├── ComposerMode.tsx      # Composition workspace
│   │   │   ├── LiveStaffEditor.tsx   # ABC notation editor + playback
│   │   │   ├── PanicPracticeMode.tsx # Voice part practice
│   │   │   ├── TheoryTeacherMode.tsx # Theory explanations
│   │   │   ├── InteractivePiano.tsx  # Visual keyboard
│   │   │   ├── Metronome.tsx         # Tempo keeper
│   │   │   └── MusicSheetUpload.tsx  # File import
│   │   └── ui/                       # shadcn components
│   ├── hooks/
│   │   ├── useAudioEngine.ts         # Tone.js wrapper
│   │   ├── useMetronome.ts           # Beat tracking
│   │   └── useChoirSampler.ts        # Voice samples
│   ├── utils/
│   │   ├── abcDurationParser.ts      # ABC → Note+Duration
│   │   ├── abcParser.ts              # ABC parsing utilities
│   │   └── scoreUtils.ts             # Score manipulation
│   ├── types/
│   │   └── music.ts                  # TypeScript interfaces
│   ├── pages/
│   │   └── Index.tsx                 # Main page
│   └── integrations/
│       └── supabase/                 # Auto-generated client
├── supabase/
│   └── functions/
│       ├── maestro-chat/             # AI intent analysis
│       └── process-music-sheet/      # Transcription
├── public/
└── package.json
```

---

## ⚙️ How It Works

### 1. Intent Analysis Pipeline

```typescript
// User types: "Create a syncopated rhythm in 6/16"
// ↓
// maestro-chat edge function receives request
// ↓
// AI analyzes intent with tool-calling:
{
  component_type: "composer",
  props: {
    abc_notation: "X:1\nM:6/16\nL:1/16\nK:C\n| z C D E>F z | G z A B c z |]",
    timeSignature: "6/16",
    key: "C"
  }
}
// ↓
// Frontend renders ComposerMode with props
// ↓
// LiveStaffEditor parses ABC, renders staff, enables playback
```

### 2. Duration-Aware Playback

The key innovation for accurate rhythmic playback:

```typescript
// abcDurationParser.ts extracts notes WITH durations
const notes = parseAbcWithDurations(abcNotation);
// → [
//   { note: "C5", duration: "16n", durationValue: 0.25 },
//   { note: "D5", duration: "8n.", durationValue: 0.75 },  // dotted
//   { note: "rest", duration: "16n", durationValue: 0.25 },
// ]

// useAudioEngine schedules each note at correct time
await playMelodyWithDurations(notes, tempo);
```

---

## 📡 API Reference

### Edge Functions

#### `maestro-chat`

Analyzes user messages and returns component decisions.

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "previous message" }],
  "userMessage": "Create a melody in G major"
}
```

**Response:**
```json
{
  "content": "Here's your composition!",
  "component": {
    "type": "composer",
    "props": {
      "abc_notation": "X:1\nK:G\n...",
      "key": "G"
    }
  }
}
```

#### `process-music-sheet`

Transcribes uploaded music files.

**Request:** FormData with file

**Response:**
```json
{
  "id": "uuid",
  "title": "Extracted Title",
  "abc_notation": "X:1\n...",
  "parts": { "soprano": "...", "alto": "..." }
}
```

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Conversational interface with intent detection
- [x] Panic Practice Mode with SATB parts
- [x] Composer Mode with ABC notation rendering
- [x] Duration-aware playback (syncopation, dotted notes)
- [x] Theory Teacher Mode with interactive piano
- [x] Sheet music upload and transcription
- [x] Metronome with pitch pipe
- [x] Key transposition

### 🚧 In Progress
- [ ] Real-time collaboration for ensemble practice
- [ ] MIDI export from compositions
- [ ] Sight-reading exercises generator

### 📋 Planned
- [ ] Voice recording + pitch detection for practice feedback
- [ ] Chord progression generator
- [ ] Mobile-optimized practice mode
- [ ] Offline capability (PWA)
- [ ] Integration with MuseScore/Finale imports
- [ ] AI-powered arrangement suggestions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 🏆 Hackathon Notes

### Judges: What to Look For

1. **Generative UI in Action**: The chat interface dynamically renders different components based on user intent - no static navigation
2. **Real-time Audio**: Accurate playback of complex rhythms using Web Audio API
3. **AI Integration**: Gemini 3 Flash for intent analysis and component prop generation
4. **Music Domain Expertise**: Deep understanding of ABC notation, music theory, and choral practice needs

### Key Technical Achievements

- **Duration-aware audio playback**: Syncopation, dotted notes, and rests are correctly timed
- **ABC notation parsing**: Full support for time signatures, key signatures, and rhythmic values
- **Component tool-calling**: AI returns structured data that maps directly to React component props
- **Responsive design**: Works on desktop and mobile for practice on-the-go

### Demo Script

```
1. "Help me practice the Alto part for Amazing Grace"
   → Watch the voice part appear with playable notation

2. "Act as a Master Hymn Composer. Generate a traditional, solemn SATB & Organ arrangement for 'Happy Birthday' in Tonic Sol-fa notation.
    Technical Requirements:
    Key & Meter: G Major, 3/4 Time (starting on the up-beat/pick-up).
    Harmony: Use traditional hymnody rules. Avoid parallel fifths. The Bass must provide a solid foundation using I, IV, and V chords.
    Notation: Use standard Sol-fa with colons (:) for beats and dots (.) for half-beats. Ensure octave marks are correct (e.g., s, for low Sol, d' for high Do).
   Organ Accompaniment: Provide an organTreble part that supports the Soprano/Alto and an organBass part with a heavy pedal line.
   Output Specification: Return the data in a raw JSON block with the following keys: title, keySignature, soprano, alto, tenor, bass, organTreble, and organBass."
   → See a simple sheet music rendered and hear accurate playback

3. "Create a syncopated rhythm in 6/16 with dotted quavers"
   → See the rhythm rendered and hear accurate playback

3. "Why does that chord progression sound so sad?"
   → Interactive piano highlights the intervals

4. "Upload a music sheet"
   → Drag a PDF and watch it transcribe
```

---

## 📄 License

MIT License - feel free to use this project for learning and building!

---

<div align="center">

**Built with ❤️ for The UI Strikes Back WEMAKEDEVS Hackathon 2026 Powered by Tambo UI**

[Tambo Generative UI](https://tambo.ai) • [abcjs](https://paulrosen.github.io/abcjs/) • [Tone.js](https://tonejs.github.io/)

</div>
