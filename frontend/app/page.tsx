"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useVoiceAssistant,
  useLocalParticipant,
  useTrackTranscription,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useRef, useState } from "react";
import { Track } from "livekit-client";

export default function Home() {
  const [token, setToken] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [secTimer, setSecTimer] = useState<string>("00:00:00");

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const hrs = String(Math.floor(diff / 3600)).padStart(2, "0");
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const secs = String(diff % 60).padStart(2, "0");
      setSecTimer(`${hrs}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("/api/token");
        const data = await resp.json();
        if (data.token && data.roomName) {
          setToken(data.token);
          setRoomName(data.roomName);
        } else {
          setError("SECURITY CIPHER MISMATCH: ACCESS REJECTED");
        }
      } catch (e) {
        console.error("Failed to fetch token:", e);
        setError("SATELLITE DOWNLINK INTERRUPTED");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#020617] text-cyan-400 font-mono tracking-widest uppercase">
        <div className="border border-cyan-500/40 bg-cyan-950/20 p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
          <p className="animate-pulse">⚠ [IMF PROTOCOL BREACH]: {error}</p>
        </div>
      </div>
    );
  }

  if (!token || !roomName) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#020617] text-cyan-400 font-mono gap-4 select-none">
        <div className="relative w-20 h-20 border-2 border-dashed border-cyan-500/40 rounded-full animate-spin flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-blue-500 rounded-full animate-ping"></div>
        </div>
        <p className="text-xs uppercase tracking-[0.4em] animate-pulse">
          ESTABLISHING QUANTUM DOWNLINK...
        </p>
      </div>
    );
  }

  return (
    <main className="relative flex h-screen w-screen flex-col justify-between bg-[#01040f] text-cyan-100 font-mono overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(1,4,15,0.95)_100%)] z-20"></div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0)_50%,rgba(2,6,23,0.35)_50%)] bg-[length:100%_4px] z-20 opacity-70"></div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <header className="relative w-full flex items-center justify-between py-3 px-8 bg-slate-950/80 border-b border-cyan-900/60 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <div className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-400 text-cyan-300 text-[11px] font-bold tracking-widest uppercase shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            IMF // BLACK-OPS
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-cyan-300 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_#22d3ee]"></span>
              TACTICAL FIELD OPERATING LINK
            </h1>
            <p className="text-[10px] text-cyan-600 tracking-wider">
              CLEARANCE: LEVEL 5 (DIRECTOR EYES ONLY)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 text-xs">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-cyan-600 uppercase tracking-widest">
              MISSION ELAPSED
            </span>
            <span className="text-cyan-300 font-bold tracking-wider">
              {secTimer}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-cyan-600 uppercase tracking-widest">
              DOWNLINK NODE
            </span>
            <span className="text-blue-400 font-bold tracking-wide">
              {roomName}
            </span>
          </div>
        </div>
      </header>

      <div className="relative flex-1 w-full flex flex-col justify-between py-4 px-8 z-30 overflow-hidden">
        <LiveKitRoom
          video={false}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          data-lk-theme="default"
          className="w-full h-full flex flex-col justify-between items-center gap-4"
        >
          <div className="w-full">
            <IMFTacticalTimeline />
          </div>

          <div className="w-full flex-1 min-h-[160px] max-h-[220px]">
            <TacticalTranscriptFeed />
          </div>

          <div className="px-8 py-2 bg-slate-950/90 border border-cyan-800/60 shadow-[0_0_30px_rgba(6,182,212,0.25)] rounded-md">
            <VoiceAssistantControlBar />
          </div>

          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>

      <footer className="relative w-full flex items-center justify-between py-2.5 px-8 border-t border-cyan-950 bg-slate-950/80 text-[10px] text-cyan-600 z-30">
        <div className="flex items-center gap-6">
          <span className="text-cyan-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>{" "}
            SATELLITE: LOCKED (GEO-SYNC)
          </span>
          <span>CIPHER: 4096-BIT QUANTUM ASYMMETRIC</span>
        </div>
        <div className="text-cyan-500/70 tracking-widest uppercase">
          SECURE COMM CHANNEL // MONITORING ACTIVE
        </div>
      </footer>
    </main>
  );
}

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

  // Explicitly tag speaker role at the segment level
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
    <div className="w-full h-full bg-[#030816]/90 border border-cyan-900/60 flex flex-col p-4 relative shadow-[0_0_40px_rgba(2,132,199,0.1)]">
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-400"></div>

      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            LIVE TACTICAL DECRYPTION // COMMS FEED
          </span>
        </div>
        <span className="text-[9px] text-cyan-600 font-mono tracking-wider">
          STT: STREAMING
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent"
      >
        {allSegments && allSegments.length > 0 ? (
          allSegments.map((seg, idx) => {
            const isOperator = seg.speakerRole === "operator";

            return (
              <div
                key={seg.id || `${seg.speakerRole}-${idx}`}
                className="flex items-start gap-3 text-xs leading-relaxed"
              >
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold tracking-wider shrink-0 border ${
                    isOperator
                      ? "bg-sky-950/80 border-sky-400 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                      : "bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
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
          <div className="h-full flex items-center justify-center text-cyan-700/60 text-xs tracking-widest uppercase">
            [STANDBY: NO AUDIO SIGNALS DETECTED ON WIRE]
          </div>
        )}
      </div>
    </div>
  );
}

function IMFTacticalTimeline() {
  const { state, audioTrack: aiAudioTrack } = useVoiceAssistant();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  const micCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const aiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const prevMicData = useRef<number[]>(new Array(160).fill(0));
  const prevAiData = useRef<number[]>(new Array(160).fill(0));

  useEffect(() => {
    const resizeCanvas = () => {
      if (micCanvasRef.current && aiCanvasRef.current) {
        const width = micCanvasRef.current.parentElement?.clientWidth || 1200;
        micCanvasRef.current.width = width;
        micCanvasRef.current.height = 70;
        aiCanvasRef.current.width = width;
        aiCanvasRef.current.height = 70;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const micPub = Array.from(localParticipant.trackPublications.values()).find(
      (p) => p.source === Track.Source.Microphone && p.track,
    );
    const mediaStreamTrack = micPub?.track?.mediaStreamTrack;
    if (!mediaStreamTrack || !micCanvasRef.current) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const stream = new MediaStream([mediaStreamTrack]);
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const canvas = micCanvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId: number;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationId = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 140;
      const barWidth = 3;
      const gap = (canvas.width - barCount * barWidth) / (barCount - 1);
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const raw = dataArray[i % bufferLength] / 255;
        prevMicData.current[i] = prevMicData.current[i] * 0.84 + raw * 0.16;
        const val = prevMicData.current[i];

        const height = Math.max(3, val * (canvas.height * 0.9));
        const x = i * (barWidth + gap);
        const y = centerY - height / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + height);
        grad.addColorStop(0, "rgba(56, 189, 248, 0.2)");
        grad.addColorStop(0.5, "#38bdf8");
        grad.addColorStop(1, "rgba(14, 165, 233, 0.2)");

        ctx.shadowBlur = val > 0.1 ? 12 : 0;
        ctx.shadowColor = "#0284c7";
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 1.5);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      audioCtx.close();
    };
  }, [localParticipant, isMicrophoneEnabled]);

  useEffect(() => {
    const mediaStreamTrack = aiAudioTrack?.publication?.track?.mediaStreamTrack;
    if (!mediaStreamTrack || !aiCanvasRef.current) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const stream = new MediaStream([mediaStreamTrack]);
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const canvas = aiCanvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId: number;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationId = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 140;
      const barWidth = 3;
      const gap = (canvas.width - barCount * barWidth) / (barCount - 1);
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const raw = dataArray[i % bufferLength] / 255;
        prevAiData.current[i] = prevAiData.current[i] * 0.84 + raw * 0.16;
        const val = prevAiData.current[i];

        const height = Math.max(3, val * (canvas.height * 0.9));
        const x = i * (barWidth + gap);
        const y = centerY - height / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + height);
        grad.addColorStop(0, "rgba(6, 182, 212, 0.25)");
        grad.addColorStop(0.5, "#22d3ee");
        grad.addColorStop(1, "rgba(37, 99, 235, 0.25)");

        ctx.shadowBlur = val > 0.1 ? 16 : 0;
        ctx.shadowColor = "#06b6d4";
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 1.5);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      audioCtx.close();
    };
  }, [aiAudioTrack]);

  return (
    <div className="w-full bg-[#030816]/90 border border-cyan-900/60 p-4 relative flex flex-col gap-3 shadow-[0_0_60px_rgba(2,132,199,0.15)]">
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

      <div className="absolute top-0 bottom-0 left-[35%] w-[1px] bg-cyan-500/80 z-30 pointer-events-none shadow-[0_0_8px_#06b6d4]">
        <div className="absolute top-1 -left-2 text-[7px] text-cyan-300 font-bold bg-slate-950 px-1 border border-cyan-600">
          SCAN
        </div>
      </div>

      <div className="w-full flex items-center gap-4 z-10">
        <div className="w-32 shrink-0 flex flex-col justify-between py-0.5 border-l-2 border-sky-400 pl-2">
          <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">
            OPERATOR
          </span>
          <span className="text-xs font-semibold text-gray-200">
            FIELD COMM
          </span>
          <span className="text-[8px] text-cyan-600 font-mono">
            {isMicrophoneEnabled ? "TX // LIVE" : "TX // MUTED"}
          </span>
        </div>

        <div className="relative h-16 flex-1 flex items-center bg-[#01040d] border border-cyan-950 px-2 overflow-hidden shadow-inner">
          <div className="absolute left-0 right-0 h-0 border-t border-dashed border-cyan-900/40 top-1/2 -translate-y-1/2 pointer-events-none"></div>
          <canvas ref={micCanvasRef} className="w-full h-full z-10" />
        </div>
      </div>

      <div className="w-full flex items-center gap-4 z-10">
        <div className="w-32 shrink-0 flex flex-col justify-between py-0.5 border-l-2 border-cyan-400 pl-2">
          <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
            TACTICAL AI
          </span>
          <span className="text-xs font-semibold text-cyan-200">
            SYNTH ENGINE
          </span>
          <span className="text-[8px] text-cyan-500 font-mono tracking-wider">
            {state.toUpperCase()}
          </span>
        </div>

        <div className="relative h-16 flex-1 flex items-center bg-[#01040d] border border-cyan-950 px-2 overflow-hidden shadow-inner">
          <div className="absolute left-0 right-0 h-0 border-t border-dashed border-cyan-900/40 top-1/2 -translate-y-1/2 pointer-events-none"></div>
          <canvas ref={aiCanvasRef} className="w-full h-full z-10" />
        </div>
      </div>
    </div>
  );
}
