"use client";

/**
 * Alta / edición de promoción (banner del carousel). Día 15.
 */

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  createPromotion,
  updatePromotion,
} from "@/app/actions/admin-promotions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { AdminFormState } from "@/lib/validations/admin-product";

const fieldClass =
  "mt-1.5 w-full rounded-[10px] border border-gs-border bg-gs-input-bg px-3 py-2.5 text-sm text-gs-text placeholder:text-gs-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong";

type ProductOption = { id: string; name: string };

type PromotionFormProps = {
  mode?: "create" | "edit";
  promotionId?: string;
  products: ProductOption[];
  defaults?: {
    title: string;
    imageUrl: string;
    productId: string;
    order: number;
    active: boolean;
  };
};

export function PromotionForm({
  mode = "create",
  promotionId,
  products,
  defaults,
}: PromotionFormProps) {
  const t = useTranslations("admin.promotions");
  const router = useRouter();
  const [active, setActive] = useState(defaults?.active ?? true);

  const action =
    mode === "edit" && promotionId
      ? updatePromotion.bind(null, promotionId)
      : createPromotion;

  const [state, formAction, pending] = useActionState<
    AdminFormState | undefined,
    FormData
  >(action, undefined);

  useEffect(() => {
    if (!state?.ok) {
      return;
    }

    if (mode === "edit") {
      router.push("/admin/promotions");
      router.refresh();
      return;
    }

    router.refresh();
  }, [state?.ok, mode, router]);

  return (
    <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-6">
      <h2 className="mb-4 text-[15px] font-bold">
        {mode === "edit" ? t("editTitle") : t("createTitle")}
      </h2>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="promo-title"
            className="block text-[12.5px] font-medium text-gs-muted"
          >
            {t("fields.title")}
          </label>
          <p className="mt-0.5 text-[12px] text-gs-muted">
            {t("fields.titleHint")}
          </p>
          <input
            id="promo-title"
            name="title"
            required
            defaultValue={defaults?.title}
            className={fieldClass}
          />
          {state?.fieldErrors?.title ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {state.fieldErrors.title[0]}
            </p>
          ) : null}
        </div>

        <ImageUpload
          kind="product"
          name="imageUrl"
          label={t("fields.image")}
          defaultUrl={defaults?.imageUrl}
          altHint={t("fields.imageAlt")}
          error={state?.fieldErrors?.imageUrl?.[0]}
          required
          variant="hero"
        />

        <div>
          <label
            htmlFor="promo-product"
            className="block text-[12.5px] font-medium text-gs-muted"
          >
            {t("fields.product")}
          </label>
          <select
            id="promo-product"
            name="productId"
            required
            defaultValue={defaults?.productId}
            className={fieldClass}
          >
            <option value="">{t("fields.productPlaceholder")}</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.productId ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {state.fieldErrors.productId[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="promo-order"
            className="block text-[12.5px] font-medium text-gs-muted"
          >
            {t("fields.order")}
          </label>
          <input
            id="promo-order"
            name="order"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={defaults?.order ?? 0}
            className={fieldClass}
          />
          {state?.fieldErrors?.order ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {state.fieldErrors.order[0]}
            </p>
          ) : null}
        </div>

        <label className="inline-flex items-center gap-3">
          <input
            type="checkbox"
            name="active"
            value="true"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4 rounded border-gs-border text-gs-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          />
          <span className="text-sm font-semibold">{t("fields.active")}</span>
        </label>

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
