import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  // Use NEXT_PUBLIC_LIVEKIT_URL for frontend, fallback to LIVEKIT_URL
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Missing LiveKit environment variables" },
      { status: 500 },
    );
  }

  // CRITICAL FIX: Must start with "room-" so LiveKit Cloud's Dispatch Rule triggers
  const roomName = `room-${Date.now()}`;
  const participantIdentity = `ashu-terminal-${Math.floor(Math.random() * 1000)}`;

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

  return NextResponse.json({
    token: await at.toJwt(),
    url: wsUrl,
  });
}
