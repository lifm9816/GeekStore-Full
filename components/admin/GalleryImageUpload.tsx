"use client";

/**
 * Galería secundaria (ProductImage) como campo del formulario.
 * Franja horizontal + scroll-x; reorden ←→ (a11y) y drag pointer (mouse/touch).
 */

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useTranslations } from "next-intl";
import { ImageUpload } from "@/components/admin/ImageUpload";

type GallerySlot = {
  id: string;
  url: string;
};

type GalleryImageUploadProps = {
  name?: string;
  defaultUrls?: string[];
};

const DRAG_THRESHOLD_PX = 8;

function makeSlot(url: string): GallerySlot {
  return { id: crypto.randomUUID(), url };
}

function reorderSlots(list: GallerySlot[], from: number, to: number) {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return list;
  }

  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function GalleryImageUpload({
  name = "galleryUrls",
  defaultUrls = [],
}: GalleryImageUploadProps) {
  const t = useTranslations("admin.products");
  const listId = useId();
  const stripRef = useRef<HTMLUListElement>(null);
  const slotsRef = useRef<GallerySlot[]>([]);
  const dragRef = useRef<{
    id: string;
    fromIndex: number;
    startX: number;
    active: boolean;
    pointerId: number;
  } | null>(null);

  const [slots, setSlots] = useState<GallerySlot[]>(() =>
    defaultUrls.map((url) => makeSlot(url)),
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);

  slotsRef.current = slots;

  const urlsForSubmit = slots
    .map((slot) => slot.url.trim())
    .filter((url) => url.length > 0 && !url.startsWith("blob:"));

  function appendUrls(urls: string[]) {
    if (urls.length === 0) {
      return;
    }

    setSlots((current) => [
      ...current,
      ...urls.map((url) => makeSlot(url)),
    ]);
  }

  function removeSlot(id: string) {
    setSlots((current) => current.filter((slot) => slot.id !== id));
  }

  function moveSlot(id: string, direction: -1 | 1) {
    setSlots((current) => {
      const index = current.findIndex((slot) => slot.id === id);
      if (index < 0) {
        return current;
      }

      return reorderSlots(current, index, index + direction);
    });
  }

  function indexFromClientX(clientX: number) {
    const strip = stripRef.current;
    if (!strip) {
      return -1;
    }

    const items = Array.from(
      strip.querySelectorAll<HTMLElement>("[data-slot-id]"),
    );

    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      if (clientX < rect.left + rect.width / 2) {
        return i;
      }
    }

    return items.length - 1;
  }

  function onThumbPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    id: string,
    index: number,
  ) {
    if (event.button !== 0) {
      return;
    }

    // No iniciar drag desde controles (por si el evento burbujea).
    const target = event.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    dragRef.current = {
      id,
      fromIndex: index,
      startX: event.clientX,
      active: false,
      pointerId: event.pointerId,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onThumbPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startX;

    if (!drag.active) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) {
        return;
      }
      drag.active = true;
      setDraggingId(drag.id);
    }

    event.preventDefault();

    const toIndex = indexFromClientX(event.clientX);
    if (toIndex < 0) {
      return;
    }

    const fromIndex = slotsRef.current.findIndex((slot) => slot.id === drag.id);
    if (fromIndex < 0 || fromIndex === toIndex) {
      return;
    }

    setSlots((current) => reorderSlots(current, fromIndex, toIndex));
  }

  function endThumbPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    setDraggingId(null);
  }

  // Rueda → scroll horizontal (passive: false para poder preventDefault).
  useEffect(() => {
    const el = stripRef.current;
    if (!el) {
      return;
    }

    function onWheel(event: WheelEvent) {
      if (!el || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      if (el.scrollWidth <= el.clientWidth) {
        return;
      }

      // No interferir mientras se arrastra una miniatura.
      if (dragRef.current?.active) {
        return;
      }

      el.scrollLeft += event.deltaY;
      event.preventDefault();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [slots.length]);

  return (
    <div>
      <h3
        id={listId}
        className="block text-[12.5px] font-medium text-gs-muted"
      >
        {t("fields.gallery")}
      </h3>
      <p className="mt-1 text-[12px] text-gs-muted">{t("fields.galleryHint")}</p>

      <input type="hidden" name={name} value={JSON.stringify(urlsForSubmit)} />

      <div className="mt-1.5">
        <ImageUpload
          kind="product"
          label={t("fields.galleryAdd")}
          altHint={t("fields.galleryItemAlt", { index: slots.length + 1 })}
          variant="hero"
          multiple
          onUrlsChange={appendUrls}
        />
      </div>

      {slots.length === 0 ? (
        <p className="mt-3 text-[12px] text-gs-muted">{t("fields.galleryEmpty")}</p>
      ) : (
        <>
          <p className="mt-3 text-[11px] text-gs-muted">
            {t("fields.galleryScrollHint")} {t("fields.galleryDragHint")}
          </p>
          <ul
            ref={stripRef}
            aria-labelledby={listId}
            tabIndex={0}
            className="mt-2 flex h-37 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            {slots.map((slot, index) => {
              const isDragging = draggingId === slot.id;

              return (
                <li
                  key={slot.id}
                  data-slot-id={slot.id}
                  aria-grabbed={isDragging}
                  className={`flex h-full w-28 shrink-0 snap-start flex-col overflow-hidden rounded-[10px] border bg-gs-surface transition-shadow ${
                    isDragging
                      ? "border-gs-accent opacity-70 ring-2 ring-gs-accent"
                      : "border-gs-border"
                  }`}
                >
                  <div
                    aria-label={t("fields.galleryDragging", {
                      index: index + 1,
                    })}
                    onPointerDown={(event) =>
                      onThumbPointerDown(event, slot.id, index)
                    }
                    onPointerMove={onThumbPointerMove}
                    onPointerUp={endThumbPointer}
                    onPointerCancel={endThumbPointer}
                    className={`relative min-h-0 flex-1 select-none ${
                      isDragging
                        ? "cursor-grabbing touch-none"
                        : "cursor-grab touch-pan-x"
                    }`}
                  >
                    <Image
                      src={slot.url}
                      alt={t("fields.galleryItemAlt", { index: index + 1 })}
                      fill
                      sizes="112px"
                      className="pointer-events-none object-cover"
                      draggable={false}
                      unoptimized={slot.url.startsWith("blob:")}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-0.5 border-t border-gs-border px-1 py-1">
                    <span className="px-1 text-[10px] font-bold text-gs-muted">
                      {index + 1}
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveSlot(slot.id, -1)}
                        className="rounded px-1.5 py-0.5 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gs-accent-strong"
                        aria-label={t("fields.galleryMoveLeft", {
                          index: index + 1,
                        })}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === slots.length - 1}
                        onClick={() => moveSlot(slot.id, 1)}
                        className="rounded px-1.5 py-0.5 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gs-accent-strong"
                        aria-label={t("fields.galleryMoveRight", {
                          index: index + 1,
                        })}
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-gs-critical focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gs-accent-strong"
                        aria-label={t("fields.galleryRemove", {
                          index: index + 1,
                        })}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
