"use client";

import { create } from "zustand";

export type AudioStopResult = {
  blob: Blob;
  mimeType: string;
  elapsedMs: number;
  avgRms: number;
  isTooQuiet: boolean;
  isEmptyOrTooShort: boolean;
  didAutoStop: boolean;
};

export type StartRecordingOptions = {
  /**
   * Called when the recorder stops (manual or auto).
   * Note: because the recorder is a singleton, only the most recent `startRecording`
   * call's handler will be used for that recording session.
   */
  onStop?: (result: AudioStopResult) => void | Promise<void>;
  /** MediaRecorder timeslice passed to `recorder.start(timesliceMs)`. */
  timesliceMs?: number;
  /** RMS below this for `silenceDurationMs` triggers auto-stop. */
  rmsSilenceThreshold?: number;
  /** Silence window for auto-stop detection. */
  silenceDurationMs?: number;
  /** Overall average RMS below this counts as "too quiet". */
  overallAvgLowThreshold?: number;
  /** Elapsed ms <= this counts as empty/too-short. Defaults to DEFAULT_MAX_EMPTY_RECORDING_MS. */
  maxEmptyRecordingMs?: number;
};

type AudioRecorderState = {
  isRecording: boolean;
  audioLevelRms: number;
  smoothedLevel: number;
  error: string | null;
  clearError: () => void;
  /**
   * Subscribe to stop events (manual or auto-stop). Useful when multiple UI
   * entrypoints want to react to the same singleton recorder.
   */
  subscribeOnStop: (listener: (result: AudioStopResult) => void | Promise<void>) => () => void;
  startRecording: (opts?: StartRecordingOptions) => Promise<boolean>;
  stopRecording: () => void;
};

const DEFAULT_RMS_SILENCE_THRESHOLD = 0.01;
const DEFAULT_SILENCE_DURATION_MS = 3000;
const DEFAULT_OVERALL_AVG_LOW_THRESHOLD = 0.002;
const DEFAULT_TIMESLICE_MS = 100;
/** Elapsed ms ≤ this = empty/too-short. Kept in sync with silence auto-stop. */
const DEFAULT_MAX_EMPTY_RECORDING_MS = DEFAULT_SILENCE_DURATION_MS + 750;

// --- Singleton, non-serializable resources (kept OUT of Zustand state) ---
let stream: MediaStream | null = null;
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let animationFrameId: number | null = null;

let isRecordingRef = false;
let recordingStartMs: number | null = null;
let silenceStartMs: number | null = null;
let silenceAutoStopFired = false;
let rmsHistory: number[] = [];
let smoothedLevelRef = 0;

let onStopHandler: StartRecordingOptions["onStop"] | undefined;
const onStopListeners = new Set<(result: AudioStopResult) => void | Promise<void>>();

function stopInternal(set: (partial: Partial<AudioRecorderState>) => void) {
  if (animationFrameId != null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }

  if (audioContext?.state !== "closed") {
    audioContext?.close();
  }
  audioContext = null;
  analyser = null;

  if (recorder && recorder.state !== "inactive") {
    try {
      recorder.stop();
    } catch {
      // Best-effort: recorder may already be stopping.
    }
  }
  recorder = null;

  set({ audioLevelRms: 0, smoothedLevel: 0 });
  smoothedLevelRef = 0;
}

