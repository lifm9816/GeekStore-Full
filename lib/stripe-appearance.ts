/**
 * Appearance del Payment Element alineado al tema GeekStore (Dark/Light).
 *
 * Stripe corre en iframe — no hereda tipografía del documento. Geist se carga
 * vía options.fonts en StripePaymentForm; aquí solo fontFamily + pesos/tamaños.
 */

import type { Appearance } from "@stripe/stripe-js";

export function getStripeAppearance(resolvedTheme: "dark" | "light"): Appearance {
  const isDark = resolvedTheme === "dark";

  return {
    theme: isDark ? "night" : "stripe",
    variables: {
      colorPrimary: isDark ? "#94d32e" : "#ff914d",
      colorBackground: isDark ? "#0e141a" : "#ffffff",
      colorText: isDark ? "#ffffff" : "#19222d",
      colorTextSecondary: isDark ? "#7a94ad" : "#5c6773",
      colorDanger: "#ff6b6b",
      borderRadius: "10px",
      fontFamily: '"Geist", Arial, Helvetica, sans-serif',
      fontSizeBase: "14px",
      fontWeightNormal: "400",
      fontWeightMedium: "600",
      fontWeightBold: "700",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        backgroundColor: isDark ? "#0e141a" : "#ffffff",
        color: isDark ? "#ffffff" : "#19222d",
        border: isDark
          ? "1px solid rgb(122 148 173 / 0.18)"
          : "1px solid rgb(25 34 45 / 0.25)",
        boxShadow: "none",
        fontSize: "14px",
        fontWeight: "600",
      },
      ".Label": {
        color: isDark ? "#ffffff" : "#19222d",
        fontSize: "13px",
        fontWeight: "600",
      },
      ".TermsText": {
        color: isDark ? "#7a94ad" : "#5c6773",
      },
      ".Tab": {
        fontSize: "14px",
        fontWeight: "600",
      },
      ".TabLabel": {
        fontWeight: "600",
      },
      ".Block": {
        fontSize: "14px",
      },
    },
  };
}
