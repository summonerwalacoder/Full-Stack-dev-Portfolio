
"use client";

const START_EVENT = "bobo:speech-start";
const END_EVENT = "bobo:speech-end";

export function notifyBoboSpeechStart() {
  window.dispatchEvent(new Event(START_EVENT));
}

export function notifyBoboSpeechEnd() {
  window.dispatchEvent(new Event(END_EVENT));
}

export function subscribeToBoboSpeech(
  onStart: () => void,
  onEnd: () => void
) {
  window.addEventListener(START_EVENT, onStart);
  window.addEventListener(END_EVENT, onEnd);

  return () => {
    window.removeEventListener(START_EVENT, onStart);
    window.removeEventListener(END_EVENT, onEnd);
  };
}
