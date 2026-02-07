"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "./ui/material-icon";

const SCROLL_THRESHOLD = 16;

type QuickViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

// Backdrop: appear instantly so the dim is there right away; fade out on close
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" as const } },
};

// Content: gentle, slower entrance so it doesn't pop; quick exit
const contentVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300,
      delay: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function QuickViewModal({
  isOpen,
  onClose,
  children,
  triggerRef,
}: QuickViewModalProps) {
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const desktopCloseButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [headerCompact, setHeaderCompact] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setHeaderCompact(el.scrollTop > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const id = requestAnimationFrame(() => setHeaderCompact(false));
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !contentRef.current) return;
      const focusable = Array.from<HTMLElement>(
        contentRef.current.querySelectorAll(FOCUSABLE)
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("keydown", handleKeyDown, true);
    
    // Focus appropriate close button based on screen size
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;
    if (isDesktop) {
      desktopCloseButtonRef.current?.focus();
    } else {
      mobileCloseButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("keydown", handleKeyDown, true);
      trigger?.focus();
    };
  }, [isOpen, handleEscape, handleKeyDown, triggerRef]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modal = (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            key="quick-view-modal"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Product details"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            aria-hidden
            onClick={handleBackdropClick}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
          />
          <motion.div
            ref={contentRef}
            layout
            className="relative z-10 bg-white dark:bg-gray-900 rounded-t-xl sm:rounded-xl shadow-xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            transition={{
              layout: { type: "spring", damping: 25, stiffness: 300 }
            }}
          >
            {/* Mobile header with close button */}
            <div
              className={`shrink-0 flex justify-end items-center px-4 sm:hidden border-b border-gray-200 dark:border-gray-700 ${
                reduceMotion ? "" : "transition-[padding] duration-200 ease-out"
              } ${headerCompact ? "py-2" : "py-3"}`}
            >
              <button
                ref={mobileCloseButtonRef}
                type="button"
                onClick={onClose}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 px-5 rounded-xl text-base font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 ${
                  headerCompact ? "py-2" : "py-3"
                }`}
                aria-label="Close product details"
              >
                <Icon name="close" className={headerCompact ? "text-lg" : "text-xl"} aria-hidden />
                Close
              </button>
            </div>
            
            {/* Desktop close button - compact, top-right corner */}
            <button
              ref={desktopCloseButtonRef}
              type="button"
              onClick={onClose}
              className="hidden sm:flex absolute top-3 right-3 z-30 items-center justify-center w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:ring-offset-2"
              aria-label="Close product details"
            >
              <Icon name="close" className="text-lg" aria-hidden />
            </button>
            {/* Scrollable content */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-auto p-4 sm:p-6"
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
