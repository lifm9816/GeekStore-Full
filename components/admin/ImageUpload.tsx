"use client";

/**
 * ImageUpload reutilizable (Días 12–13).
 * - compact: preview chico (marcas).
 * - hero: sin preview inline; el padre muestra portada vía onChange.
 * - Drag & drop + input file (a11y). multiple → lote (galería).
 */

import Image from "next/image";
import {
  useId,
  useRef,
  useState,
  useTransition,
  type DragEvent,
} from "react";
import { useTranslations } from "next-intl";
import { uploadAdminImage } from "@/app/actions/storage";

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";

type ImageUploadProps = {
  kind: "product" | "brand";
  name?: string;
  label: string;
  defaultUrl?: string;
  altHint: string;
  error?: string;
  required?: boolean;
  /** compact = preview 112px; hero = solo control (preview lo pinta el padre). */
  variant?: "compact" | "hero";
  /** Si true: input/drop aceptan varios archivos. */
  multiple?: boolean;
  onUrlChange?: (url: string) => void;
  /** Callback de lote (galería). Solo con multiple. */
  onUrlsChange?: (urls: string[]) => void;
};

async function uploadOne(
  kind: "product" | "brand",
  file: File,
): Promise<{ publicUrl?: string; error?: string }> {
  const formData = new FormData();
  formData.set("kind", kind);
  formData.set("file", file);
  return uploadAdminImage(formData);
}

export function ImageUpload({
  kind,
  name,
  label,
  defaultUrl = "",
  altHint,
  error,
  required = false,
  variant = "compact",
  multiple = false,
  onUrlChange,
  onUrlsChange,
}: ImageUploadProps) {
  const t = useTranslations("admin.upload");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl);
  const [preview, setPreview] = useState(defaultUrl);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [dragActive, setDragActive] = useState(false);
  const [pending, startTransition] = useTransition();

  function applyUrl(next: string) {
    setUrl(next);
    setPreview(next);
    onUrlChange?.(next);
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const files = multiple
      ? Array.from(fileList)
      : [fileList[0]].filter(Boolean);

    if (files.length === 0) {
      return;
    }

    setUploadError(undefined);

    if (!multiple) {
      const file = files[0];
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);
      onUrlChange?.(localPreview);

      startTransition(async () => {
        setProgress({ current: 1, total: 1 });
        const result = await uploadOne(kind, file);
        setProgress(null);

        if (result.error || !result.publicUrl) {
          setUploadError(result.error ?? t("failed"));
          setPreview(url);
          onUrlChange?.(url);
          return;
        }

        applyUrl(result.publicUrl);
      });
      return;
    }

    startTransition(async () => {
      const uploaded: string[] = [];
      let lastError: string | undefined;

      for (let i = 0; i < files.length; i++) {
        setProgress({ current: i + 1, total: files.length });
        const result = await uploadOne(kind, files[i]);

        if (result.publicUrl) {
          uploaded.push(result.publicUrl);
        } else {
          lastError = result.error ?? t("failed");
        }
      }

      setProgress(null);

      if (uploaded.length > 0) {
        onUrlsChange?.(uploaded);
      }

      if (lastError) {
        setUploadError(
          uploaded.length > 0
            ? t("partialFailed", { count: uploaded.length })
            : lastError,
        );
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    });
  }

  function onDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }

  function onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (pending) {
      return;
    }

    handleFiles(event.dataTransfer.files);
  }

  const showError = uploadError ?? error;
  const showInlinePreview = variant === "compact" && !multiple;

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-[12.5px] font-medium text-gs-muted"
      >
        {label}
      </label>

      {name ? (
        <input type="hidden" name={name} value={url} required={required} />
      ) : null}

      <div
        className={`mt-1.5 flex flex-col gap-3 ${
          showInlinePreview ? "sm:flex-row sm:items-start" : ""
        }`}
      >
        {showInlinePreview ? (
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[10px] border border-gs-border bg-gs-surface-2">
            {preview ? (
              <Image
                src={preview}
                alt={altHint}
                fill
                sizes="112px"
                className="object-cover"
                unoptimized={preview.startsWith("blob:")}
              />
            ) : (
              <span className="flex h-full items-center justify-center px-2 text-center text-[11px] text-gs-muted">
                {t("emptyPreview")}
              </span>
            )}
          </div>
        ) : null}

        <div
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`min-w-0 flex-1 rounded-[10px] border border-dashed p-3 transition-colors ${
            dragActive
              ? "border-gs-accent bg-gs-accent/10"
              : "border-gs-border bg-gs-surface"
          }`}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT}
            multiple={multiple}
            disabled={pending}
            onChange={(event) => handleFiles(event.target.files)}
            className="block w-full text-sm text-gs-text file:mr-3 file:rounded-[7px] file:border-0 file:bg-gs-accent file:px-3 file:py-2 file:text-sm file:font-bold file:text-gs-surface hover:file:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:opacity-60"
          />
          <p className="mt-1.5 text-[12px] text-gs-muted">
            {dragActive ? t("dropActive") : t("dropHint")}
          </p>
          <p className="mt-0.5 text-[12px] text-gs-muted">{t("hint")}</p>
          {pending || progress ? (
            <p className="mt-1 text-[12px] text-gs-muted" role="status">
              {progress && progress.total > 1
                ? t("uploadingCount", {
                    current: progress.current,
                    total: progress.total,
                  })
                : t("uploading")}
            </p>
          ) : null}
          {showError ? (
            <p role="alert" className="mt-1 text-sm text-gs-critical">
              {showError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
