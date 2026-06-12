// ---------------------------------------------------------------------------
// AI provider settings — stored in localStorage, read by all AI tools
// ---------------------------------------------------------------------------

export type AiProvider = "gemini" | "openai";

const KEY_STORAGE = "ai_api_key";
const PROVIDER_STORAGE = "ai_provider";

export interface AiSettings {
  key: string;
  provider: AiProvider;
}

/**
 * Read AI settings from localStorage. Returns empty key if not configured.
 */
export function getAiSettings(): AiSettings {
  if (typeof window === "undefined") {
    return { key: "", provider: "gemini" };
  }
  return {
    key: localStorage.getItem(KEY_STORAGE) || "",
    provider: (localStorage.getItem(PROVIDER_STORAGE) || "gemini") as AiProvider,
  };
}

/**
 * Check if AI is configured with a key.
 */
export function isAiConfigured(): boolean {
  const { key } = getAiSettings();
  return key.length > 0;
}

/**
 * Save AI settings to localStorage.
 */
export function saveAiSettings(settings: AiSettings): void {
  localStorage.setItem(KEY_STORAGE, settings.key);
  localStorage.setItem(PROVIDER_STORAGE, settings.provider);
}

/**
 * Clear AI settings from localStorage.
 */
export function clearAiSettings(): void {
  localStorage.removeItem(KEY_STORAGE);
  localStorage.removeItem(PROVIDER_STORAGE);
}

// ---------------------------------------------------------------------------
// Shared AI call helpers
// ---------------------------------------------------------------------------

interface AiCallOptions {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Make an AI call to the configured provider (Gemini or OpenAI).
 * Returns the response text.
 */
export async function callAi(options: AiCallOptions): Promise<string> {
  const { key, provider } = getAiSettings();

  if (!key) {
    throw new Error("No AI API key configured. Go to AI Settings to add one.");
  }

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: options.systemPrompt },
                { text: options.userPrompt },
              ],
            },
          ],
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  // OpenAI compatible
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Extract code block content from markdown response.
 */
export function extractCodeBlock(
  text: string,
  language?: string,
): string | null {
  const lang = language || "\\w+";
  const match = text.match(new RegExp(`\`\`\`${lang}\\n([\\s\\S]*?)\`\`\``));
  if (match) return match[1].trim();
  const genericMatch = text.match(/```\n?([\s\S]*?)```/);
  if (genericMatch) return genericMatch[1].trim();
  return null;
}

/**
 * Split AI response into code block + explanation.
 */
export function splitResponse(
  text: string,
  language?: string,
): { code: string; explanation: string } {
  const code = extractCodeBlock(text, language);
  if (code) {
    const explanation = text.replace(/```(?:\w+)?\n[\s\S]*?```/, "").trim();
    return { code, explanation };
  }
  return { code: text, explanation: "" };
}
