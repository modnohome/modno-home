"use client";

import React, { useId } from "react";
import { MAX_LOGO_PATH } from "./MaxIcon";

interface MaxSquareIconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const MaxSquareIcon: React.FC<MaxSquareIconProps> = ({
  className,
  width = 35,
  height = 35,
}) => {
  const gradientId = `max-sq-grad-${useId()}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 35 35'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <rect width='35' height='35' rx='6' fill={`url(#${gradientId})`} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d={MAX_LOGO_PATH}
        fill='white'
        transform='translate(7 7) scale(0.21)'
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1='0'
          y1='35'
          x2='35'
          y2='0'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0.038' stopColor='var(--color-max-start)' />
          <stop offset='0.447' stopColor='var(--color-max-mid)' />
          <stop offset='0.752' stopColor='var(--color-max-end)' />
        </linearGradient>
      </defs>
    </svg>
  );
};
