import { MODEL_CATALOG } from '../../shared/models.mjs';
import { HARNESSES } from '../../shared/harnesses.mjs';
import { I18N } from '../../shared/i18n.mjs';

export function renderDashboardHtml() {
  const initialData = JSON.stringify({
    catalog: MODEL_CATALOG,
    harnesses: HARNESSES,
    i18n: I18N,
  });

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MegaHarness — Antigravity + Claude Code + Codex</title>
  <style>
    :root {
      --bg: #0b0e14;
      --panel: #131822;
      --panel-2: #1a2130;
      --border: #273145;
      --text: #e6edf3;
      --muted: #8b949e;
      --accent: #38bdf8;
      --accent-2: #a78bfa;
      --success: #34d399;
      --warn: #fbbf24;
      --danger: #f87171;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      border-bottom: 1px solid var(--border);
      background: var(--panel);
      padding: 14px 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .brand {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .brand h1 {
      margin: 0;
      font-size: 18px;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand span {
      font-size: 12px;
      color: var(--muted);
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    select, input, button, textarea {
      background: var(--panel-2);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 13px;
      font-family: inherit;
    }
    button {
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    button:hover { border-color: var(--accent); }
    button.primary {
      background: linear-gradient(135deg, #0284c7, #7c3aed);
      border: none;
      font-weight: 600;
      padding: 9px 16px;
    }
    main {
      flex: 1;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 16px;
      padding: 16px;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
    }
    @media (max-width: 900px) {
      main { grid-template-columns: 1fr; }
    }
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .card h2 {
      margin: 0;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
    }
    .harness-btn {
      text-align: left;
      padding: 10px;
      border-radius: 10px;
      background: var(--panel-2);
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .harness-btn.active {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.35);
    }
    .harness-btn strong { font-size: 14px; }
    .harness-btn small { font-size: 11px; color: var(--muted); line-height: 1.35; }
    .chat-panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      min-height: 72vh;
      overflow: hidden;
    }
    .status-bar {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--muted);
      background: var(--panel-2);
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(56, 189, 248, 0.12);
      color: var(--accent);
      border: 1px solid rgba(56, 189, 248, 0.25);
      font-family: ui-monospace, monospace;
    }
    .messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .msg {
      max-width: 85%;
      padding: 12px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .msg.user {
      align-self: flex-end;
      background: #1e293b;
      border: 1px solid #334155;
    }
    .msg.assistant {
      align-self: flex-start;
      background: var(--panel-2);
      border: 1px solid var(--border);
    }
    .msg-meta {
      font-size: 11px;
      color: var(--muted);
      margin-bottom: 4px;
      font-family: ui-monospace, monospace;
    }
    .composer {
      border-top: 1px solid var(--border);
      padding: 12px;
      display: flex;
      gap: 10px;
      background: var(--panel-2);
    }
    .composer textarea {
      flex: 1;
      resize: vertical;
      min-height: 52px;
      max-height: 180px;
    }
    code.block {
      display: block;
      background: #090c10;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      overflow-x: auto;
      color: var(--success);
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <h1 id="title">MegaHarness</h1>
      <span id="subtitle"></span>
    </div>
    <div class="controls">
      <label for="langSelect" id="langLabel" style="font-size:12px;color:var(--muted)"></label>
      <select id="langSelect">
        <option value="ru">Русский (RU)</option>
        <option value="en">English (EN)</option>
      </select>
      <button id="clearBtn"></button>
    </div>
  </header>

  <main>
    <aside class="sidebar">
      <div class="card">
        <h2 id="harnessHeading"></h2>
        <div id="harnessList" style="display:flex;flex-direction:column;gap:8px;"></div>
      </div>

      <div class="card">
        <h2 id="modelHeading"></h2>
        <select id="providerSelect"></select>
        <input id="modelSearch" type="search" />
        <select id="modelSelect" size="7" style="width:100%;font-family:ui-monospace,monospace;font-size:12px;"></select>
      </div>

      <div class="card">
        <h2 id="archHeading"></h2>
        <code class="block" id="archCmd"></code>
      </div>
    </aside>

    <section class="chat-panel">
      <div class="status-bar">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <span class="pill" id="activeHarnessPill"></span>
          <span class="pill" id="activeModelPill"></span>
        </div>
        <span id="contextNote"></span>
      </div>

      <div class="messages" id="messages"></div>

      <form class="composer" id="chatForm">
        <textarea id="promptInput"></textarea>
        <button type="submit" class="primary" id="sendBtn"></button>
      </form>
    </section>
  </main>

  <script>
    const BOOT = ${initialData};
    const STORAGE_KEY = 'megaharness_web_state_v1';

    let state = {
      lang: 'ru',
      harness: 'antigravity',
      provider: 'all',
      model: 'gemini-4-hydrogen',
      messages: [],
    };

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        state = { ...state, ...saved };
      }
    } catch {}

    function saveState() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    }

    const els = {
      title: document.getElementById('title'),
      subtitle: document.getElementById('subtitle'),
      langLabel: document.getElementById('langLabel'),
      langSelect: document.getElementById('langSelect'),
      clearBtn: document.getElementById('clearBtn'),
      harnessHeading: document.getElementById('harnessHeading'),
      harnessList: document.getElementById('harnessList'),
      modelHeading: document.getElementById('modelHeading'),
      providerSelect: document.getElementById('providerSelect'),
      modelSearch: document.getElementById('modelSearch'),
      modelSelect: document.getElementById('modelSelect'),
      archHeading: document.getElementById('archHeading'),
      archCmd: document.getElementById('archCmd'),
      activeHarnessPill: document.getElementById('activeHarnessPill'),
      activeModelPill: document.getElementById('activeModelPill'),
      contextNote: document.getElementById('contextNote'),
      messages: document.getElementById('messages'),
      chatForm: document.getElementById('chatForm'),
      promptInput: document.getElementById('promptInput'),
      sendBtn: document.getElementById('sendBtn'),
    };

    function renderI18n() {
      const t = BOOT.i18n[state.lang] || BOOT.i18n.ru;
      els.title.textContent = t.appTitle;
      els.subtitle.textContent = t.subtitle;
      els.langLabel.textContent = t.languageLabel;
      els.langSelect.value = state.lang;
      els.clearBtn.textContent = t.clear;
      els.harnessHeading.textContent = t.harnessLabel;
      els.modelHeading.textContent = t.modelLabel;
      els.modelSearch.placeholder = t.searchModels;
      els.archHeading.textContent = t.archSetupTitle;
      els.archCmd.textContent = t.archSetupCmd;
      els.contextNote.textContent = t.contextPreserved;
      els.promptInput.placeholder = t.promptPlaceholder;
      els.sendBtn.textContent = t.send;
      renderHarnesses();
      renderProviders();
      renderModels();
      renderStatus();
    }

    function renderHarnesses() {
      els.harnessList.innerHTML = '';
      for (const h of Object.values(BOOT.harnesses)) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'harness-btn' + (state.harness === h.id ? ' active' : '');
        btn.innerHTML = '<strong>' + h.name[state.lang] + '</strong><small>' + h.tagline[state.lang] + '</small>';
        btn.onclick = () => {
          state.harness = h.id;
          saveState();
          renderHarnesses();
          renderStatus();
        };
        els.harnessList.appendChild(btn);
      }
    }

    function renderProviders() {
      const t = BOOT.i18n[state.lang] || BOOT.i18n.ru;
      const providers = ['all', ...Object.keys(BOOT.catalog)];
      els.providerSelect.innerHTML = '';
      for (const p of providers) {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p === 'all' ? t.allProviders : p.toUpperCase() + ' (' + BOOT.catalog[p].length + ')';
        if (p === state.provider) opt.selected = true;
        els.providerSelect.appendChild(opt);
      }
    }

    function renderModels() {
      const q = els.modelSearch.value.trim().toLowerCase();
      const entries = [];
      for (const [provider, list] of Object.entries(BOOT.catalog)) {
        if (state.provider !== 'all' && state.provider !== provider) continue;
        for (const id of list) {
          if (!q || id.toLowerCase().includes(q) || provider.includes(q)) {
            entries.push({ provider, id });
          }
        }
      }
      els.modelSelect.innerHTML = '';
      for (const item of entries) {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = '[' + item.provider + '] ' + item.id;
        if (item.id === state.model) opt.selected = true;
        els.modelSelect.appendChild(opt);
      }
    }

    function renderStatus() {
      els.activeHarnessPill.textContent = 'harness: ' + state.harness;
      els.activeModelPill.textContent = 'model: ' + state.model;
    }

    function renderMessages() {
      els.messages.innerHTML = '';
      for (const m of state.messages) {
        const div = document.createElement('div');
        div.className = 'msg ' + m.role;
        const meta = document.createElement('div');
        meta.className = 'msg-meta';
        meta.textContent = m.role + (m.harness ? ' · ' + m.harness : '') + (m.model ? ' · ' + m.model : '');
        const body = document.createElement('div');
        body.textContent = m.content;
        div.appendChild(meta);
        div.appendChild(body);
        els.messages.appendChild(div);
      }
      els.messages.scrollTop = els.messages.scrollHeight;
    }

    els.langSelect.onchange = () => {
      state.lang = els.langSelect.value;
      saveState();
      renderI18n();
    };

    els.providerSelect.onchange = () => {
      state.provider = els.providerSelect.value;
      saveState();
      renderModels();
    };

    els.modelSearch.oninput = renderModels;

    els.modelSelect.onchange = () => {
      if (els.modelSelect.value) {
        state.model = els.modelSelect.value;
        saveState();
        renderStatus();
      }
    };

    els.clearBtn.onclick = () => {
      state.messages = [];
      saveState();
      renderMessages();
    };

    els.chatForm.onsubmit = async (e) => {
      e.preventDefault();
      const text = els.promptInput.value.trim();
      if (!text) return;
      els.promptInput.value = '';

      state.messages.push({
        role: 'user',
        content: text,
        harness: state.harness,
        model: state.model,
      });
      renderMessages();

      const assistantMsg = {
        role: 'assistant',
        content: '...',
        harness: state.harness,
        model: state.model,
      };
      state.messages.push(assistantMsg);
      renderMessages();

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            harness: state.harness,
            model: state.model,
            lang: state.lang,
            messages: state.messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          assistantMsg.content = 'Error: ' + (data.error || res.statusText);
        } else {
          assistantMsg.content = data.reply || JSON.stringify(data, null, 2);
        }
      } catch (err) {
        assistantMsg.content = 'Network error: ' + err.message;
      }
      saveState();
      renderMessages();
    };

    renderI18n();
    renderMessages();
  </script>
</body>
</html>`;
}
