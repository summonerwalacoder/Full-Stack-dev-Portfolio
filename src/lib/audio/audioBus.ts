

/**
 * Centralized audio coordination bus.
 *
 * All spoken audio (Bobo's voice, the Guide, and any future narrator) and all
 * music playback route through this single arbiter so that the two never
 * overlap and playback state stays consistent across the app.
 *
 * Design:
 * - Pure, framework-agnostic event bus (no React) so both React and non-React
 *   callers can use it.
 * - A speech "session" is owned by whoever starts it. The bus tracks whether a
 *   speech session is active and notifies listeners on start/end.
 * - Music owners register a "ducker" (pause/resume callbacks). When speech
 *   starts, the bus asks the ducker to pause; when speech ends, it asks the
 *   ducker to resume ONLY if the duck was caused by speech (not the user) and
 *   the user has not since changed playback intent.
 */


"use client";

/**
 * Centralized audio coordination bus.
 *
 * Coordinates speech, sound effects, and multiple music sources.
 * Music paused by the bus is resumed only when:
 * - It was playing before speech started.
 * - The user has not changed playback intent.
 * - No other speech session is active.
 */

export type SpeechEndReason = "complete" | "cancel" | "error";

export interface MusicDucker {
  /** Pause this music source. Return true only if it was playing and paused. */
  pause: () => boolean;
  /** Resume this source if it was paused by the bus. */
  resume: () => void;
  /** Is this source currently playing? */
  isPlaying: () => boolean;
}

export interface AudioBus {
  registerDucker: (ducker: MusicDucker) => () => void;
  subscribeSoundActivity: (listener: (active: boolean) => void) => () => void;
  isSoundActive: () => boolean;
  beginSound: (owner: string) => number;
  endSound: (token: number) => void;
  beginSpeech: (owner: string) => number;
  endSpeech: (token: number, reason: SpeechEndReason) => void;
  isSpeaking: () => boolean;
  noteUserMusicIntent: () => void;
}

interface DuckerState {
  ducker: MusicDucker;
  pausedByBus: boolean;
}

interface BusState {
  activeSpeechToken: number | null;
  activeSpeechSoundToken: number | null;
  speechOwner: string | null;
  duckers: Map<MusicDucker, DuckerState>;
  soundListeners: Set<(active: boolean) => void>;
  soundTokens: Set<number>;
  userIntendedDuringSpeech: boolean;
}

let tokenCounter = 0;

const state: BusState = {
  activeSpeechToken: null,
  activeSpeechSoundToken: null,
  speechOwner: null,
  duckers: new Map(),
  soundListeners: new Set(),
  soundTokens: new Set(),
  userIntendedDuringSpeech: false,
};

function notifySoundActivity(active: boolean) {
  for (const listener of state.soundListeners) {
    try {
      listener(active);
    } catch (error) {
      console.error("Audio activity listener failed.", error);
    }
  }
}

function addSoundToken(token: number) {
  const wasActive = state.soundTokens.size > 0;
  state.soundTokens.add(token);

  if (!wasActive) {
    notifySoundActivity(true);
  }
}

function removeSoundToken(token: number) {
  if (!state.soundTokens.delete(token)) return;

  if (state.soundTokens.size === 0) {
    notifySoundActivity(false);
  }
}

/** Pause every music source that is currently playing. */
function duckMusic() {
  for (const entry of state.duckers.values()) {
    try {
      entry.pausedByBus = false;

      if (entry.ducker.isPlaying() && entry.ducker.pause()) {
        entry.pausedByBus = true;
      }
    } catch (error) {
      console.error("Could not pause music for speech.", error);
    }
  }
}

/** Resume only sources actually paused by this bus. */
function unduckMusic() {
  const mayResume = !state.userIntendedDuringSpeech;
  state.userIntendedDuringSpeech = false;

  for (const entry of state.duckers.values()) {
    if (!entry.pausedByBus) continue;

    entry.pausedByBus = false;

    if (!mayResume) continue;

    try {
      entry.ducker.resume();
    } catch (error) {
      console.error("Could not resume music after speech.", error);
    }
  }
}

export const audioBus: AudioBus = {
  subscribeSoundActivity(listener) {
    state.soundListeners.add(listener);
    listener(state.soundTokens.size > 0);

    return () => {
      state.soundListeners.delete(listener);
    };
  },

  isSoundActive() {
    return state.soundTokens.size > 0;
  },

  beginSound(_owner) {
    const token = ++tokenCounter;
    addSoundToken(token);
    return token;
  },

  endSound(token) {
    removeSoundToken(token);
  },

  registerDucker(ducker) {
    const entry: DuckerState = {
      ducker,
      pausedByBus: false,
    };

    state.duckers.set(ducker, entry);

    // If a new music source registers during speech, pause it immediately.
    if (state.activeSpeechToken !== null) {
      try {
        if (ducker.isPlaying() && ducker.pause()) {
          entry.pausedByBus = true;
        }
      } catch (error) {
        console.error("Could not duck newly registered music.", error);
      }
    }

    return () => {
      state.duckers.delete(ducker);
    };
  },

  beginSpeech(owner) {
    const token = ++tokenCounter;
    const alreadySpeaking = state.activeSpeechToken !== null;
    const wasSoundActive = state.soundTokens.size > 0;

    // Replace the previous speech session's sound token.
    if (state.activeSpeechSoundToken !== null) {
      state.soundTokens.delete(state.activeSpeechSoundToken);
    }

    state.activeSpeechToken = token;
    state.activeSpeechSoundToken = token;
    state.soundTokens.add(token);
    state.speechOwner = owner;

    if (!wasSoundActive) {
      notifySoundActivity(true);
    }

    // A new speech owner supersedes the previous owner without
    // briefly resuming music between the two speech sessions.
    if (!alreadySpeaking) {
      state.userIntendedDuringSpeech = false;
      duckMusic();
    }

    return token;
  },

  endSpeech(token, _reason) {
    // Ignore callbacks from a superseded speech session.
    if (state.activeSpeechToken !== token) return;

    state.activeSpeechToken = null;

    if (state.activeSpeechSoundToken !== null) {
      removeSoundToken(state.activeSpeechSoundToken);
    }

    state.activeSpeechSoundToken = null;
    state.speechOwner = null;

    unduckMusic();
  },

  isSpeaking() {
    return state.activeSpeechToken !== null;
  },

  noteUserMusicIntent() {
    if (state.activeSpeechToken !== null) {
      state.userIntendedDuringSpeech = true;

      // Do not let the bus resume music after the user has
      // manually changed playback intent during speech.
      for (const entry of state.duckers.values()) {
        entry.pausedByBus = false;
      }
    }
  },
};
