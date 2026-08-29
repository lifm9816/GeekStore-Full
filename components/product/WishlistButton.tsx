"use client";

/**
 * Un solo control (roadmap §8): outline agrega, relleno quita.
 * Invitado → login con callback; sesión → toggleWishlist (Wishlist real).
 */

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/actions/wishlist";
import { Link, usePathname } from "@/i18n/navigation";

type WishlistButtonProps = {
  productId: string;
  initialWishlisted: boolean;
  variant?: "overlay" | "detail";
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-[18px] w-[18px] ${
        filled
          ? "fill-gs-accent-strong stroke-gs-accent-strong"
          : "fill-none stroke-current"
      }`}
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    </svg>
  );
}

export function WishlistButton({
  productId,
  initialWishlisted,
  variant = "overlay",
}: WishlistButtonProps) {
  const t = useTranslations("product");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, setPending] = useState(false);
  const callbackUrl = `/${locale}${pathname}`;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const label = wishlisted ? t("wishlistRemove") : t("wishlistAdd");
  const className =
    variant === "detail"
      ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-gs-border bg-gs-surface text-gs-muted transition-colors hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:opacity-60"
      : "inline-flex h-9 w-9 items-center justify-center rounded-full bg-gs-surface/90 text-gs-muted shadow-sm transition-colors hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:opacity-60";

  async function handleToggle() {
    if (pending || status === "loading") {
      return;
    }

    setPending(true);
    const previous = wishlisted;
    setWishlisted(!previous);
    const result = await toggleWishlist(productId);

    if (!result.ok) {
      setWishlisted(previous);
    } else {
      setWishlisted(result.wishlisted);
      router.refresh();
    }

    setPending(false);
  }

  if (status !== "loading" && !session?.user) {
    return (
      <Link
        href={loginHref}
        aria-label={label}
        className={className}
      >
        <HeartIcon filled={false} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={pending || status === "loading"}
      aria-pressed={wishlisted}
      aria-label={label}
      aria-busy={pending}
      className={className}
    >
      <HeartIcon filled={wishlisted} />
    </button>
  );
}
