"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Play, Pause, Volume2, AlertCircle } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  duration?: number;
  label?: string;
  transcription?: string;
}

export default function AudioPlayer({
  src,
  duration,
  label = "Voice Instruction",
  transcription,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration ?? 0);
  const [error, setError] = useState("");

  // Resolve uploaded audio URLs against the backend origin.
  // Example:
  // NEXT_PUBLIC_API_URL=https://backend.example.com/api
  // src=/uploads/audio/file.webm
  // result=https://backend.example.com/uploads/audio/file.webm
  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  )
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  const resolvedSrc = /^(https?:|blob:|data:)/i.test(src)
    ? src
    : `${apiBase}${src.startsWith("/") ? "" : "/"}${src}`;

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Reset the player whenever a different audio source is loaded.
  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.load();
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setTotalDuration(duration ?? 0);
    setError("");
  }, [resolvedSrc, duration]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    setError("");

    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch (err) {
      console.error("Audio playback failed:", err);
      setIsPlaying(false);
      setError(
        "Unable to play this audio. Check the audio URL or try again."
      );
    }
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;

    if (!audio) return;

    const nextTime = Number(event.target.value);

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;

    if (!audio) return;

    // Use the actual media duration when available.
    if (Number.isFinite(audio.duration)) {
      setTotalDuration(audio.duration);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio) return;

    setCurrentTime(audio.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setError(
      "The voice message could not be loaded. The file may be missing or inaccessible."
    );
  };

  if (!src) return null;

  return (
    <div className="w-full rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
      <audio
        ref={audioRef}
        src={resolvedSrc}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleAudioError}
      />

      {/* Player Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Volume2 size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">Audio message</p>
        </div>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
        >
          {isPlaying ? (
            <Pause size={19} fill="currentColor" />
          ) : (
            <Play size={19} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>

      {/* Progress and Seeking */}
      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={Math.max(totalDuration, 1)}
          step={0.1}
          value={Math.min(currentTime, totalDuration || 0)}
          onChange={handleSeek}
          disabled={!totalDuration || Boolean(error)}
          aria-label="Seek audio position"
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(totalDuration)}`}
          className="h-2 w-full cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        />

        <div className="mt-1 flex items-center justify-between text-[11px] font-medium tabular-nums text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Transcription */}
      {transcription?.trim() && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Transcription
          </p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-700">
            {transcription}
          </p>
        </div>
      )}
    </div>
  );
}