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
  useChat,
  useDataChannel,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

interface TargetDossier {
  variant: "hostile" | "public";
  codename: string;
  realName: string;
  threatLevel: string;
  interpolNotice: string;
  status: string;
  origin: string;
  primaryAffiliation: string;
  crimes: string[];
  notes: string;
  photo?: string;
}

interface SatelliteRecon {
  target: string;
  locationName: string;
  lat: number;
  lon: number;
  satelliteCode: string;
  orbitStatus: string;
  resolution: string;
}

const DOSSIER_DATABASE: Record<string, TargetDossier> = {
  escobar: {
    variant: "hostile",
    codename: "THE PATRON",
    realName: "Pablo Emilio Escobar Gaviria",
    threatLevel: "LEVEL ALPHA // CRITICAL",
    interpolNotice: "RED NOTICE #A-492/10-1989",
    status: "DECEASED / ARCHIVED HOSTILE",
    origin: "Rionegro / Medellín, Colombia",
    primaryAffiliation: "Medellín Cartel (Cartel de Medellín)",
    crimes: [
      "Transnational Narcotics Trafficking",
      "Narco-Terrorism & State Subversion",
      "Avianca Flight 203 Bombing (1989)",
      "DAS Building Bombing (Bogotá)",
    ],
    notes:
      'Pioneered industrial-scale aerial cocaine distribution networks into North America. Constructed private prison citadel "La Catedral" to evade extradition treaties. Neutralized in Bloque de Búsqueda rooftop operation, Dec 2, 1993.',
  },
};

