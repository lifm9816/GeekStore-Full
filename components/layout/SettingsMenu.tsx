"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { signOutAction } from "@/app/actions/auth";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Link } from "@/i18n/navigation";

type SettingsMenuProps = {
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
  isAdmin?: boolean;
};

function GearIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className="text-gs-on-header"
    >
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.07 7.07 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.5.42l-.36 2.54c-.59.22-1.14.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.8 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.92 14.56a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.69.22l2.39-.96c.49.4 1.04.72 1.63.94l.36 2.54c.06.24.26.42.5.42h3.8c.24 0 .44-.18.5-.42l.36-2.54c.59-.22 1.14-.53 1.63-.94l2.39.96c.26.12.55.02.69-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6.5v2H16v2H8v-2h2.5v-2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v9h16V6H4Z"
      />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0-5.2h1.2v3.2H12V2Zm0 16.8h1.2V22H12v-3.2ZM2 12v1.2h3.2V12H2Zm16.8 0v1.2H22V12h-3.2ZM5.05 4.2l.85-.85 2.26 2.26-.85.85L5.05 4.2Zm10.79 10.79.85-.85 2.26 2.26-.85.85-2.26-2.26ZM18.95 4.2l-2.26 2.26.85.85 2.26-2.26-.85-.85ZM8.16 15.84 5.9 18.1l.85.85 2.26-2.26-.85-.85Z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.2 3.2a8.8 8.8 0 1 0 7.6 13.4A7.2 7.2 0 0 1 13.2 3.2Z"
      />
    </svg>
  );
}

export function SettingsMenu({ user, isAdmin = false }: SettingsMenuProps) {
  const t = useTranslations("settings");
  const tNav = useTranslations("nav");
  const tAccount = useTranslations("account");
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const triggerId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative justify-self-end">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label={t("trigger")}
        className="inline-flex size-10 items-center justify-center overflow-hidden rounded-full text-gs-on-header transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        onClick={() => setOpen((current) => !current)}
      >
        {user ? (
          <UserAvatar name={user.name} image={user.image} size={36} />
        ) : (
          <GearIcon size={28} />
        )}
      </button>

      {open ? (
        <div
          id={menuId}
          role="region"
          aria-labelledby={triggerId}
          className="absolute right-0 z-40 mt-3 w-64 rounded-[10px] border border-gs-border bg-gs-header p-3 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
        >
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gs-on-header">
                {tNav("locale")}
              </p>
              <LocaleSwitcher />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gs-on-header">
                {t("theme")}
              </p>
              <div
                className="flex flex-col gap-1"
                role="group"
                aria-label={t("theme")}
              >
                {(
                  [
                    {
                      value: "system",
                      label: t("system"),
                      icon: <MonitorIcon />,
                    },
                    { value: "light", label: t("light"), icon: <SunIcon /> },
                    { value: "dark", label: t("dark"), icon: <MoonIcon /> },
                  ] as const
                ).map((option) => {
                  const selected = preference === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      className={`inline-flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong ${
                        selected
                          ? "bg-gs-accent text-gs-header"
                          : "text-gs-on-header hover:bg-gs-surface-2 hover:text-white"
                      }`}
                      onClick={() => setPreference(option.value)}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block w-full rounded-[7px] px-2.5 py-2 text-left text-sm font-semibold text-white transition-colors hover:bg-gs-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
              >
                {tNav("adminPanel")}
              </Link>
            ) : null}

            {user ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full rounded-[7px] px-2.5 py-2 text-left text-sm font-semibold text-white transition-colors hover:bg-gs-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                >
                  {tAccount("signOut")}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
