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
- **High Accuracy**: Nova-3 is Deepgram's latest and most accurate speech recognition model, providing excellent transcription quality for natural speech
- **Smart Formatting**: Built-in smart formatting automatically handles punctuation, capitalization, and speaker diarization
- **Low Latency**: Fast API response times ensure a responsive user experience
- **Developer-Friendly**: Simple REST API with clear error handling and straightforward integration

### OpenAI GPT-4o-mini (Text-to-Structured Data)

**Why GPT-4o-mini:**
- **Cost-Effective**: The "mini" variant provides excellent performance at a fraction of the cost of larger models, making it ideal for production use
- **Structured Output**: Reliable JSON mode ensures consistent, parseable responses that match our schema
- **Context Understanding**: Strong at understanding context, tone, and extracting meaningful insights from transcripts
- **Balanced Performance**: Offers the right balance between capability and cost for this use case, where we need structured extraction rather than creative generation

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
│   ├── const.ts         # Constants
│   ├── db.ts            # Prisma client setup
│   ├── prompts.ts       # LLM prompts
│   └── utils.ts         # Utility functions
├── services/            # Business logic services
│   ├── __tests__/       # Service tests
│   ├── memory-card.service.ts
│   └── transcribe.service.ts
├── stores/              # Zustand stores
│   ├── useGlobalControls.ts
│   └── useOptimisticMemoryCards.ts
├── types/               # TypeScript type definitions
│   └── types.ts
├── ui/                  # Reusable UI components
│   ├── MenuButton.tsx
│   ├── Modal.tsx
│   ├── Switch.tsx
│   └── Tag.tsx
└── prisma/
    ├── migrations/      # Database migrations
    └── schema.prisma    # Database schema
```

## AI Services

This application leverages two AI services to transform audio recordings into structured memory cards:

### Deepgram Nova-3 (Speech-to-Text)

**Why Deepgram Nova-3:**
- **High Accuracy**: Nova-3 is Deepgram's latest and most accurate speech recognition model, providing excellent transcription quality for natural speech
- **Smart Formatting**: Built-in smart formatting automatically handles punctuation, capitalization, and speaker diarization
- **Low Latency**: Fast API response times ensure a responsive user experience
- **Developer-Friendly**: Simple REST API with clear error handling and straightforward integration

### OpenAI GPT-4o-mini (Text-to-Structured Data)

**Why GPT-4o-mini:**
- **Cost-Effective**: The "mini" variant provides excellent performance at a fraction of the cost of larger models, making it ideal for production use
- **Structured Output**: Reliable JSON mode ensures consistent, parseable responses that match our schema
- **Context Understanding**: Strong at understanding context, tone, and extracting meaningful insights from transcripts
- **Balanced Performance**: Offers the right balance between capability and cost for this use case, where we need structured extraction rather than creative generation

Together, these services provide a cost-effective, accurate pipeline from raw audio to structured, actionable memory cards.

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
