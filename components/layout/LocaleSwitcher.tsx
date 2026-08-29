"use client";

import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="inline-flex rounded-[7px] border border-gs-border p-0.5"
      role="group"
      aria-label={t("locale")}
    >
      {routing.locales.map((item) => {
        const isActive = item === locale;

        return (
          <button
            key={item}
            type="button"
            aria-pressed={isActive}
            className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong ${
              isActive
                ? "bg-gs-accent text-gs-surface"
                : "text-gs-on-header hover:bg-gs-surface-2 hover:text-white"
            }`}
            onClick={() => router.replace(pathname, { locale: item })}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
