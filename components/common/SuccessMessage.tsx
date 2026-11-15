import { MaxSquareIcon, TelegramSquareIcon } from "@/assets/icons";
import { SocialCard } from "@/components/ui/SocialCard";
import React from "react";

interface SuccessMessageProps {
  socials?: {
    max?: string;
    telegram?: string;
  };
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  socials = {
    max: "",
    telegram: "",
  },
}) => {
  return (
    <div className='flex flex-col items-center w-full max-w-full mx-auto'>
      {/* Upper box */}
      <div className='w-full bg-brand-gray/10 rounded-[20px] py-12 md:py-16 px-6 md:px-10 flex flex-col items-center text-center mb-[32px]'>
        <h2 className='text-[40px] font-bold text-brand-black mb-4 uppercase tracking-wider'>
          СПАСИБО
        </h2>
        <p className='text-[18px] text-brand-black font-bold leading-[1.2] max-w-100'>
          Наш сайт работает быстро, <br /> скоро вам перезвоним
        </p>
      </div>

      {/* Socials section */}
      <p className='text-[14px] md:text-[16px] text-brand-black mb-4 text-center'>
        Следите за нами в соц. сетях, подписывайтесь
      </p>

      <div className='flex flex-row justify-center gap-18 md:gap-15 w-full pb-7.5'>
        <SocialCard
          icon={<MaxSquareIcon className='w-8 h-8 text-brand-black' />}
          label='Мы в MAX'
          href={socials.max || "#"}
        />
        <SocialCard
          icon={<TelegramSquareIcon className='w-8 h-8 text-brand-black' />}
          label='Мы в Telegram'
          href={socials.telegram || "#"}
        />
      </div>
    </div>
  );
};
