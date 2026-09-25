# 👺 Goblin Chat

A dead-simple, single-file AI chat box. No build step, no dependencies to install —
just open `index.html` and point it at any OpenAI-compatible API.

## Quick start

**Option A — just open it:** double-click `index.html` (or drag it into your browser).

**Option B — serve it locally** (recommended, avoids `file://` quirks):

```bash
cd easy-chatbox
python3 -m http.server 8080
# then open http://localhost:8080
```

Click the ⚙️ gear and configure:

| Setting      | Example                                     |
|--------------|---------------------------------------------|
| API Base URL | `http://localhost:11434/v1` (Ollama)        |
| API Key      | blank for Ollama, `sk-…` for OpenAI etc.    |
| Model        | `llama3.1`, `gpt-4o-mini`, …                |
| System prompt| whatever persona you want                   |

Settings are saved in your browser's local storage. Your API key never leaves
your machine except to the API endpoint you configure.

## Works with

- **Ollama** (local, free) — default `http://localhost:11434/v1`.
  If the browser can't reach Ollama, start it with `OLLAMA_ORIGINS=* ollama serve`.
- **OpenAI** — `https://api.openai.com/v1` + your key
- **OpenRouter** — `https://openrouter.ai/api/v1` + your key
- **Anything else OpenAI-compatible** (vLLM, LM Studio, LiteLLM proxy, …)

## Features

- Streaming responses, stop-generation button
- Markdown rendering with copy buttons on code blocks
- Multi-turn conversation history, one-click new chat
- Dark mode UI, mobile-friendly, zero build tooling

## Testing

Playwright end-to-end tests (the API is mocked, so no key or model needed):

```bash
npm install
npx playwright install chromium   # one-time browser download
npm test
```

Covers: page load, sending a message with a mocked streaming reply, markdown/code-block
rendering, settings save + persistence, new-chat clearing, and API error handling.

## Files

- `index.html` — the entire app (HTML + CSS + JS)
- `vendor/` — vendored JS libs (marked, DOMPurify) so the app works fully offline
- `tests/` — Playwright E2E tests
- `playwright.config.js` — test config (serves the folder on :8080)
- `README.md` — this file
- `LICENSE` — MIT

## License

MIT — do whatever you want with it.
