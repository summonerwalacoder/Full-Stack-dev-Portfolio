"use client";

import { audioBus } from "@/lib/audio/audioBus";

let activeSpeechToken: number | null = null;

export function getSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return "speechSynthesis" in window ? window.speechSynthesis : null;
}

function langTag(lang: string): string {
  const base = lang.split("-")[0];
  const map: Record<string, string> = {
    hi: "hi-IN",
    es: "es-ES",
    fr: "fr-FR",
    ja: "ja-JP",
    de: "de-DE",
    bn: "bn-IN",
    te: "te-IN",
    mr: "mr-IN",
    ta: "ta-IN",
    ur: "ur-PK",
    gu: "gu-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    or: "or-IN",
    pa: "pa-IN",
    as: "as-IN",
    ne: "ne-NP",
    sd: "sd-PK",
  };
  return map[base] ?? "en-US";
}

export function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const synth = getSynthesis();
  if (!synth) return null;
  const voices = synth.getVoices();
  if (!voices.length) return null;
  const base = lang.split("-")[0].toLowerCase();
  return (
    voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(base)) ??
    voices.find((v) =>
      v.lang.replace("_", "-").toLowerCase().startsWith("en")
    ) ??
    null
  );
}

export function speakJoke(
  text: string,
  lang: string,
  cb: { onStart?: () => void; onEnd?: () => void }
): boolean {
  const synth = getSynthesis();
  if (!synth) {
    cb.onEnd?.();
    return false;
  }
  try {
    synth.cancel();
    activeSpeechToken = null;
    const u = new SpeechSynthesisUtterance(text);
    const token = audioBus.beginSpeech("spoken-joke");
    activeSpeechToken = token;
    const finish = (reason: "complete" | "error") => {
      if (activeSpeechToken !== token) return;
      activeSpeechToken = null;
      audioBus.endSpeech(token, reason);
      cb.onEnd?.();
    };
    u.lang = langTag(lang);
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.rate = 1;
    u.pitch = 1.1;
    u.onstart = () => cb.onStart?.();
    u.onend = () => finish("complete");
    u.onerror = () => finish("error");
    synth.speak(u);
    return true;
  } catch {
    if (activeSpeechToken !== null) {
      audioBus.endSpeech(activeSpeechToken, "error");
      activeSpeechToken = null;
    }
    cb.onEnd?.();
    return false;
  }
}

export function cancelSpeech() {
  if (activeSpeechToken !== null) {
    audioBus.endSpeech(activeSpeechToken, "cancel");
    activeSpeechToken = null;
  }
  try {
    getSynthesis()?.cancel();
  } catch {
    /* ignore */
  }
}

export function playBoop() {
  let soundToken: number | null = null;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    soundToken = audioBus.beginSound("bobo-boop");
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.06;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    });
    window.setTimeout(() => {
      void ctx.close().catch((error: unknown) => {
        console.error("Unable to close the Bobo sound context.", error);
      });
      if (soundToken !== null) audioBus.endSound(soundToken);
    }, 600);
  } catch {
    /* audio is optional */
    if (soundToken !== null) audioBus.endSound(soundToken);
  }
}
