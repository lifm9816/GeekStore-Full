/**
 * Teléfono a 10 dígitos (regla legacy) y máscara visual `222 526 5031`
 * usada en registro y en el perfil de cuenta.
 */

export function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhoneNumber(value: string) {
  const digits = phoneDigits(value).slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
