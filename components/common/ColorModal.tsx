"use client";

import { ModalWrapper } from "@/components/common/ModalWrapper";
import { AppButton } from "@/components/ui/AppButton";
import { Checkbox } from "@/components/ui/Checkbox";
import { ColorItem } from "@/components/ui/ColorItem";
import { Input } from "@/components/ui/Input";
import React, { useState } from "react";
import { SuccessMessage } from "./SuccessMessage";

interface ColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sofaName?: string;
}

const COLORS_DATA = [
  { src: "/images/colors/ic-1.png", name: "Tofu", pantone: "11-4801 TCX" },
  { src: "/images/colors/ic-10.png", name: "Doeskin", pantone: "15-1308 TCX" },
  {
    src: "/images/colors/ic-11.png",
    name: "Roasted Cashew",
    pantone: "17-1105 TCX",
  },
  {
    src: "/images/colors/ic-12.png",
    name: "Adobe Rose",
    pantone: "16-1508 TCX",
  },
  {
    src: "/images/colors/ic-13.png",
    name: "Plum Truffle",
    pantone: "18-1506 TCX",
  },
  {
    src: "/images/colors/ic-14.png",
    name: "Purple Dove",
    pantone: "16-1606 TCX",
  },
  {
    src: "/images/colors/ic-15.png",
    name: "Blue Mirage",
    pantone: "18-4215 TCX",
  },
  {
    src: "/images/colors/ic-16.png",
    name: "Bristol Blue",
    pantone: "17-4818 TCX",
  },
  {
    src: "/images/colors/ic-17.png",
    name: "Dragonfly",
    pantone: "19-4826 TCX",
  },
  {
    src: "/images/colors/ic-18.png",
    name: "Gibraltar Sea",
    pantone: "19-4038 TCX",
  },
  {
    src: "/images/colors/ic-19.png",
    name: "Mountain View",
    pantone: "19-5918 TCX",
  },
  { src: "/images/colors/ic-2.png", name: "Moonlight", pantone: "15-1309 TCX" },
  {
    src: "/images/colors/ic-20.png",
    name: "Raw Sienna",
    pantone: "17-1436 TCX",
  },
  {
    src: "/images/colors/ic-21.png",
    name: "Spicy Mustard",
    pantone: "14-0952 TCX",
  },
  {
    src: "/images/colors/ic-3.png",
    name: "Chinois Green",
    pantone: "17-5107 TCX",
  },
  { src: "/images/colors/ic-4.png", name: "Grisaille", pantone: "18-3912 TCX" },
  {
    src: "/images/colors/ic-5.png",
    name: "Moonlit Ocean",
    pantone: "19-4122 TCX",
  },
  {
    src: "/images/colors/ic-6.png",
    name: "Steel Gray",
    pantone: "18-4005 TCX",
  },
  {
    src: "/images/colors/ic-7.png",
    name: "Antarctica",
    pantone: "13-4104 TCX",
  },
  {
    src: "/images/colors/ic-8.png",
    name: "Tradewinds",
    pantone: "15-4307 TCX",
  },
  { src: "/images/colors/ic-9.png", name: "Sharkskin", pantone: "17-3914 TCX" },
  { src: "/images/colors/ic.png", name: "Dark Shadow", pantone: "19-3906 TCX" },
];

export const ColorModal: React.FC<ColorModalProps> = ({ isOpen, onClose, sofaName }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isAgreed, setIsAgreed] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10 || !isAgreed) return;
    setIsLoading(true);
    try {
      const res = await fetch("/send.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          formType: "colors",
          sourcePage: sofaName ? `Диван ${sofaName}` : undefined,
        }),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      setIsSubmitted(true);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Не удалось отправить заявку. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset expansion state when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
      setIsSubmitted(false);
    }
  }, [isOpen]);

  const visibleColors = isExpanded ? COLORS_DATA : COLORS_DATA.slice(0, 10);

  if (isSubmitted) {
    return (
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        className='max-w-[1100px]'
      >
        <SuccessMessage />
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      className='max-w-[1100px] !p-6 md:!p-10'
    >
      <div className='flex flex-col items-center'>
        <div className='text-center mb-6  '>
          <h2 className='text-[18px]  font-bold  uppercase max-w-[90%] mx-auto'>
            ВАРИАНТЫ ОТТЕНКОВ ДОСТУПНЫХ К ЗАКАЗУ
          </h2>
          <p className='text-[16px]  '>
            Посмотреть вживую можно в нашем шоуруме или запросить подробное
            видео
          </p>
        </div>

        <div className='w-full mb-8'>
          <div className='md:max-h-[70vh] max-h-[32dvh] overflow-y-auto pr-2 custom-scrollbar'>
            <div className='grid grid-cols-5 md:grid-cols-8 lg:grid-cols-11 lg:gap-2 md:gap-4 gap-1 w-full'>
              {COLORS_DATA.map((color, index) => (
                <div
                  key={index}
                  className={
                    index >= 16 && !isExpanded
                      ? "hidden lg:block"
                      : index >= 10 && !isExpanded
                        ? "hidden md:block"
                        : "block"
                  }
                >
                  <ColorItem {...color} />
                </div>
              ))}
            </div>
          </div>
          {!isExpanded && (
            <div className='mt-6 text-center lg:hidden'>
              <button
                onClick={() => setIsExpanded(true)}
                className='text-[14px] md:text-[16px] text-brand-black hover:text-brand-black/70 transition-colors underline underline-offset-4 decoration-black/30 cursor-pointer'
              >
                посмотреть ещё
              </button>
            </div>
          )}
        </div>

        <div className='w-full max-w-[800px] text-center px-9 md:px-0'>
          <h3 className='text-[18px]  font-bold  uppercase'>
            ЧТОБЫ УЗНАТЬ ПОДРОБНЕЕ
          </h3>
          <p className='text-[16px]  mb-8'>Заполните форму ниже</p>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col items-center gap-6'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-center justify-center flex max-w-[740px] '>
              <div className='w-full '>
                <Input
                  isPhone
                  required
                  placeholder='Ваш телефон'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className='w-full '>
                <AppButton
                  variant='secondary'
                  size='lg'
                  label={isLoading ? 'Отправка...' : 'УЗНАТЬ ПОДРОБНЕЕ ПРО ТКАНИ И ЦВЕТА'}
                  type='submit'
                  className='text-[14px] md:!text-[16px] !whitespace-normal !leading-[1.2]'
                />
              </div>
            </div>
            <Checkbox
              id='color-modal-agree'
              label='Согласен на обработку персональных данных'
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
          </form>
        </div>
      </div>
    </ModalWrapper>
  );
};
