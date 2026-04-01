import React, { useEffect, useRef, useState } from "react";
import AgentSelection from "./components/AgentSelection";
import SettingsPage from "./components/SettingsPage";
import CallInitiation from "./components/CallInitiation";
import ActiveCall from "./components/ActiveCall";
import CallSummary from "./components/CallSummary";
import { AgentProfile, CallState, Message, PastCallRecord, ProspectCase } from "./types";
import { buildGreeting } from "./services/conversationFlow";
import "./styles.css";

const AGENTS_STORAGE_KEY = "dfs_agents_v1";
const PAST_CALLS_STORAGE_KEY = "dfs_past_calls_v1";

const defaultAgents: AgentProfile[] = [
  {
    id: "agent_1",
    name: "Priya Singh",
    title: "Senior Sales Representative",
    description: "Investor relations and strategic partnerships.",
    agentSystemId: "PRIYA-001",
    voiceId: "PIGsltMj3gFMR34aFDI3",
  },
  {
    id: "agent_2",
    name: "Ahmed Hassan",
    title: "Business Development Manager",
    description: "Institutional outreach and executive qualification.",
    agentSystemId: "AHMED-002",
    voiceId: "PIGsltMj3gFMR34aFDI3",
  },
  {
    id: "agent_3",
    name: "Sofia Moreno",
    title: "Partnership Executive",
    description: "Banking innovation and expansion programs.",
    agentSystemId: "SOFIA-003",
    voiceId: "PIGsltMj3gFMR34aFDI3",
  },
];

const prospectCases: ProspectCase[] = [
  {
    id: "case_1",
    label: "Qualified Lead",
    prospect: "Raj Patel",
    company: "FinTech Innovations",
    role: "VP Finance",
    country: "UAE",
  },
  {
    id: "case_2",
    label: "Skeptical Prospect",
    prospect: "Maria Garcia",
    company: "Digital Banking Corp",
    role: "CTO",
    country: "UAE",
  },
  {
    id: "case_3",
    label: "Time-Constrained Lead",
    prospect: "James Miller",
    company: "InnovateTech Inc",
    role: "CEO",
    country: "UAE",
  },
  {
    id: "case_4",
    label: "Undecided Lead",
    prospect: "Aisha Khan",
    company: "Global Finance Partners",
    role: "Head of Strategy",
    country: "UAE",
  },
];

function createInitialCallState(): CallState {
  return {
    status: "idle",
    lead: {
      name: "Raj Patel",
      company: "FinTech Innovations",
      role: "VP Finance",
      country: "UAE",
    },
    conversationHistory: [],
    qualificationScore: 0,
    intent: "undecided",
    nextAction: "",
    callDuration: 0,
    responses: {},
  };
}

function getNextAction(score: number): string {
  if (score >= 80) {
    return "Send VIP confirmation and registration details within 24 hours.";
  }
  if (score >= 60) {
    return "Share event brief, reserve a complimentary seat, and follow up in 48 hours.";
  }
  if (score >= 40) {
    return "Keep the lead warm with event highlights and a follow-up touchpoint next week.";
  }
  return "Log the outcome and re-engage only if priorities change closer to the summit.";
}

function getIntent(score: number): CallState["intent"] {
  if (score >= 70) {
    return "interested";
  }
  if (score <= 20) {
    return "not_interested";
  }
  return "undecided";
}

function getCallStatus(score: number): string {
  if (score >= 80) {
    return "Conversion Ready";
  }
  if (score >= 60) {
    return "High Intent";
  }
  if (score >= 40) {
    return "In Discussion";
  }
  return "Not Prioritized";
}

function loadAgentsFromStorage(): AgentProfile[] {
  try {
    const raw = window.localStorage.getItem(AGENTS_STORAGE_KEY);
    if (!raw) {
      return defaultAgents;
    }
    const parsed = JSON.parse(raw) as AgentProfile[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultAgents;
    }
    return parsed.map((agent, index) => ({
      ...defaultAgents[index],
      ...agent,
      id: defaultAgents[index]?.id || agent.id,
      name: defaultAgents[index]?.name || agent.name,
      title: defaultAgents[index]?.title || agent.title,
      description: defaultAgents[index]?.description || agent.description,
    }));
  } catch {
    return defaultAgents;
  }
}

