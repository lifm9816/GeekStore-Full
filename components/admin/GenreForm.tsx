"use client";

/**
 * Alta / edición de género (solo nombre). Día 15.
 */

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createGenre, updateGenre } from "@/app/actions/admin-genres";
import type { AdminFormState } from "@/lib/validations/admin-product";

const fieldClass =
  "mt-1.5 w-full rounded-[10px] border border-gs-border bg-gs-input-bg px-3 py-2.5 text-sm text-gs-text placeholder:text-gs-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong";

type GenreFormProps = {
  mode?: "create" | "edit";
  genreId?: string;
  defaults?: { name: string };
};

export function GenreForm({
  mode = "create",
  genreId,
  defaults,
}: GenreFormProps) {
  const t = useTranslations("admin.genres");
  const router = useRouter();
  const [name, setName] = useState(defaults?.name ?? "");

  const action =
    mode === "edit" && genreId
      ? updateGenre.bind(null, genreId)
      : createGenre;

  const [state, formAction, pending] = useActionState<
    AdminFormState | undefined,
    FormData
  >(action, undefined);

  useEffect(() => {
    if (!state?.ok) {
      return;
    }

    if (mode === "edit") {
      router.push("/admin/genres");
      router.refresh();
      return;
    }

    router.refresh();
    setName("");
  }, [state?.ok, mode, router]);

  return (
    <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-6">
      <h2 className="mb-4 text-[15px] font-bold">
        {mode === "edit" ? t("editTitle") : t("createTitle")}
      </h2>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="genre-name"
            className="block text-[12.5px] font-medium text-gs-muted"
          >
            {t("fields.name")}
          </label>
          <input
            id="genre-name"
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
          {state?.fieldErrors?.name ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {state.fieldErrors.name[0]}
            </p>
          ) : null}
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
