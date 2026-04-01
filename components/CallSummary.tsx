import React from "react";
import { CallState } from "../types";
import { eventData } from "../services/data";

interface CallSummaryProps {
  callState: CallState;
  agentName: string;
  agentSystemId: string;
  onNewCall: () => void;
}

export default function CallSummary({
  callState,
  agentName,
  agentSystemId,
  onNewCall,
}: CallSummaryProps) {
  const lastMessage =
    callState.conversationHistory[callState.conversationHistory.length - 1]?.content ??
    "No conversation captured.";

  const status =
    callState.qualificationScore >= 80
      ? "Conversion Ready"
      : callState.qualificationScore >= 60
        ? "High Intent"
        : callState.qualificationScore >= 40
          ? "In Discussion"
          : "Not Prioritized";

  return (
    <div className="phone-card summary-card">
      <div className="status-strip">
        <span>Call complete</span>
        <span>{status}</span>
      </div>

      <h2>Call Outcome Summary</h2>

      <div className="summary-score-ring">
        <div>
          <strong>{callState.qualificationScore}</strong>
          <span>out of 100</span>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card-block">
          <span>Lead</span>
          <strong>{callState.lead.name}</strong>
          <p>
            {callState.lead.role} at {callState.lead.company}
          </p>
        </div>

        <div className="summary-card-block">
          <span>Agent</span>
          <strong>{agentName}</strong>
          <p>System ID: {agentSystemId || "Not configured"}</p>
        </div>

        <div className="summary-card-block">
          <span>Recommended next step</span>
          <strong>{callState.nextAction}</strong>
          <p>{eventData.name}, {eventData.dates}</p>
        </div>
      </div>

      <div className="summary-highlights">
        <span>Conversation snapshot</span>
        <p>{lastMessage}</p>
      </div>

      <button type="button" onClick={onNewCall} className="btn btn-primary btn-full">
        Start New Demo Call
      </button>
    </div>
  );
}