export interface Lead {
  name: string;
  email?: string;
  company: string;
  role: string;
  country: string;
}

export interface Message {
  role: "agent" | "lead";
  content: string;
  timestamp: Date;
}

export interface CallState {
  status: "idle" | "ringing" | "active" | "ended";
  lead: Lead;
  conversationHistory: Message[];
  qualificationScore: number;
  intent: "interested" | "not_interested" | "undecided" | "objecting";
  nextAction: string;
  callDuration: number;
  responses: Record<string, string>;
}

export interface ClaudeResponse {
  response: string;
  detected_intent: string;
  next_question?: string;
  score_adjustment: number;
}

export interface VoiceCapabilities {
  ttsProvider: "elevenlabs" | "browser" | "none";
  speechRecognitionSupported: boolean;
}

export interface AgentProfile {
  id: string;
  name: string;
  title: string;
  description: string;
  agentSystemId: string;
  voiceId: string;
}

export interface ProspectCase {
  id: string;
  label: string;
  prospect: string;
  company: string;
  role: string;
  country: string;
}

export interface PastCallRecord {
  id: string;
  leadName: string;
  company: string;
  agentName: string;
  score: number;
  status: string;
  durationSeconds: number;
  endedAtIso: string;
}