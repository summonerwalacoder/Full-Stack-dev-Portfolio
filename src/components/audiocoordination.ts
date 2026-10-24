
"use client";

const START_EVENT = "bobo:speech-start";
const END_EVENT = "bobo:speech-end";

let boboSpeaking = false;

export function notifyBoboSpeechStart() {
  if (boboSpeaking) return;
  boboSpeaking = true;
  window.dispatchEvent(new Event(START_EVENT));
}

export function notifyBoboSpeechEnd() {
  if (!boboSpeaking) return;
  boboSpeaking = false;
  window.dispatchEvent(new Event(END_EVENT));
}

export function isBoboSpeaking() {
  return boboSpeaking;
}

export function subscribeToBoboSpeech(
  onStart: () => void,
  onEnd: () => void
) {
  window.addEventListener(START_EVENT, onStart);
  window.addEventListener(END_EVENT, onEnd);

  if (boboSpeaking) onStart();

  return () => {
    window.removeEventListener(START_EVENT, onStart);
    window.removeEventListener(END_EVENT, onEnd);
  };
}
