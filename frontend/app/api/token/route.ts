import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Missing LiveKit environment variables" },
      { status: 500 },
    );
  }

  const roomName = `imf-room-${Math.floor(Math.random() * 10000)}`;
  const participantIdentity = `ashu-field-${Math.floor(Math.random() * 1000)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: "Ashu",
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  // Explicitly dispatch the agent to join this room upon creation
  at.roomConfig = {
    agents: [
      {
        agentName: "imf-agent",
      },
    ],
  };

  return NextResponse.json({
    token: await at.toJwt(),
    url: wsUrl,
  });
}
