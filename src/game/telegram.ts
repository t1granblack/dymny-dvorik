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
  initDataUnsafe?: { user?: { first_name?: string; photo_url?: string }; start_param?: string };
  setHeaderColor?(color: string): void;
  setBackgroundColor?(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  lockOrientation?(): void;
  enableClosingConfirmation?(): void;
  disableClosingConfirmation?(): void;
  shareToStory?(mediaUrl: string, params?: { text?: string; widget_link?: { url: string; name?: string } }): void;
  checkHomeScreenStatus?(cb: (status: string) => void): void;
  addToHomeScreen?(): void;
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
  // Шапка и фон Telegram в цвет игры, чтобы окно выглядело цельным
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#2a1d1a';
  if (since('6.1')) {
    app.setHeaderColor?.(bg);
    app.setBackgroundColor?.(bg);
  }
  if (since('7.10')) app.setBottomBarColor?.(bg);
  // Свайп вниз по чаше не должен сворачивать игру; экран всегда вертикальный
  if (since('7.7')) app.disableVerticalSwipes?.();
  if (since('8.0')) app.lockOrientation?.();
}

/** Методы SDK появлялись в разных версиях Telegram — вызываем только поддерживаемые */
const since = (version: string) => !!tg()?.isVersionAtLeast?.(version);

// ---------- Игрок и параметр запуска ----------

export const tgUser = () => {
  const app = tg();
  return app?.initData ? app.initDataUnsafe?.user : undefined;
};

/**
 * Параметр из ссылки t.me/бот/приложение?startapp=… — так открываются присланные миксы.
 * Telegram кладёт его и в initDataUnsafe, и в адрес страницы (tgWebAppStartParam) — второе удобно для проверки в браузере.
 */
export const startParam = () =>
  tg()?.initDataUnsafe?.start_param || new URLSearchParams(location.search).get('tgWebAppStartParam') || '';

/** «Точно закрыть?» — включаем, пока игрок обслуживает гостя */
export function setClosingConfirmation(on: boolean) {
  const app = tg();
  if (!app?.initData || !since('6.2')) return;
  if (on) app.enableClosingConfirmation?.();
  else app.disableClosingConfirmation?.();
}

// ---------- Ярлык на экране «Домой» ----------

export const homeScreenSupported = () => !!tg()?.initData && since('8.0');

export function homeScreenStatus(): Promise<string> {
  const app = tg();
  if (!homeScreenSupported() || !app?.checkHomeScreenStatus) return Promise.resolve('unsupported');
  return new Promise((resolve) => app.checkHomeScreenStatus!(resolve));
}

export const addToHomeScreen = () => tg()?.addToHomeScreen?.();

// ---------- Истории ----------

export const storiesSupported = () => !!tg()?.initData && since('7.8');

/** Публикация в историю: картинка лежит рядом с игрой, ссылка-виджет ведёт в бота (виджет видят премиум-аккаунты) */
export function shareStory(mediaPath: string, text: string) {
  const url = new URL(mediaPath, location.href).href;
  tg()?.shareToStory?.(url, { text, widget_link: { url: GAME_URL, name: 'Играть' } });
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

/** Ссылка на игру в Telegram — Mini App бота */
export const GAME_URL = 'https://t.me/dymny_dvorik_bot/Dymny_Dvorik';

/**
 * В Telegram открывает выбор чата для отправки, в браузере — системное «Поделиться»
 * или копирует текст в буфер. link — своя ссылка (например, с присланным миксом) вместо общей на игру.
 * Возвращает, что получилось, чтобы показать подсказку.
 */
export async function shareText(text: string, link = GAME_URL): Promise<'telegram' | 'shared' | 'copied' | 'failed'> {
  const app = tg();
  if (app?.initData && app.openTelegramLink) {
    app.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
    return 'telegram';
  }
  const full = `${text}\n${link}`;
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
