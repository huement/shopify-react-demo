"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "./ui/material-icon";
import { useCart } from "./cart-context";
import { productModalViewTransitionName } from "@/lib/view-transition";
import { getPrimaryCategory, getCategoryColor, truncateCategory } from "./category-utils";
import type { GetProductByHandleQuery } from "@/lib/shopify/graphql/.generated/storefront.generated";

type ProductDetail = NonNullable<GetProductByHandleQuery["productByHandle"]>;
type ProductVariant = ProductDetail["variants"]["nodes"][number];

function resolveVariant(
  product: ProductDetail,
  selectedOptions: Record<string, string>
): ProductVariant | null {
  const nodes = product.variants?.nodes ?? [];
  for (const variant of nodes) {
    const match = (variant.selectedOptions ?? []).every(
      (opt) => selectedOptions[opt.name] === opt.value
    );
    if (match) return variant;
  }
  return null;
}

function isOptionValueAvailable(
  product: ProductDetail,
  optionName: string,
  optionValue: string,
  selectedOptions: Record<string, string>
): boolean {
  const nodes = product.variants?.nodes ?? [];
  const merged = { ...selectedOptions, [optionName]: optionValue };
  for (const variant of nodes) {
    const match = (variant.selectedOptions ?? []).every(
      (opt) => merged[opt.name] === opt.value
    );
    if (match && variant.availableForSale) return true;
  }
  return false;
}

function getInitialSelectedOptions(product: ProductDetail): Record<string, string> {
  const nodes = product.variants?.nodes ?? [];
  const firstAvailable = nodes.find((v) => v.availableForSale);
  const variant = firstAvailable ?? nodes[0];
  if (!variant?.selectedOptions) return {};
  return Object.fromEntries(
    variant.selectedOptions.map((opt) => [opt.name, opt.value])
  );
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 animate-pulse">
      <div className="flex-1 aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded"
            />
          ))}
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </div>
    </div>
  );
}

type OptionButtonRefsMap = Record<string, Record<string, HTMLButtonElement | null>>;

type Props = {
  handle: string;
};

