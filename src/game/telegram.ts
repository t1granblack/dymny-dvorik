// Тонкая обёртка над Telegram Mini Apps SDK. Вне Telegram всё молча ничего не делает.

interface TgWebApp {
  initData: string;
  ready(): void;
  expand(): void;
  colorScheme?: 'light' | 'dark';
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  BackButton?: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  isVersionAtLeast?(version: string): boolean;
  openTelegramLink?(url: string): void;
  CloudStorage?: TgCloudStorage;
}

export interface TgCloudStorage {
  setItem(key: string, value: string, cb?: (err: string | null, ok?: boolean) => void): void;
  getItem(key: string, cb: (err: string | null, value?: string) => void): void;
  getItems(keys: string[], cb: (err: string | null, values?: Record<string, string>) => void): void;
}

const tg = (): TgWebApp | undefined => (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;

export function initTelegram() {
  const app = tg();
  // Скрипт SDK есть и в обычном браузере, но initData заполнен только внутри Telegram
  if (!app?.initData) return;
  app.ready();
  app.expand();
  if (app.colorScheme) document.documentElement.dataset.theme = app.colorScheme;
}

export const haptic = {
  tap: () => tg()?.HapticFeedback?.impactOccurred('light'),
  hit: () => tg()?.HapticFeedback?.impactOccurred('medium'),
  success: () => tg()?.HapticFeedback?.notificationOccurred('success'),
  warn: () => tg()?.HapticFeedback?.notificationOccurred('warning'),
};

// ---------- Облачное хранилище ----------
// CloudStorage привязан к аккаунту Telegram и боту, поэтому прогресс одинаков на всех устройствах.
// Ограничение — 4096 символов на ключ, так что сохранение режется на части: save_0, save_1… и счётчик save_n.

const CHUNK = 4000;
const COUNT_KEY = 'save_n';

const cloud = (): TgCloudStorage | undefined => {
  const app = tg();
  if (!app?.initData || !app.isVersionAtLeast?.('6.9')) return undefined;
  return app.CloudStorage;
};

export const cloudAvailable = () => !!cloud();

export function cloudLoad(): Promise<string | null> {
  const cs = cloud();
  if (!cs) return Promise.resolve(null);
  return new Promise((resolve) => {
    cs.getItem(COUNT_KEY, (err, raw) => {
      const n = Number(raw);
      if (err || !n) return resolve(null);
      const keys = Array.from({ length: n }, (_, i) => `save_${i}`);
      cs.getItems(keys, (err2, values) => {
        if (err2 || !values) return resolve(null);
        resolve(keys.map((k) => values[k] ?? '').join(''));
      });
    });
  });
}

export function cloudSave(json: string): Promise<boolean> {
  const cs = cloud();
  if (!cs) return Promise.resolve(false);
  const parts: string[] = [];
  for (let i = 0; i < json.length; i += CHUNK) parts.push(json.slice(i, i + CHUNK));
  const set = (key: string, value: string) =>
    new Promise<boolean>((resolve) => cs.setItem(key, value, (err) => resolve(!err)));
  // Сначала части, потом счётчик: если запись оборвётся, загрузка увидит битый JSON и возьмёт локальную копию
  return Promise.all(parts.map((p, i) => set(`save_${i}`, p))).then((oks) =>
    oks.every(Boolean) ? set(COUNT_KEY, String(parts.length)) : false,
  );
}

// ---------- Поделиться ----------

/** Ссылка на игру в Telegram. Заполнить, когда появится бот (например, https://t.me/имя_бота/app) */
export const GAME_URL = '';

/**
 * В Telegram открывает выбор чата для отправки, в браузере — системное «Поделиться»
 * или копирует текст в буфер. Возвращает, что получилось, чтобы показать подсказку.
 */
export async function shareText(text: string): Promise<'telegram' | 'shared' | 'copied' | 'failed'> {
  const app = tg();
  if (app?.initData && app.openTelegramLink) {
    const q = GAME_URL
      ? `url=${encodeURIComponent(GAME_URL)}&text=${encodeURIComponent(text)}`
      : `url=${encodeURIComponent(text)}`;
    app.openTelegramLink(`https://t.me/share/url?${q}`);
    return 'telegram';
  }
  const full = GAME_URL ? `${text}\n${GAME_URL}` : text;
  try {
    if (navigator.share) {
      await navigator.share({ text: full });
      return 'shared';
    }
    await navigator.clipboard.writeText(full);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/** Системная кнопка «Назад» Telegram; возвращает функцию отписки */
export function bindBackButton(cb: (() => void) | null) {
  const btn = tg()?.BackButton;
  if (!btn) return () => {};
  if (!cb) {
    btn.hide();
    return () => {};
  }
  btn.show();
  btn.onClick(cb);
  return () => {
    btn.offClick(cb);
    btn.hide();
  };
}
