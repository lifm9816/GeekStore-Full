"use client";

/**
 * Carousel dinámico de home — lee Promotion activas (Día 15).
 */

import { useCallback, useEffect, useId, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ActivePromotion } from "@/lib/promotions";

const INTERVAL_MS = 4000;

type HomeBannerCarouselProps = {
  slides: ActivePromotion[];
};

export function HomeBannerCarousel({ slides }: HomeBannerCarouselProps) {
  const t = useTranslations("home");
  const labelId = useId();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) {
        return;
      }

      setIndex((next + total) % total);
    },
    [total],
  );

  useEffect(() => {
    setIndex(0);
  }, [total]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (paused || media.matches || total <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [paused, total]);

  if (total === 0) {
    return (
      <section
        aria-labelledby={labelId}
        className="rounded-[20px] border border-dashed border-gs-border bg-gs-surface-2 px-4 py-10 text-center"
      >
        <h2 id={labelId} className="sr-only">
          {t("carousel")}
        </h2>
        <p className="text-sm text-gs-muted">{t("carouselEmpty")}</p>
      </section>
    );
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      className="relative overflow-hidden rounded-[20px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h2 id={labelId} className="sr-only">
        {t("carousel")}
      </h2>

      <div className="relative aspect-video bg-gs-surface-2">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            aria-hidden={slideIndex !== index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              slideIndex === index
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <Link
              href={`/product/${slide.productId}`}
              className="relative block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
              tabIndex={slideIndex === index ? 0 : -1}
            >
              <Image
                src={slide.imageUrl}
                alt={
                  slideIndex === index
                    ? t("bannerAlt", { title: slide.title })
                    : ""
                }
                fill
                priority={slideIndex === 0}
                className="rounded-[20px] object-cover"
                sizes="(max-width: 800px) 100vw, 50vw"
              />
            </Link>
          </div>
        ))}
      </div>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={t("previousSlide")}
            className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gs-surface/80 text-lg font-bold text-gs-text transition-colors hover:bg-gs-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={t("nextSlide")}
            className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gs-surface/80 text-lg font-bold text-gs-text transition-colors hover:bg-gs-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            ›
          </button>

          <p className="sr-only" aria-live="polite">
            {t("slideStatus", { current: index + 1, total })}
          </p>

          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={t("goToSlide", { index: slideIndex + 1 })}
                aria-current={slideIndex === index ? "true" : undefined}
                onClick={() => goTo(slideIndex)}
                className={`h-2.5 w-2.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong ${
                  slideIndex === index
                    ? "bg-gs-accent"
                    : "bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
