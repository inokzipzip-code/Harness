#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import {
  ALL_MODELS,
  DEFAULT_MODEL_BY_HARNESS,
  MODEL_CATALOG,
  getProviderForModel,
} from '../shared/models.mjs';
import { HARNESSES } from '../shared/harnesses.mjs';
import { I18N } from '../shared/i18n.mjs';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'megaharness');
const SESSIONS_DIR = path.join(CONFIG_DIR, 'sessions');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const DEFAULT_ENDPOINT = process.env.MEGAHARNESS_URL || 'https://megaharness.netlify.app';

function ensureDirs() {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

function loadConfig() {
  ensureDirs();
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return {
      lang: 'ru',
      harness: 'antigravity',
      model: DEFAULT_MODEL_BY_HARNESS.antigravity,
      endpoint: DEFAULT_ENDPOINT,
    };
  }
}

function saveConfig(cfg) {
  ensureDirs();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

function parseArgs(argv) {
  const opts = { prompt: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--harness' && argv[i + 1]) opts.harness = argv[++i];
    else if (a === '--model' && argv[i + 1]) opts.model = argv[++i];
    else if (a === '--lang' && argv[i + 1]) opts.lang = argv[++i];
    else if (a === '--endpoint' && argv[i + 1]) opts.endpoint = argv[++i];
    else if (a === '--session' && argv[i + 1]) opts.session = argv[++i];
    else if (a === '--help' || a === '-h') opts.help = true;
    else opts.prompt.push(a);
  }
  return opts;
}

function buildContextSummary(state) {
  const lines = [
    `Working directory: ${process.cwd()}`,
    `Active harness: ${state.harness}`,
    `Active model: ${state.model}`,
  ];
  if (state.attachedFiles.length > 0) {
    lines.push(`Attached files: ${state.attachedFiles.map((f) => f.path).join(', ')}`);
  }
  return lines.join('\n');
}

async function sendChat(state, userText) {
  state.messages.push({ role: 'user', content: userText });

  const endpoint = state.endpoint.replace(/\/$/, '');
  let res;
  let data;
  try {
    res = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        harness: state.harness,
        model: state.model,
        lang: state.lang,
        contextSummary: buildContextSummary(state),
        messages: state.messages,
      }),
    });
    data = await res.json();
  } catch (err) {
    state.messages.pop();
    throw err;
  }

  if (!res.ok) {
    state.messages.pop();
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  let reply = data.reply || '';
  if (data.imageBase64) {
    const mime = data.imageMimeType || 'image/png';
    const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
    const imgFile = path.join(process.cwd(), `megaharness-image-${Date.now()}.${ext}`);
    fs.writeFileSync(imgFile, Buffer.from(data.imageBase64, 'base64'));
    reply = `${reply}\nSaved image: ${imgFile}`.trim();
  }

  state.messages.push({ role: 'assistant', content: reply });
  return reply;
}

function listWorkspaceFiles(dir = process.cwd(), depth = 0, acc = []) {
  if (depth > 2 || acc.length > 80) return acc;
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.netlify') continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(process.cwd(), full);
    if (entry.isDirectory()) {
      listWorkspaceFiles(full, depth + 1, acc);
    } else {
      acc.push(rel);
    }
  }
  return acc;
}

function saveSession(state, name = 'default') {
  ensureDirs();
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const file = path.join(SESSIONS_DIR, `${safe}.json`);
  fs.writeFileSync(file, JSON.stringify(state, null, 2));
  return file;
}