export default function App() {
  const [token, setToken] = useState("");
  const [liveKitUrl, setLiveKitUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToHQ = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/token");
      const data = await res.json();
      setToken(data.token);
      setLiveKitUrl(data.url || process.env.NEXT_PUBLIC_LIVEKIT_URL || "");
    } catch (err) {
      alert("Connection failed. Check your network or LiveKit keys.");
    }
    setIsConnecting(false);
  };

  if (!token) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-gray-950 font-mono text-cyan-400 select-none relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="z-10 flex flex-col gap-6 border border-cyan-800 bg-gray-900/80 p-10 shadow-[0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-md">
          <h1 className="text-3xl font-bold tracking-[0.3em] drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
            IMF TACTICAL TERMINAL
          </h1>
          <p className="text-sm text-cyan-600 tracking-widest">
            AWAITING CLEARANCE FOR SECURE DOWNLINK...
          </p>
          <button
            onClick={connectToHQ}
            disabled={isConnecting}
            className="mt-4 border border-cyan-500 bg-cyan-950/50 px-8 py-4 font-bold tracking-widest transition-all hover:bg-cyan-900 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            {isConnecting ? "ENCRYPTING CHANNEL..." : "INITIALIZE UPLINK"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={liveKitUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      audio={true}
      className="h-screen w-full font-mono bg-black select-none"
      onDisconnected={() => setToken("")}
      onError={(err) => {
        if (err?.message?.includes("PC manager is closed")) return;
        console.warn("LiveKit error:", err);
      }}
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
  const [fallbackText, setFallbackText] = useState("");

  // Tactical Audio State
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(false);
  const [isThemePaused, setIsThemePaused] = useState<boolean>(false);
  const [themeVolume, setThemeVolume] = useState<number>(0.35);
  const [trackTitle, setTrackTitle] = useState<string>(
    "MISSION: IMPOSSIBLE THEME",
  );
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthGainNodeRef = useRef<GainNode | null>(null);

  // Target Dossier State
  const [activeDossier, setActiveDossier] = useState<TargetDossier | null>(
    null,
  );

  // Live Satellite Reconnaissance State
  const [activeSatellite, setActiveSatellite] = useState<SatelliteRecon | null>(
    null,
  );

  // Dossiers pushed from the backend agent
  useDataChannel("dossier", (msg) => {
    try {
      const incoming = JSON.parse(
        new TextDecoder().decode(msg.payload),
      ) as TargetDossier;
      const preset = Object.entries(DOSSIER_DATABASE).find(([key]) =>
        incoming.realName.toLowerCase().includes(key),
      );
      setActiveDossier(preset ? preset[1] : incoming);
    } catch (e) {
      console.warn("Dossier parse failure:", e);
    }
  });

  // Satellite reconnaissance feed pushed from backend agent
  useDataChannel("satellite", (msg) => {
    try {
      const incoming = JSON.parse(
        new TextDecoder().decode(msg.payload),
      ) as SatelliteRecon;
      setActiveSatellite(incoming);
    } catch (e) {
      console.warn("Satellite parse failure:", e);
    }
  });

  // Wiretap Recording State & Audio Graph Refs
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const lastProcessedTimeRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const agentConnectedToRecorderRef = useRef<boolean>(false);

  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const { audioTrack: agentTrack } = useVoiceAssistant();
  const { send: sendChat, chatMessages } = useChat();

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

  const voiceMessages = [
    ...userSegments.map((s) => ({
      text: s.text,
      time: s.firstReceivedTime || 0,
      isUser: true,
      isText: false,
    })),
    ...agentSegments.map((s) => ({
      text: s.text,
      time: s.firstReceivedTime || 0,
      isUser: false,
      isText: false,
    })),
  ];

  const textMsgs = chatMessages.map((m) => ({
    text: m.message,
    time: m.timestamp,
    isUser: m.from?.identity === localParticipant.identity,
    isText: true,
  }));

  const fullChatHistory = [...voiceMessages, ...textMsgs].sort(
    (a, b) => a.time - b.time,
  );

  const getNativeMediaTrack = (ref: any): MediaStreamTrack | undefined => {
    return (
      ref?.publication?.track?.mediaStreamTrack ||
      ref?.track?.mediaStreamTrack ||
      ref?.mediaStreamTrack
    );
  };

  const startRecording = async () => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      const dest = audioCtx.createMediaStreamDestination();

      audioCtxRef.current = audioCtx;
      destRef.current = dest;
      agentConnectedToRecorderRef.current = false;

      const micMediaTrack = getNativeMediaTrack(micRef);
      if (micMediaTrack) {
        audioCtx
          .createMediaStreamSource(new MediaStream([micMediaTrack]))
          .connect(dest);
      }

      const agentMediaTrack = getNativeMediaTrack(agentTrack);
      if (agentMediaTrack) {
        audioCtx
          .createMediaStreamSource(new MediaStream([agentMediaTrack]))
          .connect(dest);
        agentConnectedToRecorderRef.current = true;
      }

      const recorder = new MediaRecorder(dest.stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `IMF_WIRETAP_${Date.now()}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        audioCtx.close();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Wiretap failed:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      agentConnectedToRecorderRef.current = false;
    }
  };

  useEffect(() => {
    if (
      isRecording &&
      audioCtxRef.current &&
      destRef.current &&
      !agentConnectedToRecorderRef.current
    ) {
      const agentMediaTrack = getNativeMediaTrack(agentTrack);
      if (agentMediaTrack) {
        try {
          audioCtxRef.current
            .createMediaStreamSource(new MediaStream([agentMediaTrack]))
            .connect(destRef.current);
          agentConnectedToRecorderRef.current = true;
        } catch (err) {
          console.error("Error attaching agent audio track:", err);
        }
      }
    }
  }, [isRecording, agentTrack]);

  const handleVolumeChange = (newVol: number) => {
    setThemeVolume(newVol);
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = newVol;
    }
    if (synthGainNodeRef.current && synthCtxRef.current) {
      synthGainNodeRef.current.gain.setValueAtTime(
        newVol * 0.2,
        synthCtxRef.current.currentTime,
      );
    }
  };

  const startTacticalSynth = () => {
    try {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (!synthCtxRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        synthCtxRef.current = new AudioContextClass();
      }

      const ctx = synthCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      if (!synthGainNodeRef.current) {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(themeVolume * 0.2, ctx.currentTime);
        masterGain.connect(ctx.destination);
        synthGainNodeRef.current = masterGain;
      }

      const notes = [196, 0, 196, 0, 233.08, 0, 261.63, 0];
      let step = 0;

      synthIntervalRef.current = setInterval(() => {
        const freq = notes[step % notes.length];
        step++;

        if (freq > 0 && ctx && synthGainNodeRef.current) {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          noteGain.gain.setValueAtTime(0.08, ctx.currentTime);
          noteGain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.18,
          );

          osc.connect(noteGain);
          noteGain.connect(synthGainNodeRef.current);

          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      }, 210);

      setIsThemePaused(false);
    } catch (e) {
      console.warn("Synth initialization warning:", e);
    }
  };

  const pauseTacticalAudio = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (bgAudioRef.current && !bgAudioRef.current.paused) {
      bgAudioRef.current.pause();
    }
    setIsThemePaused(true);
  };

  const resumeTacticalAudio = () => {
    if (bgAudioRef.current && bgAudioRef.current.src) {
      bgAudioRef.current
        .play()
        .then(() => setIsThemePaused(false))
        .catch(() => startTacticalSynth());
    } else {
      startTacticalSynth();
    }
  };

  const closeTacticalPlayer = () => {
    pauseTacticalAudio();
    setShowAudioPlayer(false);
  };

  // Tactical Voice & Text Listener
  useEffect(() => {
    const userMessages = fullChatHistory.filter((m) => m.isUser);
    if (!userMessages.length) return;

    const latestMsg = userMessages[userMessages.length - 1];
    if (latestMsg.time <= lastProcessedTimeRef.current) return;

    const lastMessage = latestMsg.text.toLowerCase();
    const clean = lastMessage.replace(/[^a-z0-9 ]/g, "");

    let commandExecuted = false;

    // Self Destruct Protocol
    if (
      (clean.includes("initiate self destruct") ||
        clean.includes("self destruct sequence")) &&
      !isDestructing
    ) {
      setIsDestructing(true);
      setTimeout(() => onDisconnect(), 5000);
      commandExecuted = true;
    }

    // Stealth Protocol
    if (
      clean.includes("engage stealth") ||
      clean.includes("go dark") ||
      clean.includes("godark")
    ) {
      setIsStealth(true);
      commandExecuted = true;
    }
    if (
      clean.includes("disable stealth") ||
      clean.includes("drop stealth") ||
      clean.includes("return to normal") ||
      clean.includes("back to normal")
    ) {
      setIsStealth(false);
      commandExecuted = true;
    }

    // Director Clearance (Ghost Protocol)
    if (
      !isDirector &&
      (clean.includes("execute ghost protocol") ||
        clean.includes("execute cost protocol") ||
        (clean.includes("ghost protocol") && !clean.includes("revoke")))
    ) {
      setIsDirector(true);
      commandExecuted = true;
    }
    if (
      isDirector &&
      (clean.includes("revoke ghost protocol") || clean.includes("stand down"))
    ) {
      setIsDirector(false);
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 800);
      commandExecuted = true;
    }

    // Target Dossier Query Manual Overrides
    if (
      clean.includes("escobar") ||
      clean.includes("pablo escobar") ||
      clean.includes("the patron")
    ) {
      setActiveDossier(DOSSIER_DATABASE.escobar);
      commandExecuted = true;
    }
    if (
      clean.includes("close dossier") ||
      clean.includes("dismiss dossier") ||
      clean.includes("clear intel")
    ) {
      setActiveDossier(null);
      commandExecuted = true;
    }

    // Satellite Feed Overrides
    if (
      clean.includes("close satellite") ||
      clean.includes("dismiss satellite") ||
      clean.includes("disable satellite") ||
      clean.includes("clear satellite")
    ) {
      setActiveSatellite(null);
      commandExecuted = true;
    }

    // Comms Scrubbing (Burn Notice)
    if (clean.includes("burn notice") || clean.includes("sanitize comms")) {
      setWipeTimestamp(Date.now());
      setActiveDossier(null);
      setActiveSatellite(null);
      commandExecuted = true;
    }

    // Wiretap Audio Recording
    if (
      (clean.includes("start wiretap") || clean.includes("record call")) &&
      !isRecording
    ) {
      startRecording();
      commandExecuted = true;
    }
    if (
      (clean.includes("stop wiretap") ||
        clean.includes("save recording") ||
        clean.includes("export recording")) &&
      isRecording
    ) {
      stopRecording();
      commandExecuted = true;
    }

    // Tactical Audio Player
    if (
      clean.includes("play mission theme") ||
      clean.includes("play mission impossible") ||
      clean.includes("cue theme") ||
      clean.includes("play theme") ||
      clean.includes("play music")
    ) {
      setTrackTitle("MISSION: IMPOSSIBLE TACTICAL SYNTH");
      setShowAudioPlayer(true);

      const audio = new Audio("/audio/theme.mp3");
      audio.loop = true;
      audio.volume = themeVolume;
      audio
        .play()
        .then(() => {
          bgAudioRef.current = audio;
          setIsThemePaused(false);
        })
        .catch(() => {
          startTacticalSynth();
        });

      commandExecuted = true;
    }

    if (
      clean.includes("cut music") ||
      clean.includes("stop audio") ||
      clean.includes("stop music") ||
      clean.includes("silence player")
    ) {
      closeTacticalPlayer();
      commandExecuted = true;
    }

    // Intel Extraction
    if (clean.includes("extract intel") || clean.includes("download dossier")) {
      const transcript = fullChatHistory
        .map(
          (msg) =>
            `[${new Date(msg.time).toISOString()}] [${msg.isUser ? "OPERATOR" : "AI CORE"}]: ${msg.text}`,
        )
        .join("\n\n");
      const blob = new Blob(
        [`IMF SECURE DOSSIER\n----------------------\n\n${transcript}`],
        {
          type: "text/plain",
        },
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `IMF_DOSSIER_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      commandExecuted = true;
    }

    if (commandExecuted) {
      lastProcessedTimeRef.current = latestMsg.time;
    }
  }, [
    fullChatHistory,
    isDirector,
    isDestructing,
    isRecording,
    onDisconnect,
    themeVolume,
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleChatHistory = fullChatHistory.filter(
    (msg) => msg.time > wipeTimestamp,
  );

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleChatHistory]);

  const handleFallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackText.trim()) return;
    if (connectionState !== ConnectionState.Connected) return;

    try {
      sendChat(fallbackText);
      setFallbackText("");
    } catch (err) {
      console.warn("Failed to send text fallback:", err);
    }
  };

  const themes = {
    cyan: {
      text: "text-cyan-400",
      bg: "bg-gray-950",
      border: "border-cyan-800",
      hex: "#22d3ee",
      glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
      title: "text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]",
    },
    amber: {
      text: "text-amber-400",
      bg: "bg-[#140b00]",
      border: "border-amber-600",
      hex: "#fbbf24",
      glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
      title: "text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    },
    emerald: {
      text: "text-emerald-500",
      bg: "bg-black",
      border: "border-emerald-900",
      hex: "#10b981",
      glow: "shadow-none",
      title: "text-emerald-700",
    },
    red: {
      text: "text-red-500",
      bg: "bg-[#1a0505]",
      border: "border-red-600",
      hex: "#ef4444",
      glow: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
      title:
        "text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-pulse",
    },
  };

  let active = themes.cyan;
  if (isDirector) active = themes.amber;
  if (isStealth) active = themes.emerald;
  if (isDestructing) active = themes.red;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`relative flex h-full flex-col p-6 ${active.text} ${active.bg} ${
        isGlitching
          ? "animate-pulse blur-[1px] invert-[0.1] skew-x-[-2deg]"
          : "transition-colors duration-700"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-50 mix-blend-overlay"></div>

      {/* Header */}
      <header
        className={`flex items-end justify-between border-b ${active.border} pb-4 z-10`}
      >
        <div className="flex flex-col gap-1">
          <h1
            className={`text-2xl font-bold tracking-[0.2em] uppercase ${active.title}`}
          >
            {isDestructing
              ? "CRITICAL: PURGE INITIATED"
              : isDirector
                ? "DIRECTOR OVERRIDE ACTIVE"
                : "IMF SECURE DOWNLINK"}
          </h1>
          <div className="flex items-center gap-4 text-xs font-bold tracking-widest opacity-80">
            <span>
              SYS.STATUS:{" "}
              <span className="text-white">
                {isDestructing ? "TERMINATING" : connectionState.toUpperCase()}
              </span>
            </span>
            <span>
              ENC: <span className="text-white">AES-256</span>
            </span>
            {activeSatellite && (
              <span className="text-emerald-400 animate-pulse font-bold">
                [ ORBITAL FEED: {activeSatellite.target} ]
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`border px-4 py-2 text-xs font-bold tracking-widest transition-all ${
              isRecording
                ? "border-red-500 bg-red-950 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                : `\${active.border} hover:bg-white/5`
            }`}
          >
            {isRecording ? "● WIRETAP ACTIVE" : "○ WIRETAP"}
          </button>
          <button
            onClick={onDisconnect}
            className={`border px-4 py-2 text-xs font-bold tracking-widest transition-colors ${
              isDestructing
                ? "border-red-500 bg-red-600 text-white"
                : "border-red-900 bg-red-950/30 text-red-500 hover:bg-red-900/50"
            }`}
          >
            {isDestructing ? "ABORT PURGE" : "DISCONNECT"}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="mt-6 flex flex-1 gap-6 overflow-hidden max-md:flex-col z-10 relative">
        {/* Left Column: Oscilloscope Telemetry & Soundtrack Player */}
        {!isStealth && (
          <div className="flex w-1/3 min-w-[280px] flex-col gap-6 max-md:w-full">
            <AudioWaveMonitor
              label="CH 01 // LOCAL OPERATOR"
              trackRef={micRef}
              activeTheme={active}
            />
            <AudioWaveMonitor
              label="CH 02 // TACTICAL AI SYNTH"
              trackRef={agentTrack as any}
              activeTheme={active}
            />

            {showAudioPlayer && (
              <div
                className={`flex flex-col gap-3 border ${active.border} bg-black/60 p-4 ${active.glow} transition-all duration-700`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${isThemePaused ? "bg-gray-500" : "bg-cyan-400 animate-ping"}`}
                    ></span>
                    <span className="text-[10px] font-bold tracking-widest opacity-80 uppercase">
                      TACTICAL AUDIO STREAM
                    </span>
                  </div>
                  <button
                    onClick={closeTacticalPlayer}
                    className="text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-900/30 px-2 py-0.5 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-2 border border-white/5 bg-black/40 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white tracking-wider">
                        {trackTitle}
                      </span>
                      <span className="text-[10px] text-cyan-500 opacity-60">
                        {isThemePaused
                          ? "STATUS: PAUSED"
                          : "STATUS: AUTO-LOOP ACTIVE"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (isThemePaused) {
                          resumeTacticalAudio();
                        } else {
                          pauseTacticalAudio();
                        }
                      }}
                      className={`border ${active.border} px-3 py-1 text-[10px] font-bold tracking-widest transition-all ${
                        isThemePaused
                          ? "bg-cyan-950 text-cyan-300"
                          : "hover:bg-white/10"
                      }`}
                    >
                      {isThemePaused ? "RESUME" : "PAUSE"}
                    </button>
                  </div>

                  <div className="mt-2 flex flex-col gap-1 border-t border-white/5 pt-2">
                    <div className="flex justify-between text-[10px] opacity-60 font-bold">
                      <span>AUDIO LEVEL</span>
                      <span>{Math.round(themeVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={themeVolume}
                      onChange={(e) =>
                        handleVolumeChange(parseFloat(e.target.value))
                      }
                      className="h-1 w-full cursor-pointer appearance-none rounded bg-gray-800 accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() =>
                localParticipant.setMicrophoneEnabled(
                  !localParticipant.isMicrophoneEnabled,
                )
              }
              className={`mt-auto border p-4 text-sm font-bold tracking-widest transition-all ${
                localParticipant.isMicrophoneEnabled
                  ? `${active.border} bg-black/40 hover:bg-white/10${active.glow}`
                  : "border-red-800 bg-red-950/50 text-red-500 shadow-none"
              }`}
            >
              {localParticipant.isMicrophoneEnabled
                ? "MUTE MICROPHONE"
                : "UNMUTE MICROPHONE"}
            </button>
          </div>
        )}

        {/* Right Column: Decryption Feed / Live Satellite View & Text CLI */}
        <div
          className={`flex flex-1 flex-col border ${active.border} bg-black/60 backdrop-blur-sm ${active.glow} transition-all duration-700 relative`}
        >
          <div
            className={`flex justify-between items-center border-b ${active.border} bg-black/40 px-4 py-2 text-xs font-bold tracking-widest`}
          >
            <span className="opacity-70">
              {activeSatellite
                ? `ORBITAL RECONNAISSANCE // ${activeSatellite.satelliteCode}`
                : isStealth
                  ? "COVERT DECRYPTION LOG"
                  : "LIVE DECRYPTION LOG"}
            </span>
            <div className="flex items-center gap-3">
              {activeSatellite && (
                <button
                  onClick={() => setActiveSatellite(null)}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold tracking-wider"
                >
                  [ DISENGAGE SATCOM ]
                </button>
              )}
              {wipeTimestamp > 0 && (
                <span className="text-red-500 animate-pulse">
                  [ LOGS SCRUBBED ]
                </span>
              )}
            </div>
          </div>

          {/* DYNAMIC SATELLITE HUD OVERLAY */}
          {activeSatellite ? (
            <div className="relative flex-1 bg-gray-950 overflow-hidden flex flex-col justify-between p-4">
              {/* Satellite Map Canvas Iframe */}
              <iframe
                title="Satellite Recon"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeSatellite.lon - 0.08}%2C${activeSatellite.lat - 0.05}%2C${activeSatellite.lon + 0.08}%2C${activeSatellite.lat + 0.05}&layer=mapnik&marker=${activeSatellite.lat}%2C${activeSatellite.lon}`}
                className="absolute inset-0 w-full h-full border-0 opacity-40 contrast-200 invert hue-rotate-180 brightness-75 pointer-events-none"
              />

              {/* Optical Reticle & Scanning Crosshairs */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48 border border-cyan-500/40 rounded-full animate-spin [animation-duration:12s]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400"></div>
                </div>
                <div className="absolute w-32 h-32 border-2 border-dashed border-red-500/60 rounded-full animate-ping [animation-duration:3s]"></div>
                <div className="absolute w-6 h-6 border-t-2 border-l-2 border-cyan-400 top-1/2 left-1/2 -translate-x-6 -translate-y-6"></div>
                <div className="absolute w-6 h-6 border-b-2 border-r-2 border-cyan-400 top-1/2 left-1/2 translate-x-1 translate-y-1"></div>
              </div>

              {/* Top Telemetry Overlay */}
              <div className="z-10 bg-black/80 border border-cyan-900/60 p-3 max-w-md backdrop-blur-sm">
                <div className="flex justify-between items-center text-[10px] text-cyan-400 font-bold">
                  <span>TARGET LOCK: {activeSatellite.target}</span>
                  <span className="text-emerald-400">
                    {activeSatellite.orbitStatus}
                  </span>
                </div>
                <p className="text-xs text-white font-bold mt-1 truncate">
                  {activeSatellite.locationName}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                  <div>
                    LAT:{" "}
                    <span className="text-cyan-300 font-bold">
                      {activeSatellite.lat.toFixed(6)}°
                    </span>
                  </div>
                  <div>
                    LON:{" "}
                    <span className="text-cyan-300 font-bold">
                      {activeSatellite.lon.toFixed(6)}°
                    </span>
                  </div>
                  <div>
                    OPTIC:{" "}
                    <span className="text-cyan-300 font-bold">
                      {activeSatellite.resolution}
                    </span>
                  </div>
                  <div>
                    UPLINK:{" "}
                    <span className="text-cyan-300 font-bold">
                      MIL-SAT ENCRYPTED
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Reconnaissance Banner */}
              <div className="z-10 flex justify-between items-center text-[10px] bg-black/80 border border-cyan-900/60 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-cyan-400 font-bold animate-pulse">
                  ● LIVE SATELLITE RECONNAISSANCE ACTIVE
                </span>
                <button
                  onClick={() => setActiveSatellite(null)}
                  className="text-red-400 hover:text-white font-bold"
                >
                  RETURN TO CHAT STREAM
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent"
            >
              {visibleChatHistory.length === 0 ? (
                <div className="flex h-full items-center justify-center opacity-40">
                  <p className="text-sm tracking-widest animate-pulse">
                    [ LISTENING FOR SECURE COMMS ]
                  </p>
                </div>
              ) : (
                visibleChatHistory.map((msg, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] opacity-50 font-bold tracking-wider">
                      <span>{formatTime(msg.time)}</span>
                      <span>//</span>
                      <span
                        className={msg.isUser ? "text-gray-400" : active.text}
                      >
                        {msg.isUser
                          ? isDirector
                            ? "AUTHORIZATION: ASHU"
                            : "AUTHORIZATION: OPERATOR"
                          : isDirector
                            ? "CORE: DIRECTOR"
                            : "CORE: IMF AI"}
                      </span>
                      {msg.isText && <span className="border px-1">TXT</span>}
                    </div>
                    <div
                      className={`text-sm leading-relaxed tracking-wide ${
                        msg.isUser ? "text-gray-300" : active.text
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <form
            onSubmit={handleFallbackSubmit}
            className={`flex border-t ${active.border} bg-black`}
          >
            <div
              className={`flex items-center justify-center px-4 font-bold ${active.title}`}
            >
              &gt;
            </div>
            <input
              type="text"
              value={fallbackText}
              onChange={(e) => setFallbackText(e.target.value)}
              placeholder="ENTER SECURE COMMAND..."
              className={`flex-1 bg-transparent p-3 text-sm outline-none placeholder:opacity-30 ${active.text} tracking-wider`}
              autoComplete="off"
            />
            <button
              type="submit"
              className={`border-l ${active.border} px-6 text-xs font-bold tracking-widest hover:bg-white/10 transition-colors`}
            >
              TRANSMIT
            </button>
          </form>
        </div>

        {/* CLASSIFIED TARGET DOSSIER SLIDE-OVER DRAWER */}
        {activeDossier && (
          <aside className="absolute right-0 top-0 bottom-0 w-96 border-l-2 border-red-600 bg-black/95 p-6 shadow-[-15px_0_35px_rgba(239,68,68,0.35)] backdrop-blur-md flex flex-col z-40 overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Header banner */}
            <div className="flex justify-between items-start border-b border-red-700/60 pb-3">
              <div>
                <span className="bg-red-600 px-2 py-0.5 text-[10px] font-black text-black tracking-widest uppercase">
                  {activeDossier.variant === "hostile"
                    ? "INTERPOL RED NOTICE"
                    : "OPEN-SOURCE DOSSIER"}
                </span>
                <h2 className="text-xl font-black text-red-500 tracking-widest mt-1">
                  {activeDossier.codename}
                </h2>
                <p className="text-[10px] text-red-400/80 font-bold">
                  {activeDossier.interpolNotice}
                </p>
              </div>
              <button
                onClick={() => setActiveDossier(null)}
                className="text-red-500 hover:text-white border border-red-800 hover:border-red-500 px-2 py-0.5 text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Wireframe Portrait & Telemetry */}
            <div className="mt-4 flex gap-3 border border-red-900/50 bg-red-950/20 p-3">
              <div className="w-24 h-28 border border-red-500/50 bg-black flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(239,68,68,0.1)_0px,rgba(239,68,68,0.1)_2px,transparent_2px,transparent_4px)]"></div>
                {activeDossier.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeDossier.photo}
                    alt={activeDossier.realName}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <span className="text-3xl text-red-500 opacity-60 font-mono">
                    👤
                  </span>
                )}
                <span className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                  PHOTO DECRYPTED
                </span>
              </div>
              <div className="flex flex-col justify-between text-[11px] leading-tight">
                <div>
                  <span className="text-red-400/60 text-[9px] font-bold uppercase">
                    Target Identity:
                  </span>
                  <p className="font-bold text-white">
                    {activeDossier.realName}
                  </p>
                </div>
                <div>
                  <span className="text-red-400/60 text-[9px] font-bold uppercase">
                    Threat Tier:
                  </span>
                  <p className="font-bold text-red-400">
                    {activeDossier.threatLevel}
                  </p>
                </div>
                <div>
                  <span className="text-red-400/60 text-[9px] font-bold uppercase">
                    Status:
                  </span>
                  <p className="font-bold text-gray-300">
                    {activeDossier.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Tactical Intel Specs */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="border-b border-red-900/30 pb-2">
                <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider">
                  {activeDossier.variant === "hostile"
                    ? "Origin & Base:"
                    : "Profession:"}
                </span>
                <p className="text-gray-200 mt-0.5">{activeDossier.origin}</p>
              </div>

              <div className="border-b border-red-900/30 pb-2">
                <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider">
                  {activeDossier.variant === "hostile"
                    ? "Primary Syndicate:"
                    : "Source:"}
                </span>
                <p className="text-gray-200 mt-0.5">
                  {activeDossier.primaryAffiliation}
                </p>
              </div>

              {activeDossier.crimes.length > 0 && (
                <div className="border-b border-red-900/30 pb-2">
                  <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider">
                    Key Documented Crimes:
                  </span>
                  <ul className="mt-1 list-disc list-inside text-gray-300 space-y-0.5 text-[11px]">
                    {activeDossier.crimes.map((crime, idx) => (
                      <li key={idx}>{crime}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider">
                  Intelligence Brief:
                </span>
                <p className="text-gray-300 text-[11px] leading-relaxed mt-1 bg-black/60 p-2 border border-red-950">
                  {activeDossier.notes}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-auto pt-4 flex gap-2">
              <button
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify(activeDossier, null, 2)],
                    {
                      type: "application/json",
                    },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `DOSSIER_${activeDossier.codename.replace(/\s+/g, "_")}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 border border-red-600 bg-red-950/40 text-red-400 hover:bg-red-900/50 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors"
              >
                DOWNLOAD DOSSIER
              </button>
              <button
                onClick={() => setActiveDossier(null)}
                className="border border-white/20 hover:border-white px-3 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
              >
                CLOSE
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function AudioWaveMonitor({
  label,
  trackRef,
  activeTheme,
}: {
  label: string;
  trackRef: any;
  activeTheme: any;
}) {
  const volume = useTrackVolume(trackRef);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const volumeRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let smoothedVol = 0;

    const render = () => {
      if (!canvas || !trackRef?.publication?.track) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      smoothedVol += (volumeRef.current - smoothedVol) * 0.25;
      phaseRef.current += 0.14 + smoothedVol * 0.2;

      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 1;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = activeTheme.hex;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.5;

      const secondaryAmp = Math.max(1.5, smoothedVol * (height * 0.35));
      for (let x = 0; x < width; x++) {
        const envelope = Math.sin((x / width) * Math.PI);
        const y =
          height / 2 +
          Math.sin(x * 0.06 - phaseRef.current * 1.2) * secondaryAmp * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = activeTheme.hex;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = activeTheme.hex;
      ctx.shadowBlur = smoothedVol > 0.03 ? 12 : 4;

      const primaryAmp = Math.max(2, smoothedVol * (height * 0.45));
      for (let x = 0; x < width; x++) {
        const envelope = Math.sin((x / width) * Math.PI);
        const y =
          height / 2 +
          (Math.sin(x * 0.04 + phaseRef.current) * 0.75 +
            Math.sin(x * 0.09 - phaseRef.current * 1.6) * 0.25) *
            primaryAmp *
            envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeTheme.hex, trackRef]);

  return (
    <div
      className={`flex flex-col gap-3 border ${activeTheme.border} bg-black/40 p-5 ${activeTheme.glow} transition-all duration-700`}
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold tracking-widest opacity-60">
          {label}
        </span>
        <span className="text-[10px] font-bold opacity-40">
          {Math.round(volume * 100)}%
        </span>
      </div>
      <div className="relative h-20 w-full overflow-hidden rounded border border-white/5 bg-gray-950/90">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
        <canvas
          ref={canvasRef}
          width={360}
          height={80}
          className="h-full w-full block"
        />
      </div>
    </div>
  );
}
