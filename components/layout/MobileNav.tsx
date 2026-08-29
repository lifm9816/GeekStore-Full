"use client";

/**
 * Navbar inferior. El badge del carrito tiene dos fuentes:
 * - Invitado: localStorage (CART_DRAFT_EVENT + storage).
 * - Sesión: serverCartCount que trae el layout desde CartItem; se actualiza
 *   con router.refresh() tras cada Server Action.
 *
 * El 5º slot es siempre Carrito (cuenta dual admin/cliente — Roadmap §8).
 * Panel admin: solo vía SettingsMenu → "Panel admin".
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Link, usePathname } from "@/i18n/navigation";
import {
  CART_COUNT_EVENT,
  CART_DRAFT_EVENT,
  getDraftCartCount,
} from "@/lib/cart-draft";
import "./MobileNav.css";

const SLOT = 70;
const NOTCH_WIDTH = 120;
const FAB_SIZE = 56;

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3 4 9.2V20h5.2v-6h5.6v6H20V9.2L12 3Z"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11 7.8 6.8 12 11 16.2V13h7.2v-2H11V7.8ZM4 4h2v16H4V4Z"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm5.96 8.04 3.75 3.75-1.42 1.42-3.75-3.75 1.42-1.42Z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 4.5a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6ZM5.4 19.2c.5-3.4 3.4-5.4 6.6-5.4s6.1 2 6.6 5.4H5.4Z"
      />
    </svg>
  );
}

function CartGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>
  );
}

function resolveActiveIndex(pathname: string) {
  if (pathname.startsWith("/search")) {
    return 1;
  }

  if (pathname.startsWith("/about")) {
    return 2;
  }

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/account")
  ) {
    return 3;
  }

  if (
    pathname.startsWith("/cart") ||
    pathname.startsWith("/shopping") ||
    pathname.startsWith("/checkout")
  ) {
    return 4;
  }

  return 0;
}

function NotchPath() {
  return (
    <svg
      className="gs-nav-notch text-[color:var(--gs-nav-fill)]"
      viewBox="0 0 120 80"
      width={120}
      height={80}
      overflow="visible"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0 0 H14 C20 0 22 4 26 8 C32 22 44 34 60 34 C76 34 88 22 94 8 C98 4 100 0 106 0 H120 V80 H0 Z"
      />
    </svg>
  );
}

type MobileNavProps = {
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
  signedIn?: boolean;
  serverCartCount?: number;
};

export function MobileNav({
  user,
  signedIn = false,
  serverCartCount = 0,
}: MobileNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const activeIndex = resolveActiveIndex(pathname);
  const onProduct = pathname.includes("/product");
  const [cartCount, setCartCount] = useState(signedIn ? serverCartCount : 0);
  const navRef = useRef<HTMLElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const [ulLeft, setUlLeft] = useState(0);
  const [slotWidth, setSlotWidth] = useState(SLOT);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const ul = ulRef.current;

    if (!nav || !ul) {
      return;
    }

    function measure() {
      const navEl = navRef.current;
      const ulEl = ulRef.current;
      if (!navEl || !ulEl) {
        return;
      }

      const navRect = navEl.getBoundingClientRect();
      const ulRect = ulEl.getBoundingClientRect();
      setUlLeft(ulRect.left - navRect.left);
      setSlotWidth(ulRect.width / 5);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    observer.observe(ul);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function syncFromStorage() {
      if (!signedIn) {
        setCartCount(getDraftCartCount());
      }
    }

    function syncFromEvent(event: Event) {
      const count = (event as CustomEvent<number>).detail;
      if (typeof count === "number") {
        setCartCount(count);
      }
    }

    if (signedIn) {
      setCartCount(serverCartCount);
    } else {
      syncFromStorage();
    }

    window.addEventListener(CART_DRAFT_EVENT, syncFromStorage);
    window.addEventListener(CART_COUNT_EVENT, syncFromEvent);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener(CART_DRAFT_EVENT, syncFromStorage);
      window.removeEventListener(CART_COUNT_EVENT, syncFromEvent);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [signedIn, serverCartCount]);

  const itemCenter = ulLeft + activeIndex * slotWidth + slotWidth / 2;
  const notchLeft = itemCenter - NOTCH_WIDTH / 2;
  const fabLeft = itemCenter - FAB_SIZE / 2;
  const slide = {
    duration: reduceMotion ? 0 : 0.5,
    ease: "easeInOut" as const,
  };

  const items: {
    href: string;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      href: "/",
      label: onProduct ? t("back") : t("home"),
      icon: onProduct ? <BackIcon /> : <HomeIcon />,
    },
    {
      href: "/search",
      label: t("search"),
      icon: <SearchIcon />,
    },
    {
      href: "/about",
      label: t("about"),
      icon: (
        <>
          <Image
            src="/images/branding/dark_icon.png"
            alt=""
            width={56}
            height={56}
            className="logo_movil logo-dark"
          />
          <Image
            src="/images/branding/icon.png"
            alt=""
            width={56}
            height={56}
            className="logo_movil logo-light"
          />
        </>
      ),
    },
    {
      href: user ? "/account" : "/login",
      label: user ? t("account") : t("login"),
      icon: user ? (
        <UserAvatar name={user.name} image={user.image} size={28} />
      ) : (
        <UserIcon />
      ),
    },
    {
      href: "/cart",
      label: t("cart"),
      icon: (
        <span className="cart-icon">
          <CartGlyph />
          {cartCount > 0 ? (
            <span className="cart-counter">{cartCount}</span>
          ) : null}
        </span>
      ),
    },
  ];

  return (
    <nav ref={navRef} className="gs-nav" aria-label={t("primary")}>
      <div
        className="gs-nav-shape"
        aria-hidden="true"
        style={{ visibility: slotWidth > 0 && ulLeft >= 0 ? "visible" : "hidden" }}
      >
        <motion.div
          className="gs-nav-fill gs-nav-fill-left"
          initial={false}
          animate={{ width: Math.max(notchLeft, 0) }}
          transition={slide}
        />
        <NotchPath />
        <div className="gs-nav-fill gs-nav-fill-right" />
      </div>

      <motion.div
        className="gs-nav-fab"
        aria-hidden="true"
        initial={false}
        animate={{ left: Math.max(fabLeft, 0) }}
        transition={slide}
      />

      <ul ref={ulRef}>
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <li key={`${item.href}-${index}`} className={isActive ? "list active" : "list"}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="icon">{item.icon}</span>
                <span className="text">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
