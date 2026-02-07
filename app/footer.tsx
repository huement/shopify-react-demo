"use client";

import { useRef, useEffect, useState } from "react";
import { Icon } from "./ui/material-icon";

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        // Defer so we paint once with lines at 0 width, then animate
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setHasReachedBottom(true));
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`group py-[100px] bg-black text-white ${hasReachedBottom ? "footer-lines-drawn" : ""}`}
    >
      <div className="flex items-center justify-center gap-0 w-full max-w-4xl mx-auto px-4 sm:px-6">
        <span className="footer-line-wrap flex-1 min-w-0 flex items-center" aria-hidden>
          <span className="footer-line footer-line-left block h-px w-full bg-white" />
        </span>
        <span
          className="footer-icon-wrap flex shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-[2rem]"
          aria-hidden
        >
          <Icon
            name="favorite"
            className="text-[2rem] leading-none text-white group-[.footer-lines-drawn]:text-cyan-500 transition-colors duration-[0.6s] ease-out"
          />
        </span>
        <span className="footer-line-wrap flex-1 min-w-0 flex items-center" aria-hidden>
          <span className="footer-line footer-line-right block h-px w-full bg-white" />
        </span>
      </div>
    </footer>
  );
}
