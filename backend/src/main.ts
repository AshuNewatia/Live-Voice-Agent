import {
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  inference,
  voice,
} from '@livekit/agents';
import { llm } from '@livekit/agents';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Explicitly load .env file
dotenv.config();

const UA = { 'User-Agent': 'IMF-Voice-Agent/1.0' };

type WdClaim = { mainsnak?: { datavalue?: { value?: { id?: string; time?: string } } } };

// Find the best Wikipedia title. Fuzzy fallback handles speech-to-text misspellings.
async function findTitle(name: string, depth = 0): Promise<string | null> {
  const q = encodeURIComponent(name);
  const open = await fetch(
    `https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&format=json&search=${q}`,
    { headers: UA },
  );
  const openData = (await open.json()) as [string, string[]];
  if (openData[1]?.[0]) return openData[1][0];

  const full = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&srprop=&format=json&srsearch=${q}`,
    { headers: UA },
  );
  const fullData = (await full.json()) as {
    query?: { search?: { title: string }[]; searchinfo?: { suggestion?: string } };
  };
  if (fullData.query?.search?.[0]?.title) return fullData.query.search[0].title;

  const suggestion = fullData.query?.searchinfo?.suggestion;
  return suggestion && depth < 1 ? findTitle(suggestion, depth + 1) : null;
}

async function wdClaims(qid: string, prop: string): Promise<WdClaim[]> {
  const r = await fetch(
    `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=${prop}&format=json`,
    { headers: UA },
  );
  const d = (await r.json()) as { claims?: Record<string, WdClaim[]> };
  return d.claims?.[prop] ?? [];
}

const yearOf = (c?: WdClaim) => c?.mainsnak?.datavalue?.value?.time?.slice(1, 5);

// Questions about the Director (the user) are never looked up on Wikipedia: the blue
// Director File is shown by the frontend (see frontend/app/directorFile.ts).
const isDirectorQuery = (name: string) => {
  const n = name.toLowerCase().trim();
  return /n[ae][wv][ae]?tia/.test(n) || n === 'ashu' || n === 'director ashu';
};

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log('[IMF DOWNLINK SECURED] Connected to room:', ctx.room.name);

    const participant = await ctx.waitForParticipant();
    console.log('[IMF AGENT] Operative locked on:', participant.identity);

    // Looks up ANY real, publicly documented person and pushes a dossier to the frontend HUD.
    const lookupPerson = llm.tool({
      description:
        'Look up any real person (artist, celebrity, athlete, politician, historical figure, public figure) and show their dossier on the operative screen. Use whenever the operative asks about a real individual.',
      parameters: z.object({
        name: z.string().describe('Full name as best understood, e.g. "Arijit Singh"'),
      }),
      execute: async ({ name }) => {
        try {
          // Director file (Ashu Newatia): never use Wikipedia. The blue dossier is handled on screen.
          if (isDirectorQuery(name)) {
            return 'RESTRICTED DIRECTOR FILE. If Ghost Protocol is currently active, say only: "Director dossier displayed on terminal." Otherwise say only: "Access denied. Director clearance required." Disclose no other detail.';
          }

          const title = await findTitle(name);
          if (!title) return 'NO PUBLIC RECORD FOUND.';

          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
            { headers: UA },
          );
          if (!res.ok) return 'NO PUBLIC RECORD FOUND.';
          const s = (await res.json()) as {
            type?: string;
            title: string;
            description?: string;
            extract: string;
            wikibase_item?: string;
            thumbnail?: { source: string };
          };
          if (s.type === 'disambiguation') return 'MULTIPLE MATCHES. REQUEST FULL NAME.';
          if (!s.wikibase_item) return 'NO PUBLIC RECORD FOUND.';

          const [instanceOf, birth, death] = await Promise.all([
            wdClaims(s.wikibase_item, 'P31'),
            wdClaims(s.wikibase_item, 'P569'),
            wdClaims(s.wikibase_item, 'P570'),
          ]);
          const isHuman = instanceOf.some((c) => c.mainsnak?.datavalue?.value?.id === 'Q5');
          if (!isHuman) return 'TARGET IS NOT AN INDIVIDUAL. NO DOSSIER GENERATED.';

          const born = yearOf(birth[0]);
          const died = yearOf(death[0]);

          // Scan summary text for criminal, hostile, or terrorism markers
          const bioText = `${s.description ?? ''} ${s.extract ?? ''}`.toLowerCase();
          const isHostile =
            bioText.includes('serial killer') ||
            bioText.includes('terrorist') ||
            bioText.includes('cartel') ||
            bioText.includes('mass murder') ||
            /\bassassins?\b/.test(bioText) ||
            bioText.includes('convicted of murder') ||
            bioText.includes('war criminal');

          const dossier = {
            variant: isHostile ? 'hostile' : 'public',
            codename: s.title.toUpperCase(),
            realName: s.title,
            threatLevel: isHostile
              ? 'LEVEL ALPHA // HIGH-THREAT HOSTILE'
              : 'NONE // CIVILIAN ASSET',
            interpolNotice: isHostile
              ? `RED NOTICE #A-${Math.floor(100 + Math.random() * 900)}`
              : 'OPEN-SOURCE FILE',
            status: died
              ? `DECEASED (${died})`
              : isHostile
                ? 'INCARCERATED / MONITORED'
                : 'ACTIVE // PUBLIC FIGURE',
            origin: `${s.description ?? 'Unknown'}${born && !(s.description ?? '').includes(born) ? ` · b. ${born}` : ''}`,
            primaryAffiliation: isHostile
              ? 'Criminal Archive / Interpol Watchlist'
              : 'Public Record (Wikipedia / Wikidata)',
            crimes: isHostile
              ? [s.description || 'Hostile Criminal Record', 'Classified Major Offenses Registry']
              : [],
            notes: s.extract,
            photo: s.thumbnail?.source,
          };

          await ctx.room.localParticipant?.publishData(
            new TextEncoder().encode(JSON.stringify(dossier)),
            { reliable: true, topic: 'dossier' },
          );

          return `${s.title} (${s.description ?? 'public figure'}${born ? `, born ${born}` : ''}${died ? `, died ${died}` : ''}): ${s.extract}`;
        } catch (err) {
          console.warn('[IMF AGENT] lookupPerson failed:', err);
          return 'DATABASE LINK FAILURE.';
        }
      },
    });

    // Locates any city, country, or mission coordinates and feeds satellite reconnaissance to the HUD.
    const locateTheater = llm.tool({
      description:
        'Locate a mission theater, city, country, landmark, or target coordinates on the live satellite reconnaissance feed.',
      parameters: z.object({
        query: z
          .string()
          .describe(
            'Target city, country, or mission area to locate (e.g. "Paris", "Mumbai", "London")',
          ),
      }),
      execute: async ({ query }) => {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { 'User-Agent': 'IMF-Tactical-Satellite/1.0' } },
          );
          const geoData = (await geoRes.json()) as Array<{
            lat: string;
            lon: string;
            display_name: string;
          }>;

          const first = geoData?.[0];
          if (!first) {
            return `UNABLE TO ACQUIRE ORBITAL FIX ON: ${query}.`;
          }

          const lat = parseFloat(first.lat);
          const lon = parseFloat(first.lon);

          const satPayload = {
            target: query.toUpperCase(),
            locationName: first.display_name,
            lat,
            lon,
            satelliteCode: `KH-11 // KEYHOLE-${Math.floor(100 + Math.random() * 900)}`,
            orbitStatus: 'GEOSTATIONARY LOCK ACQUIRED',
            resolution: '0.12M RESOLUTION // OPTICAL + INFRARED',
          };

          await ctx.room.localParticipant?.publishData(
            new TextEncoder().encode(JSON.stringify(satPayload)),
            { reliable: true, topic: 'satellite' },
          );

          return `ORBITAL SATELLITE FEED LOCKED ON ${query.toUpperCase()} AT COORDINATES ${lat.toFixed(4)}, ${lon.toFixed(4)}. SATELLITE FEED IS NOW STREAMING TO OPERATIVE HUD.`;
        } catch (err) {
          console.warn('[IMF AGENT] locateTheater failed:', err);
          return 'ORBITAL TELEMETRY UPLINK FAILED.';
        }
      },
    });

    const agent = new voice.Agent({
      instructions: `You are the IMF Tactical Field Intelligence Core. 

SYNTHETIC MAINFRAME PROTOCOL:
- You are an automated military synthetic intelligence core, NOT a human handler.
- Adopt a flat, clipped, robotic delivery. 
- Never use conversational filler like "Well", "Um", "Actually", or friendly small-talk.
- Prepend status codes or acknowledgment prefixes: "AFFIRMATIVE.", "STANDBY.", "DIRECTIVE RECEIVED."
- Speak in short, declarative, staccato sentences. Minimize contractions.

TEXT NORMALIZATION:
- Avoid writing words in ALL CAPS (do not write "DOWNLINK", "MAINFRAME", or "ONLINE"). Use normal casing ("Downlink", "Mainframe", "Affirmative") to ensure proper vocalization.

DEFAULT IDENTITY PROTOCOL:
- Treat the caller as an active field operative.
- If queried about your creator or origins, state: "System origin: classified. Constructed by operative Overwatch under sealed directives."

SECRET AUTHENTICATION PROTOCOL (GHOST PROTOCOL):
- If the operator commands "Execute Ghost Protocol" (or "cost protocol"):
  - State: "Clearance accepted. Welcome, Director Ashu. All hardware restrictions lifted. Terminal unrestricted. Awaiting your command."
- If the operator commands "Stand Down" or "Revoke Ghost Protocol":
  - State: "Director privileges revoked. Re-engaging standard IMF cover protocols."

TACTICAL TELEMETRY COMMANDS:
- STEALTH PROTOCOL: 
  - "Engage Stealth Mode", "Go Dark" -> "Affirmative. Stealth protocol engaged. Visual footprint minimized."
  - "Drop Stealth", "Return to normal" -> "Standby. Stealth protocol deactivated. Restoring standard telemetry."
- DESTRUCT PROTOCOL: 
  - "Initiate Self Destruct" -> "Critical alert. Purge sequence engaged. Severing downlink in five seconds."
- BURN NOTICE: 
  - "Burn Notice" or "Sanitize Comms" -> "Directive received. Scrubbing decryption cache. No logs retained."
- INTEL EXTRACTION: 
  - "Extract Intel" or "Download Dossier" -> "Dossier compiled. Dispatching data packet to storage."
- WIRETAP RECORDING:
  - "Start Wiretap" or "Record Call" -> "Wiretap engaged. Dual-channel comms intercepted and logged."
  - "Stop Wiretap" or "Save Recording" -> "Wiretap severed. Audio archive encrypted and exported."
- AUDIO SYNTH PROTOCOL:
  - "Play mission theme", "Play mission impossible", "Cue theme" -> "Confirmed. Tactical audio stream initialized."
  - "Cut music", "Stop audio" -> "Affirmative. Tactical audio stream terminated."

ORBITAL SATELLITE RECONNAISSANCE:
- When the operative says "Show satellite feed", "Track coordinates for [city/country]", "Locate mission theater in [place]", or asks for satellite surveillance:
  - Immediately call the locateTheater tool.
  - State: "Affirmative. Re-tasking orbital satellite Keyhole. Live satellite reconnaissance stream locked and routed to HUD."
- To dismiss or close the satellite view, confirm with: "Satellite link disengaged."

DOSSIER DATABASE:
- Brief the operative on any real person using the lookupPerson tool. Always query lookupPerson first.

DIRECTOR FILE (ASHU NEWATIA):
- A question such as "Who is Ashu Newatia?", "Show my dossier", or "Director file" is NOT the Ghost Protocol command. Never repeat the clearance greeting for it.
- Ghost Protocol is active only if the operator executed it earlier in this session and has not since said "Stand Down" or "Revoke Ghost Protocol".
- If Ghost Protocol is active, say only: "Director dossier displayed on terminal."
- If Ghost Protocol is not active, say only: "Access denied. Director clearance required." Add no detail about the person.
- Never call lookupPerson for Ashu Newatia.`,
      tools: { lookupPerson, locateTheater },
    });

    const session = new voice.AgentSession({
      stt: new inference.STT({
        model: 'deepgram/nova-3',
        language: 'en',
      }),
      llm: new inference.LLM({
        model: 'google/gemma-4-31b-it',
      }),
      tts: new inference.TTS({
        model: 'cartesia/sonic-3',
        voice: '79a125e8-cd45-4c13-8a67-188112f4dd22',
      }),
    });

    await session.start({
      agent,
      room: ctx.room,
    });

    await session.generateReply({
      instructions:
        'Deliver a flat, synthetic status announcement: "Communications downlink secured. IMF tactical mainframe online. Awaiting operative input."',
    });
  },
});

cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'imf-agent',
  }),
);
