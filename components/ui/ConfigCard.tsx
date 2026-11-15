import Image from "next/image";
import React from "react";
import { AppButton } from "./AppButton";

interface ConfigCardProps {
  image: string;
  title: string;
  subtitle?: string;
  dimensions?: string;
  price: number | string;
  oldPrice?: number | string;
  onClick?: () => void;
  className?: string;
}

export const ConfigCard: React.FC<ConfigCardProps> = ({
  image,
  title,
  subtitle,
  dimensions,
  price,
  oldPrice,
  onClick,
  className = "",
}) => {
  const formatPrice = (p: string | number) => {
    if (typeof p === "number") {
      return p.toLocaleString("ru-RU") + " ₽";
    }
    return p;
  };

  return (
    <div
      className={` rounded-[20px] overflow-hidden flex flex-col h-full  hover:shadow-xl transition-shadow  ${className}`}
    >
      <div className='bg-[#E6E6E6] pt-3 pb-7 px-4 text-center mb-[-16px] min-h-[80px] flex flex-col justify-center'>
        <h3 className='text-[16px] md:text-[18px] font-bold text-brand-black leading-tight'>
          {title}
        </h3>
        {subtitle && (
          <p className='text-[12px] md:text-[14px] text-brand-black/60'>
            {subtitle}
          </p>
        )}
      </div>

      <div className='flex flex-col p-6 items-center grow rounded-t-[20px] overflow-hidden bg-white'>
        {/* Size text comes from content as is ("от 2000х1550х700", "1400/1600 mm.");
            nbsp keeps the image aligned with neighbour cards when it is empty */}
        <span className='text-[14px]  text-brand-black mb-4 px-8'>
          {dimensions || " "}
        </span>

        <div className='relative w-[80%] aspect-4/3'>
          <Image
            src={image}
            alt={title}
            fill
            className='object-contain'
            sizes='(max-width: 468px) 100vw, 50vw'
          />
        </div>

        {/* Footer: Price and Button */}
        <div className='w-full mt-auto flex flex-col lg:flex-row items-center justify-between gap-4 md:max-w-[80%] mx-auto'>
          <div className='flex  whitespace-nowrap items-end gap-2 leading-[1.2]'>
            <div className='flex items-baseline gap-1'>
              <span className='text-[14px] md:text-[16px] font-medium text-brand-black'>
                от
              </span>
              <span className='text-[18px]  font-bold text-brand-black whitespace-nowrap'>
                {formatPrice(price)}
              </span>
            </div>
            {oldPrice && (
              <span className='text-[14px] text-brand-black/30 line-through decoration-brand-black/30'>
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>

          <AppButton
            label='Узнать подробнее'
            variant='primary'
            size='md'
            onClick={onClick}
            className='!sm:min-w-[290px] lg:min-w-auto !xl:min-w-[172px] font-bold'
          />
        </div>
      </div>
    </div>
  );
};
