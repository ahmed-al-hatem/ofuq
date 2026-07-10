import "server-only"

import { GoogleGenAI } from "@google/genai"

import type { AssistantRuntimeStatus } from "@/types/chat"

type GeminiRuntimeConfig = {
  apiKey: string | null
  model: string
  fallbackModel: string
  maxOutputTokens: number
  temperature: number
}

export type GeminiGenerateReplyInput = {
  systemInstruction: string
  history: Array<{
    role: "user" | "assistant"
    content: string
  }>
}

export type GeminiGenerateReplyResult =
  | {
      ok: true
      text: string
      model: string
      usage: {
        promptTokenCount: number | null
        candidateTokenCount: number | null
        totalTokenCount: number | null
      }
    }
  | {
      ok: false
      kind: "configuration_missing" | "empty_response" | "provider_error"
      message: string
    }

let geminiClient: GoogleGenAI | null = null
let geminiClientKey: string | null = null

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function parseNumber(
  rawValue: string | undefined,
  fallback: number,
  min: number,
  max: number
) {
  const parsedValue = Number(rawValue)

  if (!Number.isFinite(parsedValue)) {
    return fallback
  }

  return clampNumber(parsedValue, min, max)
}

export function getGeminiRuntimeConfig(): GeminiRuntimeConfig {
  return {
    apiKey: process.env.GEMINI_API_KEY?.trim() || null,
    model: process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite",
    fallbackModel:
      process.env.GEMINI_FALLBACK_MODEL?.trim() || "gemini-2.5-flash-lite",
    maxOutputTokens: parseNumber(
      process.env.GEMINI_MAX_OUTPUT_TOKENS,
      700,
      128,
      2048
    ),
    temperature: parseNumber(process.env.GEMINI_TEMPERATURE, 0.2, 0, 2),
  }
}

export function getGeminiRuntimeStatus(): {
  status: AssistantRuntimeStatus
  setupMessage: string | null
} {
  const config = getGeminiRuntimeConfig()

  if (!config.apiKey) {
    return {
      status: "setup_required",
      setupMessage:
        "مساعد أُفُق غير مفعّل بعد. يرجى ضبط GEMINI_API_KEY في بيئة التشغيل.",
    }
  }

  return {
    status: "configured",
    setupMessage: null,
  }
}

function getGeminiClient(apiKey: string) {
  if (geminiClient && geminiClientKey === apiKey) {
    return geminiClient
  }

  geminiClient = new GoogleGenAI({ apiKey })
  geminiClientKey = apiKey

  return geminiClient
}

async function tryGenerateReply(
  model: string,
  config: GeminiRuntimeConfig,
  input: GeminiGenerateReplyInput
): Promise<GeminiGenerateReplyResult> {
  try {
    const ai = getGeminiClient(config.apiKey as string)
    const response = await ai.models.generateContent({
      model,
      contents: input.history.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      config: {
        systemInstruction: input.systemInstruction,
        maxOutputTokens: config.maxOutputTokens,
        temperature: config.temperature,
      },
    })

    const text = response.text?.trim()

    if (!text) {
      return {
        ok: false,
        kind: "empty_response",
        message: "EMPTY_GEMINI_RESPONSE",
      }
    }

    return {
      ok: true,
      text,
      model: response.modelVersion ?? model,
      usage: {
        promptTokenCount: response.usageMetadata?.promptTokenCount ?? null,
        candidateTokenCount:
          response.usageMetadata?.candidatesTokenCount ?? null,
        totalTokenCount: response.usageMetadata?.totalTokenCount ?? null,
      },
    }
  } catch {
    return {
      ok: false,
      kind: "provider_error",
      message: "GEMINI_PROVIDER_ERROR",
    }
  }
}

export async function generateAssistantReply(
  input: GeminiGenerateReplyInput
): Promise<GeminiGenerateReplyResult> {
  const config = getGeminiRuntimeConfig()

  if (!config.apiKey) {
    return {
      ok: false,
      kind: "configuration_missing",
      message:
        "مساعد أُفُق غير مفعّل بعد. يرجى ضبط GEMINI_API_KEY في بيئة التشغيل.",
    }
  }

  const primaryResult = await tryGenerateReply(config.model, config, input)

  if (primaryResult.ok || config.fallbackModel === config.model) {
    return primaryResult
  }

  return tryGenerateReply(config.fallbackModel, config, input)
}
