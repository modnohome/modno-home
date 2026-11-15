"use client";

import { VideoModal } from "@/components/common/VideoModal";
import { Brand, CircleCTA, ContactGroup, SocialLinks } from "@/components/ui";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface HeaderProps {
  data: {
    header?: {
      logoDescription?: string;
      workingHours?: string;
      phone?: string;
      videos?: {
        video1?: string;
        thumbnail1?: { url?: string } | string;
        video2?: string;
        thumbnail2?: { url?: string } | string;
      };
      socials?: {
        telegram?: string;
        max?: string;
      };
    };
  };
}

export const Header: React.FC<HeaderProps> = ({ data }) => {
  const {
    header: {
      logoDescription = "Производство модульных диванов в Челябинске с доставкой по РФ",
      workingHours = "Шоурум в Челябинске с 9:00 до 18:00",
      phone = "+7 (992) 503-54-99",
      videos = {},
      socials = {},
    } = {},
  } = data || {};

  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const pathname = usePathname();
  const isSofaPage = pathname.startsWith("/sofa/");

  return (
    <>
      <header className='absolute top-0 md:top-1 left-0 w-full z-100 py-4'>
        <div className='content flex items-center justify-between gap-8'>
          {/* Left: Logo and Description */}
          <Brand description={logoDescription} />

          {isSofaPage ? (
            <div className='hidden lg:flex'>
              <a
                href='#calculation'
                className='hidden md:inline-flex items-center font-medium justify-center px-4 py-[6px] bg-brand-green  text-white text-[14px]  rounded-[4px] whitespace-nowrap '
              >
                Доступен к заказу
              </a>
            </div>
          ) : (
            <div className='hidden lg:flex gap-5'>
              <CircleCTA
                text='Смотреть'
                imageSrc={typeof videos.thumbnail1 === 'object' ? videos.thumbnail1?.url || '/images/stories/st_1.webp' : '/images/stories/st_1.webp'}
                className='text-[14px] leading-none h-auto'
                onClick={() => videos.video1 && setActiveVideo(videos.video1)}
              />
              <CircleCTA
                text='Смотреть'
                imageSrc={typeof videos.thumbnail2 === 'object' ? videos.thumbnail2?.url || '/images/stories/st_2.webp' : '/images/stories/st_2.webp'}
                className='text-[14px] leading-none h-auto'
                onClick={() => videos.video2 && setActiveVideo(videos.video2)}
                delay='1s'
              />
            </div>
          )}

          {/* Center: Working Hours */}
          <div className='flex items-center gap-4 lg:gap-8'>
            <div className='flex flex-col text-right  max-w-36 md:max-w-37.5 md:text-center text-black'>
              <p className='text-[13px] font-medium  leading-snug whitespace-pre-line'>
                {workingHours}
              </p>
            </div>
          </div>
          {/* Social Icons */}
          {/* Header shows Telegram and MAX only; VK is in the footer */}
          <SocialLinks
            socials={{ telegram: socials.telegram, max: socials.max }}
            className='hidden lg:flex'
          />

          {/* Contact Info & Call to Action */}
          <div className='hidden lg:block'>
            <ContactGroup phone={phone} />
          </div>
        </div>

        {/* Decorative Bottom Line (like in referenced image) */}
        <div className='content'>
          <div className=' lg:block hidden h-px xl:w-[calc(100%-12rem)] w-full bg-brand-gray mx-auto mt-3' />
        </div>
      </header>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        videoSrc={activeVideo || ""}
      />
    </>
  );
};
