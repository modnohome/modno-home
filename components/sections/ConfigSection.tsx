"use client";

import { ConfigCard, SectionTitle } from "@/components/ui";
import React from "react";
import { useModal } from "../providers/ModalProvider";

interface ConfigItem {
  image: string;
  title: string;
  subtitle?: string;
  dimensions?: string;
  price: number;
  oldPrice?: number;
}

interface ConfigSectionProps {
  title?: string;
  subtitle?: string;
  configs?: ConfigItem[];
  sofaName?: string;
  className?: string;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
  title = "ПОПУЛЯРНЫЕ КОНФИГУРАЦИИ",
  subtitle = "Все параметры можно менять под себя",
  configs = [],
  sofaName,
  className = "",
}) => {
  const { openModal } = useModal();

  if (configs.length === 0) return null;

  return (
    <section className={`w-full pt-10 md:pt-12.5 pb-10 md:pb-16 bg-[#F5F5F5] ${className}`}>
      <div className='content'>
        <SectionTitle
          title={title}
          subtitle={subtitle}
          className='text-center mb-12 md:mb-16'
          titleClassName='text-[28px] md:text-[42px] font-bold leading-tight'
          subtitleClassName='text-[18px] md:text-[30px] mt-1'
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {configs.map((config, index) => (
            <ConfigCard
              key={index}
              {...config}
              onClick={() =>
                openModal(`Узнать подробнее о модели ${config.title}`, undefined, sofaName ? `Диван ${sofaName}` : undefined)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
};
