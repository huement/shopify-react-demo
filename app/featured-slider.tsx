"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "motion/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import type { GetCollectionByHandleQuery } from "@/lib/shopify/graphql/.generated/storefront.generated";

type CollectionProduct = NonNullable<GetCollectionByHandleQuery["collectionByHandle"]>["products"]["nodes"][number];

type FeaturedSliderProps = {
  products: CollectionProduct[];
  onQuickView: (handle: string) => void;
};

export function FeaturedSlider({ products, onQuickView }: FeaturedSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter logic (kept from your original)
  const slides = products.filter((p) => p.featuredImage?.url).slice(0, 4);

  if (slides.length === 0) return null;

  return (
    <section className="featured-hero h-screen bg-black relative overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{
          crossFade: true, // This prevents the blending issue
        }}
        loop={slides.length > 1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        pagination={{
          clickable: true,
          bulletClass: "featured-bullet",
          bulletActiveClass: "featured-bullet-active",
        }}
        navigation={{
          nextEl: ".featured-swiper-next",
          prevEl: ".featured-swiper-prev",
        }}
        className="h-full w-full"
        speed={800} // Smoother transition speed
      >
        {slides.map((product) => (
          <SwiperSlide key={product.id} className="!h-full relative">
            {/* Using the render function to get the 'isActive' boolean directly from Swiper */}
            {({ isActive }) => (
              <>
                {/* Background with Ken Burns Effect */}
                <motion.div
                  initial={{ scale: 1, opacity: 0 }}
                  animate={isActive ? { scale: 1.15, opacity: 0.5 } : { scale: 1, opacity: 0 }}
                  transition={{ 
                    scale: { duration: 8, ease: "linear" },
                    opacity: { duration: 0.8, ease: "easeInOut" }
                  }}
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${product.featuredImage?.url})` }}
                />

                {/* Content Card */}
                <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key={`content-${product.id}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={[
                          "w-[95%] max-w-xl lg:max-w-4xl xl:max-w-6xl",
                          "px-8 py-12 md:px-16 md:py-20 flex flex-col items-center justify-center",
                          "bg-black/40 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-2xl"
                        ].join(' ')}
                      >
                        <motion.h2 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-white text-5xl md:text-8xl mb-6 font-heading font-bold tracking-tighter text-center"
                        >
                          {product.title}
                        </motion.h2>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onQuickView(product.handle)}
                          className="border border-white px-12 py-4 text-xs tracking-[0.3em] text-white hover:bg-white hover:text-black transition-all"
                        >
                          QUICK VIEW
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Modern Minimal Navigation - Hidden on medium and small screens */}
      <div className="absolute bottom-12 right-12 z-20 hidden lg:flex gap-4">
        <button className="featured-swiper-prev group border border-white/20 p-4 rounded-full hover:bg-white hover:text-black transition-all">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="rotate-180 stroke-current"><path d="M4 10h12m0 0l-4-4m4 4l-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="featured-swiper-next group border border-white/20 p-4 rounded-full hover:bg-white hover:text-black transition-all">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="stroke-current"><path d="M4 10h12m0 0l-4-4m4 4l-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </section>
  );
}