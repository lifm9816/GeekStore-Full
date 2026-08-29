/**
 * Único punto de entrada de IA (roadmap §8 / Días 12–14).
 * AI_PROVIDER=claude → Anthropic; cualquier otro valor/default → Ollama local
 * (API OpenAI-compatible). Modelo local fijo: qwen2.5:3b (no latest/7B).
 *
 * Ningún feature (bannerColor, recomendaciones) debe importar el proveedor
 * directamente — solo este módulo.
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

/** Temperatura baja para salidas cortas/estructuradas (hex, JSON). */
export const DETERMINISTIC_TEMPERATURE = 0.1;

export function getAIModel() {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (provider === "claude") {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY no está definida (AI_PROVIDER=claude).");
    }

    return createAnthropic({ apiKey })("claude-sonnet-4-20250514");
  }

  const baseURL =
    process.env.OLLAMA_BASE_URL?.trim() || "http://localhost:11434/v1";
  const modelId = process.env.OLLAMA_MODEL?.trim() || "qwen2.5:3b";

  return createOpenAI({
    baseURL,
    apiKey: process.env.OLLAMA_API_KEY?.trim() || "ollama",
  })(modelId);
}
