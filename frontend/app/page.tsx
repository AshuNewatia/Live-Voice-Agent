"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useLocalParticipant,
  useTrackTranscription,
  useConnectionState,
  useTrackVolume,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

export default function App() {
  const [token, setToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToHQ = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/token");
      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      alert("Connection failed. Check your network or LiveKit keys.");
    }
    setIsConnecting(false);
  };

  if (!token) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-gray-950 font-mono text-cyan-400 select-none">
        <div className="flex flex-col gap-6 border border-cyan-900/50 bg-gray-900/40 p-8 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <h1 className="text-xl font-bold tracking-widest">
            IMF FIELD TERMINAL
          </h1>
          <p className="text-sm text-cyan-700">
            Awaiting clearance for secure downlink...
          </p>
          <button
            onClick={connectToHQ}
            disabled={isConnecting}
            className="border border-cyan-500 bg-cyan-950 px-6 py-3 font-bold hover:bg-cyan-900 transition-colors"
          >
            {isConnecting ? "ENCRYPTING..." : "INITIALIZE UPLINK"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect
      audio
      className="h-screen w-full font-mono bg-black select-none"
      onDisconnected={() => setToken("")}
    >
      <RoomAudioRenderer />
      <Dashboard onDisconnect={() => setToken("")} />
    </LiveKitRoom>
  );
}

