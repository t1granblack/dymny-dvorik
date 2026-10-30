// Состояние и формулы. В прототипе всё считается на клиенте и хранится в localStorage;
// по спецификации награды, валюта и офлайн-доход потом переезжают на сервер.
import {
  BOSS, BOSS_EVERY, COMBOS, DOG, DOG_CHANCE, DOG_GUESS, Combo, FLAVORS, GUESTS, GuestRequest, GuestType, HELPER, MAX_UPGRADE, Tag, UPGRADES, UpgradeId,
  flaskMult, flavorById, helperUpCost, interiorMult, mixBonus, upgradeCost, xpToNext,
} from './data';

export interface Save {
  v: 1;
  ageOk: boolean;
  coins: number;
  clouds: number;
  xp: number;
  level: number;
  served: number;
  upgrades: Record<UpgradeId, number>;
  helper: number; // 0 — не нанят
  lastCollect: number; // время последнего сбора офлайн-дохода, мс
  recipes: string[]; // id открытых сочетаний
  lastBossServed: number; // значение served при последнем визите босса
  bossWins: number;
  secretFlavors: string[]; // открытые секретные вкусы
  signatures: Signature[]; // фирменные миксы игрока
  updatedAt: number; // время последней записи, мс — по нему выбираем свежую копию из облака или устройства
}

const KEY = 'dymny-dvorik-save';

export const newSave = (): Save => ({
  v: 1,
  ageOk: false,
  coins: 0,
  clouds: 0,
  xp: 0,
  level: 1,
  served: 0,
  upgrades: { storage: 0, bowl: 0, kalaud: 0, flask: 0, interior: 0 },
  helper: 0,
  lastCollect: Date.now(),
  recipes: [],
  lastBossServed: 0,
  bossWins: 0,
  secretFlavors: [],
  signatures: [],
  updatedAt: 0,
});

