export const AUTO_OPEN_DIRECTOR_FILE = true;

export interface DirectorDossier {
  codename: string;
  fullName: string;
  title: string;
  clearance: string;
  status: string;
  fields: { label: string; value: string }[];
  tags: string[];
  notes: string;
  photo?: string;
}

export const DIRECTOR_FILE: DirectorDossier = {
  codename: "DIRECTOR ASHU // ARCHITECT",
  fullName: "Ashu Newatia",
  title: "Chief Architect & Director // IMF Cybernetic Division",
  clearance: "LEVEL 0 // OMEGA OVERRIDE",
  status: "ACTIVE // GHOST PROTOCOL MASTER KEY",
  fields: [
    {
      label: "Designation",
      value: "Primary Architect, Autonomous Intelligence Division",
    },
    {
      label: "Authentication",
      value: "Bypass Cipher: Ghost Protocol // SHA-512 Biometric Lock",
    },
    {
      label: "Base of Operations",
      value: "Sector 7 // Surat & Indore Relay Hub, India",
    },
    {
      label: "Specialization",
      value:
        "Low-Latency Autonomous Comms, Full-Stack Telemetry & Distributed Systems",
    },
    {
      label: "Background",
      value:
        "Computer Science & Engineering // Indian Institute of Technology Indore",
    },
    {
      label: "Languages",
      value: "English, Hindi, C++, TypeScript, Assembly (Tactical Core)",
    },
    {
      label: "Active Projects",
      value: "Project Ghost Protocol, LiveKit Neural Fabric, CampusFlow",
    },
    {
      label: "Secure Contact",
      value: "SIGNAL // ashu.imf.net // GPG Key: 0x9F4B3C81",
    },
  ],
  tags: [
    "CYBER WARFARE",
    "REAL-TIME WEBRTC",
    "COMPETITIVE ALGORITHMS",
    "TACTICAL AI CORE",
    "SURVEILLANCE ARCHITECTURE",
  ],
  notes:
    "Sole developer and administrator of the Ghost Protocol neural uplink. Retains root administrative clearance to intercept global tactical feeds, initiate terminal purges, and deploy autonomous operational countermeasures across all IMF sectors.",
  photo: undefined,
};
