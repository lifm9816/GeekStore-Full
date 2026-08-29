export function safeRedirectPath(
  value: FormDataEntryValue | string | null | undefined,
  locale: string,
) {
  const fallback = `/${locale}`;

  if (typeof value !== "string") {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
