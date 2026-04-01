import React, { useEffect, useRef, useState } from "react";
import { CallState, Message } from "../types";
import { getSimulatedResponse } from "../services/conversationFlow";
import {
  hasElevenLabsConfig,
  speakAgentText,
  stopVoicePlayback,
} from "../services/elevenLabsService";
import {
  isSpeechRecognitionSupported,
  startSpeechRecognition,
} from "../services/speechRecognition";

interface ActiveCallProps {
  callState: CallState;
  agentName: string;
  agentSystemId: string;
  agentVoiceId: string;
  onUpdateScore: (delta: number) => void;
  onAddMessage: (message: Message) => void;
  onEndCall: () => void;
}

export default function ActiveCall({
  callState,
  agentName,
  agentSystemId,
  agentVoiceId,
  onUpdateScore,
  onAddMessage,
  onEndCall,
}: ActiveCallProps) {
  const [userInput, setUserInput] = useState("");
  const [voiceMode, setVoiceMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState<"elevenlabs" | "browser" | "none">(
    hasElevenLabsConfig() ? "elevenlabs" : "browser"
  );
  const [voiceError, setVoiceError] = useState("");
  const [pendingAutoClose, setPendingAutoClose] = useState(false);
  const stopListeningRef = useRef<(() => void) | null>(null);
  const lastSpokenMessageRef = useRef("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const quickReplies = [
    "Yes, sounds good",
    "Not interested",
    "Tell me more",
    "Send me email",
    "I don't have time",
    "Thank you for the call",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [callState.conversationHistory.length]);

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    if (isListening && stopListeningRef.current) {
      stopListeningRef.current();
      stopListeningRef.current = null;
      setIsListening(false);
    }

    const userMessage: Message = { role: "lead", content: message, timestamp: new Date() };
    onAddMessage(userMessage);
    setUserInput("");
    setVoiceError("");

    const simulated = getSimulatedResponse(message, callState);
    const agentMessage: Message = { role: "agent", content: simulated.content, timestamp: new Date() };
    onAddMessage(agentMessage);
    onUpdateScore(simulated.score);

    if (simulated.shouldEndCall) {
      setPendingAutoClose(true);
      if (!voiceMode) {
        window.setTimeout(() => { stopVoicePlayback(); onEndCall(); }, 800);
      }
    }
  };

  // Voice playback effect
  useEffect(() => {
    if (!voiceMode) { stopVoicePlayback(); setIsSpeaking(false); return undefined; }
    const latestAgentMessage = [...callState.conversationHistory].reverse().find((m) => m.role === "agent");
    if (!latestAgentMessage) return undefined;
    const messageKey = `${latestAgentMessage.timestamp.toString()}_${latestAgentMessage.content}`;
    if (messageKey === lastSpokenMessageRef.current) return undefined;
    lastSpokenMessageRef.current = messageKey;
    let isCancelled = false;
    setIsSpeaking(true);
    setVoiceError("");
    void speakAgentText(latestAgentMessage.content, agentVoiceId)
      .then((provider) => {
        if (!isCancelled) {
          setVoiceProvider(provider);
          setIsSpeaking(false);
          if (pendingAutoClose) { setPendingAutoClose(false); stopVoicePlayback(); onEndCall(); }
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setVoiceProvider("none");
          setIsSpeaking(false);
          setVoiceError(error instanceof Error ? error.message : "Voice playback failed.");
          if (pendingAutoClose) { setPendingAutoClose(false); onEndCall(); }
        }
      });
    return () => { isCancelled = true; };
  }, [agentVoiceId, callState.conversationHistory, onEndCall, pendingAutoClose, voiceMode]);

  useEffect(() => {
    return () => { stopVoicePlayback(); if (stopListeningRef.current) stopListeningRef.current(); };
  }, []);

  const handleMicToggle = () => {
    if (isListening && stopListeningRef.current) {
      stopListeningRef.current();
      stopListeningRef.current = null;
      setIsListening(false);
      return;
    }
    setVoiceError("");
    setIsListening(true);
    stopListeningRef.current = startSpeechRecognition({
      onTranscript: (transcript) => { setUserInput(transcript); handleSendMessage(transcript); },
      onError: (message) => { setVoiceError(message); setIsListening(false); stopListeningRef.current = null; },
      onEnd: () => { setIsListening(false); stopListeningRef.current = null; },
    });
  };

  const mins = Math.floor(callState.callDuration / 60);
  const secs = String(callState.callDuration % 60).padStart(2, "0");
  const score = callState.qualificationScore;
  const scoreColor = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="call-screen">
      {/* Left: Call header + chat */}
      <div className="call-main">
        {/* Call header bar */}
        <div className="call-header">
          <div className="call-header-left">
            <div className="call-avatar-live">
              <span>{agentName.split(" ").map((p) => p[0]).join("")}</span>
              {isSpeaking && <span className="pulse-ring" />}
            </div>
            <div className="call-header-info">
              <strong>{agentName}</strong>
              <span className="call-header-sub">
                speaking with <strong>{callState.lead.name}</strong> · {callState.lead.role} at {callState.lead.company}
              </span>
            </div>
          </div>
          <div className="call-header-right">
            <div className="call-timer">
              <span className="timer-dot" />
              {mins}:{secs}
            </div>
            <div className="call-score-mini" style={{ borderColor: scoreColor }}>
              <span style={{ color: scoreColor }}>{score}</span>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="call-chat">
          {callState.conversationHistory.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role}`}>
              <div className="chat-msg-avatar">
                {msg.role === "agent"
                  ? agentName.split(" ").map((p) => p[0]).join("")
                  : callState.lead.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div className="chat-msg-body">
                <span className="chat-msg-name">
                  {msg.role === "agent" ? agentName : callState.lead.name}
                </span>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {isSpeaking && (
            <div className="chat-msg agent">
              <div className="chat-msg-avatar">{agentName.split(" ").map((p) => p[0]).join("")}</div>
              <div className="chat-msg-body">
                <span className="chat-msg-name">{agentName}</span>
                <div className="typing-indicator"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick replies */}
        <div className="call-quick-replies">
          {quickReplies.map((opt) => (
            <button key={opt} type="button" className="quick-chip" onClick={() => handleSendMessage(opt)}>
              {opt}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="call-input-bar">
          <button
            type="button"
            className={`call-btn-icon ${isListening ? "active-mic" : ""}`}
            onClick={handleMicToggle}
            disabled={!isSpeechRecognitionSupported()}
            title={isListening ? "Stop listening" : "Start speaking"}
          >
            {isListening ? "⏹" : "🎤"}
          </button>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(userInput); }}
            placeholder="Type your response…"
          />
          <button type="button" className="call-btn-send" onClick={() => handleSendMessage(userInput)}>
            Send
          </button>
        </div>
        {voiceError && <p className="call-voice-error">{voiceError}</p>}
      </div>

      {/* Right: Call controls sidebar */}
      <div className="call-sidebar">
        {/* Score ring */}
        <div className="sidebar-score">
          <svg viewBox="0 0 80 80" className="score-svg">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke={scoreColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 213.6} 213.6`}
              transform="rotate(-90 40 40)"
              className="score-arc"
            />
          </svg>
          <div className="score-center">
            <strong style={{ color: scoreColor }}>{score}</strong>
            <span>/ 100</span>
          </div>
        </div>
        <span className="sidebar-label">
          {score >= 80 ? "Ready to Convert" : score >= 60 ? "High Intent" : score >= 40 ? "Engaged" : "Early Stage"}
        </span>

        {/* Voice status */}
        <div className="sidebar-section">
          <span className="sidebar-section-title">Voice</span>
          <div className="sidebar-pills">
            <span className={`s-pill ${voiceProvider === "elevenlabs" ? "active" : ""}`}>
              {voiceProvider === "elevenlabs" ? "ElevenLabs" : voiceProvider === "browser" ? "Browser" : "Off"}
            </span>
            {isSpeaking && <span className="s-pill speaking">Speaking…</span>}
            {isListening && <span className="s-pill listening">Listening…</span>}
          </div>
          <button
            type="button"
            className={`sidebar-toggle ${voiceMode ? "on" : ""}`}
            onClick={() => setVoiceMode((prev) => !prev)}
          >
            {voiceMode ? "🔊 Voice On" : "🔇 Voice Off"}
          </button>
        </div>

        {/* Lead info */}
        <div className="sidebar-section">
          <span className="sidebar-section-title">Lead</span>
          <div className="sidebar-lead-card">
            <strong>{callState.lead.name}</strong>
            <span>{callState.lead.role}</span>
            <span>{callState.lead.company}</span>
          </div>
        </div>

        {/* Agent info */}
        <div className="sidebar-section">
          <span className="sidebar-section-title">Agent</span>
          <div className="sidebar-lead-card">
            <strong>{agentName}</strong>
            <span>ID: {agentSystemId || "—"}</span>
          </div>
        </div>

        {/* End call */}
        <button
          type="button"
          className="call-end-btn"
          onClick={() => { stopVoicePlayback(); onEndCall(); }}
        >
          ✕ End Call
        </button>
      </div>
    </div>
  );
}