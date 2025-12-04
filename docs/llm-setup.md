# Anthropic / Claude Haiku 4.5 setup

This project includes a small wrapper at `lib/llm-client.ts` to centralize Anthropic model selection and requests.

Quick steps to enable `claude-haiku-4.5` for all clients in this app:

1. Create a local env file (do not commit your secrets):

```bash
cp .env.example .env.local
# Edit .env.local and set ANTHROPIC_API_KEY
```

2. In `.env.local` set `ANTHROPIC_API_KEY` to your Anthropic API key. The wrapper defaults `ANTHROPIC_DEFAULT_MODEL` to `claude-haiku-4.5`.

3. Use the wrapper in server-side code (example):

```ts
import llm from '../lib/llm-client';

async function run() {
  const resp = await llm.callAnthropic({ prompt: 'Hello world', max_tokens: 200 });
  console.log(resp);
}
```

Notes:
- The wrapper sends a POST to `ANTHROPIC_API_URL` and uses `x-api-key` header. If your Anthropic integration expects a different request shape or header name, update `lib/llm-client.ts` accordingly.
- If you do not control Anthropic admin, enabling access to a model for *all* API keys is an Anthropic org/config step — this wrapper only centralizes model selection inside this repo.
