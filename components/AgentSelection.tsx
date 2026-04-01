import React, { useState } from "react";
import { AgentProfile, PastCallRecord, ProspectCase } from "../types";

interface AgentSelectionProps {
  agents: AgentProfile[];
  cases: ProspectCase[];
  pastCalls: PastCallRecord[];
  onStart: (agentId: string, caseId: string, agentName: string, lead: any) => void;
  onOpenSettings: () => void;
}

export default function AgentSelection({
  agents,
  cases,
  pastCalls,
  onStart,
  onOpenSettings,
}: AgentSelectionProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>(agents[0]?.id ?? "");
  const [selectedCase, setSelectedCase] = useState<string>(cases[0]?.id ?? "");

  const agent = agents.find((a) => a.id === selectedAgent);
  const prospect = cases.find((c) => c.id === selectedCase);

  const handleStart = () => {
    if (!agent || !prospect) return;
    onStart(selectedAgent, selectedCase, agent.name, {
      name: prospect.prospect,
      company: prospect.company,
      role: prospect.role,
      country: prospect.country,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="workspace-card selection-screen">
      {/* Top bar */}
      <div className="sel-topbar">
        <div className="sel-topbar-left">
          <span className="sel-logo">DFS</span>
          <div>
            <p className="sel-kicker">AI Calling Console</p>
            <h2 className="sel-title">New Call</h2>
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenSettings}>
          ⚙ Settings
        </button>
      </div>

      {/* Dropdown row */}
      <div className="sel-config-row">
        <div className="sel-dropdown-group">
          <label className="sel-label">Agent</label>
          <select
            className="sel-select"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.title}
              </option>
            ))}
          </select>
          {agent && (
            <div className="sel-preview">
              <span className="sel-avatar">{agent.name.split(" ").map((p) => p[0]).join("")}</span>
              <div className="sel-preview-info">
                <strong>{agent.name}</strong>
                <span>{agent.description}</span>
                <span className="sel-id">ID: {agent.agentSystemId || "—"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="sel-dropdown-group">
          <label className="sel-label">Lead Case</label>
          <select
            className="sel-select"
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.prospect} — {c.label}
              </option>
            ))}
          </select>
          {prospect && (
            <div className="sel-preview">
              <span className="sel-avatar lead-avatar">{prospect.prospect.split(" ").map((p) => p[0]).join("")}</span>
              <div className="sel-preview-info">
                <strong>{prospect.prospect}</strong>
                <span>{prospect.role} at {prospect.company}</span>
                <span className="sel-id">{prospect.label} • {prospect.country}</span>
              </div>
            </div>
          )}
        </div>

        <div className="sel-action-col">
          <button
            type="button"
            className="btn btn-primary btn-call"
            onClick={handleStart}
            disabled={!agent || !prospect}
          >
            <span className="call-icon">📞</span> Start Call
          </button>
        </div>
      </div>

      {/* Past calls table */}
      <section className="history-panel">
        <div className="history-header">
          <h3>Call History</h3>
          <span className="history-count">{pastCalls.length} calls</span>
        </div>

        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Lead</th>
                <th>Agent</th>
                <th>Status</th>
                <th>Score</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {pastCalls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-history">
                    No calls recorded yet. Start a call to see history here.
                  </td>
                </tr>
              ) : (
                pastCalls.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.endedAtIso).toLocaleString()}</td>
                    <td>
                      <strong>{record.leadName}</strong>
                      <span>{record.company}</span>
                    </td>
                    <td>{record.agentName}</td>
                    <td>
                      <span className={`status-dot ${record.score >= 60 ? "green" : record.score >= 40 ? "amber" : "red"}`} />
                      {record.status}
                    </td>
                    <td><strong>{record.score}</strong>/100</td>
                    <td>{formatDuration(record.durationSeconds)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
