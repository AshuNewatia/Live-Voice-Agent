# IMF Tactical Voice AI Terminal

A real-time, low-latency voice AI command terminal inspired by the Impossible Mission Force (IMF). Features dual-channel Web Audio visualizers, live STT decryption comms feeds, and an authoritative tactical intelligence agent.

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, LiveKit Components React, Web Audio API Canvas Oscilloscopes
- **Backend Pipeline**: LiveKit Agents SDK (Node.js / TypeScript)
- **STT**: Deepgram Nova-3
- **LLM**: Google Gemma 4-31B
- **TTS**: Cartesia Sonic-3

## Getting Started

### 1. Prerequisites

- Node.js 20+
- pnpm

### 2. Setup Environment Variables

Configure `.env` in both `backend` and `frontend` following the `.env.example` templates.

### 3. Install Dependencies

```bash
# Frontend
cd frontend
pnpm install

# Backend
cd ../backend
pnpm install
```
