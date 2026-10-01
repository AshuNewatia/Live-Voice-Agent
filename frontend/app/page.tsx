"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useLocalParticipant,
  useTrackTranscription,
  useConnectionState,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

export default function IMFCommandConsole() {
  const [token, setToken] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [missionTime, setMissionTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Mission stopwatch
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (token) {
      timer = setInterval(() => setMissionTime((t) => t + 1), 1000);
    } else {
      setMissionTime(0);
    }
    return () => clearInterval(timer);
  }, [token]);

  const formatMissionTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const initMission = async () => {
    try {
      setIsConnecting(true);
      const res = await fetch("/api/token");
      const data = await res.json();
      if (!data.token) throw new Error("Token acquisition failed");
      setToken(data.token);
      setUrl(data.url || process.env.NEXT_PUBLIC_LIVEKIT_URL || "");
    } catch (err) {
      console.error("[UPLINK FAILURE]:", err);
      alert(
        "IMF Downlink Failure: Could not establish encrypted token connection.",
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const abortMission = () => {
    setToken("");
    setUrl("");
    setIsMuted(false);
  };

  return (
    <main className="relative w-full h-[100dvh] bg-[#020611] text-cyan-400 font-mono flex flex-col overflow-hidden select-none">
      {/* Scanline CRT FX */}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

      {/* Tactical HUD Header */}
      <header className="relative z-20 flex flex-wrap items-center justify-between border-b border-cyan-900/60 bg-[#030a1c]/90 px-3 py-2 sm:px-6 sm:py-3 shrink-0 backdrop-blur-md gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                token ? "animate-ping bg-cyan-400" : "bg-red-500"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                token ? "bg-cyan-400" : "bg-red-500"
              }`}
            />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-widest uppercase text-cyan-200">
              IMF TACTICAL SECURE DOWNLINK
            </h1>
            <p className="text-[9px] sm:text-[10px] text-cyan-600 font-semibold tracking-wider">
              PROTOCOL: {token ? "ENCRYPTED COMMS ACTIVE" : "AWAITING DISPATCH"}
            </p>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
          <div className="flex flex-col items-end">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-cyan-600">
              MISSION TIME
            </span>
            <span className="font-bold tracking-widest text-cyan-300">
              {formatMissionTime(missionTime)}
            </span>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-cyan-600">
              SECURITY LEVEL
            </span>
            <span className="font-bold tracking-widest text-cyan-300">
              IMF-TOP-SECRET
            </span>
          </div>
        </div>
      </header>

      {/* Main Terminal Viewport */}
      {!token ? (
        /* Standby / Connect Screen */
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
          <div className="w-full max-w-md border border-cyan-900/60 bg-[#03091e]/80 p-6 sm:p-8 backdrop-blur-md relative shadow-[0_0_50px_rgba(6,182,212,0.12)]">
            {/* HUD Corner Reticles */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

            <div className="w-12 h-12 mx-auto mb-4 border border-cyan-500/40 rounded-full flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 animate-pulse"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </div>

            <h2 className="text-sm sm:text-base font-bold tracking-widest text-cyan-100 uppercase mb-2">
              IMPOSSIBLE MISSION FORCE
            </h2>
            <p className="text-[11px] sm:text-xs text-cyan-600 mb-6 leading-relaxed">
              Autonomous Tactical Core offline. Initialize encrypted field
              downlink to connect with the tactical voice agent.
            </p>

            <button
              onClick={initMission}
              disabled={isConnecting}
              className="w-full py-3.5 px-4 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500 text-cyan-200 text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-200 active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              {isConnecting ? "ENCRYPTING DOWNLINK..." : "INITIALIZE UPLINK"}
            </button>
          </div>
        </div>
      ) : (
        /* Active Mission HUD */
        <LiveKitRoom
          token={token}
          serverUrl={url}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={abortMission}
          className="relative z-20 flex-1 flex flex-col overflow-hidden"
        >
          <RoomAudioRenderer />
          <TacticalHUDCore
            onAbort={abortMission}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        </LiveKitRoom>
      )}
    </main>
  );
}

interface HUDCoreProps {
  onAbort: () => void;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
}

function TacticalHUDCore({ onAbort, isMuted, setIsMuted }: HUDCoreProps) {
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();

  const toggleMic = async () => {
    if (!localParticipant) return;
    const currentMute = localParticipant.isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(!currentMute);
    setIsMuted(currentMute);
  };

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 gap-2 sm:gap-3 overflow-hidden">
      {/* Visualizers & Feed Responsive Split: Stack on mobile, side-by-side on lg */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 min-h-0 overflow-hidden">
        {/* Oscilloscope Panel (Top on mobile, Left on desktop) */}
        <section className="lg:col-span-5 flex flex-col gap-2 sm:gap-3 min-h-[180px] sm:min-h-[220px] lg:min-h-0">
          <div className="flex-1 relative bg-[#03091e]/80 border border-cyan-900/60 p-2 sm:p-3 flex flex-col">
            <Reticles />
            <span className="text-[9px] font-bold tracking-widest text-cyan-500 uppercase mb-1">
              CHANNEL 01 // OPERATOR MIC WAVEFORM
            </span>
            <div className="flex-1 relative w-full h-full min-h-[70px]">
              <TrackOscilloscope source="local" />
            </div>
          </div>

          <div className="flex-1 relative bg-[#03091e]/80 border border-cyan-900/60 p-2 sm:p-3 flex flex-col">
            <Reticles />
            <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase mb-1">
              CHANNEL 02 // IMF AGENT SYNTH WAVEFORM
            </span>
            <div className="flex-1 relative w-full h-full min-h-[70px]">
              <TrackOscilloscope source="agent" />
            </div>
          </div>
        </section>

        {/* Tactical Feed Panel (Bottom on mobile, Right on desktop) */}
        <section className="lg:col-span-7 flex-1 min-h-[220px] lg:min-h-0 overflow-hidden">
          <TacticalTranscriptFeed />
        </section>
      </div>

      {/* Tactical Bottom Control Bar */}
      <footer className="shrink-0 flex items-center justify-between border border-cyan-900/60 bg-[#030a1c]/90 px-3 py-2 sm:px-4 sm:py-3 gap-2">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs">
          <span className="text-cyan-600 hidden sm:inline">STATUS:</span>
          <span
            className={`font-bold tracking-wider ${
              connectionState === ConnectionState.Connected
                ? "text-cyan-300"
                : "text-amber-400 animate-pulse"
            }`}
          >
            {connectionState.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute Button */}
          <button
            onClick={toggleMic}
            className={`px-3 py-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase border transition-all ${
              isMuted
                ? "bg-amber-950/80 border-amber-500 text-amber-300"
                : "bg-cyan-950/60 border-cyan-600 text-cyan-300 hover:bg-cyan-900/60"
            }`}
          >
            {isMuted ? "UNMUTE MIC" : "MUTE MIC"}
          </button>

          {/* Abort Mission Button */}
          <button
            onClick={onAbort}
            className="px-3 py-2 bg-red-950/60 hover:bg-red-900/80 border border-red-500/80 text-red-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            TERMINATE DOWNLINK
          </button>
        </div>
      </footer>
    </div>
  );
}

/* Responsive Real-Time Canvas Oscilloscope */
function TrackOscilloscope({ source }: { source: "local" | "agent" }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { audioTrack: agentAudioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();

  const micPub = Array.from(localParticipant.trackPublications.values()).find(
    (p) => p.source === Track.Source.Microphone && p.track,
  );

  const activeTrack =
    source === "agent"
      ? agentAudioTrack?.publication?.track?.mediaStreamTrack
      : micPub?.track?.mediaStreamTrack;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive Canvas Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          canvas.width = Math.floor(width * window.devicePixelRatio);
          canvas.height = Math.floor(height * window.devicePixelRatio);
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    if (!activeTrack) {
      // Idle Flatline
      let animId: number;
      const drawIdle = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle =
          source === "local" ? "rgba(56,189,248,0.2)" : "rgba(6,182,212,0.2)";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        animId = requestAnimationFrame(drawIdle);
      };
      drawIdle();
      return () => {
        cancelAnimationFrame(animId);
        resizeObserver.disconnect();
      };
    }

    // AudioContext Setup
    const audioCtx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
    const mediaStream = new MediaStream([activeTrack]);
    const audioSource = audioCtx.createMediaStreamSource(mediaStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    audioSource.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animId: number;

    const render = () => {
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = source === "agent" ? 2 : 1.5;
      ctx.strokeStyle = source === "local" ? "#38bdf8" : "#22d3ee";
      ctx.shadowBlur = 8;
      ctx.shadowColor = source === "local" ? "#0284c7" : "#06b6d4";

      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      audioCtx.close().catch(() => {});
      resizeObserver.disconnect();
    };
  }, [activeTrack, source]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}

/* Real-Time Transcript Feed with Dynamic Mobile Height */
function TacticalTranscriptFeed() {
  const { audioTrack: aiAudioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();

  const micPub = Array.from(localParticipant.trackPublications.values()).find(
    (p) => p.source === Track.Source.Microphone && p.track,
  );

  const localTrackRef = micPub?.track
    ? {
        participant: localParticipant,
        source: Track.Source.Microphone,
        publication: micPub,
      }
    : undefined;

  const agentSegments = useTrackTranscription(
    aiAudioTrack?.publication?.track ? aiAudioTrack : undefined,
  ).segments;
  const userSegments = useTrackTranscription(localTrackRef).segments;

  const taggedAgentSegments = (agentSegments || []).map((seg) => ({
    ...seg,
    speakerRole: "agent" as const,
  }));

  const taggedUserSegments = (userSegments || []).map((seg) => ({
    ...seg,
    speakerRole: "operator" as const,
  }));

  const allSegments = [...taggedUserSegments, ...taggedAgentSegments].sort(
    (a, b) => (a.firstReceivedTime || 0) - (b.firstReceivedTime || 0),
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allSegments]);

  return (
    <div className="w-full h-full bg-[#030816]/90 border border-cyan-900/60 flex flex-col p-3 sm:p-4 relative shadow-[0_0_40px_rgba(2,132,199,0.1)] overflow-hidden">
      <Reticles />

      {/* Subheader */}
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            TACTICAL DECRYPTION // COMMS FEED
          </span>
        </div>
        <span className="text-[8px] sm:text-[9px] text-cyan-600 font-mono tracking-wider">
          LIVE STT
        </span>
      </div>

      {/* Auto-scrolling Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent"
      >
        {allSegments && allSegments.length > 0 ? (
          allSegments.map((seg, idx) => {
            const isOperator = seg.speakerRole === "operator";
            return (
              <div
                key={seg.id || `${seg.speakerRole}-${idx}`}
                className="flex items-start gap-2 sm:gap-3 text-[11px] sm:text-xs leading-relaxed"
              >
                <span
                  className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold tracking-wider shrink-0 border ${
                    isOperator
                      ? "bg-sky-950/80 border-sky-400 text-sky-300"
                      : "bg-cyan-950/80 border-cyan-500 text-cyan-300"
                  }`}
                >
                  {isOperator ? "OPERATOR" : "IMF AI"}
                </span>
                <span
                  className={`${
                    isOperator ? "text-sky-100 font-medium" : "text-cyan-200"
                  } break-words`}
                >
                  {seg.text}
                </span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-cyan-700/60 text-[10px] sm:text-xs tracking-widest uppercase text-center p-4">
            [STANDBY: NO AUDIO SIGNALS DETECTED ON WIRE]
          </div>
        )}
      </div>
    </div>
  );
}

/* Corner Reticles HUD Utility */
function Reticles() {
  return (
    <>
      <div className="pointer-events-none absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
      <div className="pointer-events-none absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
    </>
  );
}
