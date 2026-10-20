"use client";

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
    const u = new SpeechSynthesisUtterance(text);
    u.lang = langTag(lang);
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.rate = 1;
    u.pitch = 1.1;
    u.onstart = () => cb.onStart?.();
    u.onend = () => cb.onEnd?.();
    u.onerror = () => cb.onEnd?.();
    synth.speak(u);
    return true;
  } catch {
    cb.onEnd?.();
    return false;
  }
}

export function cancelSpeech() {
  try {
    getSynthesis()?.cancel();
  } catch {
    /* ignore */
  }
}

export function playBoop() {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
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
    window.setTimeout(() => ctx.close(), 600);
  } catch {
    /* audio is optional */
  }
}
