import { objections, pitch, qualifyingQuestions, eventData } from "./data";
import { CallState, Lead } from "../types";

export interface SimulatedAgentTurn {
  content: string;
  score: number;
  shouldEndCall?: boolean;
}

export function buildGreeting(lead: Lead, agentName = "Aisha"): string {
  return pitch
    .replace("[NAME]", lead.name)
    .replace("[AGENT]", agentName)
    .replace("[ROLE]", lead.role)
    .replace("[COMPANY]", lead.company);
}

export function getSimulatedResponse(message: string, callState: CallState): SimulatedAgentTurn {
  const normalized = message.toLowerCase();
  const closingSignals = [
    "thank you for the call",
    "thanks for the call",
    "thank you",
    "thanks",
    "talk later",
    "bye",
    "goodbye",
  ];

  if (closingSignals.some((signal) => normalized.includes(signal))) {
    return {
      content:
        "Thank you, really appreciate your time. Great speaking with you, we will follow up shortly with the next steps.",
      score: 6,
      shouldEndCall: true,
    };
  }

  const objection = objections.find((item) =>
    item.trigger.some((trigger) => normalized.includes(trigger))
  );

  if (objection) {
    return {
      content: objection.response,
      score: -8,
    };
  }

  const positiveSignals = [
    "yes",
    "available",
    "interested",
    "sounds good",
    "can decide",
    "attend",
    "i can",
    "i am available",
    "that works",
  ];
  const neutralSignals = ["tell me more", "maybe", "depends", "what is it", "details"];
  const leadReplyCount = callState.conversationHistory.filter((entry) => entry.role === "lead").length;
  const nextQuestion = qualifyingQuestions[leadReplyCount] ?? null;

  if (positiveSignals.some((signal) => normalized.includes(signal))) {
    if (nextQuestion) {
      return {
        content: `Got it, thanks for sharing. Let me just quickly understand. ${nextQuestion.text}`,
        score: nextQuestion.scoreIfPositive,
      };
    }

    return {
      content:
        "Perfect, that helps. Honestly, based on what you shared, this looks like a strong fit for a complimentary pass. I will mark this as priority and arrange a tailored event brief for you.",
      score: 12,
    };
  }

  if (neutralSignals.some((signal) => normalized.includes(signal))) {
    return {
      content:
        "Yeah, of course. This is not one of those generic conferences. It is very execution-focused and built for people actually making decisions. You will get access to hands-on workshops, closed-door discussions, and think-tank style sessions covering future of finance, digital assets and tokenization, cross-border payments, AI in decision-making, insurance and risk, and private capital strategies. If it helps, I can narrow this down to what is most relevant for your role.",
      score: 6,
    };
  }

  return {
    content: nextQuestion
      ? `So just checking, ${nextQuestion.text}`
      : "Perfect, let us do this. Just to confirm, what is the best email to send your invite and details?",
    score: 4,
  };
}