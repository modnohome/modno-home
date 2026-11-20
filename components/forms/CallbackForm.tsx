"use client";

import { MaxIcon, TelegramIcon } from "@/assets/icons";
import React, { useState } from "react";
import { SuccessMessage } from "../common/SuccessMessage";
import { type Messenger, useContacts } from "../providers/ContactsProvider";
import { AppButton, Checkbox, Input } from "../ui";
import { softButtonClass } from "../ui/softButton";

const CATALOG_MESSENGERS: {
  id: Messenger;
  label: string;
  /** Bare logo in the text color: gray, white once chosen */
  icon: React.ReactNode;
  /** Chosen option takes the messenger's own gradient, like its contact button */
  checkedClass: string;
}[] = [
  {
    id: "max",
    label: "MAX",
    icon: <MaxIcon variant='white' width={16} height={16} />,
    checkedClass: "has-checked:bg-(image:--gradient-max)",
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: <TelegramIcon variant='white' width={16} height={16} />,
    checkedClass: "has-checked:bg-(image:--gradient-telegram)",
  },
];

interface CallbackFormProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  image?: React.ReactNode;
  onSuccess?: () => void;
  uppercase?: boolean;
  titleClassName?: string;
  sourcePage?: string;
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
}) => {
  const isCatalog = Boolean(buttonLabel?.includes("каталог"));
  const { catalogBots } = useContacts();
  // Catalog forms offer the messengers whose bot is set in settings.json
  const messengers = isCatalog
    ? CATALOG_MESSENGERS.filter(({ id }) => catalogBots[id])
    : [];

  const [phone, setPhone] = useState("");
  const [messenger, setMessenger] = useState<Messenger | undefined>(
    messengers.length === 1 ? messengers[0].id : undefined,
  );
  const [agreed, setAgreed] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [messengerError, setMessengerError] = useState("");

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
    if (messengers.length > 0 && !messenger) {
      setMessengerError("Выберите, куда прислать каталог");
      return;
    }
    // Open the bot right in the click, before any await, or the browser blocks
    // the pop-up; after "Start" the bot sends the catalog
    if (messenger) {
      window.open(catalogBots[messenger], "_blank", "noopener");
    }
    setIsLoading(true);

    try {
      const res = await fetch("/send.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          formType: isCatalog ? "catalog" : "callback",
          messenger,
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
    return <SuccessMessage catalogIn={messenger} />;
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
      {messengers.length > 0 && (
        <fieldset className='mb-5 flex flex-col items-center'>
          <legend className='w-full text-center text-[14px] md:text-[16px] text-brand-black mb-2'>
            Куда прислать каталог?
          </legend>
          <div className='flex gap-3'>
            {messengers.map(({ id, label, icon, checkedClass }) => (
              <label
                key={id}
                className={`${softButtonClass} ${checkedClass} flex items-center gap-2 px-5 py-2.5 leading-none cursor-pointer has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-brand-black/30`}
              >
                <input
                  type='radio'
                  name='messenger'
                  value={id}
                  checked={messenger === id}
                  onChange={() => {
                    setMessenger(id);
                    setMessengerError("");
                  }}
                  className='sr-only'
                />
                {icon}
                {label}
              </label>
            ))}
          </div>
          {messengerError && (
            <p className='text-red-500 text-xs mt-1.5'>{messengerError}</p>
          )}
        </fieldset>
      )}
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
