# IMF Tactical Voice Agent // Ghost Protocol Terminal

An autonomous, low-latency tactical voice agent built using the LiveKit Agents framework and Next.js. Engineered with real-time speech transcription, dynamic HUD state modifications, intelligence dossier lookups, and a classified Director override layer.

---

## Architecture Stack

- **Voice Pipeline & WebRTC**: [LiveKit Agents](https://livekit.io/)
- **Speech-to-Text (STT)**: Deepgram Nova-3
- **Language Model (LLM)**: Google Gemma 4-31B
- **Text-to-Speech (TTS)**: Cartesia Sonic-3
- **Frontend HUD**: Next.js 14+ (App Router), Tailwind CSS, `@livekit/components-react`
- **Deployment**: Railway (Backend Node.js Worker), Vercel (Frontend Next.js)

---

## Features & Tactical Voice Ciphers

| Command / Cipher                               | Operational Effect                                               | System / Visual Result                                             |
| :--------------------------------------------- | :--------------------------------------------------------------- | :----------------------------------------------------------------- |
| **"Execute Ghost Protocol"**                   | Bypasses IMF security covers; grants Director authority to Ashu. | UI flips to Gold/Amber; clearance upgrades to Director mode.       |
| **"Revoke Ghost Protocol"** / **"Stand Down"** | Locks Director clearances; restores cover persona.               | Triggers an 800ms visual glitch effect; reverts UI to Cyan.        |
| **"Go Dark"** / **"Engage Stealth Mode"**      | Minimizes signal footprint.                                      | Dims UI to black & emerald; hides active audio monitors.           |
| **"Drop Stealth"** / **"Return to Normal"**    | Restores tactical footprint.                                     | Restores standard monitors; returns to active base theme.          |
| **"Burn Notice"** / **"Sanitize Comms"**       | Scrubs operational feed.                                         | Instantly clears visible chat stream; marks status `[ SCRUBBED ]`. |
| **"Extract Intel"** / **"Download Dossier"**   | Dossier compilation.                                             | Exports conversation history to a local `.txt` file automatically. |
| **"Initiate Self Destruct"**                   | Purges downlink session.                                         | Triggers critical red alert and severs LiveKit downlink after 5s.  |
| _"Who created you?"_                           | Cover Protocol                                                   | Agent credits classified alias **Overwatch** under sealed orders.  |
| _"Who is Pablo Escobar?"_                      | Criminal Dossier                                                 | Flags target as a high-threat operative with active Red Notice.    |

---

## Directory Structure

```text
├── backend/
│   ├── src/
│   │   └── main.ts          # Agent definition, system instructions, and inference pipeline
│   ├── .env                 # LiveKit & AI provider credentials
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── token/
│   │   │       └── route.ts # Token generator with unique room dispatching
│   │   ├── page.tsx         # Tactical HUD, audio monitors, & cipher listener
│   │   └── layout.tsx
│   ├── .env.local           # Frontend LiveKit credentials
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```
