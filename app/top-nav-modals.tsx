"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "./ui/material-icon";
import { useCart } from "./cart-context";
import type { GetCollectionByHandleQuery } from "@/lib/shopify/graphql/.generated/storefront.generated";

type CollectionProduct = NonNullable<
  GetCollectionByHandleQuery["collectionByHandle"]
>["products"]["nodes"][number];

type ModalBaseProps = {
  isOpen: boolean;
  onClose: () => void;
};

// --- Helpers ---

function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

function useModalLifecycle(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);
}

function ModalPortal({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    // Use a timeout to avoid the synchronous setState warning
    const timeoutId = setTimeout(() => setHasMounted(true), 0);
    return () => clearTimeout(timeoutId);
  }, []);
  
  if (!hasMounted) return null;
  
  return createPortal(children, document.body);
}

// --- Components ---

const MENU_LINKS = [
  { label: "Storefront", description: "Browse seasonal drops", icon: "bakery_dining" },
  { label: "About Us", description: "Meet the bakers", icon: "emoji_people" },
  { label: "Contact", description: "Get recommendations", icon: "call" },
  { label: "Shipping", description: "Delivery windows", icon: "local_shipping" },
  { label: "Legal", description: "Read our policies", icon: "gavel" },
] as const;

export function MenuOverlay({ isOpen, onClose }: ModalBaseProps) {
  useModalLifecycle(isOpen, onClose);
  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-50 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
              className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-white"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <button onClick={onClose} className="absolute top-8 right-8 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                Close <Icon name="close" className="text-sm" />
              </button>
              <div className="w-full max-w-md space-y-4">
                <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 mb-8 text-center">Navigation</p>
                {MENU_LINKS.map((link) => (
                  <button key={link.label} onClick={onClose} className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 group-hover:bg-white group-hover:text-black transition-colors">
                        <Icon name={link.icon} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{link.label}</p>
                        <p className="text-xs text-zinc-400">{link.description}</p>
                      </div>
                    </div>
                    <Icon name="arrow_forward" className="text-zinc-600 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}

export function AccountModal({ isOpen, onClose }: ModalBaseProps) {
  useModalLifecycle(isOpen, onClose);
  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
              className="relative z-10 w-full max-w-sm rounded-[32px] bg-zinc-50 p-8 text-zinc-900 dark:bg-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black">
                  <Icon name="person" className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold">Avery Baker</h3>
                <p className="text-sm text-zinc-500">avery@bakery.io</p>
              </div>
              <div className="mt-8 space-y-2">
                {["Orders", "Settings", "Log Out"].map((item) => (
                  <button key={item} className="w-full rounded-xl py-3 px-4 text-left text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                    {item}
                  </button>
                ))}
              </div>
              <button onClick={onClose} className="mt-6 w-full rounded-xl bg-zinc-900 py-3 text-white dark:bg-white dark:text-black font-bold transition-transform active:scale-95">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}

type SearchModalProps = ModalBaseProps & {
  products: CollectionProduct[];
  onProductSelect: (handle: string) => void;
};

export function SearchModal({ isOpen, onClose, products, onProductSelect }: SearchModalProps) {
  useModalLifecycle(isOpen, onClose);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => 
    products.filter((p: CollectionProduct) => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
    [query, products]
  );

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-50 bg-black/90 p-4 pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mx-auto max-w-2xl">
              <div className="relative flex items-center">
                <Icon name="search" className="absolute left-4 text-zinc-400" />
                <input 
                  autoFocus
                  className="w-full rounded-2xl bg-zinc-800 py-4 pl-12 pr-16 text-white outline-none ring-1 ring-white/10 focus:ring-white/30 transition-all"
                  placeholder="What are you looking for?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  onClick={onClose}
                  className="absolute right-4 rounded-full p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close search"
                >
                  <Icon name="close" className="text-lg" />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {filtered.map((p: CollectionProduct) => (
                  <button key={p.id} onClick={() => { onProductSelect(p.handle); onClose(); }} className="flex w-full items-center gap-4 rounded-xl bg-white/5 p-3 text-white hover:bg-white/10 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-zinc-700 overflow-hidden relative">
                        {p.featuredImage?.url && <Image src={p.featuredImage.url} fill alt="" className="object-cover" />}
                    </div>
                    <span className="font-medium">{p.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}

type CartModalProps = ModalBaseProps & {
  onProductSelect: (handle: string) => void;
};

export function CartModal({ isOpen, onClose, onProductSelect }: CartModalProps) {
  useModalLifecycle(isOpen, onClose);
  const { items } = useCart();
  const subtotal = items.reduce((acc, item) => acc + (item.price.amount * item.quantity), 0);

  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
              className="relative h-full w-full max-w-md bg-white p-8 dark:bg-zinc-950 dark:text-white shadow-2xl flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Your Bag</h2>
                <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Icon name="close" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {items.length === 0 ? (
                  <p className="text-zinc-500 text-center mt-20">Your bag is empty.</p>
                ) : (
                  items.map((item) => (
                    <button 
                      key={item.variantId} 
                      className="flex gap-4 w-full text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl p-2 -m-2 transition-colors"
                      onClick={() => {
                        onProductSelect(item.productHandle);
                        onClose();
                      }}
                    >
                      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 relative">
                        {item.image?.url && <Image src={item.image.url} fill alt="" className="object-cover" />}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{item.productTitle}</p>
                          <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price.amount, item.price.currencyCode)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between mb-4">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-bold text-xl">{formatCurrency(subtotal, items[0]?.price.currencyCode || "USD")}</span>
                </div>
                <button className="w-full rounded-2xl bg-zinc-900 py-4 text-white dark:bg-white dark:text-black font-bold transition-transform active:scale-[0.98]">
                  Checkout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}