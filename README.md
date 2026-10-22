# IMF Tactical Voice Terminal // Ghost Protocol Console

An autonomous, full-duplex tactical voice terminal designed after the _Mission: Impossible_ universe. Powered by LiveKit Agents, Deepgram Nova-3, Google Gemma, and Cartesia Sonic-3, the terminal puts operatives in direct communication with an IMF tactical AI handler capable of executing voice ciphers, performing automated target surveillance, plotting live satellite reconnaissance, and conducting dual-channel wiretaps.

---

## Technical Stack & Architecture

- **Real-Time WebRTC Media Fabric**: [LiveKit Agents](https://livekit.io/)
- **Streaming Speech-to-Text (STT)**: Deepgram Nova-3 (sub-second streaming transcription)
- **Intelligence & Orchestration (LLM)**: Google Gemma 4-31B with function calling / tool use
- **Streaming Text-to-Speech (TTS)**: Cartesia Sonic-3 (tactical synthetic voice profile)
- **Frontend HUD**: Next.js 14+ (App Router), Tailwind CSS, `@livekit/components-react`, Web Audio API, HTML5 Canvas Oscilloscopes
- **Open-Source Intelligence (OSINT)**: Wikipedia REST API & Wikidata Knowledge Graph
- **Geospatial Telemetry**: OpenStreetMap Nominatim & Komoot Photon fuzzy POI geocoders
- **Telephony & Bridge**: LiveKit SIP Inbound Trunking & Twilio PSTN Gateway

---

## Key Tactical Capabilities

### 1. Cover Protocol & Director Clearance Override

- **Default Cover**: Masks its origin under the sealed pseudonym **Overwatch**, responding exclusively as an automated military core.
- **Ghost Protocol Override**: Speaking _"Execute Ghost Protocol"_ immediately bypasses clearance walls, recognizes **Ashu**, unlocks unrestricted intelligence capabilities, and re-themes the HUD from tactical Cyan to Gold/Amber.
- **Stand Down**: Triggering _"Stand Down"_ or _"Revoke Ghost Protocol"_ induces an 800ms visual CRT glitch and locks down clearance.

### 2. Autonomous Target Intelligence (OSINT & Interpol Classification)

- The agent dynamically calls the `lookupPerson` tool when queried about any individual (artists, actors, public figures, historical personas, or criminals).
- **Automated Threat Assessment**: Parses criminal indicators (_serial killer, cartel, terrorism, murder, trafficking_) to classify targets as either an **`INTERPOL RED NOTICE // LEVEL ALPHA HOSTILE`** or an **`OPEN-SOURCE // CIVILIAN ASSET`**.
- Pushes synchronized payload events over the LiveKit Data Channel (`topic: 'dossier'`) to slide out a biometric HUD card with mugshot portraits, threat metrics, and JSON export.

### 3. Live Orbital Satellite Reconnaissance

- Operating via the `locateTheater` tool, operatives can target any global theater, city, landmark, or specific residential society (e.g., _"Track coordinates for Paris"_, _"Locate mission theater in Mumbai"_).
- Employs a two-tier geocoding pipeline (Nominatim + Komoot Photon) to calculate geostationary coordinates, retasking an orbital CRT scanline feed with target reticles and dynamic street/rooftop zoom.

### 4. Dual-Channel Comms Wiretap (Call Recording)

- Operatives can initiate an encrypted wiretap via button or voice command (_"Start Wiretap"_ / _"Record Call"_).
- The browser Web Audio API mixes both the local operator microphone and the AI synthesizer track into a unified audio stream, auto-exporting an `IMF_WIRETAP_[timestamp].webm` recording upon completion.

### 5. Encrypted Fallback CLI & Tactical Audio

- **Comms Fallback**: If audio conditions deteriorate, operatives can transmit commands via the encrypted text console (`[TXT]`).
- **Tactical Synth Audio**: Operatives can cue or silence background audio (_"Play mission theme"_, _"Cut music"_), with integrated auto-looping, volume sliders, and HTML5 dual-harmonic oscilloscope sine wave monitors.

---

## Voice Ciphers & Operational Directives

| Command / Cipher                                    | Tactical Function           | System Response / HUD Action                                           |
| :-------------------------------------------------- | :-------------------------- | :--------------------------------------------------------------------- |
| **"Execute Ghost Protocol"**                        | Master clearance bypass     | Shifts HUD to Gold/Amber; recognizes Director Ashu.                    |
| **"Stand Down"** / **"Revoke Ghost Protocol"**      | Re-engages security cover   | 800ms visual inversion glitch; returns HUD to Cyan.                    |
| **"Go Dark"** / **"Engage Stealth"**                | Covert operations mode      | Blanks HUD to stealth Emerald; hides active audio monitors.            |
| **"Drop Stealth"** / **"Return to Normal"**         | Restores tactical footprint | Restores visual telemetry and oscilloscope monitors.                   |
| **"Who is [Name]?"** / **"Pull dossier on [Name]"** | Live OSINT target query     | Queries Wikipedia/Wikidata; slides out Red Notice or Civilian card.    |
| **"Track coordinates for [Location]"**              | Orbital reconnaissance      | Geocodes target location; streams CRT satellite map with reticles.     |
| **"Start Wiretap"** / **"Record Call"**             | Intercepts comms            | Flashes active recording alert; mixes mic and AI audio tracks.         |
| **"Stop Wiretap"** / **"Save Recording"**           | Concludes intercept         | Compiles and auto-downloads the recorded `.webm` audio archive.        |
| **"Play mission theme"** / **"Cue theme"**          | Audio stream control        | Initializes auto-looping theme player with volume control.             |
| **"Burn Notice"** / **"Sanitize Comms"**            | Scrubs operational feed     | Wipes visible chat history; stamps status `[ LOGS SCRUBBED ]`.         |
| **"Extract Intel"** / **"Download Dossier"**        | Dossier compilation         | Exports decrypted chat log into an `IMF_DOSSIER_[timestamp].txt` file. |
| **"Initiate Self Destruct"**                        | Terminal purge              | Triggers emergency red alert and severs WebRTC uplink after 5s.        |

---

## Directory Structure

```text
├── backend/
│   ├── src/
│   │   └── main.ts         # Agent definition, LLM tools (OSINT, Satellite), LiveKit pipeline
│   ├── .env                # LiveKit Cloud, Deepgram, & AI provider keys
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── token/
│   │   │       └── route.ts # LiveKit token issuance & agent dispatch configuration
│   │   ├── page.tsx        # Tactical HUD, oscilloscopes, satellite feed, dossier drawer
│   │   └── layout.tsx
│   ├── public/
│   │   └── audio/
│   │       └── theme.mp3   # Local tactical soundtrack fallback
│   ├── .env.local          # Frontend LiveKit credentials
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```
