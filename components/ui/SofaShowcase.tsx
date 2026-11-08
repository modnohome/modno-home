import Image from "next/image";
import React from "react";

interface SofaShowcaseProps {
  title: string;
  description: string;
  /** Square-ish photo with empty space above the sofa (section-2-mob.webp) */
  image: string;
  className?: string;
}

/**
 * Sofa name and description above its photo. The photo may slide up under the
 * text by 40% of its width: every photo is empty above at least 45% of its width,
 * so the text never covers the sofa, and a longer text simply pushes it down.
 * When the block is stretched taller (next to the videos), the photo sticks to the bottom.
 */
export const SofaShowcase: React.FC<SofaShowcaseProps> = ({
  title,
  description,
  image,
  className = "",
}) => {
  return (
    <div className={`flex flex-col grow ${className}`}>
      <div className='relative z-1 text-brand-black -mb-[40%]'>
        <h3 className='text-lg font-bold leading-tight'>{title}</h3>
        <p className='text-showcase leading-snug'>{description}</p>
      </div>
      <Image
        src={image}
        alt={title}
        width={960}
        height={916}
        className='w-full h-auto mt-auto'
        sizes='(max-width: 1024px) 100vw, 420px'
      />
    </div>
  );
};
