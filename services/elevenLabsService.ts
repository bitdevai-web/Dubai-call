const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

export function hasElevenLabsConfig(): boolean {
  return Boolean(ELEVENLABS_API_KEY);
}

export function stopVoicePlayback() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speakWithBrowserVoice(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Speech synthesis is not supported in this browser."));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.97;
    utterance.pitch = 0.96;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Browser speech synthesis failed."));
    window.speechSynthesis.speak(utterance);
  });
}

async function speakWithElevenLabs(text: string, voiceIdOverride?: string): Promise<void> {
  const voiceId = voiceIdOverride || ELEVENLABS_VOICE_ID;
  if (!voiceId) {
    throw new Error("Missing ElevenLabs Voice ID.");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY ?? "",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.18,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs request failed with status ${response.status}.`);
  }

  const audioBlob = await response.blob();
  stopVoicePlayback();
  currentObjectUrl = URL.createObjectURL(audioBlob);
  currentAudio = new Audio(currentObjectUrl);

  await new Promise<void>((resolve, reject) => {
    if (!currentAudio) {
      reject(new Error("Audio player unavailable."));
      return;
    }

    currentAudio.onended = () => {
      stopVoicePlayback();
      resolve();
    };
    currentAudio.onerror = () => {
      stopVoicePlayback();
      reject(new Error("Audio playback failed."));
    };
    void currentAudio.play().catch((error) => {
      stopVoicePlayback();
      reject(error instanceof Error ? error : new Error("Audio playback failed."));
    });
  });
}

export async function speakAgentText(
  text: string,
  voiceIdOverride?: string
): Promise<"elevenlabs" | "browser"> {
  if (hasElevenLabsConfig() && (voiceIdOverride || ELEVENLABS_VOICE_ID)) {
    await speakWithElevenLabs(text, voiceIdOverride);
    return "elevenlabs";
  }

  await speakWithBrowserVoice(text);
  return "browser";
}