/** Разбирает сохранение из строки; битое или пустое — null */
export function parseSave(raw: string | null): Save | null {
  if (!raw) return null;
  try {
    return { ...newSave(), ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function loadSave(): Save {
  try {
    return parseSave(localStorage.getItem(KEY)) ?? newSave();
  } catch {
    // нет доступа к хранилищу — играем с нуля
    return newSave();
  }
}

export function storeSave(s: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // не критично для прототипа
  }
}

export const unlockedFlavors = (level: number, secret: string[] = []) =>
  FLAVORS.filter((f) => f.unlock <= level || secret.includes(f.id));

// ---------- Гости ----------

export interface Guest {
  key: number;
  type: GuestType;
  request: GuestRequest;
}

let guestKey = 0;
/** prevId — кто пришёл перед ним: один и тот же гость два раза подряд не заходит */
export function randomGuest(level: number, prevId?: string): Guest {
  const open = GUESTS.filter((g) => g.unlock <= level);
  const pool = open.filter((g) => g.id !== prevId);
  const type = pickWeighted(pool.length ? pool : open, (g) => g.weight ?? 1);
  // Запрос должен быть выполним из открытых вкусов
  const have = new Set(unlockedFlavors(level).flatMap((f) => f.tags));
  const ok = type.requests.filter((r) => r.tags.every((t) => have.has(t)));
  const list = ok.length ? ok : type.requests;
  return { key: ++guestKey, type, request: pick(list) };
}

export const bossDue = (save: Save) => save.level >= BOSS.unlock && save.served - save.lastBossServed >= BOSS_EVERY;

function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

/** Случайный элемент с учётом веса: редкие гости заходят реже */
function pickWeighted<T>(list: T[], weight: (item: T) => number) {
  let r = Math.random() * list.reduce((s, x) => s + weight(x), 0);
  for (const x of list) {
    r -= weight(x);
    if (r <= 0) return x;
  }
  return list[list.length - 1];
}

/**
 * Босс заходит без очереди и встаёт первым. Иногда забегает собака.
 * В остальных случаях в конец очереди садится обычный гость.
 * prevId — кого только что обслужили, если очередь пуста: он тоже не должен прийти сразу снова.
 */
export function withNewGuest(save: Save, queue: Guest[], prevId?: string): Guest[] {
  if (bossDue(save) && !queue.some((g) => g.type.boss)) {
    return [{ key: ++guestKey, type: BOSS, request: BOSS.requests[0] }, ...queue];
  }
  const last = queue.length ? queue[queue.length - 1].type.id : prevId;
  if (save.level >= DOG.unlock && Math.random() < DOG_CHANCE && !queue.some((g) => g.type.dog) && last !== DOG.id) {
    return [...queue, { key: ++guestKey, type: DOG, request: pick(DOG.requests) }];
  }
  return [...queue, randomGuest(save.level, last)];
}

// ---------- Оценка ----------

export interface MixPart {
  id: string;
  weight: number; // 1..10, доли считаются нормированием
}

// ---------- Фирменные миксы ----------

export interface Signature {
  id: string;
  name: string;
  parts: MixPart[];
  served: number; // сколько раз подан
  best: number; // лучший результат в звёздах
  from?: string; // имя друга, если микс пришёл по ссылке
}

export const MAX_SIGNATURES = 6;
export const SIGNATURE_BONUS = 0.3; // надбавка к оплате, если фирменный зашёл (микс ≥ 85%)

/** Можно ли сейчас подать фирменный: все вкусы открыты и хватает слотов в чаше */
export const signatureUsable = (sig: Signature, save: Save, slots: number) =>
  sig.parts.length <= slots && sig.parts.every((p) => unlockedFlavors(save.level, save.secretFlavors).some((f) => f.id === p.id));

// ---------- Микс в ссылке ----------
// Ссылка t.me/бот/приложение?startapp=mix_… несёт сам микс: друг открывает игру, и микс уже у него.
// Telegram пропускает в параметре только A-Z, a-z, 0-9, _ и -, поэтому JSON кодируем в base64url.

const MIX_PREFIX = 'mix_';

export function encodeMix(sig: Signature, author?: string): string {
  const payload = JSON.stringify({ n: sig.name, p: sig.parts.map((p) => [p.id, p.weight]), a: author?.slice(0, 24) });
  const bytes = new TextEncoder().encode(payload);
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return MIX_PREFIX + b64;
}

/** Разбор присланного микса. Всё непонятное (чужие вкусы, мусор в ссылке) — null */
export function decodeMix(param: string): Signature | null {
  if (!param.startsWith(MIX_PREFIX)) return null;
  try {
    const b64 = param.slice(MIX_PREFIX.length).replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    const parts: MixPart[] = (Array.isArray(data.p) ? data.p : [])
      .slice(0, 3)
      .filter((x: unknown) => Array.isArray(x) && FLAVORS.some((f) => f.id === x[0]))
      .map(([id, w]: [string, number]) => ({ id, weight: Math.min(10, Math.max(1, Math.round(Number(w) || 5))) }));
    if (!parts.length) return null;
    const name = String(data.n ?? '').trim().slice(0, 28) || 'Микс друга';
    const from = data.a ? String(data.a).slice(0, 24) : undefined;
    return { id: `gift-${Date.now()}`, name, parts, served: 0, best: 0, from };
  } catch {
    return null;
  }
}

const sameMix = (a: Signature, b: Signature) =>
  a.name === b.name && a.parts.length === b.parts.length && a.parts.every((p, i) => p.id === b.parts[i].id && p.weight === b.parts[i].weight);

/** Кладёт присланный микс к фирменным. Уже есть — не дублируем; мест нет — сообщаем */
export function importSignature(save: Save, sig: Signature): { save: Save; result: 'added' | 'exists' | 'full' } {
  if (save.signatures.some((s) => sameMix(s, sig))) return { save, result: 'exists' };
  if (save.signatures.length >= MAX_SIGNATURES) return { save, result: 'full' };
  return { save: { ...save, signatures: [...save.signatures, sig] }, result: 'added' };
}

export function signatureText(sig: Signature) {
  const parts = shares(sig.parts)
    .map((s) => `${Math.round(s.share * 100)}% ${flavorById(s.id).name.toLowerCase()}`)
    .join(', ');
  return `Мой фирменный микс «${sig.name}»: ${parts}. Жми на ссылку — он появится у тебя в «Дымном дворике»!`;
}

export const shares = (parts: MixPart[]) => {
  const total = parts.reduce((s, p) => s + p.weight, 0) || 1;
  return parts.map((p) => ({ id: p.id, share: p.weight / total }));
};

export function findCombos(parts: MixPart[]): Combo[] {
  const sh = shares(parts).filter((p) => p.share >= 0.2).map((p) => p.id);
  return COMBOS.filter((c) => sh.includes(c.a) && sh.includes(c.b));
}

/** Насколько микс попадает в запрос, 0..1 */
export function scoreMix(parts: MixPart[], want: Tag[], storageLvl: number) {
  const sh = shares(parts);
  const profile: Partial<Record<Tag, number>> = {};
  let offTarget = 0;
  for (const { id, share } of sh) {
    const f = flavorById(id);
    for (const t of f.tags) profile[t] = (profile[t] ?? 0) + share;
    if (!f.tags.some((t) => want.includes(t))) offTarget += share;
  }
  // Каждый нужный тег должен «звучать» хотя бы в 40% чаши
  const coverage = want.reduce((s, t) => s + Math.min(1, (profile[t] ?? 0) / 0.4), 0) / want.length;
  const combos = findCombos(parts);
  const comboBonus = combos.length ? 0.15 : 0;
  const score = clamp01(coverage * 0.9 + 0.1 - offTarget * 0.4 + comboBonus + mixBonus(storageLvl));
  return { score, combos };
}

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function starsFor(total: number) {
  if (total >= 0.85) return 3;
  if (total >= 0.6) return 2;
  return 1;
}

export interface ServeResult {
  mix: number;
  pack: number;
  heat: number;
  total: number;
  stars: number;
  coins: number;
  tips: number;
  xp: number;
  newRecipes: Combo[];
  boss: boolean;
  bossWon: boolean;
  clouds: number;
  dogGuessed: boolean | null; // null — гость не собака
  secretFlavor: string | null; // открытый сейчас секретный вкус
  weird: string | null; // бредовый вкус в миксе — гость на него отреагирует
  missingNeed: string | null; // обязательный вкус, которого не оказалось в миксе
  signature: { id: string; name: string; bonus: number } | null;
}

export function buildResult(
  save: Save, guest: Guest, mix: number, pack: number, heat: number, combos: Combo[],
  parts: MixPart[] = [], signatureId?: string,
): ServeResult {
  // Гость сказал «обязательно с …», а этого вкуса нет — микс засчитывается лишь частично
  const need = guest.request.needs;
  const missingNeed = need && !parts.some((p) => p.id === need) ? need : null;
  if (missingNeed) mix *= 0.4;
  const total = mix * 0.5 + pack * 0.25 + heat * 0.25;
  const stars = starsFor(total);
  const mult = interiorMult(save.upgrades.interior) * flaskMult(save.upgrades.flask);
  const base = Math.round(guest.type.base * (0.6 + total * 0.6) * mult);
  // Фирменный микс, который попал в заказ, приносит надбавку
  const sig = save.signatures.find((s) => s.id === signatureId);
  const sigBonus = sig && mix >= 0.85 ? Math.round(base * SIGNATURE_BONUS) : 0;
  const coins = base + sigBonus;
  const weird = parts.map((p) => flavorById(p.id)).find((f) => f.weird)?.id ?? null;
  const tips = stars === 3 ? Math.round(coins * 0.5) : 0;
  const newRecipes = combos.filter((c) => !save.recipes.includes(c.id));
  const boss = !!guest.type.boss;
  const bossWon = boss && stars >= 2;
  // Собаке важен только микс: угадал её желание — получаешь «Собачью радость»
  const dogGuessed = guest.type.dog ? mix >= DOG_GUESS : null;
  const secretFlavor = dogGuessed && !save.secretFlavors.includes('dogjoy') ? 'dogjoy' : null;
  return {
    mix, pack, heat, total, stars, coins, tips, newRecipes, boss, bossWon, dogGuessed, secretFlavor, weird, missingNeed,
    xp: (5 + stars * 5) * (boss ? 3 : 1),
    clouds: bossWon ? guest.type.boss!.clouds : 0,
    signature: sig ? { id: sig.id, name: sig.name, bonus: sigBonus } : null,
  };
}

export interface ApplyOutcome {
  save: Save;
  levelUps: number[];
}

export function applyResult(save: Save, r: ServeResult): ApplyOutcome {
  let { xp, level } = save;
  xp += r.xp;
  const levelUps: number[] = [];
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
    levelUps.push(level);
  }
  return {
    save: {
      ...save,
      xp,
      level,
      coins: save.coins + r.coins + r.tips + levelUps.length * 25,
      clouds: save.clouds + levelUps.length * 5 + r.clouds,
      served: save.served + 1,
      lastBossServed: r.boss ? save.served + 1 : save.lastBossServed,
      bossWins: save.bossWins + (r.bossWon ? 1 : 0),
      recipes: [...save.recipes, ...r.newRecipes.map((c) => c.id)],
      secretFlavors: r.secretFlavor ? [...save.secretFlavors, r.secretFlavor] : save.secretFlavors,
      signatures: save.signatures.map((s) =>
        s.id === r.signature?.id ? { ...s, served: s.served + 1, best: Math.max(s.best, r.stars) } : s,
      ),
    },
    levelUps,
  };
}

/** Хватает ли монет хотя бы на одно улучшение или помощника */
export const canAffordUpgrade = (save: Save) =>
  save.coins >= helperUpCost(save.helper) ||
  UPGRADES.some((u) => save.upgrades[u.id] < MAX_UPGRADE && save.coins >= upgradeCost(u, save.upgrades[u.id]));

// ---------- Офлайн-доход ----------

export const helperRate = (save: Save) => (save.helper ? HELPER.ratePerHour * save.helper * interiorMult(save.upgrades.interior) : 0);

export function pendingIncome(save: Save, now = Date.now()) {
  if (!save.helper) return 0;
  const hours = Math.min(HELPER.capHours, Math.max(0, now - save.lastCollect) / 3_600_000);
  return Math.floor(hours * helperRate(save));
}
