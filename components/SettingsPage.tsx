import React, { useRef, useState } from "react";
import { AgentProfile } from "../types";

interface SettingsPageProps {
  agents: AgentProfile[];
  onSave: (agents: AgentProfile[]) => void;
  onBack: () => void;
}

export default function SettingsPage({ agents, onSave, onBack }: SettingsPageProps) {
  const [draftAgents, setDraftAgents] = useState<AgentProfile[]>(
    agents.map((a) => ({ ...a }))
  );
  const [savedMsg, setSavedMsg] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  const updateField = (
    agentId: string,
    field: "agentSystemId" | "voiceId",
    value: string
  ) => {
    setDraftAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, [field]: value } : agent
      )
    );
    setSavedMsg("");
  };

  const handleSave = () => {
    onSave(draftAgents);
    setSavedMsg("✓ Settings saved successfully.");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handleExport = () => {
    const json = JSON.stringify(draftAgents, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dfs-agent-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as AgentProfile[];
        if (Array.isArray(parsed)) {
          setDraftAgents(parsed.map((p, i) => ({
            ...draftAgents[i],
            ...p,
            id: draftAgents[i]?.id ?? p.id,
            name: draftAgents[i]?.name ?? p.name,
            title: draftAgents[i]?.title ?? p.title,
          })));
          setSavedMsg("✓ File imported. Click Save to apply.");
        }
      } catch {
        setSavedMsg("✗ Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-pg-header">
        <div className="settings-pg-title-group">
          <span className="settings-pg-badge">⚙ System Settings</span>
          <h2 className="settings-pg-title">Agent Configuration</h2>
          <p className="settings-pg-subtitle">
            Configure Agent IDs and ElevenLabs Voice IDs for each agent profile. Changes are saved to your browser and can be exported as a local JSON file.
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Agent Cards */}
      <div className="settings-agents-grid">
        {draftAgents.map((agent, idx) => (
          <div key={agent.id} className="settings-agent-card">
            <div className="settings-agent-card-header">
              <div className="settings-agent-avatar">
                {agent.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="settings-agent-name">{agent.name}</div>
                <div className="settings-agent-title">{agent.title}</div>
              </div>
              <span className="settings-agent-num">#{idx + 1}</span>
            </div>

            <div className="settings-field">
              <label className="settings-field-label">Agent System ID</label>
              <input
                type="text"
                className="settings-field-input"
                value={agent.agentSystemId}
                onChange={(e) => updateField(agent.id, "agentSystemId", e.target.value)}
                placeholder="e.g. AGENT-001"
              />
            </div>

            <div className="settings-field">
              <label className="settings-field-label">ElevenLabs Voice ID</label>
              <input
                type="text"
                className="settings-field-input"
                value={agent.voiceId}
                onChange={(e) => updateField(agent.id, "voiceId", e.target.value)}
                placeholder="e.g. PIGsltMj3gFMR34aFDI3"
              />
              {agent.voiceId.trim().length === 0 && (
                <span className="settings-field-warn">⚠ Voice ID required</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Status message */}
      {savedMsg && (
        <div className={`settings-msg ${savedMsg.startsWith("✓") ? "settings-msg-ok" : "settings-msg-err"}`}>
          {savedMsg}
        </div>
      )}

      {/* Actions */}
      <div className="settings-footer">
        <div className="settings-footer-left">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleExport}>
            ↓ Export JSON
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => importRef.current?.click()}
          >
            ↑ Import JSON
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImport}
          />
        </div>
        <div className="settings-footer-right">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={draftAgents.some((a) => a.voiceId.trim().length === 0)}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
