"use client";

import { useState, useRef, useEffect } from "react";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Normalize relative URL to backend URL if needed
  const resolvedSrc =
    src.startsWith("http") || src.startsWith("blob:") || src.startsWith("data:")
      ? src
      : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "")}${src.startsWith("/") ? "" : "/"}${src}`;

  useEffect(() => {
    setError(false);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [src]);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "00:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn("Audio playback notice:", e);
          setError(true);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!totalDuration && audioRef.current.duration) {
        setTotalDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  if (!src) return null;

  return (
    <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/60 to-orange-50/30 p-3.5 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9A7B4F] text-white shadow-xs transition hover:bg-[#85683e] active:scale-95 cursor-pointer"
            aria-label={isPlaying ? "Pause voice recording" : "Play voice recording"}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Volume2 size={13} className="text-[#9A7B4F] shrink-0" />
              <p className="truncate text-xs font-bold text-gray-900">{label}</p>
            </div>
            <p className="text-[10px] font-mono font-medium text-gray-500">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </p>
          </div>
        </div>

        {/* Scrubber slider */}
        <div className="flex-1 max-w-[140px] sm:max-w-xs">
          <input
            type="range"
            min={0}
            max={totalDuration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="h-1.5 w-full accent-[#9A7B4F] cursor-pointer"
          />
        </div>
      </div>

      {transcription && (
        <div className="mt-2.5 rounded-xl bg-white/90 p-2.5 border border-amber-100 text-[11px] text-gray-600">
          <span className="font-bold text-gray-800">Transcript:</span>{" "}
          <span className="italic">{transcription}</span>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600">
          <AlertCircle size={13} />
          <span>Could not load voice recording.</span>
        </div>
      )}

      <audio
        ref={audioRef}
        src={resolvedSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setError(true)}
        preload="metadata"
        className="hidden"
      />
    </div>
  );
}
