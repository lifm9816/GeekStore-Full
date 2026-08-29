"use client";

/**
 * Información personal del mockup 10. Validación = umbrales de registro.
 * El teléfono se formatea al escribir; se guarda en 10 dígitos.
 */

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/app/actions/account";
import { AccountField } from "@/components/account/AccountField";
import { formatPhoneNumber } from "@/lib/phone";
import type { AccountFormState } from "@/lib/validations/account";

type ProfileFormProps = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
};

export function ProfileForm({
  name,
  lastName,
  email,
  phone,
}: ProfileFormProps) {
  const t = useTranslations("account");
  const [phoneValue, setPhoneValue] = useState(formatPhoneNumber(phone));
  const [state, action, pending] = useActionState<
    AccountFormState | undefined,
    FormData
  >(updateProfile, undefined);

  return (
    <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-6">
      <h2 className="mb-5 text-[15px] font-bold">{t("personalInfo")}</h2>
      <form action={action} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AccountField
            id="account-name"
            name="name"
            autoComplete="given-name"
            label={t("fields.name")}
            defaultValue={name}
            errors={state?.fieldErrors?.name}
          />
          <AccountField
            id="account-lastName"
            name="lastName"
            autoComplete="family-name"
            label={t("fields.lastName")}
            defaultValue={lastName}
            errors={state?.fieldErrors?.lastName}
          />
          <AccountField
            id="account-email"
            name="email"
            type="email"
            autoComplete="email"
            label={t("fields.email")}
            defaultValue={email}
            errors={state?.fieldErrors?.email}
          />
          <AccountField
            id="account-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            label={t("fields.phone")}
            value={phoneValue}
            onChange={(value) => setPhoneValue(formatPhoneNumber(value))}
            errors={state?.fieldErrors?.phone}
          />
        </div>

        {state?.error ? (
          <p role="alert" className="text-sm text-gs-critical">
            {state.error}
          </p>
        ) : null}
        {state?.ok ? (
          <p role="status" className="text-sm font-semibold text-gs-accent-strong">
            {t("saved")}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-fit min-w-40 items-center justify-center rounded-[7px] bg-gs-accent px-4 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:opacity-80"
        >
          {pending ? t("saving") : t("saveChanges")}
        </button>
      </form>
    </section>
  );
}

export function EditProfileButton() {
  const t = useTranslations("account");

  return (
    <button
      type="button"
      onClick={() => document.getElementById("account-name")?.focus()}
      className="mb-2 inline-flex items-center gap-1.5 rounded-[7px] px-3 py-2 text-sm font-semibold text-gs-muted transition-colors hover:bg-gs-surface-2 hover:text-gs-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
    >
      ✏️ {t("editProfile")}
    </button>
  );
}
