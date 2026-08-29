/**
 * Sugiere bannerColor (#RRGGBB) para una marca nueva vía getAIModel().
 * Temp baja + few-shot; fallback neutro si falla o el hex es inválido.
 */

import { generateObject } from "ai";
import { z } from "zod";
import { DETERMINISTIC_TEMPERATURE, getAIModel } from "@/lib/ai/client";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const colorSchema = z.object({
  bannerColor: z.string(),
  reason: z.string().optional(),
});

const FALLBACK_COLOR = "#19222D";

const SYSTEM_PROMPT = `Eres un diseñador de marca para e-commerce gamer.
Debes devolver SOLO el schema pedido: bannerColor como hex #RRGGBB (6 dígitos).
Sé consistente y determinista: misma marca → mismo color característico.

Ejemplos few-shot (marca → color):
- Nintendo → #E60012
- PlayStation → #003791
- Xbox → #107C10
- NVIDIA → #76B900
- Steam → #1B2838

Si no conoces la marca, elige un hex coherente con su identidad percibida (no inventes texto fuera del schema).`;

function normalizeHex(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!HEX_RE.test(trimmed)) {
    return null;
  }
  return trimmed.toUpperCase();
}

export async function suggestBrandBannerColor(brandName: string) {
  const name = brandName.trim();

  if (!name) {
    return { bannerColor: FALLBACK_COLOR, source: "fallback" as const };
  }

  try {
    const { object } = await generateObject({
      model: getAIModel(),
      temperature: DETERMINISTIC_TEMPERATURE,
      schema: colorSchema,
      system: SYSTEM_PROMPT,
      prompt: `Marca: "${name}". Devuelve bannerColor en formato #RRGGBB.`,
    });

    const hex = normalizeHex(object.bannerColor);

    if (!hex) {
      console.warn(
        "[ai] bannerColor inválido, usando fallback:",
        object.bannerColor,
      );
      return { bannerColor: FALLBACK_COLOR, source: "fallback" as const };
    }

    return {
      bannerColor: hex,
      source: "ai" as const,
      reason: object.reason,
    };
  } catch (error) {
    console.warn("[ai] suggestBrandBannerColor falló:", error);
    return { bannerColor: FALLBACK_COLOR, source: "fallback" as const };
  }
}
