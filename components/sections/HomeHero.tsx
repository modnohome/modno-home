"use client";

import {
  DoubleChevronIcon,
  MaxSquareIcon,
  PhoneIcon,
  TelegramSquareIcon,
} from "@/assets/icons";
import { CallbackForm } from "@/components/forms/CallbackForm";
import { useModal } from "@/components/providers/ModalProvider";
import { Modal } from "@/components/ui";
import Image from "next/image";
import React, { useState } from "react";
import { RealzView } from "./RealzView";

interface HomeHeroProps {
  phone: string;
  socials: {
    telegram?: string;
    max?: string;
  };
  title?: string;
  titleBold?: string[];
  title2?: string;
  title2Bold?: string[];
  description?: string;
  descriptionBold?: string[];
  catalogButtonLabel?: string;
  catalogButtonSublabel?: string;
  showroomButtonLabel?: string;
  showroomButtonSublabel?: string;
  popularTitle?: string;
  popularSubtitle?: string;
  popularImages?: { image: { url?: string } | string }[];
}

function highlightWords(text: string, bold: string[] = []) {
  if (!bold || !bold.length) return text;

  const pattern = bold
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (!pattern) return text;

  const regex = new RegExp(`(${pattern})`, "g");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    bold.includes(part) ? (
      <span key={i} className='font-bold'>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  phone,
  socials,
  title = "Модульные диваны",
  titleBold = ["Модульные диваны"],
  title2 = "которые украсят ваш интерьер",
  title2Bold = [],
  description = "Изготовим за 30 дней, любой размер и конфигурацию, подберем цвет, ткань и мягкость именно для Вас",
  descriptionBold = ["Изготовим за 30 дней", "именно для Вас"],
  catalogButtonLabel = "Скачивайте каталог диванов",
  catalogButtonSublabel = "с ценами и размерами",
  showroomButtonLabel = "Запишитесь в шоурум",
  showroomButtonSublabel = "выбрать ткань, мягкость, модель",
  popularTitle = "Популярные конфигурации",
  popularSubtitle = "Прямые, угловые, большие, малые и т.д",
  popularImages,
}) => {
  const phoneClean = phone.replace(/[\s\-\(\)]/g, "");
  const { openModal } = useModal();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const fallbackImages = [
    "/images/view/1.webp",
    "/images/view/2.webp",
    "/images/view/3.webp",
    "/images/view/4.webp",
    "/images/view/5.webp",
  ];
  const sliderImages = popularImages?.length
    ? popularImages
        .map((item) => {
          if (typeof item.image === "object" && item.image?.url) return item.image.url;
          return "";
        })
        .filter(Boolean)
    : fallbackImages;

  return (
    <>
      <section className='relative overflow-hidden pt-23.5 lg:pt-40.5 pb-22.5 bg-[#E9E9E7] '>
        {/* Background Images */}
        <Image
          src='/images/bg-hero.webp'
          alt='Модульные диваны'
          fill
          className='hidden lg:block object-cover object-top z-0 w-full'
          priority
        />
        <Image
          src='/images/bg-hero-mob.webp'
          alt='Модульные диваны'
          fill
          className='lg:hidden object-cover sm:object-[center_14%] md:object-[center_18%] object-top z-0'
          priority
        />

        <div className='content '>
          {/* Mobile: Phone + Socials */}
          <div className='flex lg:hidden flex-col items-center gap-4 relative z-2 mb-6'>
            <a
              href={`tel:${phoneClean}`}
              className='text-2xl font-semibold leading-[1.2]'
            >
              {phone}
            </a>
            <div className='flex items-center gap-3'>
              {socials.max && (
                <a href={socials.max} target='_blank' rel='noopener noreferrer'>
                  <MaxSquareIcon className='w-10 h-10' />
                </a>
              )}
              {socials.telegram && (
                <a
                  href={socials.telegram}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <TelegramSquareIcon className='w-10 h-10' />
                </a>
              )}
              <a href={`tel:${phoneClean}`}>
                <PhoneIcon className='w-10 h-10' />
              </a>
            </div>
          </div>

          {/* Title Block */}
          <div className='flex flex-col items-center w-full relative z-2 mb-12.5 md:mb-14 '>
            <div className='text-center mb-40 sm:mb-67.5'>
              <h1 className='text-[clamp(30px,calc(30px+(15)*((100vw-390px)/810)),45px)] text-brand-black leading-[1.1] font-bold'>
                {highlightWords(title, titleBold)}
              </h1>
              <p className='text-[clamp(20px,calc(20px+(25)*((100vw-390px)/810)),45px)] text-brand-black leading-[1.1]'>
                {highlightWords(title2, title2Bold)}
              </p>
              <p className='text-[clamp(16px,calc(16px+(6)*((100vw-390px)/810)),22px)] text-brand-black leading-[1.1] mt-3 max-w-150 mx-auto'>
                {highlightWords(description, descriptionBold)}
              </p>
            </div>

            {/* Chevron Down Icon */}
            <div className='flex justify-center mb-6'>
              <DoubleChevronIcon className='text-[#353535] animate-bounce shrink-0' />
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-col items-center gap-5 md:gap-6.5 w-full max-w-[256px] md:max-w-94.25'>
              {/* Yellow Catalog Button */}
              <button
                onClick={() => setIsCatalogOpen(true)}
                className='animate-shine w-full text-[14px] md:text-[17px] bg-brand-yellow text-brand-black rounded-lg py-2.5 px-6 text-center transition-all duration-300 hover:scale-[1.02] cursor-pointer'
              >
                <span className='font-bold block'>{catalogButtonLabel}</span>
                <span>{catalogButtonSublabel}</span>
              </button>

              {/* White Showroom Button */}
              <button
                onClick={() =>
                  openModal(
                    "ЧТОБЫ ЗАПИСАТЬСЯ В ШОУРУМ НА УДОБНОЕ ВРЕМЯ",
                    "ЗАПИСАТЬСЯ",
                    "Главная",
                    "max-w-[100%]",
                  )
                }
                className='w-full bg-white text-brand-black text-[14px] md:text-[17px] rounded-[8px] py-[10px] px-1 md:px-6 text-center border border-brand-border transition-all duration-300 hover:scale-[1.02] cursor-pointer'
              >
                <span className='font-bold block'>{showroomButtonLabel}</span>
                <span>{showroomButtonSublabel}</span>
              </button>
            </div>
          </div>

          {/* Популярные конфигурации */}
          <div className='relative flex flex-col items-center z-2 '>
            <div className='flex-1 w-full'>
              <RealzView
                images={sliderImages}
                title={popularTitle}
                subtitle={popularSubtitle}
                showTitle
              />
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Download Modal */}
      <Modal
        isOpen={isCatalogOpen}
        onClose={() => { setIsCatalogOpen(false); setTimeout(() => setIsFormSubmitted(false), 250); }}
        className={isFormSubmitted ? "max-w-174" : "max-w-252.5"}
        contentClassName={isFormSubmitted ? "px-2.5 py-2.5" : "p-8 md:p-10"}
        closeButtonClassName='top-3 right-3'
      >
        {!isFormSubmitted && <div className='absolute inset-3.5 border-2 border-[#E9E9E9] rounded-2xl pointer-events-none z-10' />}
        <div className='relative flex flex-col lg:flex-row gap-6 md:gap-10 items-center overflow-hidden lg:min-h-100'>
          <div className={isFormSubmitted ? "w-full" : "w-full lg:w-1/2"}>
            <CallbackForm
              title='Чтобы получить каталог, заполните форму'
              subtitle=''
              uppercase
              buttonLabel='Жду каталог'
              onSuccess={() => setIsFormSubmitted(true)}
              image={
                !isFormSubmitted ? (
                  <div
                    className='-mb-25 -left-[8%] relative z-0 block md:hidden pointer-events-none'
                    style={{
                      width: "clamp(300px, 130vw, 600px)",
                      height: "clamp(250px, 110vw, 400px)",
                    }}
                  >
                    <Image
                      src='/images/catalog.webp'
                      alt='Каталог мебели'
                      fill
                      className='object-contain'
                    />
                  </div>
                ) : undefined
              }
            />
          </div>
          {!isFormSubmitted && (
            <div className='relative lg:absolute lg:right-[6%] lg:-bottom-[56%] w-full lg:w-1/2 lg:h-185 lg:scale-[1.2] z-0'>
              <Image
                src='/images/catalog.webp'
                alt='Каталог мебели'
                fill
                className='object-contain'
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
