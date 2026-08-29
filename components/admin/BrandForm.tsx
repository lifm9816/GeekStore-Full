"use client";

/**
 * Alta / edición de marca. IA de bannerColor solo al crear o al cambiar nombre.
 */

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  createBrand,
  suggestBannerColorAction,
  updateBrand,
} from "@/app/actions/admin-brands";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { AdminFormState } from "@/lib/validations/admin-product";

const fieldClass =
  "mt-1.5 w-full rounded-[10px] border border-gs-border bg-gs-input-bg px-3 py-2.5 text-sm text-gs-text placeholder:text-gs-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong";

const SUGGEST_DEBOUNCE_MS = 800;

type BrandFormProps = {
  mode?: "create" | "edit";
  brandId?: string;
  defaults?: {
    name: string;
    logoUrl: string;
    bannerColor: string;
  };
};

export function BrandForm({
  mode = "create",
  brandId,
  defaults,
}: BrandFormProps) {
  const t = useTranslations("admin.brands");
  const router = useRouter();
  const [name, setName] = useState(defaults?.name ?? "");
  const [bannerColor, setBannerColor] = useState(
    defaults?.bannerColor ?? "#19222D",
  );
  const [suggestError, setSuggestError] = useState<string | undefined>();
  const [suggesting, startSuggest] = useTransition();
  const lastSuggestedName = useRef(defaults?.name?.trim() ?? "");
  const skipInitialSuggest = useRef(mode === "edit");

  const action =
    mode === "edit" && brandId
      ? updateBrand.bind(null, brandId)
      : createBrand;

  const [state, formAction, pending] = useActionState<
    AdminFormState | undefined,
    FormData
  >(action, undefined);

  useEffect(() => {
    if (!state?.ok) {
      return;
    }

    if (mode === "edit") {
      router.push("/admin/brands");
      router.refresh();
      return;
    }

    router.refresh();
    setName("");
    setBannerColor("#19222D");
    lastSuggestedName.current = "";
  }, [state?.ok, mode, router]);

  function runSuggest(brandName: string) {
    const trimmed = brandName.trim();

    if (trimmed.length < 2) {
      return;
    }

    if (trimmed === lastSuggestedName.current) {
      return;
    }

    setSuggestError(undefined);
    startSuggest(async () => {
      const result = await suggestBannerColorAction(trimmed);

      if (result.error || !result.bannerColor) {
        setSuggestError(result.error ?? t("suggestFailed"));
        return;
      }

      lastSuggestedName.current = trimmed;
      setBannerColor(result.bannerColor);
    });
  }

  useEffect(() => {
    if (skipInitialSuggest.current) {
      skipInitialSuggest.current = false;
      return;
    }

    const trimmed = name.trim();

    if (trimmed.length < 2) {
      return;
    }

    const timer = window.setTimeout(() => {
      runSuggest(trimmed);
    }, SUGGEST_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce por name
  }, [name]);

  return (
    <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-6">
      <h2 className="mb-4 text-[15px] font-bold">
        {mode === "edit" ? t("editTitle") : t("createTitle")}
      </h2>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="brand-name"
            className="block text-[12.5px] font-medium text-gs-muted"
          >
            {t("fields.name")}
          </label>
          <input
            id="brand-name"
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => runSuggest(name)}
            className={fieldClass}
          />
          {state?.fieldErrors?.name ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {state.fieldErrors.name[0]}
            </p>
          ) : null}
        </div>

        <ImageUpload
          kind="brand"
          name="logoUrl"
          label={t("fields.logo")}
          defaultUrl={defaults?.logoUrl}
          altHint={t("fields.logoAlt")}
          error={state?.fieldErrors?.logoUrl?.[0]}
          required
        />

        <div>
          <label
            htmlFor="brand-color"
            className="block text-[12.5px] font-medium text-gs-muted"
          >
            {t("fields.bannerColor")}
          </label>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <input
              id="brand-color"
              name="bannerColor"
              type="color"
              required
              value={bannerColor}
              onChange={(event) => setBannerColor(event.target.value)}
              className="h-10 w-14 cursor-pointer rounded-[7px] border border-gs-border bg-transparent"
            />
            <input
              type="text"
              value={bannerColor}
              onChange={(event) => setBannerColor(event.target.value)}
              className={`${fieldClass} mt-0 max-w-32 font-mono`}
              aria-label={t("fields.bannerColorHex")}
            />
            {suggesting ? (
              <p className="text-[12px] text-gs-muted" role="status">
                {t("suggesting")}
              </p>
            ) : null}
          </div>
          {suggestError ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {suggestError}
            </p>
          ) : null}
          {state?.fieldErrors?.bannerColor ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {state.fieldErrors.bannerColor[0]}
            </p>
          ) : null}
          <p className="mt-1.5 text-[12px] text-gs-muted">{t("suggestHint")}</p>
        </div>

        {state?.error ? (
          <p role="alert" className="text-sm text-gs-critical">
            {state.error}
          </p>
        ) : null}
        {state?.ok && mode === "create" ? (
          <p role="status" className="text-sm font-semibold text-gs-accent-strong">
            {t("created")}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-fit min-w-40 items-center justify-center rounded-[7px] bg-gs-accent px-4 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:opacity-80"
        >
          {pending
            ? t("saving")
            : mode === "edit"
              ? t("saveChanges")
              : t("create")}
        </button>
      </form>
    </section>
  );
}
