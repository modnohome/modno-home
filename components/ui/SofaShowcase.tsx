import Image from "next/image";
import React from "react";

interface SofaSpec {
  /** Bold part, e.g. "Размер" */
  label: string;
  /** Text after the dash, e.g. "от 2000 до 3500 мм." */
  value: string;
}

interface SofaShowcaseProps {
  title: string;
  description: string;
  specs?: SofaSpec[];
  /** Square-ish photo with empty space above the sofa (section-2-mob.webp) */
  image: string;
  className?: string;
}

/**
 * Sofa name and specs above its photo, description below it. The photo may slide
 * up under the specs by 40% of its width plus 32px, so each photo needs an empty
 * top of about 53% of its width; a longer text simply pushes the photo down.
 * With little text above, the photo's empty top would rise above the block,
 * so it is clipped there.
 */
export const SofaShowcase: React.FC<SofaShowcaseProps> = ({
  title,
  description,
  specs = [],
  image,
  className = "",
}) => {
  return (
    <div className={`flex flex-col grow overflow-hidden text-brand-black ${className}`}>
      <div className='relative z-1 -mb-[calc(40%+2rem)]'>
        <h3 className='text-hero-line lg:text-hero-line-lg font-bold leading-tight'>
          {title}
        </h3>
        {specs.length > 0 && (
          <ul className='mt-2 pl-5 list-disc text-specs leading-snug'>
            {specs.map((spec) => (
              <li key={spec.label}>
                <span className='font-bold'>{spec.label}</span> — {spec.value}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Image
        src={image}
        alt={title}
        width={960}
        height={916}
        className='w-full h-auto'
        sizes='(max-width: 1024px) 100vw, 420px'
      />
      {description && (
        <p className='text-base leading-snug'>{description}</p>
      )}
    </div>
  );
};