export function QuickViewModalContent({ handle }: Props) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [addState, setAddState] = useState<"idle" | "popping" | "loading" | "added">("idle");
  const [bagIconPop, setBagIconPop] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const bagIconRef = useRef<HTMLSpanElement>(null);
  const optionButtonRefs = useRef<OptionButtonRefsMap>({});
  const requestHandleRef = useRef<string>(handle);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    const thisHandle = handle;
    requestHandleRef.current = thisHandle;
    const ac = new AbortController();
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setAddState("idle");
      fetch(`/api/product/${encodeURIComponent(thisHandle)}`, { signal: ac.signal })
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((data: ProductDetail | null) => {
          if (requestHandleRef.current !== thisHandle) return;
          setProduct(data ?? null);
          if (data) {
            setSelectedOptions(getInitialSelectedOptions(data));
            setSelectedImageIndex(0);
          }
          setLoading(false);
        })
        .catch((err: Error) => {
          if (err.name === "AbortError") return;
          if (requestHandleRef.current === thisHandle) {
            setLoading(false);
            setProduct(null);
          }
        });
    });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [handle]);

  const pendingAddVariantIdRef = useRef<string | null>(null);

  const resolvedVariant = useMemo(
    () => (product ? resolveVariant(product, selectedOptions) : null),
    [product, selectedOptions]
  );

  const handleAddToBag = () => {
    if (!resolvedVariant?.availableForSale || addState !== "idle" || !product) return;
    pendingAddVariantIdRef.current = resolvedVariant.id;
    setBagIconPop(true);
    setAddState("popping");
  };

  const handleBagIconPopEnd = () => {
    setBagIconPop(false);
    setAddState("loading");
    const delay = 800 + Math.random() * 400;
    setTimeout(() => {
      const id = pendingAddVariantIdRef.current;
      if (id && product) {
        const selectedPrice = resolvedVariant?.price ?? null;
        const amount = selectedPrice ? Number(selectedPrice.amount) : 0;
        const currencyCode = selectedPrice?.currencyCode ?? "USD";
        const representativeImage =
          resolvedVariant?.image ??
          product.images?.nodes?.[selectedImageIndex] ??
          product.featuredImage ??
          product.images?.nodes?.[0] ??
          null;

        addItem({
          variantId: id,
          quantity: 1,
          productHandle: product.handle ?? handle,
          productTitle: product.title,
          variantTitle: resolvedVariant?.title ?? null,
          price: { amount: amount || 0, currencyCode },
          image: representativeImage
            ? {
                url: representativeImage.url,
                alt: representativeImage.altText ?? null,
              }
            : undefined,
        });
        pendingAddVariantIdRef.current = null;
      }
      setAddState("added");
      if (!reduceMotionRef.current) setShowSuccessOverlay(true);
      setTimeout(() => setAddState("idle"), 1500);
    }, delay);
  };
  const reduceMotionRef = useRef(reduceMotion);
  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);
  useEffect(() => {
    if (!showSuccessOverlay) return;
    const t = setTimeout(() => setShowSuccessOverlay(false), 1600);
    return () => clearTimeout(t);
  }, [showSuccessOverlay]);

  const variantImageUrl = resolvedVariant?.image?.url;
  useEffect(() => {
    if (!variantImageUrl || !product) return;
    const nodes = product.images?.nodes ?? [];
    const idx = nodes.findIndex((img) => img.url === variantImageUrl);
    if (idx >= 0) {
      const id = requestAnimationFrame(() => setSelectedImageIndex(idx));
      return () => cancelAnimationFrame(id);
    }
  }, [variantImageUrl, product]);

  // Focus management for thumbnail navigation
  useEffect(() => {
    const activeButton = thumbnailRefs.current[selectedImageIndex];
    if (activeButton && document.activeElement && thumbnailRefs.current.includes(document.activeElement as HTMLButtonElement)) {
      // Only focus if a thumbnail was previously focused (keyboard navigation)
      activeButton.focus();
    }
  }, [selectedImageIndex]);

  if (loading && !product) {
    return <ProductSkeleton />;
  }

  if (!loading && !product) {
    return (
      <div className="flex flex-col items-center gap-3 text-icon-muted py-8">
        <Icon name="search_off" className="text-4xl" />
        <p className="text-gray-500 dark:text-gray-400">Product not found.</p>
      </div>
    );
  }

  if (!product) return null;

  const productImages = product.images?.nodes ?? [];
  const image =
    productImages[selectedImageIndex] ??
    resolvedVariant?.image ??
    product.featuredImage ??
    productImages[0];
  const price = resolvedVariant?.price;
  const compareAtPrice = resolvedVariant?.compareAtPrice ?? null;
  const availableForSale = resolvedVariant?.availableForSale ?? false;
  const category = getPrimaryCategory(product);
  const categoryColor = getCategoryColor(category);
  const displayCategory = truncateCategory(category);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleOptionKeyDown = (
    optionName: string,
    value: string,
    values: string[],
    e: React.KeyboardEvent
  ) => {
    const idx = values.indexOf(value);
    if (idx < 0) return;
    let nextIdx = idx;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIdx = idx - 1;
      if (nextIdx < 0) nextIdx = values.length - 1;
      while (nextIdx !== idx && !isOptionValueAvailable(product, optionName, values[nextIdx], selectedOptions)) {
        nextIdx = nextIdx - 1;
        if (nextIdx < 0) nextIdx = values.length - 1;
      }
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIdx = idx + 1;
      if (nextIdx >= values.length) nextIdx = 0;
      while (nextIdx !== idx && !isOptionValueAvailable(product, optionName, values[nextIdx], selectedOptions)) {
        nextIdx = nextIdx + 1;
        if (nextIdx >= values.length) nextIdx = 0;
      }
    } else return;
    const nextValue = values[nextIdx];
    if (isOptionValueAvailable(product, optionName, nextValue, selectedOptions)) {
      handleOptionChange(optionName, nextValue);
      optionButtonRefs.current[optionName]?.[nextValue]?.focus();
    }
  };

  const options = product.options ?? [];
  const displayOptions = options.filter(
    (option) => option.name?.toLowerCase() !== "title"
  );

  return (
    <div className="relative">
      {showSuccessOverlay && (
        <div className="add-to-bag-success-overlay" aria-hidden>
          <div className="add-to-bag-success-action">
            <div className="add-to-bag-success-trophy">
              <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <filter id="add-to-bag-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path
                  fill="#00FF41"
                  filter="url(#add-to-bag-neon-glow)"
                  style={{ filter: 'url(#add-to-bag-neon-glow)' }}
                  d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"
                />
              </svg>
            </div>
            <div className="add-to-bag-success-confetti add-to-bag-success-confetti-one" />
            <div className="add-to-bag-success-confetti add-to-bag-success-confetti-two" />
            <div className="add-to-bag-success-confetti add-to-bag-success-confetti-three" />
            <div className="add-to-bag-success-confetti add-to-bag-success-confetti-four" />
            <div className="add-to-bag-success-confetti add-to-bag-success-confetti--purple add-to-bag-success-confetti--purple-one" />
            <div className="add-to-bag-success-confetti add-to-bag-success-confetti--purple add-to-bag-success-confetti--purple-two" />
            <div className="add-to-bag-success-confetti add-to-bag-success-confetti--purple add-to-bag-success-confetti--purple-three" />
            <div className="add-to-bag-success-confetti add-to-bag-success-confetti--purple add-to-bag-success-confetti--purple-four" />
          </div>
        </div>
      )}
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 dark:bg-gray-900/80"
          aria-hidden
        >
          <Icon name="progress_activity" className="text-4xl animate-spin text-gray-500 dark:text-gray-400" />
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex-shrink-0 space-y-3">
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {image?.url ? (
              <Image
                key={image.url}
                src={image.url}
                alt={image.altText ?? product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                style={{ viewTransitionName: productModalViewTransitionName(product.id) }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
            {displayCategory && (
              <div className={`absolute top-3 left-3 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold text-white ${categoryColor} shadow-lg max-w-[140px] truncate`}>
                {displayCategory}
              </div>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1" role="tablist" aria-label="Product images">
              {productImages.map((img, idx) => (
                <button
                  key={img.url}
                  type="button"
                  role="tab"
                  aria-selected={selectedImageIndex === idx}
                  tabIndex={selectedImageIndex === idx ? 0 : -1}
                  ref={(el) => {
                    thumbnailRefs.current[idx] = el;
                  }}
                  onClick={() => setSelectedImageIndex(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      const prevIndex = idx === 0 ? productImages.length - 1 : idx - 1;
                      setSelectedImageIndex(prevIndex);
                    } else if (e.key === "ArrowRight") {
                      e.preventDefault();
                      const nextIndex = idx === productImages.length - 1 ? 0 : idx + 1;
                      setSelectedImageIndex(nextIndex);
                    }
                  }}
                  className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 border-transparent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `${product.title} ${idx + 1}`}
                    width={56}
                    height={56}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${selectedImageIndex === idx ? "opacity-100" : "opacity-60"}`}
                  />
                  {selectedImageIndex === idx && (
                    <motion.span
                      layoutId="thumbnail-ring"
                      className="absolute inset-0 rounded-sm border-4 border-primary pointer-events-none"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white pr-12">
            {product.title}
          </h2>

            {/* Price display with compare-at pricing */}
            {(price || compareAtPrice) && (
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xl text-gray-700 dark:text-gray-300"
              >
                {/* Wrap the prices in AnimatePresence to handle exit animations */}
                <AnimatePresence mode="popLayout" initial={false}>
                  
                  {/* 1. Compare-at Price Animation */}
                  {compareAtPrice && (
                    <motion.span
                      key={`compare-${compareAtPrice.amount}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -10 }}
                      className="text-base text-gray-500 dark:text-gray-400 line-through"
                    >
                      {Number(compareAtPrice.amount).toFixed(2)} {compareAtPrice.currencyCode}
                    </motion.span>
                  )}

                  {/* 2. Main Price Animation */}
                  {price && (
                    <motion.p
                      key={`price-${price.amount}`} // Key triggers the animation when variant changes
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-1.5"
                    >
                      <Icon name="attach_money" className="text-green-600 dark:text-green-400 text-xl shrink-0" />
                      <span>{Number(price.amount).toFixed(2)}</span>
                      {price.currencyCode && price.currencyCode !== "USD" && (
                        <span className="text-sm opacity-80">{price.currencyCode}</span>
                      )}
                    </motion.p>
                  )}

                </AnimatePresence>
              </motion.div>
            )}

          {displayOptions.length > 0 && (
            <div className="mt-4 pb-28 sm:pb-0 space-y-3">
              {displayOptions.map((option) => (
                <div key={option.id ?? option.name}>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {option.name}
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {(option.values ?? []).map((value) => {
                      const selected = selectedOptions[option.name] === value;
                      const disabled = !isOptionValueAvailable(
                        product,
                        option.name,
                        value,
                        selectedOptions
                      );
                      return (
                        <button
                          key={value}
                          type="button"
                          ref={(el) => {
                            if (!optionButtonRefs.current[option.name]) {
                              optionButtonRefs.current[option.name] = {};
                            }
                            optionButtonRefs.current[option.name][value] = el;
                          }}
                          onClick={() => handleOptionChange(option.name, value)}
                          onKeyDown={(e) => handleOptionKeyDown(option.name, value, option.values ?? [], e)}
                          disabled={disabled}
                          className={`relative px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                            selected
                              ? "bg-primary text-white border-primary"
                              : disabled
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                          }`}
                          aria-pressed={selected}
                        >
                          {value}
                          {selected && (
                            <motion.span
                              layoutId={`selected-${option.name}`}
                              className="absolute inset-0 bg-primary rounded-lg -z-10"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:p-0 sm:bg-transparent sm:border-0 sm:mt-6">
            <motion.button
              type="button"
              onClick={handleAddToBag}
              disabled={!availableForSale || addState !== "idle"}
              className={`w-full min-h-[48px] px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                !availableForSale || addState !== "idle"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 active:bg-primary/95"
              }`}
              whileTap={{ scale: addState === "idle" ? 0.98 : 1 }}
              aria-label={`Add ${product.title} to cart`}
            >
              <span className="flex items-center justify-center gap-2">
                {addState === "idle" && (
                  <>
                    <Icon
                      name="shopping_bag"
                      className={`text-xl ${bagIconPop ? "icon-pop-running" : ""}`}
                      ref={bagIconRef}
                      onAnimationEnd={handleBagIconPopEnd}
                    />
                    Add to bag
                  </>
                )}
                {addState === "popping" && (
                  <>
                    <Icon
                      name="shopping_bag"
                      className="text-xl icon-pop-running"
                      ref={bagIconRef}
                      onAnimationEnd={handleBagIconPopEnd}
                    />
                    Add to bag
                  </>
                )}
                {addState === "loading" && (
                  <>
                    <Icon name="progress_activity" className="text-xl animate-spin" />
                    Adding...
                  </>
                )}
                {addState === "added" && (
                  <>
                    <Icon name="check_circle" className="text-xl" />
                    Added!
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