function Dashboard({ onDisconnect }: { onDisconnect: () => void }) {
  const [isDirector, setIsDirector] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isStealth, setIsStealth] = useState(false);
  const [isDestructing, setIsDestructing] = useState(false);
  const [wipeTimestamp, setWipeTimestamp] = useState<number>(0);

  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const { audioTrack: agentTrack } = useVoiceAssistant();

  const micPub = Array.from(localParticipant.trackPublications.values()).find(
    (p) => p.source === Track.Source.Microphone,
  );
  const micRef = micPub?.track
    ? {
        participant: localParticipant,
        publication: micPub,
        source: Track.Source.Microphone,
      }
    : undefined;

  const agentSegments = useTrackTranscription(agentTrack as any).segments || [];
  const userSegments = useTrackTranscription(micRef).segments || [];

  const fullChatHistory = [
    ...userSegments.map((s) => ({ ...s, isUser: true })),
    ...agentSegments.map((s) => ({ ...s, isUser: false })),
  ].sort((a, b) => (a.firstReceivedTime || 0) - (b.firstReceivedTime || 0));

  useEffect(() => {
    if (!userSegments.length) return;

    const lastSentence =
      userSegments[userSegments.length - 1].text.toLowerCase();

    const isUnlockCommand =
      lastSentence.includes("execute ghost protocol") ||
      (lastSentence.includes("ghost protocol") &&
        !lastSentence.includes("revoke"));
    const isLockdownCommand =
      lastSentence.includes("revoke ghost protocol") ||
      lastSentence.includes("stand down");
    const isStealthOn =
      lastSentence.includes("engage stealth") ||
      lastSentence.includes("go dark");
    const isStealthOff =
      lastSentence.includes("disable stealth") ||
      lastSentence.includes("drop stealth") ||
      lastSentence.includes("return to normal");
    const isSelfDestruct =
      lastSentence.includes("initiate self destruct") ||
      lastSentence.includes("self destruct sequence");
    const isBurnNotice =
      lastSentence.includes("burn notice") ||
      lastSentence.includes("sanitize comms");
    const isExtractIntel =
      lastSentence.includes("extract intel") ||
      lastSentence.includes("download dossier");

    if (isSelfDestruct && !isDestructing) {
      setIsDestructing(true);
      setTimeout(() => onDisconnect(), 5000);
      return;
    }

    if (isStealthOn && !isStealth) setIsStealth(true);
    if (isStealthOff && isStealth) setIsStealth(false);

    if (!isDirector && isUnlockCommand) {
      setIsDirector(true);
    } else if (isDirector && isLockdownCommand) {
      setIsDirector(false);
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 800);
    }

    if (isBurnNotice) {
      setWipeTimestamp(Date.now());
    }

    if (isExtractIntel) {
      const transcriptText = fullChatHistory
        .map((msg) => `[${msg.isUser ? "OPERATOR" : "AI CORE"}]: ${msg.text}`)
        .join("\n\n");

      const blob = new Blob(
        [
          `IMF SECURE DOSSIER\nDECRYPTION LOG\n----------------------\n\n${transcriptText}`,
        ],
        { type: "text/plain" },
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `IMF_DOSSIER_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [
    userSegments,
    isDirector,
    isStealth,
    isDestructing,
    onDisconnect,
    fullChatHistory,
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleChatHistory = fullChatHistory.filter(
    (msg) => (msg.firstReceivedTime || 0) > wipeTimestamp,
  );

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleChatHistory]);

  const themes = {
    cyan: {
      text: "text-cyan-400",
      bg: "bg-gray-950",
      border: "border-cyan-800",
      fill: "bg-cyan-500",
      muted: "text-cyan-700",
    },
    amber: {
      text: "text-amber-400",
      bg: "bg-[#140b00]",
      border: "border-amber-800",
      fill: "bg-amber-500",
      muted: "text-amber-700",
    },
    emerald: {
      text: "text-emerald-500",
      bg: "bg-black",
      border: "border-emerald-900",
      fill: "bg-emerald-700",
      muted: "text-emerald-800",
    },
    red: {
      text: "text-red-400",
      bg: "bg-red-950/40",
      border: "border-red-600",
      fill: "bg-red-500",
      muted: "text-red-700",
    },
  };

  let activeTheme = themes.cyan;
  if (isDirector) activeTheme = themes.amber;
  if (isStealth) activeTheme = themes.emerald;
  if (isDestructing) activeTheme = themes.red;

  const glitchStyle = isGlitching
    ? "animate-pulse blur-[2px] invert-[0.1] skew-x-[-3deg] saturate-200"
    : "transition-all duration-700";

  return (
    <div
      className={`flex h-full flex-col p-4 ${activeTheme.text} ${activeTheme.bg} ${glitchStyle} ${isDestructing ? "animate-pulse" : ""}`}
    >
      {/* Header */}
      <header
        className={`flex items-center justify-between border-b ${activeTheme.border} pb-4`}
      >
        <div>
          <h1 className="text-lg font-bold tracking-widest">
            {isDestructing
              ? "CRITICAL: PURGE INITIATED"
              : isDirector
                ? "DIRECTOR TACTICAL OVERRIDE"
                : "IMF SECURE DOWNLINK"}
          </h1>
          <p className={`text-xs ${activeTheme.muted}`}>
            STATUS:{" "}
            {isDestructing ? "TERMINATING..." : connectionState.toUpperCase()}
          </p>
        </div>
        <button
          onClick={onDisconnect}
          className={`border px-4 py-2 text-xs font-bold transition-colors ${isDestructing ? "border-red-500 bg-red-600 text-white" : "border-red-800 bg-red-950/50 text-red-400 hover:bg-red-900"}`}
        >
          {isDestructing ? "ABORT PURGE" : "DISCONNECT"}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="mt-4 flex flex-1 gap-4 overflow-hidden max-md:flex-col">
        {/* Left Side: Audio Monitors (Hidden in Stealth Mode) */}
        {!isStealth && (
          <div className="flex w-1/3 flex-col gap-4 max-md:w-full">
            <AudioMonitor
              label="CHANNEL 01 // OPERATOR"
              trackRef={micRef}
              fillClass={activeTheme.fill}
              borderClass={activeTheme.border}
            />
            <AudioMonitor
              label="CHANNEL 02 // AI SYNTH"
              trackRef={agentTrack as any}
              fillClass={activeTheme.fill}
              borderClass={activeTheme.border}
            />

            <button
              onClick={() =>
                localParticipant.setMicrophoneEnabled(
                  !localParticipant.isMicrophoneEnabled,
                )
              }
              className={`mt-auto border p-4 text-sm font-bold transition-colors ${
                localParticipant.isMicrophoneEnabled
                  ? `${activeTheme.border} bg-black/20 hover:bg-black/40`
                  : "border-red-800 bg-red-950 text-red-500"
              }`}
            >
              {localParticipant.isMicrophoneEnabled
                ? "MUTE MICROPHONE"
                : "UNMUTE MICROPHONE"}
            </button>
          </div>
        )}

        {/* Right Side: Transcript Feed */}
        <div
          className={`flex flex-1 flex-col border ${activeTheme.border} bg-black/40 p-4 transition-all duration-700`}
        >
          <div
            className={`mb-2 border-b ${activeTheme.border} pb-2 text-xs font-bold flex justify-between`}
          >
            <span>
              {isStealth ? "COVERT DECRYPTION FEED" : "LIVE DECRYPTION FEED"}
            </span>
            {wipeTimestamp > 0 && (
              <span className="text-red-500 animate-pulse">[ SCRUBBED ]</span>
            )}
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-track-transparent"
          >
            {visibleChatHistory.length === 0 ? (
              <p className={`text-center text-xs mt-10 ${activeTheme.muted}`}>
                [ AWAITING AUDIO SIGNALS ]
              </p>
            ) : (
              visibleChatHistory.map((msg, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span
                    className={`shrink-0 text-xs font-bold mt-0.5 ${msg.isUser ? "text-gray-500" : activeTheme.text}`}
                  >
                    {msg.isUser
                      ? isDirector
                        ? "ASHU :"
                        : "OPERATOR :"
                      : isDirector
                        ? "DIRECTOR CORE :"
                        : "IMF AI :"}
                  </span>
                  <span
                    className={msg.isUser ? "text-gray-300" : activeTheme.text}
                  >
                    {msg.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AudioMonitor({
  label,
  trackRef,
  fillClass,
  borderClass,
}: {
  label: string;
  trackRef: any;
  fillClass: string;
  borderClass: string;
}) {
  const volume = useTrackVolume(trackRef);

  return (
    <div
      className={`flex flex-col gap-2 border ${borderClass} bg-black/30 p-4 transition-colors duration-700`}
    >
      <span className="text-xs font-bold text-gray-500">{label}</span>
      <div className="h-6 w-full rounded bg-gray-900 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-out ${fillClass}`}
          style={{ width: `${Math.max(2, volume * 100)}%` }}
        />
      </div>
    </div>
  );
}
