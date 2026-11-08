"use client";

import React, { useState } from "react";
import { SuccessMessage } from "../common/SuccessMessage";
import { AppButton, Checkbox, Input } from "../ui";

interface CallbackFormProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  image?: React.ReactNode;
  onSuccess?: () => void;
  uppercase?: boolean;
  titleClassName?: string;
  sourcePage?: string;
  socials?: {
    vk?: string;
    telegram?: string;
  };
}

export const CallbackForm: React.FC<CallbackFormProps> = ({
  title = "БЫСТРО ПЕРЕЗВОНИМ",
  subtitle = "Заполните форму ниже",
  buttonLabel = "ЖДУ ЗВОНКА",
  image,
  onSuccess,
  uppercase = false,
  titleClassName = "",
  sourcePage,
  socials,
}) => {
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const digits = phone.replace(/\D/g, "");
    if (digits.length === 0) {
      setPhoneError("Введите номер телефона");
      return;
    }
    if (digits[0] !== "9") {
      setPhoneError("Первая цифра номера должна быть 9");
      return;
    }
    if (digits.length < 10) {
      setPhoneError("Введите полный номер телефона (10 цифр)");
      return;
    }
    setPhoneError("");
    setIsLoading(true);

    try {
      const res = await fetch("/send.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          formType: buttonLabel?.includes("каталог") ? "catalog" : "callback",
          sourcePage,
          formTitle: title,
        }),
      });

      if (!res.ok) throw new Error("Ошибка отправки");
      setIsSubmitted(true);
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Не удалось отправить заявку. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return <SuccessMessage socials={socials} />;
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col items-center'>
      <h2
        className={`text-xl md:text-2xl font-bold text-brand-black ${uppercase ? "uppercase" : ""} ${subtitle ? "mb-2" : "mb-8"} text-center ${titleClassName || "max-w-[90%]"}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-brand-gray text-base ${uppercase ? "uppercase" : ""} mb-8 text-center`}
        >
          {subtitle}
        </p>
      )}
      {image && image}

      <div className='w-fit mb-4'>
        <Input
          placeholder='Ваш телефон'
          isPhone={true}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setPhoneError("");
          }}
          phoneError={phoneError}
        />
      </div>
      <div className='mb-4'>
        <AppButton
          type='submit'
          label={isLoading ? "Отправка..." : buttonLabel}
          size='lg'
          variant='secondary'
        />
      </div>

      <Checkbox
        label='Согласен на обработку персональных данных'
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        required
      />
    </form>
  );
};
