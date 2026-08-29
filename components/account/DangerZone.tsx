"use client";

/**
 * Zona de peligro del mockup 10 (pestaña Seguridad).
 * Eliminar cuenta exige escribir la palabra de confirmación — el botón
 * legacy de Account.jsx no hacía nada.
 */

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { deleteAccount } from "@/app/actions/account";
import { signOutAction } from "@/app/actions/auth";
import type { AccountFormState } from "@/lib/validations/account";

export function DangerZone() {
  const t = useTranslations("account");
  const [state, action, pending] = useActionState<
    AccountFormState | undefined,
    FormData
  >(deleteAccount, undefined);

  return (
    <section className="rounded-[10px] border border-gs-critical/35 bg-gs-surface p-5 md:flex md:items-center md:justify-between md:gap-6">
      <div className="mb-4 md:mb-0">
        <h2 className="mb-1 text-[13.5px] font-bold text-gs-critical">
          {t("dangerTitle")}
        </h2>
        <p className="text-[12.5px] text-gs-muted">{t("dangerBody")}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end">
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex min-w-36 items-center justify-center rounded-[7px] bg-gs-surface-2 px-4 py-2.5 text-sm font-bold text-gs-text transition-colors hover:bg-gs-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            {t("signOut")}
          </button>
        </form>
        <form action={action} className="flex flex-col gap-2">
          <label htmlFor="delete-confirm" className="text-[12px] text-gs-muted">
            {t("deleteConfirmLabel", { word: t("deleteConfirmWord") })}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="delete-confirm"
              name="confirm"
              autoComplete="off"
              className="rounded-[7px] border border-gs-border bg-gs-bg px-3 py-2 text-sm text-gs-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
            />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-w-36 items-center justify-center rounded-[7px] bg-gs-critical px-4 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:opacity-80"
            >
              {pending ? t("deleting") : t("deleteAccount")}
            </button>
          </div>
          {state?.error ? (
            <p role="alert" className="text-sm text-gs-critical">
              {state.error}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
