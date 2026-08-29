"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CoverImage } from "@/components/product/CoverImage";

export type GalleryItem = {
  url: string;
  alt: string;
};

type ProductGalleryProps = {
  name: string;
  images: GalleryItem[];
};

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const t = useTranslations("product");
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return null;
  }

  return (
    <div>
      <figure className="overflow-hidden rounded-[10px] border border-gs-border bg-gs-surface">
        <div className="relative aspect-[4/5] md:aspect-[4/5] lg:min-h-[420px]">
          <CoverImage
            src={active.url}
            alt={active.alt}
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-contain p-6"
            priority
          />
        </div>
        <figcaption className="sr-only">{t("gallery", { name })}</figcaption>
      </figure>

      {images.length > 1 ? (
        <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <li key={`${image.url}-${index}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={t("thumbnail", { index: index + 1, name })}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong ${
                    isActive
                      ? "border-gs-accent"
                      : "border-gs-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <CoverImage
                    src={image.url}
                    alt=""
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
