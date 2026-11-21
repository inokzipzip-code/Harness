export const I18N = {
  en: {
    appTitle: 'MegaHarness — Antigravity + Claude Code + Codex',
    subtitle: 'Unified VibeCode harness powered by Netlify AI Gateway',
    harnessLabel: 'Active Harness',
    modelLabel: 'Netlify AI Gateway Model',
    languageLabel: 'Language',
    providerFilter: 'Provider',
    allProviders: 'All providers',
    searchModels: 'Search models...',
    send: 'Send',
    clear: 'Clear Context',
    promptPlaceholder: 'Describe a coding task, paste an error, or ask to inspect Arch Linux / project files...',
    contextPreserved: 'Context preserved across harness & model switches',
    cliBanner: 'MegaHarness CLI — VibeCode for Arch Linux',
    cliHelp: `Commands:
  /harness <antigravity|claude-code|codex>  Switch harness without losing context
  /model <model-id>                         Switch Netlify AI Gateway model
  /models [provider|query]                  List available Netlify AI Gateway models
  /lang <ru|en>                             Switch language (Russian / English)
  /context                                  Show active harness, model, and context stats
  /save [name]                              Save session to ~/.config/megaharness/sessions/
  /load [name]                              Load saved session
  /endpoint <url>                           Set MegaHarness server URL
  /files                                    List workspace files
  /read <path>                              Attach file contents to context
  /run <command>                            Run Arch Linux shell command (with confirmation)
  /clear                                    Clear conversation history
  /help                                     Show this help
  /exit                                     Exit MegaHarness`,
    switchedHarness: 'Switched harness to',
    switchedModel: 'Switched model to',
    switchedLang: 'Language set to',
    unknownCommand: 'Unknown command. Type /help for available commands.',
    confirmRun: 'Run command? (y/N): ',
    aborted: 'Aborted.',
    savedSession: 'Session saved:',
    loadedSession: 'Session loaded:',
    sessionNotFound: 'Session not found:',
    contextCleared: 'Conversation context cleared.',
    archSetupTitle: 'Arch Linux VibeCode CLI',
    archSetupCmd: 'git clone https://github.com/inokzipzip-code/Harness.git && cd Harness && bash packaging/install-arch.sh',
  },
  ru: {
    appTitle: 'MegaHarness — Antigravity + Claude Code + Codex',
    subtitle: 'Единый VibeCode-харнесс на базе Netlify AI Gateway',
    harnessLabel: 'Активный харнесс',
    modelLabel: 'Модель Netlify AI Gateway',
    languageLabel: 'Язык',
    providerFilter: 'Провайдер',
    allProviders: 'Все провайдеры',
    searchModels: 'Поиск модели...',
    send: 'Отправить',
    clear: 'Очистить контекст',
    promptPlaceholder: 'Опишите задачу по коду, вставьте ошибку или попросите разобрать проект на Arch Linux...',
    contextPreserved: 'Контекст сохраняется при переключении харнесса и модели',
    cliBanner: 'MegaHarness CLI — VibeCode для Arch Linux',
    cliHelp: `Команды:
  /harness <antigravity|claude-code|codex>  Переключить харнесс без потери контекста
  /model <model-id>                         Переключить модель Netlify AI Gateway
  /models [провайдер|поиск]                 Показать доступные модели Netlify AI Gateway
  /lang <ru|en>                             Переключить язык (русский / английский)
  /context                                  Показать текущий харнесс, модель и статистику контекста
  /save [имя]                               Сохранить сессию в ~/.config/megaharness/sessions/
  /load [имя]                               Загрузить сохранённую сессию
  /endpoint <url>                           Указать URL сервера MegaHarness
  /files                                    Список файлов рабочей директории
  /read <путь>                              Добавить содержимое файла в контекст
  /run <команда>                            Выполнить команду в Arch Linux (с подтверждением)
  /clear                                    Очистить историю диалога
  /help                                     Показать справку
  /exit                                     Выйти из MegaHarness`,
    switchedHarness: 'Харнесс переключён на',
    switchedModel: 'Модель переключена на',
    switchedLang: 'Язык установлен:',
    unknownCommand: 'Неизвестная команда. Введите /help для списка команд.',
    confirmRun: 'Выполнить команду? (y/N): ',
    aborted: 'Отменено.',
    savedSession: 'Сессия сохранена:',
    loadedSession: 'Сессия загружена:',
    sessionNotFound: 'Сессия не найдена:',
    contextCleared: 'Контекст диалога очищен.',
    archSetupTitle: 'Установка CLI для Arch Linux (VibeCode)',
    archSetupCmd: 'git clone https://github.com/inokzipzip-code/Harness.git && cd Harness && bash packaging/install-arch.sh',
  },
};
