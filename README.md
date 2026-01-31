# Memory Cards - Taya Assessment

A Next.js application that allows users to record audio notes and automatically generate structured memory cards using AI. The app transcribes audio using Deepgram, then uses OpenAI to extract key information including mood, categories, and action items.

## Features

- 🎤 **Audio Recording**: Record voice notes directly in the browser with real-time audio level visualization
- 🧠 **AI-Powered Processing**: Automatic transcription and structured data extraction
- 📝 **Memory Cards**: Organize thoughts with automatically generated titles, moods, categories, and action items
- 🎨 **Modern UI**: Clean, meditative design with smooth animations and optimistic updates
- ⚡ **Real-time Feedback**: Instant UI updates with server synchronization

## Tech Stack

### Frontend

- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.10

### Backend

- **Runtime**: Node.js
- **Database**: PostgreSQL with Prisma ORM 7.3.0
- **AI Services**:
  - OpenAI (GPT-4o-mini) for memory card generation
  - Deepgram (Nova-3) for speech-to-text transcription

### Development Tools

- **Testing**: Vitest 4.0.18
- **Linting**: ESLint with Next.js config
- **Package Manager**: pnpm (recommended)

## AI Services

This application leverages two AI services to transform audio recordings into structured memory cards:

### Deepgram Nova-3 (Speech-to-Text)

**Why Deepgram Nova-3:**

- **Performance**: Low-latency, cost-efficient, high-quality transcription of conversational speech. Handles messy, stream-of-consciousness audio well.
- **API**: Accepts raw audio bytes via `multipart/form-data`. Much cheaper than OpenAI Whisper with lower latency for pure STT; faster and more future-proof than AssemblyAI.
- **Route**: `POST /api/transcribe` handles silence and short-audio edge cases server-side, returning a friendly 422 instead of passing low-quality input downstream.

### OpenAI GPT-4o-mini (Structured Memory Generation)

**Why GPT-4o-mini:**

- **Performance & cost**: Fast, cost-efficient reasoning and reliable structured output—about 10x cheaper than GPT-4.1.
- **Output**: Converts unstructured transcripts into schema-validated JSON (titles, categories, action items, inferred mood). Cheaper than Anthropic; more deterministic than Mistral for APIs at scale.
- **Data integrity**: A strict Zod schema enforces output correctness, so responses are safe to store and render without fragile parsing.

Together, these services provide a cost-effective, accurate pipeline from raw audio to structured, actionable memory cards.

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- PostgreSQL database (or Docker for local development)
- OpenAI API key
- Deepgram API key

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd taya-assessment
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5434/taya"
   OPENAI_API_KEY="your-openai-api-key"
   DEEPGRAM_API_KEY="your-deepgram-api-key"
   NODE_ENV="development"
   ```

4. **Set up the database**

   Start PostgreSQL using Docker:

   ```bash
   pnpm db:up
   ```

   Run Prisma migrations:

   ```bash
   pnpm prisma migrate dev
   ```

   (Optional) Open Prisma Studio to view the database:

   ```bash
   pnpm db:studio
   ```

5. **Run the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Run ESLint
- `pnpm db:up` - Start PostgreSQL with Docker
- `pnpm db:down` - Stop PostgreSQL
- `pnpm db:studio` - Open Prisma Studio

## Project Structure

```
taya-assessment/
├── app/
│   ├── actions/          # Server actions
│   │   └── memory-card.actions.ts
│   ├── api/              # API routes
│   │   ├── memory-card/
│   │   │   └── route.ts
│   │   └── transcribe/
│   │       └── route.ts
│   ├── components/       # React components
│   │   ├── AudioRecordButton.tsx
│   │   ├── MemoryCard.tsx
│   │   ├── MemoryCardDetailModal.tsx
│   │   ├── MemoryCards.tsx
│   │   └── MemoryCardTags.tsx
│   ├── data/             # Mock data
│   │   └── data.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Main page
├── lib/
│   ├── colors.ts         # Color utilities
│   ├── const.ts          # Constants
│   ├── db.ts             # Prisma client setup
│   ├── prompts.ts        # LLM prompts
│   └── utils.ts          # Utility functions
├── services/             # Business logic services
│   ├── __tests__/        # Service tests
│   ├── memory-card.service.ts
│   └── transcribe.service.ts
├── stores/               # Zustand stores
│   ├── useAudioRecorder.ts
│   ├── useGlobalControls.ts
│   └── useOptimisticMemoryCards.ts
├── types/                # TypeScript type definitions
│   └── types.ts
├── ui/                   # Reusable UI components
│   ├── MenuButton.tsx
│   ├── Modal.tsx
│   ├── Switch.tsx
│   └── Tag.tsx
└── prisma/
    ├── migrations/       # Database migrations
    └── schema.prisma     # Database schema
```

## Architecture

### Data Flow

1. **Recording**: User records audio in the browser using MediaRecorder API
2. **Transcription**: Audio is sent to `/api/transcribe` which uses Deepgram
3. **Generation**: Transcript is sent to `/api/memory-card` which uses OpenAI to generate structured data
4. **Storage**: Memory card is saved to PostgreSQL via Prisma
5. **Display**: Cards are displayed with optimistic updates for instant feedback

### Key Components

- **AudioRecordButton**: Handles audio recording, level metering, and silence detection
- **MemoryCards**: Displays memory cards grouped by date (Today, Yesterday, Earlier)
- **MemoryCard**: Individual card component with detail modal
- **Services**: Isolated business logic for transcription and memory card generation

## Database Schema

The application uses PostgreSQL with the following main models:

- **MemoryCard**: Stores transcribed audio, generated title, mood, categories, and action items
- **User**: User accounts (optional, for future multi-user support)

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for memory card generation
- `DEEPGRAM_API_KEY` - Deepgram API key for transcription
- `NODE_ENV` - Environment (development, production, test)

## Testing

### Audio without backend (admin flag)

To test the recording UI without sending audio to the backend, add `?admin=1` to the URL (e.g. `http://localhost:3000?admin=1`). This reveals a **Listening only** toggle; when it’s on, recorded audio is played back locally and not sent to the transcription or memory-card APIs.

### Unit tests

Run unit tests:

```bash
pnpm test
```

Tests are located in `services/__tests__/` and cover:

- Memory card generation service
- Transcription service
- Schema validation

## License

Private project for Taya assessment.