export const useAudioRecorderStore = create<AudioRecorderState>((set, get) => ({
  isRecording: false,
  audioLevelRms: 0,
  smoothedLevel: 0,
  error: null,

  clearError: () => set({ error: null }),

  subscribeOnStop: (listener) => {
    onStopListeners.add(listener);
    return () => {
      onStopListeners.delete(listener);
    };
  },

  startRecording: async (opts = {}) => {
    // Even if already recording, allow callers to register/replace the per-session handler.
    // (Example: another button mounts and wants to handle stop.)
    if (opts.onStop) onStopHandler = opts.onStop;
    if (isRecordingRef) return true;

    const {
      onStop,
      timesliceMs = DEFAULT_TIMESLICE_MS,
      rmsSilenceThreshold = DEFAULT_RMS_SILENCE_THRESHOLD,
      silenceDurationMs = DEFAULT_SILENCE_DURATION_MS,
      overallAvgLowThreshold = DEFAULT_OVERALL_AVG_LOW_THRESHOLD,
      maxEmptyRecordingMs = DEFAULT_MAX_EMPTY_RECORDING_MS,
    } = opts;

    onStopHandler = onStop;
    set({ error: null });

    silenceStartMs = null;
    silenceAutoStopFired = false;
    smoothedLevelRef = 0;
    set({ smoothedLevel: 0 });
    rmsHistory = [];
    recordingStartMs = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const localRecorder = new MediaRecorder(stream);
      recorder = localRecorder;
      chunks = [];

      localRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      localRecorder.onstop = async () => {
        const mimeType = localRecorder.mimeType || chunks[0]?.type || "audio/webm";
        const blob = new Blob(chunks, { type: mimeType });

        const elapsedMs = recordingStartMs == null ? 0 : Date.now() - recordingStartMs;
        recordingStartMs = null;

        const avgRms =
          rmsHistory.length > 0 ? rmsHistory.reduce((a, b) => a + b, 0) / rmsHistory.length : 0;

        const result: AudioStopResult = {
          blob,
          mimeType,
          elapsedMs,
          avgRms,
          isTooQuiet: avgRms < overallAvgLowThreshold,
          isEmptyOrTooShort: elapsedMs > 0 && elapsedMs <= maxEmptyRecordingMs,
          didAutoStop: silenceAutoStopFired,
        };

        // Call the per-session handler (if provided), plus any global subscribers.
        // Note: listeners are not awaited sequentially to avoid one blocking others.
        const calls: Array<void | Promise<void>> = [];
        if (onStopHandler) calls.push(onStopHandler(result));
        for (const listener of onStopListeners) calls.push(listener(result));
        await Promise.all(calls);

        // Avoid keeping stale closures alive longer than necessary.
        onStopHandler = undefined;
      };

      localRecorder.start(timesliceMs);
      recordingStartMs = Date.now();

      isRecordingRef = true;
      set({ isRecording: true });

      // Start level meter (RMS + smoothing + silence detection)
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const computeRms = () => {
        if (!analyser || !isRecordingRef) return;

        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const n = (dataArray[i] - 128) / 128;
          sum += n * n;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        set({ audioLevelRms: rms });

        const norm = Math.min(1, rms * 8);
        const smoothed = 0.22 * norm + 0.78 * smoothedLevelRef;
        smoothedLevelRef = smoothed;
        set({ smoothedLevel: smoothed });

        rmsHistory.push(rms);
        if (rmsHistory.length > 120) rmsHistory.shift();

        if (rms < rmsSilenceThreshold) {
          const now = Date.now();
          if (silenceStartMs == null) {
            silenceStartMs = now;
          } else if (now - silenceStartMs >= silenceDurationMs) {
            if (!silenceAutoStopFired) {
              silenceAutoStopFired = true;
              get().stopRecording();
              return;
            }
          }
        } else {
          silenceStartMs = null;
        }

        if (!isRecordingRef) return;
        animationFrameId = requestAnimationFrame(computeRms);
      };

      animationFrameId = requestAnimationFrame(computeRms);

      return true;
    } catch (err) {
      isRecordingRef = false;
      set({ isRecording: false });
      recordingStartMs = null;

      set({
        error: err instanceof Error ? err.message : "Microphone access denied or unavailable.",
      });

      stopInternal(set);
      return false;
    }
  },

  stopRecording: () => {
    isRecordingRef = false;
    set({ isRecording: false });
    stopInternal(set);
  },
}));

