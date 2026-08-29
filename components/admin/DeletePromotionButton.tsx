"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { deletePromotion } from "@/app/actions/admin-promotions";

type DeletePromotionButtonProps = {
  promotionId: string;
  title: string;
};

export function DeletePromotionButton({
  promotionId,
  title,
}: DeletePromotionButtonProps) {
  const t = useTranslations("admin.promotions");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(undefined);
    startTransition(async () => {
      const result = await deletePromotion(promotionId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setConfirming(false);
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-[7px] p-2 text-gs-critical transition-colors hover:bg-gs-critical/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        aria-label={t("deleteAria", { title })}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex gap-1">
        <button
          type="button"
          disabled={pending}
          onClick={handleDelete}
          className="rounded-[7px] bg-gs-critical px-2 py-1 text-[11px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:opacity-60"
        >
          {pending ? t("deleting") : t("confirmDelete")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setConfirming(false);
            setError(undefined);
          }}
          className="rounded-[7px] border border-gs-border px-2 py-1 text-[11px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        >
          {t("cancelDelete")}
        </button>
      </span>
      {error ? (
        <span role="alert" className="max-w-48 text-right text-[11px] text-gs-critical">
          {error}
        </span>
      ) : null}
    </span>
  );
}
