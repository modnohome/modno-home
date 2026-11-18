"use client";

import React, { useEffect, useRef, useState } from "react";

interface HeroBackgroundProps {
  children: React.ReactNode;
}

/**
 * Background layer of a hero section (put `fill` images inside). It covers the
 * whole section, but a button click inside the hero (e.g. "СМОТРЕТЬ ЕЩЕ" that
 * opens more photos) first freezes its current height, so the picture does not
 * rescale and move when the hero grows. A screen width change releases it.
 */
export const HeroBackground: React.FC<HeroBackgroundProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const section = ref.current?.parentElement;
    if (!section) return;

    // capture phase: runs before the button's own handler changes the layout
    const freeze = (e: Event) => {
      if (!(e.target as Element).closest?.("button")) return;
      const current = section.offsetHeight;
      setHeight((h) => h ?? current);
    };
    let width = window.innerWidth;
    const release = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      setHeight(undefined);
    };

    section.addEventListener("click", freeze, true);
    window.addEventListener("resize", release);
    return () => {
      section.removeEventListener("click", freeze, true);
      window.removeEventListener("resize", release);
    };
  }, []);

  return (
    <div
      ref={ref}
      className='absolute inset-x-0 top-0 h-full z-0'
      style={height ? { height } : undefined}
    >
      {children}
    </div>
  );
};
