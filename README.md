# MegaHarness (Antigravity + Claude Code + Codex)

Unified VibeCode AI harness for Arch Linux and Netlify AI Gateway, with Russian (`ru`) and English (`en`) language support.

## Features

- **Three Harnesses in One**: Switch seamlessly between `antigravity`, `claude-code`, and `codex` modes without losing conversation history or workspace context.
- **Full Netlify AI Gateway Catalog**: Access all supported Anthropic, Google Gemini, OpenAI, Meta, OpenRouter, and Typesafe models through the Netlify Server at `/api/chat` and `/api/models`.
- **Context Persistence**: Session history, attached files, and active harness/model state are preserved across harness and model switches (both in the Arch Linux CLI under `~/.config/megaharness/sessions/` and in the Web Control Center).
- **Russian & English UI**: Full bilingual support (`--lang ru` / `/lang ru` or Web UI selector).
- **Arch Linux Ready**: Includes `cli/megaharness.mjs`, `packaging/PKGBUILD`, and `packaging/install-arch.sh`.

> **Note on Netlify AI Gateway Credits**: AI Gateway requests are authenticated and billed through your Netlify site's server-side runtime environment (`NETLIFY_AI_GATEWAY_URL` / `NETLIFY_AI_GATEWAY_KEY`). Automated multi-account Google OAuth cycling to bypass credit limits is not supported.

## Arch Linux Installation

```bash
git clone https://github.com/inokzipzip-code/Harness.git
cd Harness
bash packaging/install-arch.sh
megaharness --lang ru
```

Or build the Arch package directly:

```bash
cd packaging
makepkg -si
```

## CLI Commands

- `/harness <antigravity|claude-code|codex>` — Switch harness while preserving context
- `/model <model-id>` — Switch active Netlify AI Gateway model
- `/models [provider|query]` — Browse all Netlify AI Gateway models
- `/lang <ru|en>` — Switch between Russian and English
- `/read <path>` — Attach a workspace file into context
- `/run <cmd>` — Execute an Arch Linux command (with confirmation) and attach output
- `/save [name]` / `/load [name]` — Save or resume a session
