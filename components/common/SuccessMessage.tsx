import { MaxSquareIcon, TelegramSquareIcon } from "@/assets/icons";
import {
  type Messenger,
  useContacts,
} from "@/components/providers/ContactsProvider";
import { SocialCard } from "@/components/ui/SocialCard";
import Link from "next/link";
import React from "react";

const MESSENGER_NAMES: Record<Messenger, string> = {
  max: "MAX",
  telegram: "Telegram",
};

interface SuccessMessageProps {
  /** The catalog form sent the person to this messenger's bot */
  catalogIn?: Messenger;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  catalogIn,
}) => {
  const { socials, catalogBots } = useContacts();
  const botLink = catalogIn && catalogBots[catalogIn];

  return (
    <div className='flex flex-col items-center w-full max-w-full mx-auto'>
      {/* Upper box */}
      <div className='w-full bg-brand-gray/10 rounded-[20px] py-12 md:py-16 px-6 md:px-10 flex flex-col items-center text-center mb-[32px]'>
        <h2 className='text-[40px] font-bold text-brand-black mb-4 uppercase tracking-wider'>
          СПАСИБО
        </h2>
        {botLink ? (
          <>
            <p className='text-[18px] text-brand-black font-bold leading-[1.2] max-w-100'>
              Каталог пришлёт наш бот в {MESSENGER_NAMES[catalogIn]}:{" "}
              <br className='hidden md:inline' />
              нажмите «Старт» в чате с ним
            </p>
            {/* The form opens the bot itself; this link is for a blocked pop-up */}
            <Link
              href={botLink}
              target='_blank'
              className='mt-5 bg-brand-yellow text-brand-black rounded-lg py-2.5 px-6 text-[14px] md:text-[16px] font-bold transition-transform duration-300 hover:scale-[1.02]'
            >
              Открыть {MESSENGER_NAMES[catalogIn]}
            </Link>
          </>
        ) : (
          <p className='text-[18px] text-brand-black font-bold leading-[1.2] max-w-100'>
            Наш сайт работает быстро, <br /> скоро вам перезвоним
          </p>
        )}
      </div>

      {/* Socials section */}
      <p className='text-[14px] md:text-[16px] text-brand-black mb-4 text-center'>
        Следите за нами в соц. сетях, подписывайтесь
      </p>

      <div className='flex flex-row justify-center gap-18 md:gap-15 w-full pb-7.5'>
        {socials.max && (
          <SocialCard
            icon={<MaxSquareIcon className='w-8 h-8 text-brand-black' />}
            label='Мы в MAX'
            href={socials.max}
          />
        )}
        {socials.telegram && (
          <SocialCard
            icon={<TelegramSquareIcon className='w-8 h-8 text-brand-black' />}
            label='Мы в Telegram'
            href={socials.telegram}
          />
        )}
      </div>
    </div>
  );
};
