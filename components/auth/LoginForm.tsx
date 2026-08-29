"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  loginWithCredentials,
  signInWithGoogle,
} from "@/app/actions/auth";
import { AuthCard, AuthField } from "@/components/auth/AuthField";
import { Link } from "@/i18n/navigation";
import type { AuthFormState } from "@/lib/validations/auth";

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<
    AuthFormState | undefined,
    FormData
  >(loginWithCredentials, undefined);

  return (
    <AuthCard>
      <form action={action} className="flex w-full flex-col items-center gap-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <AuthField
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          errors={state?.fieldErrors?.email}
        />
        <AuthField
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          label={t("password")}
          placeholder={t("passwordPlaceholder")}
          errors={state?.fieldErrors?.password}
        />
        {state?.error ? (
          <p role="alert" className="w-full text-sm text-gs-critical">
            {state.error}
          </p>
        ) : null}
        <div className="mt-2 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex min-w-40 items-center justify-center rounded-[10px] bg-[#37495f] px-5 py-2.5 text-base font-semibold text-gs-text transition-colors hover:bg-gs-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            {t("createAccount")}
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-w-40 items-center justify-center rounded-[10px] bg-gs-accent px-5 py-2.5 text-base font-semibold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:opacity-70"
          >
            {pending ? t("signingIn") : t("signIn")}
          </button>
        </div>
      </form>
      <form action={signInWithGoogle} className="mt-6 w-full">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-[10px] border border-gs-border bg-gs-bg px-5 py-2.5 text-sm font-semibold text-gs-text transition-colors hover:bg-gs-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        >
          {t("google")}
        </button>
      </form>
    </AuthCard>
  );
}
