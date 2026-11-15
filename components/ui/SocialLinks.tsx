import { MaxIcon, TelegramIcon, VkIcon } from "@/assets/icons";
import Link from "next/link";
import React from "react";

interface SocialLinksProps {
  socials: {
    telegram?: string;
    max?: string;
    vk?: string;
  };
  className?: string;
}

/**
 * Reusable social media links component.
 * Renders an icon for every link it gets (Telegram, VK, MAX).
 */
export const SocialLinks: React.FC<SocialLinksProps> = ({
  socials,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {socials.telegram && (
        <Link href={socials.telegram} target='_blank'>
          <TelegramIcon
            width={50}
            height={38}
            className='hover:opacity-80 transition-opacity'
          />
        </Link>
      )}
      {socials.vk && (
        <Link href={socials.vk} target='_blank'>
          <VkIcon
            width={50}
            height={38}
            className='hover:opacity-80 transition-opacity'
          />
        </Link>
      )}
      {socials.max && (
        <Link href={socials.max} target='_blank'>
          <MaxIcon
            width={50}
            height={38}
            className='hover:opacity-80 transition-opacity'
          />
        </Link>
      )}
    </div>
  );
};
