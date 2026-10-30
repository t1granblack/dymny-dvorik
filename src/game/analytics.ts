// Аналитика в PostHog — без их библиотеки: события копятся пачкой и уходят одним запросом.
// Игрок анонимен: вместо Telegram ID отправляется его хеш, имён и аватарок не передаём.
// Пока POSTHOG_KEY пустой, всё молча выключено.

/** Ключ проекта PostHog (phc_…). Он публичный — его можно хранить в коде */
const POSTHOG_KEY = '';
/** Сервер PostHog: EU — https://eu.i.posthog.com, US — https://us.i.posthog.com */
const POSTHOG_HOST = 'https://eu.i.posthog.com';

const SESSION_GAP = 30 * 60 * 1000; // 30 минут без действий — новая сессия
const ID_KEY = 'dymny-dvorik-anon-id';

interface Pending {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

const queue: Pending[] = [];
let idPromise: Promise<string> | null = null;
let sessionId = '';
let lastActivity = 0;
let base: Record<string, unknown> = {};

const uuid = () => crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/** Анонимный id: хеш Telegram ID (один и тот же на всех устройствах) или случайный id браузера */
async function anonId(tgUserId?: number): Promise<string> {
  if (tgUserId && crypto.subtle) {
    const bytes = new TextEncoder().encode(`dymny-dvorik:${tgUserId}`);
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    return 'tg_' + Array.from(hash.slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  try {
    const saved = localStorage.getItem(ID_KEY);
    if (saved) return saved;
    const fresh = 'web_' + uuid();
    localStorage.setItem(ID_KEY, fresh);
    return fresh;
  } catch {
    return 'web_' + uuid();
  }
}

export const analyticsEnabled = () => !!POSTHOG_KEY;

export function initAnalytics(opts: { tgUserId?: number; platform: 'telegram' | 'web'; lang?: string }) {
  if (!POSTHOG_KEY) return;
  idPromise = anonId(opts.tgUserId);
  base = { platform: opts.platform, lang: opts.lang, $lib: 'dymny-dvorik' };
  setInterval(() => flush(false), 5000);
  // Для отладки при разработке: window.__analytics.queue — что ещё не отправлено
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__analytics = { queue, flush: () => flush(false) };
  // Свернул игру — отправляем то, что накопилось, даже если вкладку сейчас закроют
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush(true));
}

/** Записать событие. Свойства — только игровые данные, без личной информации */
export function track(event: string, properties: Record<string, unknown> = {}) {
  if (!POSTHOG_KEY) return;
  const now = Date.now();
  if (!sessionId || now - lastActivity > SESSION_GAP) sessionId = uuid();
  lastActivity = now;
  queue.push({ event, properties: { ...base, ...properties, $session_id: sessionId }, timestamp: new Date(now).toISOString() });
}

async function flush(beacon: boolean) {
  if (!queue.length || !idPromise) return;
  const distinct_id = await idPromise;
  const batch = queue.splice(0).map((e) => ({ ...e, properties: { ...e.properties, distinct_id } }));
  const body = JSON.stringify({ api_key: POSTHOG_KEY, batch });
  if (import.meta.env.DEV) console.debug('[analytics]', JSON.stringify(batch.map((e) => ({ event: e.event, ...e.properties }))));
  const url = `${POSTHOG_HOST}/batch/`;
  if (beacon && navigator.sendBeacon?.(url, body)) return;
  fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {
    queue.unshift(...batch); // сеть отвалилась — попробуем со следующей пачкой
  });
}
