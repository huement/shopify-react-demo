"use client";

import { forwardRef } from "react";

type IconProps = {
  name: string;
  className?: string;
  variant?: "outlined" | "filled";
  weight?: number;
  onAnimationEnd?: () => void;
};

export const Icon = forwardRef<HTMLSpanElement, IconProps>(
  function Icon({ name, className = "", variant = "outlined", weight = 400, onAnimationEnd }, ref) {
    const fill = variant === "filled" ? 1 : 0;
    return (
      <span
        ref={ref}
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `"FILL" ${fill}, "wght" ${weight}, "GRAD" 0, "opsz" 24` }}
        aria-hidden
        onAnimationEnd={onAnimationEnd}
      >
        {name}
      </span>
    );
  }
);
