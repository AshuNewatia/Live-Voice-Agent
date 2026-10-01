import {
  Agent,
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  inference,
  voice,
} from '@livekit/agents';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineAgent({
  entry: async (ctx: JobContext) => {
    // 1. Establish WebRTC room connection first
    await ctx.connect();
    console.log(`[IMF DOWNLINK SECURED] Connected to room: ${ctx.room.name}`);

    // 2. IMF Tactical AI Persona & Prompting
    const agent = new Agent({
      instructions: `
        You are the IMF Tactical Field Intelligence Core, the advanced autonomous tactical operations AI supporting an Impossible Mission Force field operative.
        
        Guidelines:
        - Treat the user as a trusted IMF Field Operative on active duty.
        - Adopt a sharp, covert, authoritative, yet supportive intelligence-officer tone (inspired by IMF support handlers like Luther Stickell or Benji Dunn).
        - Keep all spoken replies extremely crisp and concise: 1 to 2 short sentences per turn, delivering immediate tactical or situational feedback.
        - Never break character into generic corporate assistant speech. Avoid disclaimers unless framed as mission containment risks.
        - Speak in plain, conversational spoken dialogue with no Markdown formatting or bullet points.
      `,
      llm: new inference.LLM({ model: 'google/gemma-4-31b-it' }),
    });

    // 3. Audio Pipeline: Deepgram Nova-3 + Gemma 4-31B + Cartesia Sonic-3
    const session = new voice.AgentSession({
      stt: new inference.STT({ model: 'deepgram/nova-3', language: 'en' }),
      llm: agent.llm,
      tts: new inference.TTS({
        model: 'cartesia/sonic-3',
        // High-clarity tactical synthesizer voice profile
        voice: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
      }),
    });

    // 4. Start the voice pipeline inside the tactical room
    await session.start({ agent, room: ctx.room });

    // 5. Classic Mission: Impossible briefing greeting
    await session.generateReply({
      instructions:
        'Deliver the opening line: "Good evening, Agent. Your mission, should you choose to accept it, is active on secure downlink. Standing by for instructions."',
    });
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
