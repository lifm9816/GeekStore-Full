"use client";

/**
 * Barra de búsqueda al estilo GeekStore-Demo (SearchBar):
 * píldora blanca, ícono de marca a la izquierda, input centrado,
 * botón circular derecho con primary del tema.
 *
 * Comportamiento como el CRA activo: resultados al escribir
 * (debounce 300ms → /search?q=…). contains insensitive vía Prisma
 * (no startsWith).
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";

const DEBOUNCE_MS = 300;

type SearchFormProps = {
  defaultQuery?: string;
};

export function SearchForm({ defaultQuery = "" }: SearchFormProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const { theme } = useTheme();
  const [term, setTerm] = useState(defaultQuery);

  useEffect(() => {
    setTerm(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    const trimmed = term.trim();
    const current = defaultQuery.trim();

    if (trimmed === current) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!trimmed) {
        router.replace("/search");
        return;
      }

      router.replace(`/search?q=${encodeURIComponent(trimmed)}`);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [term, defaultQuery, router]);

  function flushSearch() {
    const trimmed = term.trim();

    if (!trimmed) {
      router.replace("/search");
      return;
    }

    router.replace(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const iconSrc =
    theme === "dark"
      ? "/images/branding/dark_icon.png"
      : "/images/branding/icon.png";

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        flushSearch();
      }}
      className="mx-auto flex w-full max-w-2xl items-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
    >
      <div className="relative flex min-w-0 flex-1 items-center">
        <Image
          src={iconSrc}
          alt=""
          width={55}
          height={55}
          className="z-10 h-[55px] w-[55px] shrink-0 rounded-l-full object-cover"
          aria-hidden
        />
        <label htmlFor="search-q" className="sr-only">
          {t("label")}
        </label>
        <input
          id="search-q"
          name="q"
          type="text"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t("placeholder")}
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2.5 text-center text-base text-[#19222D] outline-none placeholder:text-[#19222D]/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        />
      </div>
      <button
        type="submit"
        className="flex shrink-0 items-center justify-center rounded-r-full bg-gs-header px-[19px] py-[19px] text-white transition-colors hover:bg-gs-header/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        aria-label={t("submit")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
