"use client";

import { Brand, ContactGroup, SocialLinks } from "@/components/ui";
import Link from "next/link";
import React from "react";

interface FooterProps {
  data: {
    header?: {
      logoDescription?: string;
      phone?: string;
      socials?: {
        telegram?: string;
        max?: string;
        vk?: string;
      };
    };
    footer?: {
      copyright?: string;
      privacyPolicyText?: string;
      privacyPolicyLink?: string;
    };
  };
}

export const Footer: React.FC<FooterProps> = ({ data }) => {
  const {
    header: {
      logoDescription = "Производство модульных диванов в Челябинске с доставкой по РФ",
      phone = "+7 (992) 503-54-99",
      socials = {},
    } = {},
    footer: {
      copyright = "© modno-home 2026",
      privacyPolicyText = "Политика конфиденциальности",
      privacyPolicyLink = "/privacy-policy",
    } = {},
  } = data;

  return (
    <footer className='w-full pb-10'>
      <div className='content'>
        <div className=' h-px  w-full bg-brand-gray mx-auto mb-5' />
      </div>
      <div className='content flex flex-col md:flex-row items-center justify-between md:gap-8 gap-4'>
        <div className='order-1 md:order-1 flex flex-col md:flex-row justify-center md:justify-between items-center  w-full  md:w-auto md:gap-2 gap-4 '>
          <Brand description={logoDescription} showDescription={true} />
          <div className='block lg:hidden'>
            {" "}
            <SocialLinks socials={socials} />
          </div>
        </div>

        <div className='flex flex-col items-center text-center order-3 md:order-2'>
          <p className='text-[12px] text-brand-black font-medium'>
            {copyright}
          </p>
          <Link
            href={privacyPolicyLink}
            className='text-[12px] text-brand-black font-medium hover:opacity-70 transition-opacity'
          >
            {privacyPolicyText}
          </Link>
        </div>

        <div className='flex flex-col md:flex-row items-center gap-10 order-2 md:order-3'>
          <div className='hidden lg:block'>
            {" "}
            <SocialLinks socials={socials} />
          </div>

          <ContactGroup phone={phone} />
        </div>
      </div>
    </footer>
  );
};
