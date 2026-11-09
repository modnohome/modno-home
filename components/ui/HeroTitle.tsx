import React from "react";

interface HeroTitleProps {
  topLine: string;
  bottomLine: string;
  description: string;
  topBold?: string[];
  bottomBold?: string[];
  descriptionBold?: string[];
  className?: string;
  bottomLineClassName?: string;
}

function highlightWords(text: string, bold: string[] = []) {
  if (!bold.length) return text;

  const pattern = bold
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
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

export const HeroTitle: React.FC<HeroTitleProps> = ({
  topLine,
  bottomLine,
  description,
  topBold = [],
  bottomBold = [],
  descriptionBold = [],
  className = "",
  bottomLineClassName,
}) => {
  return (
    <div className={`text-center ${className}`}>
      <h1 className='text-[27px] md:text-[32px] lg:text-[45px] text-brand-black leading-[1.1] '>
        {highlightWords(topLine, topBold)}
      </h1>
      <p
        className={`text-hero-line ${bottomLineClassName || "lg:text-hero-line-lg"} text-brand-black leading-[1.1] max-w-full  mx-auto `}
      >
        {highlightWords(bottomLine, bottomBold)}
      </p>
      <p className='text-hero-line text-brand-black leading-[1.1] mt-3 sm:max-w-141.25 mx-auto block xsm:max-w-82.5 '>
        {highlightWords(description, descriptionBold)}
      </p>
    </div>
  );
};
