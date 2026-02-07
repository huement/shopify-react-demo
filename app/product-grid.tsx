"use client";

import Image from "next/image";
import type { GetCollectionByHandleQuery } from "@/lib/shopify/graphql/.generated/storefront.generated";
import { Icon } from "./ui/material-icon";
import { productViewTransitionName } from "@/lib/view-transition";
import { getPrimaryCategory, getCategoryColor, truncateCategory } from "./category-utils";

type CollectionProduct = NonNullable<
  GetCollectionByHandleQuery["collectionByHandle"]
>["products"]["nodes"][number];

type ProductCardProps = {
  product: CollectionProduct;
  onQuickView: (handle: string) => void;
  onPrefetchRequested?: (handle: string) => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  isSelected?: boolean;
};

function ProductCard({ product, onQuickView, onPrefetchRequested, triggerRef, isSelected }: ProductCardProps) {
  const image = product.featuredImage;
  const price = product.priceRange?.minVariantPrice;
  const category = getPrimaryCategory(product);
  const categoryColor = getCategoryColor(category);
  const displayCategory = truncateCategory(category);

  const handleClick = () => {
    onQuickView(product.handle);
  };

  const handlePrefetch = () => {
    onPrefetchRequested?.(product.handle);
  };

  return (
    <button
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      type="button"
      ref={isSelected ? triggerRef : undefined}
      onClick={handleClick}
      className="group/card w-full text-left bg-white dark:bg-gray-900 shadow-md rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-xl dark:shadow-gray-950/50 dark:hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white cursor-pointer min-h-[44px] touch-manipulation md:hover:scale-[1.02] md:transition-transform md:duration-300 motion-reduce:md:hover:scale-100"
      aria-label={`Quick view ${product.title}`}
    >
      {/* Square image container: top/bottom cropped on card; full image shown in modal */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden rounded-t-xl">
        {image?.url ? (
          <div className="absolute inset-0 transition-transform duration-300 md:group-hover/card:scale-105">
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              className="w-full h-full object-cover object-center"
              width={image.width ?? 400}
              height={image.height ?? 400}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ viewTransitionName: productViewTransitionName(product.id) }}
            />
            {/* Quick View overlay: shown on hover (desktop); hidden on touch devices */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-300 md:group-hover/card:opacity-100" aria-hidden>
              <Icon
                name="photo_camera"
                weight={700}
                className="text-white text-5xl sm:text-6xl shrink-0 drop-shadow-lg"
              />
              <span className="text-white font-bold text-base sm:text-lg drop-shadow-md">Quick View</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="px-4 py-3">
        <h3 className="font-heading text-base sm:text-lg md:text-xl lg:text-2xl font-medium sm:font-semibold lg:font-bold tracking-wide md:tracking-wider leading-snug md:leading-normal text-gray-900 dark:text-white line-clamp-2 break-words capitalize antialiased min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem] lg:min-h-[4rem]">
          {product.title}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-3">
          {price && (
            <div className="flex items-center gap-3 text-gray-900 dark:text-white">
              <Icon
                name="attach_money"
                weight={700}
                className="text-green-600 dark:text-green-400 text-xl shrink-0"
              />
              <span className="text-lg font-bold">
                {(() => {
                  const num = Number(price.amount);
                  const int = Math.floor(num);
                  const cents = Math.round((num % 1) * 100);
                  const centsStr = cents.toString().padStart(2, "0");
                  return (
                    <>
                      {int}<span className="text-sm font-semibold opacity-80 align-baseline">.{centsStr}</span>
                      {price.currencyCode !== "USD" ? ` ${price.currencyCode}` : ""}
                    </>
                  );
                })()}
              </span>
            </div>
          )}
          {displayCategory && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${categoryColor} max-w-[120px] truncate shrink-0`}>
              {displayCategory}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

type Props = {
  products: CollectionProduct[];
  selectedHandle: string | null;
  onSelectedHandleChange: (handle: string) => void;
  onPrefetchRequested?: (handle: string) => void;
  quickViewTriggerRef: React.RefObject<HTMLButtonElement | null>;
};

export function ProductGrid({
  products,
  selectedHandle,
  onSelectedHandleChange,
  onPrefetchRequested,
  quickViewTriggerRef,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-icon-muted py-12">
        <Icon name="inventory_2" className="text-4xl" />
        <p className="text-gray-500 dark:text-gray-400">
          No products in this collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={(handle) => onSelectedHandleChange(handle)}
          onPrefetchRequested={onPrefetchRequested}
          triggerRef={quickViewTriggerRef}
          isSelected={selectedHandle === product.handle}
        />
      ))}
    </div>
  );
}
