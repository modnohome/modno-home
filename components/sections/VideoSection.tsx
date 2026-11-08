"use client";

import { VideoModal } from "@/components/common/VideoModal";
import { SectionTitle, VideoCard } from "@/components/ui";
import React, { useState } from "react";

interface VideoItem {
  id: string | number;
  title: string;
  overlayText: string;
  views: string | number;
  image: string;
  video?: string;
}

interface VideoSectionProps {
  title: string;
  subtitle?: string;
  videos: VideoItem[];
  /** Block shown next to the videos (left column on desktop, above them on mobile) */
  aside?: React.ReactNode;
  className?: string;
}

/**
 * Section displaying a collection of short videos in a responsive horizontal-scroll or grid.
 * Features a centered SectionTitle and 5-column layout on desktop; with `aside`,
 * the aside takes the left third and the videos a 3-column grid.
 */
export const VideoSection: React.FC<VideoSectionProps> = ({
  title,
  subtitle,
  videos,
  aside,
  className = "",
}) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const cards = videos.map((video, index) => (
    <div
      key={video.id}
      className={
        aside
          ? index >= 2
            ? "hidden md:block"
            : "block"
          : index >= 4
            ? "hidden lg:block"
            : "block"
      }
    >
      <VideoCard
        title={video.title}
        overlayText={video.overlayText}
        views={video.views}
        image={video.image}
        video={video.video}
        onClick={() => {
          if (video.video) {
            setActiveVideo(video.video);
          }
        }}
      />
    </div>
  ));

  return (
    <>
      <section
        className={`w-full ${aside ? "pt-10 md:pt-12.5 pb-4.5 md:pb-8.75" : "py-10 md:py-18"} ${className}`}
      >
        <div className='content flex flex-col items-center'>
          {/* Centered Title */}
          <SectionTitle
            title={title}
            subtitle={subtitle}
            className={`text-center mb-8.75 ${aside ? "md:mb-12.5" : "md:mb-10"}`}
            titleClassName='text-video-title'
            subtitleClassName='text-video-subtitle mt-2.5'
          />

          {aside ? (
            /* Desktop: the same 5-column grid as the default layout, so the cards
               match it exactly; the aside takes 2 columns, the videos 3 */
            <div className='flex flex-col gap-8 lg:grid lg:grid-cols-5 lg:gap-6 w-full'>
              {/* Stretches to the videos' height on desktop */}
              <div className='flex flex-col w-full max-w-md mx-auto lg:mx-0 lg:max-w-none lg:col-span-2 lg:pr-10'>
                {aside}
              </div>
              {/* Videos - 2 on mobile, 3 columns from tablet up */}
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full lg:col-span-3'>
                {cards}
              </div>
            </div>
          ) : (
            /* Video Grid - 5 columns on desktop, 4 on mobile/tablet */
            <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 w-full'>
              {cards}
            </div>
          )}
        </div>
      </section>

      <VideoModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        videoSrc={activeVideo || ""}
      />
    </>
  );
};
