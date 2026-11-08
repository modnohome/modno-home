"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Тимчасово: вимкнути показ відео на картках (тільки картинки + модалка)
const DISABLE_CARD_VIDEO = false;

// Touch: holding a finger this long plays the preview; a shorter tap opens the video
const LONG_PRESS_MS = 250;

interface VideoCardProps {
  image: string;
  video?: string;
  title: string;
  overlayText: string;
  views: string | number;
  onClick: () => void;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  image,
  video,
  title,
  overlayText,
  views,
  onClick,
  className = "",
}) => {
  const viewsText =
    typeof views === "number" ? `${views} тыс. просмотров` : views;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(hover: none) and (pointer: coarse)").matches
      : false,
  );

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPreviewing = useRef(false);

  // IntersectionObserver — start loading the video when the card is near the viewport
  useEffect(() => {
    if (!video || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [video]);

  // When visible: seek to 3s → show frame
  useEffect(() => {
    const vid = videoRef.current;
    if (!isVisible || !vid) return;

    const handleSeeked = () => setVideoReady(true);
    vid.addEventListener("seeked", handleSeeked, { once: true });
    vid.addEventListener(
      "loadeddata",
      () => {
        vid.currentTime = 3;
      },
      { once: true },
    );

    return () => vid.removeEventListener("seeked", handleSeeked);
  }, [isVisible]);

  const handleMouseEnter = useCallback(() => {
    if (!videoReady || isMobile) return;
    videoRef.current?.play().catch(() => {});
  }, [videoReady, isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    videoRef.current?.pause();
  }, [isMobile]);

  const cancelPress = useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  }, []);

  const handleTouchStart = useCallback(() => {
    isPreviewing.current = false;
    cancelPress();
    pressTimer.current = setTimeout(() => {
      pressTimer.current = null;
      isPreviewing.current = true;
      videoRef.current?.play().catch(() => {});
    }, LONG_PRESS_MS);
  }, [cancelPress]);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      cancelPress();
      if (!isPreviewing.current) return; // short tap: the click opens the video
      isPreviewing.current = false;
      videoRef.current?.pause();
      e.preventDefault(); // the hold was a preview, don't open the video
    },
    [cancelPress],
  );

  // Clean up a pending long press if the card unmounts mid-touch
  useEffect(() => cancelPress, [cancelPress]);

  return (
    <div className={`flex flex-col group ${className}`} ref={containerRef}>
      <div
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={cancelPress}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
        className='relative aspect-[9/16] w-full rounded-[8px] overflow-hidden cursor-pointer shadow-sm select-none [-webkit-touch-callout:none]'
      >
        {/* Thumbnail */}
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            className={`object-cover transition-all duration-500 opacity-100 ${
              !DISABLE_CARD_VIDEO &&
              (videoReady ? "md:opacity-0" : "md:blur-md")
            }`}
            sizes='(max-width: 768px) 100vw, 33vw'
          />
        )}

        {/* Desktop: shimmer overlay while loading */}
        {!DISABLE_CARD_VIDEO && !videoReady && (
          <div className='absolute inset-0 overflow-hidden hidden md:block'>
            <div className='absolute inset-0 bg-black/40' />
            <div className='absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent' />
          </div>
        )}

        {/* Video — hover to play on desktop, hold a finger to play on touch screens.
            Touch: lighter preload, and #t=3 makes iPhones draw that frame before playing */}
        {!DISABLE_CARD_VIDEO && video && isVisible && (
          <video
            ref={videoRef}
            src={isMobile ? `${video}#t=3` : video}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
            muted
            playsInline
            loop
            preload={isMobile ? "metadata" : "auto"}
          />
        )}

        {/* Dark overlay */}
        <div
          className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${videoReady ? "group-hover:opacity-0" : ""}`}
        />

        {/* Centered Overlay Text — desktop only */}
        <div
          className={`absolute inset-0 hidden md:flex items-center justify-center p-6 text-center transition-opacity duration-300 ${videoReady ? "group-hover:opacity-0" : ""}`}
        >
          <p className='text-white text-base font-bold leading-tight drop-shadow-lg'>
            {(DISABLE_CARD_VIDEO || videoReady) && overlayText}
          </p>
        </div>

        {/* Mobile bottom gradient + title */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden' />
        <div className='absolute bottom-5 left-3 right-6 flex flex-col items-start text-white md:hidden max-w-[60%]'>
          <h3 className='text-[18px] font-bold leading-tight'>{title}</h3>
        </div>
      </div>

      {/* Info Section — desktop only */}
      <div className='mt-4 hidden md:flex flex-col gap-1'>
        <h3 className='text-[20px] md:text-base font-extrabold text-brand-black leading-[1.2] transition-colors duration-300 md:max-w-[140px] break-words line-clamp-2'>
          {title}
        </h3>
        <p className='text-[16px] md:text-sm text-brand-muted font-light'>
          {viewsText}
        </p>
      </div>
    </div>
  );
};
