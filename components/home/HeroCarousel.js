"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    headline: "Premium Electronics",
    subtext: "Discover the latest technology at unbeatable prices",
    cta: "Shop Now",
    href: "/products",
    bg: "bg-[#2563EB]",
    image: "/images/hero-electronics.jpg",
  },
  {
    headline: "Smart Solutions",
    subtext: "Expert advice and top-tier customer service",
    cta: "Learn More",
    href: "/about",
    bg: "bg-slate-900",
    image: "/images/hallway-modern-electronics-store_808280-2288.avif",
  },
  {
    headline: "New Arrivals",
    subtext: "Check out our latest collection of cutting-edge devices",
    cta: "View Collection",
    href: "/products",
    bg: "bg-slate-950",
    image: "/images/electronics-store-display-cameras-accessories-november-tashkent-uzbekistan-showcase-filled-various-lenses-audio-420572841.webp",
  },
];

const arrowButton =
  "absolute top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-b from-white/30 to-white/10 border border-white/40 backdrop-blur-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.35)] hover:from-white/50 hover:to-white/20 active:translate-y-[calc(-50%+1px)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)] transition-all duration-150";

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="relative w-full overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex transition-transform duration-[900ms] ease-[cubic-bezier(0.25,1,0.3,1)] will-change-transform">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`flex-none w-full min-h-[480px] md:min-h-[480px] lg:min-h-[540px] flex items-center ${slide.bg} relative`}
            >
              {slide.image && (
                <>
                  <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </>
              )}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">
                <div className="max-w-2xl mx-auto space-y-2 text-center">
                  <h1 className="text-[clamp(1.5rem,8vw,3rem)] md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight whitespace-nowrap [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
                    {slide.headline}
                  </h1>
                  <p className="text-base md:text-lg text-slate-200 dark:text-slate-300 max-w-lg mx-auto [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
                    {slide.subtext}
                  </p>
                  <Link
                    href={slide.href}
                    className="inline-block px-8 py-3.5 bg-gradient-to-b from-white to-[#dfe5ec] text-slate-900 font-semibold rounded-lg text-base border border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(0,0,0,0.15),0_3px_8px_rgba(0,0,0,0.35)] hover:from-[#f6f8fb] hover:to-[#d6dde6] active:translate-y-px active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.22)] transition-all duration-150"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={scrollPrev} className={`${arrowButton} left-4 md:left-6`} aria-label="Previous slide">
        <ChevronLeft className="w-6 h-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
      </button>

      <button onClick={scrollNext} className={`${arrowButton} right-4 md:right-6`} aria-label="Next slide">
        <ChevronRight className="w-6 h-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-8 h-3 bg-gradient-to-b from-white to-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_1px_2px_rgba(0,0,0,0.45)]"
                : "w-3 h-3 bg-white/40 border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.35)] hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}