function loadSession(name = 'default') {
  ensureDirs();
  const safe = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const file = path.join(SESSIONS_DIR, `${safe}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfg = loadConfig();

  const state = {
    lang: args.lang || cfg.lang || 'ru',
    harness: HARNESSES[args.harness] ? args.harness : cfg.harness || 'antigravity',
    model: args.model || cfg.model || DEFAULT_MODEL_BY_HARNESS.antigravity,
    endpoint: args.endpoint || cfg.endpoint || DEFAULT_ENDPOINT,
    messages: [],
    attachedFiles: [],
  };

  if (args.session) {
    const loaded = loadSession(args.session);
    if (loaded) Object.assign(state, loaded);
  }

  const t = () => I18N[state.lang] || I18N.ru;

  if (args.help) {
    console.log(`\x1b[36m${t().cliBanner}\x1b[0m\n\n${t().cliHelp}`);
    process.exit(0);
  }

  if (args.prompt.length > 0) {
    const reply = await sendChat(state, args.prompt.join(' '));
    console.log(reply);
    process.exit(0);
  }

  console.log(`\x1b[36m=== ${t().cliBanner} ===\x1b[0m`);
  console.log(`Harness: \x1b[33m${state.harness}\x1b[0m | Model: \x1b[32m${state.model}\x1b[0m | Lang: \x1b[35m${state.lang}\x1b[0m`);
  console.log(`Endpoint: ${state.endpoint}`);
  console.log(`Type /help for commands.\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `\x1b[36m[${state.harness}:${state.model}]\x1b[0m> `,
  });

  const refreshPrompt = () => {
    rl.setPrompt(`\x1b[36m[${state.harness}:${state.model}]\x1b[0m> `);
  };

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    if (input.startsWith('/')) {
      const [cmd, ...rest] = input.split(/\s+/);
      const arg = rest.join(' ').trim();

      if (cmd === '/exit' || cmd === '/quit') {
        saveConfig({ lang: state.lang, harness: state.harness, model: state.model, endpoint: state.endpoint });
        rl.close();
        return;
      }

      if (cmd === '/help') {
        console.log(t().cliHelp);
      } else if (cmd === '/harness') {
        if (!HARNESSES[arg]) {
          console.log(`Available harnesses: ${Object.keys(HARNESSES).join(', ')}`);
        } else {
          state.harness = arg;
          saveConfig({ lang: state.lang, harness: state.harness, model: state.model, endpoint: state.endpoint });
          console.log(`${t().switchedHarness} ${arg} (${t().contextPreserved})`);
          refreshPrompt();
        }
      } else if (cmd === '/model') {
        if (!getProviderForModel(arg)) {
          console.log(`Unknown model "${arg}". Use /models to search.`);
        } else {
          state.model = arg;
          saveConfig({ lang: state.lang, harness: state.harness, model: state.model, endpoint: state.endpoint });
          console.log(`${t().switchedModel} ${arg}`);
          refreshPrompt();
        }
      } else if (cmd === '/models') {
        const q = arg.toLowerCase();
        const matches = MODEL_CATALOG[q]
          ? MODEL_CATALOG[q].map((id) => ({ provider: q, id }))
          : ALL_MODELS.filter((m) => !q || m.id.toLowerCase().includes(q) || m.provider.includes(q));
        for (const m of matches.slice(0, 60)) {
          console.log(`  [${m.provider}] ${m.id}`);
        }
        if (matches.length > 60) {
          console.log(`  ...and ${matches.length - 60} more (refine filter).`);
        }
      } else if (cmd === '/lang') {
        if (arg === 'ru' || arg === 'en') {
          state.lang = arg;
          saveConfig({ lang: state.lang, harness: state.harness, model: state.model, endpoint: state.endpoint });
          console.log(`${t().switchedLang} ${arg}`);
        } else {
          console.log('Usage: /lang <ru|en>');
        }
      } else if (cmd === '/context') {
        console.log(
          JSON.stringify(
            {
              harness: state.harness,
              model: state.model,
              lang: state.lang,
              endpoint: state.endpoint,
              messages: state.messages.length,
              attachedFiles: state.attachedFiles.map((f) => f.path),
            },
            null,
            2,
          ),
        );
      } else if (cmd === '/save') {
        const saved = saveSession(state, arg || 'default');
        console.log(`${t().savedSession} ${saved}`);
      } else if (cmd === '/load') {
        const loaded = loadSession(arg || 'default');
        if (!loaded) {
          console.log(`${t().sessionNotFound} ${arg || 'default'}`);
        } else {
          Object.assign(state, loaded);
          refreshPrompt();
          console.log(`${t().loadedSession} ${arg || 'default'}`);
        }
      } else if (cmd === '/endpoint') {
        if (arg) {
          state.endpoint = arg;
          saveConfig({ lang: state.lang, harness: state.harness, model: state.model, endpoint: state.endpoint });
          console.log(`Endpoint: ${state.endpoint}`);
        }
      } else if (cmd === '/files') {
        for (const f of listWorkspaceFiles()) {
          console.log(`  ${f}`);
        }
      } else if (cmd === '/read') {
        try {
          const content = fs.readFileSync(arg, 'utf8');
          state.attachedFiles.push({ path: arg, bytes: content.length });
          state.messages.push({
            role: 'user',
            content: `[Attached file: ${arg}]\n\`\`\`\n${content.slice(0, 12000)}\n\`\`\``,
          });
          console.log(`Attached ${arg} (${content.length} bytes)`);
        } catch (err) {
          console.log(`Failed to read ${arg}: ${err.message}`);
        }
      } else if (cmd === '/run') {
        if (!arg) {
          console.log('Usage: /run <shell-command>');
        } else {
          rl.question(t().confirmRun, (ans) => {
            if (ans.trim().toLowerCase() === 'y') {
              try {
                const out = execSync(arg, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
                console.log(out);
                state.messages.push({ role: 'user', content: `[Command: ${arg}]\n\`\`\`\n${out.slice(0, 8000)}\n\`\`\`` });
              } catch (err) {
                const errOut = err.stderr || err.message;
                console.error(errOut);
                state.messages.push({ role: 'user', content: `[Command failed: ${arg}]\n\`\`\`\n${String(errOut).slice(0, 8000)}\n\`\`\`` });
              }
            } else {
              console.log(t().aborted);
            }
            rl.prompt();
          });
          return;
        }
      } else if (cmd === '/clear') {
        state.messages = [];
        state.attachedFiles = [];
        console.log(t().contextCleared);
      } else {
        console.log(t().unknownCommand);
      }

      rl.prompt();
      return;
    }

    try {
      const reply = await sendChat(state, input);
      console.log(`\n\x1b[32m${reply}\x1b[0m\n`);
    } catch (err) {
      console.error(`\x1b[31mError: ${err.message}\x1b[0m`);
    }
    rl.prompt();
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
