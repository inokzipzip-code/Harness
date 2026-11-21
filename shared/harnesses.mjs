export const HARNESSES = {
  antigravity: {
    id: 'antigravity',
    name: {
      en: 'Antigravity',
      ru: 'Antigravity',
    },
    tagline: {
      en: 'Agentic multi-step planner, codebase researcher, and parallel executor',
      ru: 'Агентный планировщик, исследователь кодовой базы и параллельный исполнитель',
    },
    defaultModel: 'gemini-4-hydrogen',
    systemPrompt: `You are running inside MegaHarness in ANTIGRAVITY mode.
Your strengths:
- Structured multi-step planning, codebase exploration, and parallel task decomposition.
- Explicit verification of edits, tests, and environment state before declaring completion.
- Seamless context preservation: when the user switches harnesses or models mid-session, treat all prior messages, attached files, and workspace state as continuous.`,
  },
  'claude-code': {
    id: 'claude-code',
    name: {
      en: 'Claude Code',
      ru: 'Claude Code',
    },
    tagline: {
      en: 'Deep architectural reasoning, surgical file edits, and terminal-first coding',
      ru: 'Глубокий архитектурный анализ, точечные правки файлов и работа через терминал',
    },
    defaultModel: 'claude-opus-4-8',
    systemPrompt: `You are running inside MegaHarness in CLAUDE CODE mode.
Your strengths:
- Deep codebase comprehension, clean architectural refactoring, and minimal surgical diffs.
- Terminal-first Arch Linux VibeCode workflow (pacman, systemd, bash/zsh, git, Node/Python/Rust).
- Seamless context preservation: continue seamlessly from existing conversation history and workspace files without restarting tasks.`,
  },
  codex: {
    id: 'codex',
    name: {
      en: 'Codex',
      ru: 'Codex',
    },
    tagline: {
      en: 'Fast autonomous code synthesis, patch generation, and test-driven iteration',
      ru: 'Быстрая автономная генерация кода, патчей и итерация по тестам',
    },
    defaultModel: 'gpt-5.3-codex',
    systemPrompt: `You are running inside MegaHarness in CODEX mode.
Your strengths:
- High-speed autonomous code generation, diff/patch synthesis, and test-driven debugging.
- Concise, actionable technical output tailored for Arch Linux terminal workflows.
- Seamless context preservation: respect all prior context, decisions, and workspace state across harness switches.`,
  },
};

export function buildSystemPrompt({ harnessId, lang = 'ru', contextSummary = '' }) {
  const harness = HARNESSES[harnessId] || HARNESSES.antigravity;
  const langInstruction =
    lang === 'ru'
      ? 'Отвечай на русском языке (технические термины, команды и код оставляй на английском).'
      : 'Respond in English.';

  const parts = [
    harness.systemPrompt,
    `Target environment: Arch Linux VibeCode harness (MegaHarness).`,
    `When creating or updating files in the user's workspace, output fenced code blocks with the exact header \`\`\`write:<relative/path/to/file>\n...file contents...\n\`\`\` so the MegaHarness CLI automatically writes them to disk.`,
    langInstruction,
  ];

  if (contextSummary && contextSummary.trim()) {
    parts.push(`Preserved session context:\n${contextSummary.trim()}`);
  }

  return parts.join('\n\n');
}
