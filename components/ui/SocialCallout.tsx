import Link from "next/link";
import React from "react";

interface SocialCalloutProps {
  socials?: {
    telegram?: string;
    max?: string;
  };
  className?: string;
}

export const SocialCallout: React.FC<SocialCalloutProps> = ({
  socials,
  className = "",
}) => {
  const max = socials?.max;
  const telegram = socials?.telegram;

  return (
    <p className={`text-[12px] text-brand-black text-center  ${className}`}>
      {/* Client's line breaks: three lines on mobile, two from md */}
      Мы знаем, что наши клиенты
      <br className='md:hidden' /> не любят звонки,
      <br className='hidden md:inline' /> поэтому связь
      <br className='md:hidden' /> в{" "}
      {max ? (
        <Link
          href={max}
          target='_blank'
          className='font-semibold hover:opacity-70 transition-opacity'
        >
          MAX
        </Link>
      ) : (
        <span className='font-semibold'>MAX</span>
      )}{" "}
      или{" "}
      {telegram ? (
        <Link
          href={telegram}
          target='_blank'
          className='font-semibold hover:opacity-70 transition-opacity'
        >
          Telegram
        </Link>
      ) : (
        <span className='font-semibold'>Telegram</span>
      )}
    </p>
  );
};
