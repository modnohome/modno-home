"use client";

import { AppButton, Input, SocialCallout } from "@/components/ui";
import React, { useState } from "react";

interface CalculationSectionProps {
  socials?: { telegram?: string; vk?: string };
  className?: string;
}

export const CalculationSection: React.FC<CalculationSectionProps> = ({
  socials,
  className = "",
}) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/send.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, formType: "calculation", sourcePage: "Главная" }),
      });

      if (!res.ok) throw new Error("Ошибка отправки");
      setIsSubmitted(true);
      setPhone("");
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Не удалось отправить заявку. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={`w-full pt-12 md:pt-20 pb-12 md:pb-12.5 ${className}`}>
      <div className='content'>
        <div className='max-w-[90%] md:max-w-[820px] w-full mx-auto border border-brand-border rounded-[24px] md:rounded-[16px] px-10 py-6 md:py-8 md:px-18 bg-white flex flex-col items-center '>
          <h2 className='text-[16px] md:text-[20px] font-bold text-center mb-6 md:mb-6 text-brand-black leading-tight sm:max-w-[60%] md:max-w-full  w-full'>
            Узнать стоимость своего размера за 5 мин.
          </h2>

          <form
            onSubmit={handleSubmit}
            className='w-full flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-5 mb-2'
          >
            <Input
              placeholder='Ваш телефон'
              isPhone={true}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <AppButton
              type='submit'
              label={
                isLoading
                  ? "Отправка..."
                  : isSubmitted
                    ? "Отправлено ✓"
                    : "Узнать стоимость"
              }
              variant='primary'
              size='lg'
            />
          </form>

          <SocialCallout socials={socials} className='max-w-[300px]' />
        </div>
      </div>
    </section>
  );
};
