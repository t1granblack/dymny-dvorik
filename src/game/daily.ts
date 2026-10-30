// Ежедневное: награда за вход с серией на 7 дней, 3 задания на день и гость дня.
// День считается по местному времени игрока. Пока всё на клиенте — перевод на серверное время будет вместе с сервером.
import { GUESTS, GuestType, Tag, flavorById } from './data';
import type { ServeResult } from './state';

export const today = (now = new Date()) => now.toLocaleDateString('sv-SE'); // 2026-10-30
const yesterday = (now = new Date()) => today(new Date(now.getTime() - 86_400_000));

// ---------- Награда за вход ----------

export interface Reward {
  coins?: number;
  clouds?: number;
}

export const DAILY_REWARDS: Reward[] = [
  { coins: 30 }, { coins: 50 }, { clouds: 5 }, { coins: 80 }, { coins: 120 }, { clouds: 10 },
  { coins: 200, clouds: 25 }, // седьмой день — сундук
];

export interface DailyState {
  last: string; // день последнего получения
  streak: number; // сколько дней подряд (1..7)
}

/** Какой по счёту день серии будет, если забрать награду сейчас; null — сегодня уже забрал */
export function nextStreak(d: DailyState): number | null {
  if (d.last === today()) return null;
  return d.last === yesterday() ? (d.streak % DAILY_REWARDS.length) + 1 : 1;
}

// ---------- Задания ----------

export type QuestKind = 'serve' | 'stars3' | 'flavor3' | 'coins' | 'signature';

export interface Quest {
  id: string;
  kind: QuestKind;
  target: number;
  progress: number;
  flavor?: string; // для «микс с … на 3 звезды»
  reward: Reward;
  claimed: boolean;
}

export interface QuestsState {
  day: string;
  list: Quest[];
}

export function questText(q: Quest) {
  switch (q.kind) {
    case 'serve': return `Обслужи гостей: ${q.target}`;
    case 'stars3': return `Подай на 3 звезды: ${q.target} раз`;
    case 'flavor3': return `Микс с вкусом «${flavorById(q.flavor!).name}» на 3 звезды`;
    case 'coins': return `Заработай ${q.target} монет`;
    case 'signature': return 'Подай свой фирменный микс на 2+ звезды';
  }
}

const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

/** Три разных задания под уровень игрока */
export function makeQuests(level: number, flavorIds: string[], hasSignatures: boolean): Quest[] {
  const pool: QuestKind[] = ['serve', 'stars3', 'coins', 'flavor3'];
  if (hasSignatures) pool.push('signature');
  const kinds = shuffle(pool).slice(0, 3);
  const coins = 50 + 10 * level;
  return kinds.map((kind, i) => {
    const base = { id: `${today()}-${i}`, kind, progress: 0, claimed: false };
    switch (kind) {
      case 'serve': return { ...base, target: Math.min(15, 6 + level), reward: { coins } };
      case 'stars3': return { ...base, target: Math.min(6, 2 + Math.floor(level / 3)), reward: { coins, clouds: 3 } };
      case 'coins': return { ...base, target: 150 + 40 * level, reward: { coins: Math.round(coins * 0.8) } };
      case 'flavor3': return { ...base, target: 1, flavor: shuffle(flavorIds)[0], reward: { coins, clouds: 3 } };
      case 'signature': return { ...base, target: 1, reward: { clouds: 4 } };
    }
  });
}

/** Продвигает задания после подачи */
export function progressQuests(list: Quest[], r: ServeResult): Quest[] {
  return list.map((q) => {
    if (q.claimed || q.progress >= q.target) return q;
    const add =
      q.kind === 'serve' ? 1
      : q.kind === 'stars3' ? (r.stars === 3 ? 1 : 0)
      : q.kind === 'flavor3' ? (r.stars === 3 && r.flavors.includes(q.flavor!) ? 1 : 0)
      : q.kind === 'coins' ? r.coins + r.tips
      : r.signature && r.stars >= 2 ? 1 : 0;
    return add ? { ...q, progress: Math.min(q.target, q.progress + add) } : q;
  });
}

// ---------- Гость дня ----------
// Раз в день один из знакомых гостей приходит с трудным заказом из трёх вкусов. Награда ×2 монет, ×2 опыта и облачка

export interface GuestOfDayState {
  day: string;
  done: boolean;
  startServed: number; // сколько гостей было обслужено на начало дня — гость дня приходит после второго
}

export const GOTD_AFTER = 2;
export const GOTD_CLOUDS = 5;

/** Трудный заказ: три разных тега из тех, что можно собрать открытыми вкусами */
export function makeGuestOfDay(level: number, tagsAvailable: Tag[]): { type: GuestType; text: string; tags: Tag[] } {
  const pool = GUESTS.filter((g) => g.unlock <= level && !g.creature && (g.weight ?? 1) >= 1);
  const type = pool[Math.floor(Math.random() * pool.length)];
  const tags = shuffle(tagsAvailable).slice(0, 3);
  const [a, b, c] = tags.map((t) => TAG_ADVERB[t]);
  return { type, tags, text: `Сегодня мой день! Хочу, чтобы было ${a}, ${b} и ${c}. Удиви меня` };
}

// «чтобы было кисло, сладко и свежо» — наречия читаются в заказе естественнее прилагательных
const TAG_ADVERB: Record<Tag, string> = {
  sour: 'кисло', sweet: 'сладко', fresh: 'свежо', spicy: 'пряно', dessert: 'десертно', fruity: 'фруктово',
};
