"use client";

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

export type SpeechEndReason = "complete" | "cancel" | "error";

export interface AudioBus {
  /** Register a music ducker. Returns an unsubscribe function. */
  registerDucker: (ducker: MusicDucker) => () => void;
  /** Register for any non-music sound becoming active or inactive. */
  subscribeSoundActivity: (listener: (active: boolean) => void) => () => void;
  /** True while any non-music sound session is active. */
  isSoundActive: () => boolean;
  /** Mark a short sound effect as active until its matching endSound call. */
  beginSound: (owner: string) => number;
  /** End a short sound effect session. */
  endSound: (token: number) => void;
  /**
   * Mark a speech session as started. Returns a token that must be passed to
   * endSpeech. If speech is already active, the previous session is considered
   * superseded (its endSpeech becomes a no-op for resume purposes).
   */
  beginSpeech: (owner: string) => number;
  /** End a speech session. */
  endSpeech: (token: number, reason: SpeechEndReason) => void;
  /** True while any speech session is active. */
  isSpeaking: () => boolean;
  /**
   * Called by the music owner whenever the USER changes playback intent
   * (play/pause/stop/switch). This clears any pending speech-resume so music
   * is never resumed behind the user's back.
   */
  noteUserMusicIntent: () => void;
}

export interface MusicDucker {
  /** Pause music for speech. Return true if music was actually playing. */
  pause: () => boolean;
  /** Resume music that was paused for speech. */
  resume: () => void;
  /**
   * Returns whether the music is currently actively playing (so the bus can
   * decide whether pausing is even necessary).
   */
  isPlaying: () => boolean;
}

interface BusState {
  activeSpeechToken: number | null;
  activeSpeechSoundToken: number | null;
  speechOwner: string | null;
  duckers: Set<MusicDucker>;
  soundListeners: Set<(active: boolean) => void>;
  soundTokens: Set<number>;
  /** Whether music was actually paused by the bus for the active speech. */
  duckedForSpeech: boolean;
  /** Whether the user changed intent during the active speech. */
  userIntendedDuringSpeech: boolean;
}

let tokenCounter = 0;
const state: BusState = {
  activeSpeechToken: null,
  activeSpeechSoundToken: null,
  speechOwner: null,
  duckers: new Set<MusicDucker>(),
  soundListeners: new Set<(active: boolean) => void>(),
  soundTokens: new Set<number>(),
  duckedForSpeech: false,
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
  if (!wasActive) notifySoundActivity(true);
}

function removeSoundToken(token: number) {
  if (!state.soundTokens.delete(token)) return;
  if (state.soundTokens.size === 0) notifySoundActivity(false);
}

function duckMusic() {
  // Only duck if something is actually playing; remember if we did pause.
  let paused = false;
  for (const d of state.duckers) {
    try {
      if (d.isPlaying()) {
        if (d.pause()) paused = true;
      }
    } catch {
      /* ignore */
    }
  }
  state.duckedForSpeech = paused;
}

function unduckMusic() {
  const shouldResume = state.duckedForSpeech && !state.userIntendedDuringSpeech;
  state.duckedForSpeech = false;
  state.userIntendedDuringSpeech = false;
  if (!shouldResume) return;
  for (const d of state.duckers) {
    try {
      d.resume();
    } catch {
      /* ignore */
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
    state.duckers.add(ducker);
    // If speech is already active when a ducker registers, duck immediately.
    if (state.activeSpeechToken != null) {
      try {
        if (ducker.isPlaying()) {
          if (ducker.pause()) state.duckedForSpeech = true;
        }
      } catch {
        /* ignore */
      }
    }
    return () => {
      state.duckers.delete(ducker);
    };
  },

  beginSpeech(owner) {
    const token = ++tokenCounter;
    const alreadySpeaking = state.activeSpeechToken != null;
    const wasSoundActive = state.soundTokens.size > 0;
    if (state.activeSpeechSoundToken != null) {
      state.soundTokens.delete(state.activeSpeechSoundToken);
    }
    state.activeSpeechToken = token;
    state.activeSpeechSoundToken = token;
    state.soundTokens.add(token);
    state.speechOwner = owner;
    if (!wasSoundActive) notifySoundActivity(true);
    if (!alreadySpeaking) {
      state.duckedForSpeech = false;
      state.userIntendedDuringSpeech = false;
      duckMusic();
    }
    return token;
  },

  endSpeech(token, _reason) {
    if (state.activeSpeechToken !== token) return; // superseded/old token
    state.activeSpeechToken = null;
    if (state.activeSpeechSoundToken !== null) {
      removeSoundToken(state.activeSpeechSoundToken);
    }
    state.activeSpeechSoundToken = null;
    state.speechOwner = null;
    unduckMusic();
  },

  isSpeaking() {
    return state.activeSpeechToken != null;
  },

  noteUserMusicIntent() {
    if (state.activeSpeechToken != null) {
      state.userIntendedDuringSpeech = true;
    }
  },
};
