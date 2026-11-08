import { TelegramIcon, VkIcon } from "@/assets/icons";
import { SectionTitle } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";

interface ContactUsSectionProps {
  title?: string;
  subtitle?: string;
  telegramUrl?: string;
  vkUrl?: string;
  className?: string;
}

export const ContactUsSection: React.FC<ContactUsSectionProps> = ({
  title = "НЕ НАШЛИ ЧТО ИСКАЛИ?",
  subtitle = "Напишите нам, вышлем вам больше вариантов или сделаем диван по вашему проекту.",
  telegramUrl,
  vkUrl,
  className = "",
}) => {
  return (
    <section className={`w-full py-10 md:py-18 ${className}`}>
      <div className='content'>
        <div className='relative w-full rounded-[30px] overflow-hidden min-h-[540px] md:min-h-[930px] bg-[#DED9D6]'>
          <Image
            src='/images/bg-contact.webp'
            alt='Диван'
            fill
            className='lg:object-cover object-contain   object-bottom lg:object-center'
            sizes='100vw'
          />

          {/* Content Overlay */}
          <div className='relative z-10 flex flex-col items-center md:items-start p-8 md:p-14 h-full'>
            <SectionTitle
              title={title}
              subtitle={subtitle}
              className='text-center md:text-left mb-8 md:mb-10 md:max-w-[500px]'
              titleClassName='text-[28px] md:text-[42px] leading-tight'
              subtitleClassName='text-[16px] md:text-[20px] mt-1'
            />

            <div className='flex flex-col gap-3 w-full max-w-[320px]'>
              {telegramUrl && (
                <Link
                  href={telegramUrl}
                  target='_blank'
                  className='flex items-center justify-center gap-2 text-white font-bold uppercase text-[14px] md:text-[16px] py-4 px-8 rounded-[8px] transition-all hover:opacity-90 whitespace-nowrap'
                  style={{ background: "var(--gradient-telegram)" }}
                >
                  НАПИСАТЬ НА TELEGRAM
                  <TelegramIcon width={28} height={20} variant='white' />
                </Link>
              )}
              {vkUrl && (
                <Link
                  href={vkUrl}
                  target='_blank'
                  className='flex items-center justify-center gap-2 text-white font-bold uppercase text-[14px] md:text-[16px] py-4 px-8 rounded-[8px] transition-all hover:opacity-90 whitespace-nowrap'
                  style={{ background: "var(--gradient-vk)" }}
                >
                  НАПИСАТЬ В VK
                  <VkIcon width={28} height={20} variant='white' />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
