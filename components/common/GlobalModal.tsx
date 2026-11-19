"use client";

import React, { useState } from "react";
import { ModalWrapper } from "../common/ModalWrapper";
import { CallbackForm } from "../forms/CallbackForm";
import { useModal } from "../providers/ModalProvider";

export const GlobalModal: React.FC = () => {
  const { isOpen, closeModal, title, buttonLabel, sourcePage, titleClassName } = useModal();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = () => {
    closeModal();
    setTimeout(() => setIsSubmitted(false), 250);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      className={isSubmitted ? "max-w-[696px] px-2.5! py-2.5! md:px-2.5! md:py-2.5!" : "max-w-[460px]"}
    >
      <CallbackForm
        title={title}
        buttonLabel={buttonLabel}
        sourcePage={sourcePage}
        titleClassName={titleClassName}
        onSuccess={() => setIsSubmitted(true)}
      />
    </ModalWrapper>
  );
};
