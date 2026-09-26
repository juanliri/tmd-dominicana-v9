import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw, 
  MapPin
} from 'lucide-react';

interface BioHeaderVideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  location?: string;
  onOpenTheater?: () => void;
  onPlayFeedback?: () => void;
  className?: string;
}

export const BioHeaderVideoPlayer: React.FC<BioHeaderVideoPlayerProps> = ({
  src = '/videos/tmd-patio-km22.mp4',
  poster = '/images/video_ch1_patio.jpg',
  title = 'PATIO KM 22 · AUTOPISTA DUARTE',
  location = '15,000 m² · Sede Central RD',
  onOpenTheater,
  onPlayFeedback,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [buffered, setBuffered] = useState<number>(0);

  // Auto-play muted loop on mount & battery optimization
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    setIsMuted(true);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoRef.current) return;
          if (entry.isIntersecting) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const currentProgress = (video.currentTime / video.duration) * 100;
    setProgress(currentProgress);

    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBuffered((bufferedEnd / video.duration) * 100);
    }
  };

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onPlayFeedback?.();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [onPlayFeedback]);

  const toggleAudio = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayFeedback?.();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [onPlayFeedback]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekPercentage = Math.max(0, Math.min(1, clickX / rect.width));
    video.currentTime = seekPercentage * video.duration;
    setProgress(seekPercentage * 100);
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full relative overflow-hidden bg-black select-none group ${className}`}
    >
      {/* HTML5 Autoplay HD Video Stream in Tall Portrait / Cinematic Framing */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
      />

      {/* Smooth Multi-Stop Gradient Transition to Dark Theme */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/20 to-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#08090d] pointer-events-none" />

      {/* Video Quick Controls Badge (Mute, Play, 1080p Theater) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={toggleAudio}
          title={isMuted ? "Activar audio" : "Silenciar audio"}
          className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md border ${
            !isMuted 
              ? 'bg-amber-400 text-black border-amber-300' 
              : 'bg-black/60 hover:bg-black text-zinc-300 hover:text-white border-white/20'
          }`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
        </button>

        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? "Pausar" : "Reproducir"}
          className="p-1.5 rounded-full bg-black/60 hover:bg-black text-white hover:text-amber-400 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-md"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current text-amber-400" />}
        </button>

        {onOpenTheater && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayFeedback?.();
              onOpenTheater();
            }}
            title="Pantalla Completa 1080p"
            className="p-1.5 rounded-full bg-black/60 hover:bg-amber-400 hover:text-black text-zinc-200 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-md"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Scrubber at bottom edge */}
      <div 
        onClick={handleSeek}
        className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/80 hover:h-1.5 transition-all cursor-pointer z-20"
      >
        <div 
          className="h-full bg-zinc-600/40" 
          style={{ width: `${buffered}%` }} 
        />
        <div 
          className="absolute top-0 left-0 bottom-0 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
};
