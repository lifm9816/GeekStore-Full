"use client";

/**
 * Formulario crear/editar producto (mockup 08 + Día 15).
 * Géneros (si videojuegos), estelar + heroImageUrl opcionales.
 */

import Image from "next/image";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createProduct, updateProduct } from "@/app/actions/admin-products";
import { GalleryImageUpload } from "@/components/admin/GalleryImageUpload";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { AdminFormState } from "@/lib/validations/admin-product";

type Option = { id: string; name: string };
type CategoryOption = Option & { slug: string };

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  categories: CategoryOption[];
  brands: Option[];
  genres: Option[];
  defaults?: {
    name: string;
    description: string;
    price: string;
    stock: string;
    coverImageUrl: string;
    categoryId: string;
    brandId: string;
    genreIds?: string[];
    isFeatured?: boolean;
    heroImageUrl?: string | null;
    galleryUrls?: string[];
  };
};

const fieldClass =
  "mt-1.5 w-full rounded-[10px] border border-gs-border bg-gs-input-bg px-3 py-2.5 text-sm text-gs-text placeholder:text-gs-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong md:py-3";

const VIDEOGAMES_SLUG = "videojuegos";

export function ProductForm({
  mode,
  productId,
  categories,
  brands,
  genres,
  defaults,
}: ProductFormProps) {
  const t = useTranslations("admin.products");
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState(
    defaults?.coverImageUrl ?? "",
  );
  const [categoryId, setCategoryId] = useState(defaults?.categoryId ?? "");
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>(
    defaults?.genreIds ?? [],
  );
  const [isFeatured, setIsFeatured] = useState(defaults?.isFeatured ?? false);
  const [heroPreview, setHeroPreview] = useState(defaults?.heroImageUrl ?? "");

  const showGenres = useMemo(() => {
    const category = categories.find((item) => item.id === categoryId);
    return category?.slug === VIDEOGAMES_SLUG;
  }, [categories, categoryId]);

  const action =
    mode === "edit" && productId
      ? updateProduct.bind(null, productId)
      : createProduct;

  const [state, formAction, pending] = useActionState<
    AdminFormState | undefined,
    FormData
  >(action, undefined);

  useEffect(() => {
    if (state?.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  }, [state?.ok, router]);

  function toggleGenre(id: string) {
    setSelectedGenreIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,1fr)] lg:items-start xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] xl:gap-10"
    >
      <div className="flex flex-col gap-4 md:gap-5">
        <div>
          <label
            htmlFor="product-name"
            className="block text-[12.5px] font-medium text-gs-muted"
          >
            {t("fields.name")}
          </label>
          <input
            id="product-name"
            name="name"
            required
            defaultValue={defaults?.name}
            className={fieldClass}
          />
          {state?.fieldErrors?.name ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {state.fieldErrors.name[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="product-description"
            className="block text-[12.5px] font-medium text-gs-muted"
          >
            {t("fields.description")}
          </label>
          <textarea
            id="product-description"
            name="description"
            required
            rows={5}
            defaultValue={defaults?.description}
            className={fieldClass}
          />
          {state?.fieldErrors?.description ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {state.fieldErrors.description[0]}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
          <div>
            <label
              htmlFor="product-price"
              className="block text-[12.5px] font-medium text-gs-muted"
            >
              {t("fields.price")}
            </label>
            <input
              id="product-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={defaults?.price}
              className={fieldClass}
            />
            {state?.fieldErrors?.price ? (
              <p role="alert" className="mt-1 text-sm text-gs-critical">
                {state.fieldErrors.price[0]}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="product-stock"
              className="block text-[12.5px] font-medium text-gs-muted"
            >
              {t("fields.stock")}
            </label>
            <input
              id="product-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={defaults?.stock}
              className={fieldClass}
            />
            {state?.fieldErrors?.stock ? (
              <p role="alert" className="mt-1 text-sm text-gs-critical">
                {state.fieldErrors.stock[0]}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
          <div>
            <label
              htmlFor="product-category"
              className="block text-[12.5px] font-medium text-gs-muted"
            >
              {t("fields.category")}
            </label>
            <select
              id="product-category"
              name="categoryId"
              required
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setSelectedGenreIds([]);
              }}
              className={fieldClass}
            >
              <option value="">{t("fields.categoryPlaceholder")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {state?.fieldErrors?.categoryId ? (
              <p role="alert" className="mt-1 text-sm text-gs-critical">
                {state.fieldErrors.categoryId[0]}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="product-brand"
              className="block text-[12.5px] font-medium text-gs-muted"
            >
              {t("fields.brand")}
            </label>
            <select
              id="product-brand"
              name="brandId"
              required
              defaultValue={defaults?.brandId}
              className={fieldClass}
            >
              <option value="">{t("fields.brandPlaceholder")}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {state?.fieldErrors?.brandId ? (
              <p role="alert" className="mt-1 text-sm text-gs-critical">
                {state.fieldErrors.brandId[0]}
              </p>
            ) : null}
          </div>
        </div>

        {showGenres && genres.length > 0 ? (
          <fieldset className="rounded-[10px] border border-gs-border p-3 md:p-4">
            <legend className="px-1 text-[12.5px] font-medium text-gs-muted">
              {t("fields.genres")}
            </legend>
            <p className="mb-3 text-[12px] text-gs-muted">
              {t("fields.genresHint")}
            </p>
            <ul className="flex flex-wrap gap-2">
              {genres.map((genre) => {
                const checked = selectedGenreIds.includes(genre.id);

                return (
                  <li key={genre.id}>
                    <label
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gs-accent-strong ${
                        checked
                          ? "border-gs-accent bg-gs-accent/15 text-gs-accent-strong"
                          : "border-gs-border text-gs-text hover:bg-gs-surface-2"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="genreIds"
                        value={genre.id}
                        checked={checked}
                        onChange={() => toggleGenre(genre.id)}
                        className="sr-only"
                      />
                      {genre.name}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ) : null}

        <div className="rounded-[10px] border border-gs-border p-3 md:p-4">
          <label className="inline-flex items-start gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              value="true"
              checked={isFeatured}
              onChange={(event) => setIsFeatured(event.target.checked)}
              className="mt-1 size-4 rounded border-gs-border text-gs-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
            />
            <span>
              <span className="block text-sm font-semibold text-gs-text">
                {t("fields.isFeatured")}
              </span>
              <span className="mt-0.5 block text-[12px] text-gs-muted">
                {t("fields.isFeaturedHint")}
              </span>
            </span>
          </label>

          {isFeatured ? (
            <div className="mt-4">
              <ImageUpload
                kind="product"
                name="heroImageUrl"
                label={t("fields.heroImage")}
                defaultUrl={defaults?.heroImageUrl ?? undefined}
                altHint={t("fields.heroImageAlt")}
                error={state?.fieldErrors?.heroImageUrl?.[0]}
                required
                variant="hero"
                onUrlChange={setHeroPreview}
              />
              {heroPreview ? (
                <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-[10px] border border-gs-border">
                  <Image
                    src={heroPreview}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                    unoptimized={heroPreview.startsWith("blob:")}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <input type="hidden" name="heroImageUrl" value="" />
          )}
        </div>

        <GalleryImageUpload defaultUrls={defaults?.galleryUrls} />

        {state?.error ? (
          <p role="alert" className="text-sm text-gs-critical">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-fit min-w-44 items-center justify-center rounded-[7px] bg-gs-accent px-5 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:opacity-80 md:py-3"
        >
          {pending
            ? t("saving")
            : mode === "edit"
              ? t("saveChanges")
              : t("create")}
        </button>
      </div>

      <aside className="rounded-[10px] border border-gs-border bg-gs-surface-2 p-4 md:p-5 lg:sticky lg:top-24">
        <p className="mb-3 text-[12.5px] font-medium text-gs-muted">
          {t("fields.coverPreview")}
        </p>
        <div className="relative aspect-3/4 w-full overflow-hidden rounded-[10px] border border-gs-border bg-gs-surface">
          {coverPreview ? (
            <Image
              src={coverPreview}
              alt={t("fields.coverAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover"
              unoptimized={coverPreview.startsWith("blob:")}
            />
          ) : (
            <span className="flex h-full items-center justify-center px-4 text-center text-sm text-gs-muted">
              {t("fields.coverEmpty")}
            </span>
          )}
        </div>

        <div className="mt-4">
          <ImageUpload
            kind="product"
            name="coverImageUrl"
            label={t("fields.cover")}
            defaultUrl={defaults?.coverImageUrl}
            altHint={t("fields.coverAlt")}
            error={state?.fieldErrors?.coverImageUrl?.[0]}
            required
            variant="hero"
            onUrlChange={setCoverPreview}
          />
        </div>
      </aside>
    </form>
  );
}
