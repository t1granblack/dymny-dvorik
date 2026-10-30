// Только для разработки: имитация Telegram с CloudStorage в обычном браузере.
// Включается адресом ?mockcloud. «Облако» лежит в localStorage под ключом mock-cloud,
// так что можно стереть локальное сохранение и проверить, что прогресс вернётся из облака.

const STORE = 'mock-cloud';
const read = (): Record<string, string> => JSON.parse(localStorage.getItem(STORE) ?? '{}');
const write = (m: Record<string, string>) => localStorage.setItem(STORE, JSON.stringify(m));
// Как у настоящего облака — ответ не сразу. С ?mockcloud&slow — очень медленно, для проверки таймаута
const later = (fn: () => void) => setTimeout(fn, location.search.includes('slow') ? 4000 : 250);

export function installMockTelegram() {
  const w = window as unknown as { Telegram?: { WebApp?: Record<string, unknown> } };
  w.Telegram ??= {};
  w.Telegram.WebApp = {
    ...w.Telegram.WebApp,
    initData: 'mock',
    colorScheme: 'dark',
    initDataUnsafe: { user: { first_name: 'Тест' } },
    shareToStory: (url: string, params: unknown) => console.log('[mock] shareToStory', url, params),
    checkHomeScreenStatus: (cb: (s: string) => void) => cb('missing'),
    addToHomeScreen: () => console.log('[mock] addToHomeScreen'),
    isVersionAtLeast: () => true,
    ready() {},
    expand() {},
    CloudStorage: {
      setItem(key: string, value: string, cb?: (err: string | null, ok?: boolean) => void) {
        if (value.length > 4096) return later(() => cb?.('VALUE_TOO_LONG'));
        const m = read();
        m[key] = value;
        write(m);
        later(() => cb?.(null, true));
      },
      getItem(key: string, cb: (err: string | null, value?: string) => void) {
        const v = read()[key] ?? '';
        later(() => cb(null, v));
      },
      getItems(keys: string[], cb: (err: string | null, values?: Record<string, string>) => void) {
        const m = read();
        later(() => cb(null, Object.fromEntries(keys.map((k) => [k, m[k] ?? '']))));
      },
    },
  };
}