function normalizePastCallRecord(record: unknown): PastCallRecord | null {
  if (!record || typeof record !== "object") {
    return null;
  }

  const item = record as Record<string, unknown>;
  const leadName = typeof item.leadName === "string" ? item.leadName : "Unknown Lead";
  const company = typeof item.company === "string" ? item.company : "Unknown Company";
  const agentName = typeof item.agentName === "string" ? item.agentName : "Unknown Agent";
  const score =
    typeof item.score === "number"
      ? item.score
      : typeof item.qualificationScore === "number"
      ? item.qualificationScore
      : 0;
  const status =
    typeof item.status === "string"
      ? item.status
      : typeof item.callStatus === "string"
      ? item.callStatus
      : "In Discussion";
  const durationSeconds =
    typeof item.durationSeconds === "number"
      ? item.durationSeconds
      : typeof item.callDuration === "number"
      ? item.callDuration
      : 0;
  const endedAtIso =
    typeof item.endedAtIso === "string"
      ? item.endedAtIso
      : typeof item.timestamp === "string"
      ? item.timestamp
      : new Date().toISOString();
  const id = typeof item.id === "string" ? item.id : `${endedAtIso}-${leadName}`;

  return {
    id,
    leadName,
    company,
    agentName,
    score,
    status,
    durationSeconds,
    endedAtIso,
  };
}

function loadPastCallsFromStorage(): PastCallRecord[] {
  try {
    const raw = window.localStorage.getItem(PAST_CALLS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => normalizePastCallRecord(item))
      .filter((item): item is PastCallRecord => item !== null);
  } catch {
    return [];
  }
}

