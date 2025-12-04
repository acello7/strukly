/*
 * Central Anthropic LLM client wrapper
 * - Reads `ANTHROPIC_API_KEY`, `ANTHROPIC_DEFAULT_MODEL`, and optional `ANTHROPIC_API_URL` from env
 * - Exposes `callAnthropic` to make requests and centralize the model selection
 *
 * NOTE: This is a lightweight wrapper example. Adjust the request body to match the
 * Anthropic API shape your project uses (the wrapper keeps model selection centralized).
 */

type CallOptions = {
  prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  // passthrough for other provider-specific fields
  [key: string]: unknown;
};

const API_URL = process.env.ANTHROPIC_API_URL || "https://api.anthropic.com/v1/complete";

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  return key;
}

export function getDefaultModel(): string {
  return process.env.ANTHROPIC_DEFAULT_MODEL || "claude-haiku-4.5";
}

export async function callAnthropic(opts: CallOptions) {
  const apiKey = getApiKey();
  const model = opts.model || getDefaultModel();

  // Build a minimal request body. Customize to match your Anthropic integration.
  const body: Record<string, unknown> = {
    model,
  };

  if (opts.prompt != null) body["prompt"] = opts.prompt;
  if (opts.temperature != null) body["temperature"] = opts.temperature;
  if (opts.max_tokens != null) body["max_tokens"] = opts.max_tokens;

  // copy other fields through (but avoid overriding model)
  Object.keys(opts).forEach((k) => {
    if (["prompt", "model", "temperature", "max_tokens"].includes(k)) return;
    body[k] = opts[k];
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const err = new Error(`Anthropic API error: ${res.status} ${res.statusText} ${txt}`);
    // attach the response status for callers to inspect if needed
    // @ts-ignore
    err.status = res.status;
    throw err;
  }

  // return parsed JSON; callers may adapt to the exact response shape
  return res.json();
}

export default {
  callAnthropic,
  getDefaultModel,
};
