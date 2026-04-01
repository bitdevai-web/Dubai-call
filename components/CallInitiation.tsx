import React from "react";
import { Lead } from "../types";
import { eventData } from "../services/data";

interface CallInitiationProps {
  lead: Lead;
  agentName: string;
  agentSystemId: string;
  isRinging: boolean;
  ringSecondsRemaining: number;
  onAccept: () => void;
}

export default function CallInitiation({
  lead,
  agentName,
  agentSystemId,
  isRinging,
  ringSecondsRemaining,
  onAccept,
}: CallInitiationProps) {
  return (
    <div className="phone-card incoming-card">
      <div className="status-strip">
        <span>Incoming curated invitation</span>
        <span>{isRinging ? `Ringing... auto-pick in ${ringSecondsRemaining}s` : "Ready"}</span>
      </div>

      <div className="incoming-avatar">{agentName.split(" ").map((part) => part[0]).join("")}</div>

      <div className="incoming-meta">
        <p className="incoming-kicker">Assigned Agent: {agentName}</p>
        <h2>Dubai Fintech Summit</h2>
        <p>
          Calling {lead.name}, {lead.role} at {lead.company}
        </p>
        <p className="incoming-agent-id">System ID: {agentSystemId || "Not configured"}</p>
      </div>

      <div className="incoming-highlight">
        <strong>Complimentary delegate invite</strong>
        <span>
          {eventData.dates} at {eventData.location}
        </span>
      </div>

      <div className="incoming-stats">
        <div>
          <strong>{eventData.ticketPrice}</strong>
          <span>Standard pass value</span>
        </div>
        <div>
          <strong>{eventData.attendees}</strong>
          <span>Expected attendees</span>
        </div>
      </div>

      <div className="incoming-actions">
        <button type="button" className="btn btn-ghost">
          Decline
        </button>
        <button type="button" onClick={onAccept} className="btn btn-primary">
          Pick Up Now
        </button>
      </div>
    </div>
  );
}