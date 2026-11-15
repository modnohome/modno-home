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
      Мы знаем, что наши клиенты не любят звонки,
      <br />
      поэтому связь в{" "}
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
