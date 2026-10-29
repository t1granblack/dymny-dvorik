// Реакции гостей на подачу: выражение лица и реплика
import type { Mood } from '../art/Character';
import { flavorById } from './data';
import type { GuestType } from './data';
import type { ServeResult } from './state';

type Verdict = 'love' | 'ok' | 'sad';

// Фирменные фразы отдельных гостей; остальные говорят общими
const OWN: Record<string, Partial<Record<Verdict, string>>> = {
  rapper: { love: 'Это база, бро! Чистый флекс!', ok: 'Нормас, по-братски', sad: 'Бро… это вообще не флекс' },
  major: { love: 'Норм. Папе понравится', ok: 'Сойдёт для района', sad: 'Фу. В Дубае такое не курят' },
  deputy: { love: 'Поддерживаю единогласно!', ok: 'Принято в первом чтении', sad: 'Вынесем на повторное рассмотрение' },
  aunt: { love: 'Ой, золотые руки!', ok: 'Ну ничего, ничего', sad: 'Худой ты какой-то, вот и дым такой' },
  biker: { love: 'Жёстко. Уважаю', sad: 'Слабовато, братан' },
  student: { love: 'Лучше, чем лекция по матану!', sad: 'Как пересдача, честно' },
  manager: { love: 'Закрываю квартал с плюсом!', sad: 'Это надо обсудить на созвоне' },
  groom: { love: 'Это лучше, чем свадьба! Только ей не говори', sad: 'Ладно, пойду к невесте…' },
  vibecoder: { love: 'Заработало с первого раза! Коммичу', ok: 'Норм, потом отрефакторю', sad: 'Галлюцинирует… перегенерируй' },
  dog: { love: 'Гав-гав-гав!!!', sad: 'Ууу…' },
  stranger: { love: 'Хм. Достойно.', ok: 'Хм. Достойно.', sad: 'Не то.' },
};

const COMMON: Record<Verdict, string[]> = {
  love: ['Вот это кайф!', 'Шедевр, беру ещё!', 'Лучшая кальянная района!'],
  ok: ['Неплохо, спасибо!', 'Хороший дым', 'Норм, зайду ещё'],
  sad: ['Хм… ну такое', 'Горчит что-то…', 'Я ждал большего'],
};

function verdict(type: GuestType, r: ServeResult): Verdict {
  if (type.dog) return r.dogGuessed ? 'love' : 'sad';
  if (type.boss) return r.bossWon ? 'love' : 'sad';
  return r.stars === 3 ? 'love' : r.stars === 2 ? 'ok' : 'sad';
}

export function reactionMood(type: GuestType, r: ServeResult): Mood {
  const v = verdict(type, r);
  // Незнакомец эмоций не показывает: максимум — лёгкая улыбка
  if (type.boss) return v === 'love' ? 'smile' : 'neutral';
  return v === 'love' ? 'love' : v === 'ok' ? 'happy' : 'sad';
}

export function reactionLine(type: GuestType, r: ServeResult): string {
  const v = verdict(type, r);
  // Бредовый вкус в миксе — главная тема для обсуждения (кроме пса и незнакомца)
  if (r.weird && !type.dog && !type.boss) {
    const f = flavorById(r.weird);
    const nom = f.name;
    const acc = f.acc ?? f.name.toLowerCase();
    if (v === 'love') return `${nom} в кальяне?! Это гениально!`;
    if (v === 'ok') return `Хм, ${nom.toLowerCase()}… А неплохо!`;
    return `Кто положил ${acc} в кальян?!`;
  }
  const list = COMMON[v];
  return OWN[type.id]?.[v] ?? list[Math.floor(Math.random() * list.length)];
}

export const isHappy = (type: GuestType, r: ServeResult) => verdict(type, r) !== 'sad';