export default function App() {
  const [screen, setScreen] = useState<"selection" | "settings" | "ringing" | "active" | "summary">("selection");
  const [agents, setAgents] = useState<AgentProfile[]>(() => loadAgentsFromStorage());
  const [pastCalls, setPastCalls] = useState<PastCallRecord[]>(() => loadPastCallsFromStorage());
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [selectedCase, setSelectedCase] = useState<ProspectCase | null>(null);
  const [callState, setCallState] = useState<CallState>(createInitialCallState());
  const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);
  const [ringSecondsRemaining, setRingSecondsRemaining] = useState(5);

  const playRingBurst = () => {
    const ContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!ContextCtor) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new ContextCtor();
    }

    const context = audioContextRef.current;
    const now = context.currentTime;

    const osc1 = context.createOscillator();
    const gain1 = context.createGain();
    osc1.frequency.value = 760;
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(context.destination);
    osc1.start(now);
    osc1.stop(now + 0.24);

    const osc2 = context.createOscillator();
    const gain2 = context.createGain();
    osc2.frequency.value = 640;
    gain2.gain.setValueAtTime(0.0001, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.16, now + 0.34);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
    osc2.connect(gain2);
    gain2.connect(context.destination);
    osc2.start(now + 0.3);
    osc2.stop(now + 0.54);
  };

  const startRingtone = () => {
    playRingBurst();
    ringIntervalRef.current = window.setInterval(() => {
      playRingBurst();
      setRingSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
  };

  const stopRingtone = () => {
    if (ringIntervalRef.current) {
      window.clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (ringingTimeoutRef.current) {
      window.clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopRingtone();
  }, []);

  useEffect(() => {
    if (screen !== "active") return;
    const interval = window.setInterval(() => {
      setCallState((prev) => ({
        ...prev,
        callDuration: prev.callDuration + 1,
      }));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [screen]);

  const handleEndCall = () => {
    stopRingtone();
    if (callState.conversationHistory.length > 0) {
      const newRecord: PastCallRecord = {
        id: Date.now().toString(),
        endedAtIso: new Date().toISOString(),
        leadName: callState.lead.name,
        company: callState.lead.company,
        agentName: selectedAgent?.name || "Unknown",
        status: getCallStatus(callState.qualificationScore),
        score: callState.qualificationScore,
        durationSeconds: callState.callDuration,
      };
      setPastCalls((prev) => {
        const updated = [newRecord, ...prev].slice(0, 50);
        window.localStorage.setItem(PAST_CALLS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }

    setCallState((prev) => ({ ...prev, status: "ended" }));
    setScreen("summary");
  };

  const handleReturnToSelection = () => {
    stopRingtone();
    setScreen("selection");
    setSelectedAgent(null);
    setSelectedCase(null);
    setCallState(createInitialCallState());
  };

  const handleSaveAgents = (updatedAgents: AgentProfile[]) => {
    setAgents(updatedAgents);
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(updatedAgents));
  };

  const handleUpdateScore = (delta: number) => {
    setCallState((prev) => ({
      ...prev,
      qualificationScore: Math.max(0, Math.min(100, prev.qualificationScore + delta)),
    }));
  };

  const handleAddMessage = (message: Message) => {
    setCallState((prev) => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message],
    }));
  };

  const handleStartCall = (agentId: string, caseId: string, agentName: string, lead: any) => {
    const agent = agents.find((a) => a.id === agentId);
    const prospectCase = prospectCases.find((c) => c.id === caseId);

    if (!agent || !prospectCase) return;

    setSelectedAgent(agent);
    setSelectedCase(prospectCase);

    const newCallState = createInitialCallState();
    newCallState.lead = lead;

    setCallState(newCallState);
    setScreen("ringing");
    setRingSecondsRemaining(5);
    startRingtone();

    ringingTimeoutRef.current = setTimeout(() => {
      const greeting = buildGreeting(lead, agentName);
      setCallState((prev) => ({
        ...prev,
        status: "active",
        conversationHistory: [{ role: "agent", content: greeting, timestamp: new Date() }],
        qualificationScore: 15,
      }));
      stopRingtone();
      setScreen("active");
    }, 5000);
  };

  const getBreadcrumbStep = (): number => {
    switch (screen) {
      case "selection":
        return 1;
      case "ringing":
      case "active":
      case "summary":
        return 2;
      case "settings":
        return 3;
      default:
        return 1;
    }
  };

  const getBreadcrumbName = (): string => {
    switch (screen) {
      case "selection":
        return "Select";
      case "ringing":
      case "active":
      case "summary":
        return "Call";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="app-container">
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <div className="breadcrumb-wrapper">
          <div className={`breadcrumb-dot ${getBreadcrumbStep() >= 1 ? "active" : ""}`}>1</div>
          <div className="breadcrumb-connector" style={{ opacity: getBreadcrumbStep() >= 2 ? 1 : 0.3 }} />
          <div className={`breadcrumb-dot ${getBreadcrumbStep() >= 2 ? "active" : ""}`}>2</div>
          <div className="breadcrumb-connector" style={{ opacity: getBreadcrumbStep() >= 3 ? 1 : 0.3 }} />
          <div className={`breadcrumb-dot ${getBreadcrumbStep() >= 3 ? "active" : ""}`}>3</div>
          <span className="breadcrumb-text">{getBreadcrumbName()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {screen === "selection" && (
          <AgentSelection
            agents={agents}
            cases={prospectCases}
            pastCalls={pastCalls}
            onStart={handleStartCall}
            onOpenSettings={() => setScreen("settings")}
          />
        )}
        {screen === "settings" && (
          <SettingsPage agents={agents} onSave={handleSaveAgents} onBack={() => setScreen("selection")} />
        )}
        {screen === "ringing" && selectedAgent && (
          <CallInitiation
            lead={callState.lead}
            agentName={selectedAgent.name}
            agentSystemId={selectedAgent.agentSystemId}
            isRinging={true}
            ringSecondsRemaining={ringSecondsRemaining}
            onAccept={() => {
              stopRingtone();
              if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
              const greeting = buildGreeting(callState.lead, selectedAgent.name);
              setCallState((prev) => ({
                ...prev,
                status: "active",
                conversationHistory: [{ role: "agent", content: greeting, timestamp: new Date() }],
                qualificationScore: 15,
              }));
              setScreen("active");
            }}
          />
        )}
        {screen === "active" && selectedAgent && (
          <ActiveCall
            callState={callState}
            agentName={selectedAgent.name}
            agentSystemId={selectedAgent.agentSystemId}
            agentVoiceId={selectedAgent.voiceId}
            onUpdateScore={handleUpdateScore}
            onAddMessage={handleAddMessage}
            onEndCall={handleEndCall}
          />
        )}
        {screen === "summary" && selectedAgent && (
          <CallSummary
            callState={callState}
            agentName={selectedAgent.name}
            agentSystemId={selectedAgent.agentSystemId}
            onNewCall={handleReturnToSelection}
          />
        )}
      </div>
    </div>
  );
}
