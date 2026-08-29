"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import {
  registerWithCredentials,
  signInWithGoogle,
} from "@/app/actions/auth";
import { AuthCard, AuthField } from "@/components/auth/AuthField";
import { Link } from "@/i18n/navigation";
import { formatPhoneNumber } from "@/lib/phone";
import type { AuthFormState } from "@/lib/validations/auth";

type RegisterFormProps = {
  callbackUrl: string;
};

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const t = useTranslations("auth");
  const [phone, setPhone] = useState("");
  const [state, action, pending] = useActionState<
    AuthFormState | undefined,
    FormData
  >(registerWithCredentials, undefined);

  return (
    <AuthCard>
      <form action={action} className="flex w-full flex-col items-center gap-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <AuthField
          id="name"
          name="name"
          autoComplete="given-name"
          label={t("name")}
          errors={state?.fieldErrors?.name}
        />
        <AuthField
          id="lastName"
          name="lastName"
          autoComplete="family-name"
          label={t("lastName")}
          errors={state?.fieldErrors?.lastName}
        />
        <AuthField
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label={t("email")}
          errors={state?.fieldErrors?.email}
        />
        <AuthField
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          label={t("phone")}
          value={phone}
          onChange={(value) => setPhone(formatPhoneNumber(value))}
          errors={state?.fieldErrors?.phone}
        />
        <AuthField
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          label={t("password")}
          errors={state?.fieldErrors?.password}
        />
        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          label={t("confirmPassword")}
          errors={state?.fieldErrors?.confirmPassword}
        />
        {state?.error ? (
          <p role="alert" className="w-full text-sm text-gs-critical">
            {state.error}
          </p>
        ) : null}
        <div className="mt-2 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-w-40 items-center justify-center rounded-[10px] bg-[#37495f] px-5 py-2.5 text-base font-semibold text-gs-text transition-colors hover:bg-gs-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            {t("signIn")}
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-w-40 items-center justify-center rounded-[10px] bg-gs-accent px-5 py-2.5 text-base font-semibold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:opacity-70"
          >
            {pending ? t("creating") : t("createAccount")}
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
