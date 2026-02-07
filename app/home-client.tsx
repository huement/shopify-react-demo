"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { FeaturedSlider } from "./featured-slider";
import { ProductGrid } from "./product-grid";
import { QuickViewModal } from "./quick-view-modal";
import { QuickViewModalContent } from "./quick-view-modal-content";
import { MenuOverlay, AccountModal, SearchModal, CartModal } from "./top-nav-modals";
import { useRef, useState, useMemo } from "react";
import type { GetCollectionByHandleQuery } from "@/lib/shopify/graphql/.generated/storefront.generated";

type CollectionProduct = NonNullable<
  GetCollectionByHandleQuery["collectionByHandle"]
>["products"]["nodes"][number];

type Props = {
  products: CollectionProduct[];
  shopName?: string;
};

// Hardcoded based on your CLI output
const COLLECTIONS = [
  { handle: "all", title: "All" },
  { handle: "graphics-cards", title: "Graphics Cards" },
  { handle: "accessories", title: "Accessories" },
];

export function HomeClient({
  products,
  shopName,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quickViewTriggerRef = useRef<HTMLButtonElement | null>(null);
  
  // UI State
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  
  // Filter State
  const [activeCollection, setActiveCollection] = useState("all");

  const selectedHandle = searchParams.get("quickView");

  // Filter products based on active tab
  const filteredProducts = useMemo(() => {
    if (activeCollection === "all") return products;
    return products.filter((product) => 
      product.collections?.nodes?.some((collection: { handle: string }) => collection.handle === activeCollection)
    );
  }, [activeCollection, products]);


  const openQuickView = (handle: string) => {
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as Document & { startViewTransition: (cb: () => void | Promise<void>) => { ready: Promise<void>; finished: Promise<void> } })
        .startViewTransition(() => {
          router.push(`/?quickView=${encodeURIComponent(handle)}`, { scroll: false });
          return new Promise<void>((resolve) => setTimeout(resolve, 120));
        })
        .finished.catch(() => {});
    } else {
      router.push(`/?quickView=${encodeURIComponent(handle)}`, { scroll: false });
    }
  };

  const closeQuickView = () => {
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as Document & { startViewTransition: (cb: () => void | Promise<void>) => { ready: Promise<void>; finished: Promise<void> } })
        .startViewTransition(() => {
          router.push("/", { scroll: false });
          return new Promise<void>((resolve) => setTimeout(resolve, 80));
        })
        .finished.catch(() => {});
    } else {
      router.push("/", { scroll: false });
    }
  };

  const closeAllChrome = () => {
    setMenuOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
  };

  const handleMenuToggle = () => {
    setMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        // Close other modals when opening menu
        setAccountOpen(false);
        setSearchOpen(false);
        setCartOpen(false);
      }
      return next;
    });
  };

  const handleAccountOpen = () => {
    closeAllChrome();
    setAccountOpen(true);
  };

  const handleSearchOpen = () => {
    closeAllChrome();
    setSearchOpen(true);
  };

  const handleCartOpen = () => {
    closeAllChrome();
    setCartOpen(true);
  };

  const handleProductSelectFromOverlay = (handle: string) => {
    closeAllChrome();
    openQuickView(handle);
  };

  return (
    <>
      <section className="h-screen bg-black relative">
        <Header
          shopName={shopName ?? "BRYT"}
          onMenuToggle={handleMenuToggle}
          onAccountOpen={handleAccountOpen}
          onSearchOpen={handleSearchOpen}
          onCartOpen={handleCartOpen}
          isMenuOpen={menuOpen}
        />
        <FeaturedSlider products={products} onQuickView={openQuickView} />
      </section>

      <main id="products" className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 md:p-8 bg-white dark:bg-black text-black dark:text-white" role="main">
        
        {/* Collection Tab Bar */}
        <nav className="flex items-center justify-center mb-12 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-8">
            {COLLECTIONS.map((col) => (
              <button
                key={col.handle}
                onClick={() => setActiveCollection(col.handle)}
                className={`cursor-pointer touch-manipulation pb-4 text-sm font-medium uppercase tracking-widest transition-all relative ${
                  activeCollection === col.handle
                    ? "text-black dark:text-white"
                    : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                {col.title}
                {activeCollection === col.handle && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white" />
                )}
              </button>
            ))}
          </div>
        </nav>

        <ProductGrid
          products={filteredProducts}
          selectedHandle={selectedHandle}
          onSelectedHandleChange={openQuickView}
          onPrefetchRequested={(handle) => fetch(`/api/product/${encodeURIComponent(handle)}`)}
          quickViewTriggerRef={quickViewTriggerRef}
        />
      </main>

      <Footer />

      <QuickViewModal
        isOpen={selectedHandle !== null}
        onClose={closeQuickView}
        triggerRef={quickViewTriggerRef}
      >
        {selectedHandle && (
          <QuickViewModalContent handle={selectedHandle} />
        )}
      </QuickViewModal>

      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <AccountModal isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
        onProductSelect={handleProductSelectFromOverlay}
      />
      <CartModal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onProductSelect={handleProductSelectFromOverlay}
      />
    </>
  );
}