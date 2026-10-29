"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  AlertCircle,
  FileText,
  Volume2,
} from "lucide-react";

interface AudioTaskRecorderProps {
  onAudioReady: (audioBlob: Blob, duration: number, transcribedText?: string) => void;
  onAudioClear: () => void;
  onTranscriptGenerated?: (transcriptText: string) => void;
  existingAudioUrl?: string;
  disabled?: boolean;
}

export default function AudioTaskRecorder({
  onAudioReady,
  onAudioClear,
  onTranscriptGenerated,
  existingAudioUrl,
  disabled = false,
}: AudioTaskRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [speechToTextEnabled, setSpeechToTextEnabled] = useState(true);
  const [speechTranscript, setSpeechTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let text = "";
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript + " ";
          }
          const cleanText = text.trim();
          setSpeechTranscript(cleanText);
          if (onTranscriptGenerated && cleanText) {
            onTranscriptGenerated(cleanText);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e.error);
        };

        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn("Could not start SpeechRecognition:", err);
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch {}
      }
    };
  }, [onTranscriptGenerated]);

  // Clean up timer and media streams
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioUrl && !existingAudioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, existingAudioUrl]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingDuration(0);
    setSpeechTranscript("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Prefer webm, fallback to supported types
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        const finalBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        const newUrl = URL.createObjectURL(finalBlob);
        setAudioBlob(finalBlob);
        setAudioUrl(newUrl);

        onAudioReady(finalBlob, recordingDuration, speechTranscript);
      };

      recorder.start(250); // Emit data every 250ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Start duration counter
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(elapsed);
      }, 500);

      // Optionally start speech-to-text
      if (speechToTextEnabled && speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch {
          // Ignore if already active
        }
      }
    } catch (err: any) {
      console.error("Microphone access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError(
          "Microphone permission denied. Please allow microphone access in your browser settings to record voice notes."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No microphone detected. Please connect a microphone and try again.");
      } else {
        setError(err.message || "Failed to start audio recording.");
      }
      setIsRecording(false);
    }
  }, [onAudioReady, recordingDuration, speechToTextEnabled, speechTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("Error stopping recorder:", err);
      }
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }

    setIsRecording(false);
  }, [isRecording]);

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().catch((err) => {
        console.warn("Playback error:", err);
      });
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioPlayerRef.current) return;
    const current = audioPlayerRef.current.currentTime;
    const dur = audioPlayerRef.current.duration || 1;
    setPlaybackProgress((current / dur) * 100);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackProgress(0);
  };

  const clearAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (audioUrl && !existingAudioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    setPlaybackProgress(0);
    setRecordingDuration(0);
    setSpeechTranscript("");
    setError(null);
    onAudioClear();
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-stone-50/70 p-4 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-[#9A7B4F]">
            <Volume2 size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Task Voice Recording</h4>
            <p className="text-[11px] text-gray-500">
              Record a voice note explaining task instructions
            </p>
          </div>
        </div>

        {/* Speech-to-text toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-gray-600 hover:text-gray-900">
          <input
            type="checkbox"
            checked={speechToTextEnabled}
            onChange={(e) => setSpeechToTextEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[#9A7B4F] focus:ring-[#9A7B4F]"
          />
          <span className="flex items-center gap-1">
            <FileText size={12} />
            <span>Auto-transcribe</span>
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recording State Controller */}
      <div className="mt-4">
        {!isRecording && !audioUrl && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl bg-[#29241f] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Mic size={15} className="text-amber-400" />
            <span>Start Voice Recording</span>
          </button>
        )}

        {/* Live Recording In-Progress */}
        {isRecording && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-red-700">
                Recording...
              </span>
              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-red-800 border border-red-200">
                {formatTime(recordingDuration)}
              </span>
            </div>

            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition active:scale-95 cursor-pointer"
            >
              <Square size={13} fill="white" />
              <span>Stop & Save</span>
            </button>
          </div>
        )}

        {/* Completed Audio Player */}
        {audioUrl && !isRecording && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9A7B4F] text-white shadow-xs transition hover:bg-[#85683e] active:scale-95 cursor-pointer"
                  title={isPlaying ? "Pause" : "Play recording"}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>

                <div>
                  <p className="text-xs font-bold text-gray-900">
                    Voice Note Ready
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {recordingDuration > 0
                      ? `Duration: ${formatTime(recordingDuration)}`
                      : "Voice message attached"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 transition active:scale-95 cursor-pointer"
                >
                  <Mic size={13} />
                  <span>Re-record</span>
                </button>

                <button
                  type="button"
                  onClick={clearAudio}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition active:scale-95 cursor-pointer"
                  title="Delete voice recording"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-[#9A7B4F] transition-all duration-150"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
              </div>

              {/* Native audio element */}
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={handleAudioEnded}
                className="hidden"
              />
            </div>

            {speechTranscript && (
              <div className="rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-600">
                <span className="font-bold text-gray-800">Transcribed Note:</span>{" "}
                <span className="italic">"{speechTranscript}"</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
