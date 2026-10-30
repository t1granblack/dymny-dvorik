// Игровые данные прототипа. Все числа — стартовый баланс из спецификации, правим по плейтестам.

import type { Look } from '../art/Character';

export type Tag ='sour' | 'sweet' | 'fresh' | 'spicy' | 'dessert' | 'fruity';

export const TAG_LABEL: Record<Tag, string> = {
  sour: 'кислый',
  sweet: 'сладкий',
  fresh: 'свежий',
  spicy: 'пряный',
  dessert: 'десертный',
  fruity: 'фруктовый',
};

export interface Flavor {
  id: string;
  name: string;
  color: string;
  tags: Tag[];
  unlock: number; // уровень игрока
  secret?: boolean;
  weird?: boolean; // бредовый вкус со «странной полки»
  acc?: string; // винительный падеж для реплик: «кто положил сгущёнку в кальян?!»
}

export const FLAVORS: Flavor[] = [
  { id: 'mint', name: 'Мята', color: '#3ecf8e', tags: ['fresh'], unlock: 1 },
  { id: 'watermelon', name: 'Арбуз', color: '#ff5a6e', tags: ['fruity', 'sweet', 'fresh'], unlock: 1 },
  { id: 'lemon', name: 'Лимон', color: '#ffd23f', tags: ['sour', 'fresh', 'fruity'], unlock: 1 },
  { id: 'blueberry', name: 'Черника', color: '#5b6cff', tags: ['fruity', 'sweet'], unlock: 1 },
  { id: 'vanilla', name: 'Ваниль', color: '#f3e3b5', tags: ['dessert', 'sweet'], unlock: 1 },
  { id: 'cardamom', name: 'Кардамон', color: '#b08d57', tags: ['spicy'], unlock: 2 },
  { id: 'mango', name: 'Манго', color: '#ffa62b', tags: ['fruity', 'sweet'], unlock: 2 },
  { id: 'grapefruit', name: 'Грейпфрут', color: '#ff7b54', tags: ['sour', 'fruity'], unlock: 3 },
  { id: 'strawberry', name: 'Клубника', color: '#ff4f81', tags: ['sweet', 'fruity'], unlock: 3 },
  { id: 'cinnamon', name: 'Корица', color: '#a0522d', tags: ['spicy', 'dessert'], unlock: 4 },
  { id: 'kiwi', name: 'Киви', color: '#9be15d', tags: ['sour', 'fresh', 'fruity'], unlock: 4 },
  { id: 'caramel', name: 'Карамель', color: '#d98b3a', tags: ['dessert', 'sweet'], unlock: 5 },
  { id: 'bubblegum', name: 'Жвачка', color: '#ff8fc8', tags: ['sweet', 'fresh'], unlock: 2 },
  { id: 'cola', name: 'Кола', color: '#7a3b1e', tags: ['sweet', 'spicy'], unlock: 3 },
  { id: 'peach', name: 'Персик', color: '#ffb07a', tags: ['fruity', 'sweet'], unlock: 5 },
  { id: 'passionfruit', name: 'Маракуйя', color: '#8e4fbf', tags: ['sour', 'fruity'], unlock: 6 },
  { id: 'coconut', name: 'Кокос', color: '#f4efe6', tags: ['dessert', 'sweet'], unlock: 6 },
  { id: 'doubleapple', name: 'Двойное яблоко', color: '#d23b3b', tags: ['fruity', 'spicy'], unlock: 7 },
  // «Странная полка»: бредовые вкусы ради смеха и шеринга фирменных миксов
  { id: 'plov', name: 'Плов', acc: 'плов', color: '#e0a03a', tags: ['spicy'], unlock: 2, weird: true },
  { id: 'zira', name: 'Зира', acc: 'зиру', color: '#8a6a3a', tags: ['spicy'], unlock: 2, weird: true },
  { id: 'pickle', name: 'Солёный огурец', acc: 'солёный огурец', color: '#5f9e3a', tags: ['sour', 'fresh'], unlock: 3, weird: true },
  { id: 'condensed', name: 'Сгущёнка', acc: 'сгущёнку', color: '#f3e7cf', tags: ['sweet', 'dessert'], unlock: 3, weird: true },
  { id: 'seeds', name: 'Семечки', acc: 'семечки', color: '#4a4038', tags: ['spicy', 'dessert'], unlock: 4, weird: true },
  { id: 'shawarma', name: 'Шаурма', acc: 'шаурму', color: '#d9a05b', tags: ['spicy', 'sour'], unlock: 4, weird: true },
  { id: 'borscht', name: 'Борщ', acc: 'борщ', color: '#b0243a', tags: ['sour', 'sweet'], unlock: 5, weird: true },
  { id: 'noodles', name: 'Доширак', acc: 'доширак', color: '#f2c14e', tags: ['spicy', 'sweet'], unlock: 5, weird: true },
  { id: 'protein', name: 'Протеин', acc: 'протеин', color: '#d9c7a8', tags: ['dessert', 'sweet'], unlock: 3, weird: true },
  // Секретный вкус: только за то, что угадал заказ собаки
  { id: 'dogjoy', name: 'Собачья радость', color: '#c9a36b', tags: ['sweet', 'dessert', 'fresh'], unlock: 99, secret: true },
];

export const flavorById = (id: string) => FLAVORS.find((f) => f.id === id)!;

export interface Combo {
  id: string;
  name: string;
  a: string;
  b: string;
}

const combo = (a: string, b: string, name: string): Combo => ({ id: [a, b].sort().join('+'), name, a, b });

export const COMBOS: Combo[] = [
  combo('watermelon', 'mint', 'Летний дворик'),
  combo('lemon', 'blueberry', 'Черничный лимонад'),
  combo('lemon', 'mint', 'Мохито-вайб'),
  combo('blueberry', 'vanilla', 'Черничный чизкейк'),
  combo('strawberry', 'vanilla', 'Клубника со сливками'),
  combo('grapefruit', 'mint', 'Холодный цитрус'),
  combo('watermelon', 'lemon', 'Арбузный фреш'),
  combo('cinnamon', 'caramel', 'Булочка с корицей'),
  combo('mango', 'kiwi', 'Тропики'),
  combo('kiwi', 'strawberry', 'Киви-клубника'),
  combo('mango', 'cardamom', 'Пряное манго'),
  combo('vanilla', 'caramel', 'Крем-брюле'),
  combo('cardamom', 'vanilla', 'Восточная сладость'),
  combo('grapefruit', 'strawberry', 'Розовый закат'),
  combo('blueberry', 'mint', 'Ледяная черника'),
  combo('cola', 'lemon', 'Кола с лимоном'),
  combo('bubblegum', 'mint', 'Ледяная жвачка'),
  combo('cola', 'cinnamon', 'Пряная кола'),
  combo('peach', 'mint', 'Персиковый чай'),
  combo('passionfruit', 'mango', 'Тропический шторм'),
  combo('coconut', 'vanilla', 'Кокосовый пломбир'),
  combo('doubleapple', 'mint', 'Классика двора'),
  combo('plov', 'zira', 'Ташкентский дворик'),
  combo('pickle', 'mint', 'Рассольный бриз'),
  combo('condensed', 'cola', 'Пионерский лагерь'),
  combo('borscht', 'condensed', 'Мамин обед'),
  combo('shawarma', 'pickle', 'Ночная шаурмичная'),
  combo('noodles', 'seeds', 'Общага'),
];

// Внешность персонажей — рисуются конструктором из src/art/Character.tsx
const LOOKS = {
  student: { skin: '#f2c9a0', hair: '#5a3a22', hairStyle: 'messy', shirt: '#4f8cff', top: 'hoodie', headphones: '#e2553a' },
  manager: { skin: '#e8b98f', hair: '#3a2a20', hairStyle: 'slick', shirt: '#3c4a63', top: 'suit', tie: '#c0392b', glasses: 'round', mood: 'neutral' },
  biker: { skin: '#d9a57a', hair: '#3a2416', hairStyle: 'bald', beard: 'full', shirt: '#2b2b2b', top: 'jacket', inner: '#8b1e1e', earring: true },
  blogger: { skin: '#f5d0b0', hair: '#e8b04a', hairStyle: 'long', shirt: '#ff7eb6', top: 'tee', lipstick: '#d94a6a', blush: true, mood: 'happy' },
  friends: [
    { skin: '#c98e64', hair: '#1f1410', hairStyle: 'curly', shirt: '#22b5a0', top: 'tee', mood: 'happy' },
    { skin: '#f2c9a0', hair: '#b5512b', hairStyle: 'bob', shirt: '#f2a93b', top: 'tee', blush: true },
  ],
  designer: { skin: '#efc39b', hair: '#d9653b', hairStyle: 'short', shirt: '#ffb020', top: 'tee', hat: 'beanie', hatColor: '#2f6f6a', glasses: 'round', beard: 'stubble' },
  taxi: { skin: '#c68b5e', hair: '#1f1410', hairStyle: 'short', beard: 'mustache', shirt: '#506070', top: 'jacket', inner: '#e8b730', hat: 'cap', hatColor: '#e8b730' },
  aunt: { skin: '#f0c4a0', hair: '#b9b4bf', hairStyle: 'bun', shirt: '#a9539c', top: 'tee', glasses: 'round', lipstick: '#b8334f', blush: true },
  surfer: { skin: '#d9a06b', hair: '#f0d27a', hairStyle: 'messy', shirt: '#2a9fd6', top: 'tee', glasses: 'sun', beard: 'stubble', mood: 'happy' },
  groom: { skin: '#efc39b', hair: '#3a2a20', hairStyle: 'slick', shirt: '#2a2a2a', top: 'suit', bowtie: true, mood: 'happy' },
  stranger: { skin: '#d8a77f', hair: '#1a1210', hairStyle: 'ponytail', shirt: '#1e1b2e', top: 'coat', hat: 'fedora', hatColor: '#2a2438', glasses: 'sun', beard: 'stubble', mood: 'neutral' },
  helper: { skin: '#f2c9a0', hair: '#7a4a2a', hairStyle: 'short', shirt: '#f2a93b', top: 'tee', hat: 'cap', hatColor: '#e2553a', blush: true },
  rapper: { skin: '#f0c9a8', hair: '#ff6fb5', hairStyle: 'messy', shirt: '#1d1d1d', top: 'hoodie', glasses: 'sun', chain: '#f2c14e', faceTattoo: true, earring: true, mood: 'happy' },
  major: { skin: '#f3cfae', hair: '#8a5a2b', hairStyle: 'slick', shirt: '#f7a8c8', top: 'jacket', inner: '#ffffff', chain: '#f2c14e', earring: true, blush: true, mood: 'neutral' },
  billionaire: { skin: '#ecc19c', hair: '#2b1d14', hairStyle: 'short', shirt: '#141414', top: 'tee', item: 'shaker', mood: 'smile' },
  altgirl: { skin: '#f3d5c0', hair: '#1a1414', hairStyle: 'bob', streak: '#ff4fa3', shirt: '#1d1d1d', top: 'tee', lipstick: '#5a1030', choker: true, earring: true, mood: 'neutral' },
  tiktoker: { skin: '#f2c9a0', hair: '#c9b8ff', hairStyle: 'messy', shirt: '#9fd8f0', top: 'hoodie', chain: '#d0d4dc', earring: true, blush: true, mood: 'happy' },
  vibecoder: { skin: '#f0c4a0', hair: '#3a2a20', hairStyle: 'bun', shirt: '#2d2f3a', top: 'hoodie', headphones: '#7c5cff', glasses: 'round', beard: 'stubble', mood: 'happy' },
  deputy: { skin: '#eab48e', hair: '#9b968f', hairStyle: 'bald', shirt: '#24324f', top: 'suit', tie: '#1f4fa8', glasses: 'round', pin: true, mood: 'smile' },
} satisfies Record<string, Look | Look[]>;

export interface GuestRequest {
  text: string;
  tags: Tag[];
  hint?: string; // для гостей, которые не говорят прямо (собака)
  needs?: string; // вкус, без которого гость микс не примет
}

export interface GuestType {
  id: string;
  name: string;
  look: Look | Look[]; // несколько — для компании
  base: number; // монеты за гостя до множителей
  unlock: number;
  requests: GuestRequest[];
  boss?: { intro: string; win: string; lose: string; clouds: number };
  dog?: boolean; // рисуется собакой, заказ угадывается по подсказке
  creature?: 'cheremsha'; // рисуется своим персонажем, а не конструктором людей
  weight?: number; // как часто заходит относительно остальных (по умолчанию 1)
}

export const GUESTS: GuestType[] = [
  {
    id: 'student', look: LOOKS.student, name: 'Студент Дима', base: 10, unlock: 1,
    requests: [
      { text: 'Что-то кислое и свежее', tags: ['sour', 'fresh'] },
      { text: 'Чтоб бодрило перед парой', tags: ['fresh'] },
      { text: 'Фруктовое, ничего сложного', tags: ['fruity'] },
      { text: 'Что-нибудь, чтобы забыть про сессию. Шучу. Нет. Кисленькое', tags: ['sour'] },
    ],
  },
  {
    id: 'manager', look: LOOKS.manager, name: 'Офисный Олег', base: 14, unlock: 1,
    requests: [
      { text: 'Сладкое, но не приторное', tags: ['sweet', 'fresh'] },
      { text: 'Как десерт после обеда', tags: ['dessert'] },
      { text: 'Спокойное, ягодное', tags: ['fruity', 'sweet'] },
      { text: 'Как пятница в 18:01. Сладко и свежо', tags: ['sweet', 'fresh'] },
      { text: 'Мне по KPI нужно что-то десертное к третьему кварталу', tags: ['dessert'] },
    ],
  },
  {
    id: 'biker', look: LOOKS.biker, name: 'Байкер Гена', base: 16, unlock: 2,
    requests: [
      { text: 'Пряное, с характером', tags: ['spicy'] },
      { text: 'Насыщенное, пряно-сладкое', tags: ['spicy', 'sweet'] },
      { text: 'Я суровый. Но… можно клубничку? Только никому', tags: ['fruity', 'sweet'] },
    ],
  },
  {
    id: 'blogger', look: LOOKS.blogger, name: 'Блогерша Ника', base: 18, unlock: 2,
    requests: [
      { text: 'Чтобы красиво и ягодно', tags: ['fruity', 'sweet'] },
      { text: 'Как летом на даче', tags: ['fruity', 'fresh'] },
      { text: 'Что-то десертное для сторис', tags: ['dessert', 'sweet'] },
      { text: 'Чтобы облако было эстетичное. Вкус? Ну пусть фруктовый, неважно', tags: ['fruity'] },
    ],
  },
  {
    id: 'friends', look: LOOKS.friends, name: 'Компания друзей', base: 24, unlock: 3,
    requests: [
      { text: 'Чтоб всем зашло: свежее и фруктовое', tags: ['fresh', 'fruity'] },
      { text: 'Кисло-сладкое, на компанию', tags: ['sour', 'sweet'] },
      { text: 'Мы полчаса спорили, что взять. Сделай свежее, пока опять не начали', tags: ['fresh'] },
    ],
  },
  {
    id: 'designer', look: LOOKS.designer, name: 'Дизайнер Артём', base: 20, unlock: 4,
    requests: [
      { text: 'Необычное: пряное и фруктовое', tags: ['spicy', 'fruity'] },
      { text: 'Десерт с пряностью', tags: ['dessert', 'spicy'] },
      { text: 'Сделай фруктовое, но чтобы чуть-чуть «повеселее». Ну ты понял', tags: ['fruity', 'sweet'] },
    ],
  },
  {
    id: 'taxi', look: LOOKS.taxi, name: 'Таксист Рустам', base: 15, unlock: 2,
    requests: [
      { text: 'Освежиться после смены', tags: ['fresh'] },
      { text: 'Что-нибудь цитрусовое, кисленькое', tags: ['sour', 'fruity'] },
      { text: 'Брат, сделай как в машине ёлочка висит. Ну, свежее', tags: ['fresh'] },
    ],
  },
  {
    id: 'aunt', look: LOOKS.aunt, name: 'Тётя Люда', base: 17, unlock: 3,
    requests: [
      { text: 'Сладенькое, как к чаю', tags: ['sweet', 'dessert'] },
      { text: 'Как бабушкин пирог с пряностями', tags: ['dessert', 'spicy'] },
      { text: 'Внук сказал, тут модно. Давай сладенькое, а то худая какая-то ты', tags: ['sweet'] },
    ],
  },
  {
    id: 'surfer', look: LOOKS.surfer, name: 'Серфер Влад', base: 19, unlock: 4,
    requests: [
      { text: 'Тропическое, как на Бали', tags: ['fruity', 'sweet', 'fresh'] },
      { text: 'Холодок и фрукты', tags: ['fresh', 'fruity'] },
      { text: 'Волны нет третий день. Утешь меня чем-нибудь тропическим', tags: ['fruity', 'sweet'] },
    ],
  },
  {
    id: 'groom', look: LOOKS.groom, name: 'Жених Паша', base: 26, unlock: 5,
    requests: [
      { text: 'На мальчишник: чтоб все ахнули', tags: ['sweet', 'sour', 'fresh'] },
      { text: 'Празднично и десертно', tags: ['dessert', 'fruity'] },
      { text: 'Невеста думает, что я на примерке костюма. Быстро что-нибудь свежее', tags: ['fresh'] },
    ],
  },
  {
    id: 'rapper', look: LOOKS.rapper, name: 'Рэпер Лил Дымок', base: 28, unlock: 3,
    requests: [
      { text: 'Йоу, бро, по-братски: сладенькое, как мой новый трек. Это база', tags: ['sweet'] },
      { text: 'Чтоб кислое, аж скулы свело. Чисто флекс, понимаешь?', tags: ['sour', 'fruity'] },
      { text: 'Давай свежак, ледяной, как мой флоу. Холодно-холодно, бро', tags: ['fresh'] },
      { text: 'Сделай, чтоб в клипе облако красиво легло. Десертненько, сладенько, кайф', tags: ['dessert', 'sweet'] },
    ],
  },
  {
    id: 'major', look: LOOKS.major, name: 'Мажор Арсений', base: 40, unlock: 4,
    requests: [
      { text: 'Мне самое дорогое. А, у вас всё одной цены? Тогда десертное', tags: ['dessert'] },
      { text: 'Папа сказал не тратить много. Сделай фруктовое, но чтобы выглядело дорого', tags: ['fruity', 'sweet'] },
      { text: 'Как в Дубае. Пряно и сладко. Я там был, мне можно', tags: ['spicy', 'sweet'] },
    ],
  },
  {
    id: 'deputy', look: LOOKS.deputy, name: 'Депутат Пётр Петрович', base: 35, unlock: 5,
    requests: [
      { text: 'Нужно что-то стабильное. Сладкое, без резких движений', tags: ['sweet', 'dessert'] },
      { text: 'Народу — фруктовое! И мне тоже, раз уж пришёл', tags: ['fruity'] },
      { text: 'Сделайте свежо. Это не для меня, это для отчёта', tags: ['fresh'] },
      { text: 'Предлагаю в первом чтении пряное, во втором — сладкое', tags: ['spicy', 'sweet'] },
    ],
  },
  // Пародийный образ: миллиардер-аскет в чёрном. Редкий гость, без протеина микс не примет
  {
    id: 'billionaire', look: LOOKS.billionaire, name: 'Миллиардер в чёрном', base: 50, unlock: 3, weight: 0.15,
    requests: [
      { text: 'Сладкое, но полезное — с протеином', tags: ['sweet'], needs: 'protein' },
      { text: 'Десерт с протеином. Мне за сорок, а выгляжу на двадцать пять — вот почему', tags: ['dessert'], needs: 'protein' },
      { text: 'Фруктовое с протеином. И отключите, пожалуйста, уведомления', tags: ['fruity', 'sweet'], needs: 'protein' },
      { text: 'С протеином. Остальное зашифруй на свой вкус', tags: ['sweet'], needs: 'protein' },
    ],
  },
  {
    id: 'cheremsha', look: LOOKS.helper /* не используется: рисуется Cheremsha */, name: 'Черемша', base: 22, unlock: 3, creature: 'cheremsha',
    requests: [
      { text: 'Тихо, не спеша… Сладенькое, как сгущёнка после смены на заводе', tags: ['sweet', 'dessert'] },
      { text: 'Тихо, спокойно, без суеты. Что-нибудь свежее', tags: ['fresh'] },
      { text: 'Как в Советском Союзе: вкусно и по ГОСТу. Фруктовое', tags: ['fruity'] },
    ],
  },
  {
    id: 'altgirl', look: LOOKS.altgirl, name: 'Альтушка с Китай-города', base: 20, unlock: 2,
    requests: [
      { text: 'Что-нибудь тёмное и пряное. Как моя душа', tags: ['spicy'] },
      { text: 'Кислое. Я не такая, как все', tags: ['sour'] },
      { text: 'Только не мейнстрим. Ну ладно, давай ягодное', tags: ['fruity', 'sweet'] },
      { text: 'Встретимся на Китай-городе? А, я уже тут. Десертное', tags: ['dessert'] },
    ],
  },
  {
    id: 'tiktoker', look: LOOKS.tiktoker, name: 'Тиктокер Даня', base: 24, unlock: 4,
    requests: [
      { text: 'Сделай сладенькое, пока я снимаю тренд', tags: ['sweet'] },
      { text: 'Что-нибудь фруктовое, чтобы залетело в реки', tags: ['fruity'] },
      { text: 'Свежак, чтобы облако на видео красиво легло', tags: ['fresh'] },
      { text: 'Ща станцую, а ты пока замути десертное', tags: ['dessert', 'sweet'] },
    ],
  },
  // Вайбкодер всегда заказывает «Тропики 8» — манго с киви (сочетание «Тропики») попадает идеально
  {
    id: 'vibecoder', look: LOOKS.vibecoder, name: 'Вайбкодер Максим', base: 22, unlock: 4,
    requests: [
      { text: 'Тропики 8, пожалуйста', tags: ['fruity', 'sweet', 'fresh'] },
      { text: 'Тропики 8. Промпт: манго, киви, без багов', tags: ['fruity', 'sweet', 'fresh'] },
      { text: 'Сделай Тропики 8. Не выйдет — откатимся на Тропики 7', tags: ['fruity', 'sweet', 'fresh'] },
      { text: 'Тропики 8, только чтобы с первого раза. Я сам не умею, я только описываю', tags: ['fruity', 'sweet', 'fresh'] },
    ],
  },
];

// Собака: лает, а что хочет — угадывай по подсказке. Угадал — секретный вкус
export const DOG: GuestType = {
  id: 'dog', look: LOOKS.helper /* не используется: рисуется Dog */, name: 'Бигль Руби', base: 8, unlock: 2, dog: true,
  requests: [
    { text: 'Гав! Гав-гав!', tags: ['sweet', 'dessert'], hint: 'Облизывается, когда ты проходишь мимо ванили' },
    { text: 'Ррр… Гав!', tags: ['fresh'], hint: 'Язык наружу, тяжело дышит — жарко' },
    { text: 'Гав? Гав-гав-гав!', tags: ['fruity', 'sweet'], hint: 'Виляет хвостом, глядя на ягоды' },
    { text: 'Ауууу! Гав!', tags: ['sour'], hint: 'Чихает от лимона… и снова к нему тянется' },
  ],
};
export const DOG_CHANCE = 0.12; // шанс, что очередным гостем зайдёт собака
export const DOG_GUESS = 0.75; // насколько точным должен быть микс, чтобы угадать

// Мини-босс: приходит без очереди раз в несколько гостей, начиная с 3-го уровня
export const BOSS: GuestType = {
  id: 'stranger', look: LOOKS.stranger, name: 'Таинственный незнакомец', base: 60, unlock: 3,
  requests: [
    { text: 'Арабский кальян. Настоящий: пряный, сладкий, как восточный десерт.', tags: ['spicy', 'sweet', 'dessert'] },
  ],
  boss: {
    intro: 'Говорят, он обошёл все кальянные города и нигде не остался доволен. Чаша будет капризной, а жар — злым.',
    win: 'Он молча кивает, оставляет щедрые чаевые и растворяется в дыму…',
    lose: '«Хм. Не то». Он уходит, но обещает вернуться.',
    clouds: 10,
  },
};
export const BOSS_EVERY = 8; // гостей между визитами

/**
 * Сложность 0..1 растёт с уровнем игрока плавно, к 13-му уровню выходит на максимум.
 * Босс добавляет сверху, поэтому значение может быть больше 1.
 */
export const difficulty = (level: number, boss = false) => Math.min(1, (level - 1) / 12) + (boss ? 0.35 : 0);

// ---------- Заведения ----------
// Игрок копит на переезд: старое заведение заменяется новым, интерьер начинается заново,
// а оборудование, вкусы, рецепты и фирменные миксы остаются.

export type LocationId = 'yard' | 'lounge';

export interface Location {
  id: LocationId;
  name: string;
  sign: string; // надпись на вывеске
  payMult: number; // во сколько раз гости платят больше
  difficultyBonus: number; // насколько капризнее заказы
  interiorLevels: string[]; // названия уровней интерьера 1..5 в этом заведении
  move?: { cost: number; level: number }; // условия переезда сюда (интерьер прошлого — на максимуме)
}

export const LOCATIONS: Location[] = [
  {
    id: 'yard', name: 'Дымный дворик', sign: 'Дымный дворик', payMult: 1, difficultyBonus: 0,
    interiorLevels: ['Лавочка', 'Пуфы', 'Гирлянды', 'Диваны', 'Вывеска и музыка'],
  },
  {
    id: 'lounge', name: 'Лаунж', sign: 'Dvorik Lounge', payMult: 1.6, difficultyBonus: 0.1,
    interiorLevels: ['Неоновая подсветка', 'Бар с подсветкой', 'Бархатные диваны', 'VIP-зона', 'Диджей-пульт'],
    move: { cost: 2500, level: 8 },
  },
];

export const locationById = (id: LocationId) => LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0];
export const nextLocation = (id: LocationId) => LOCATIONS[LOCATIONS.findIndex((l) => l.id === id) + 1];

export type UpgradeId = 'storage' | 'bowl' | 'kalaud' | 'flask' | 'interior';

export interface Upgrade {
  id: UpgradeId;
  name: string;
  icon: string;
  baseCost: number;
  levels: string[]; // названия уровней 1..5
  effect: (lvl: number) => string;
}

export const MAX_UPGRADE = 5;

export const UPGRADES: Upgrade[] = [
  {
    id: 'storage', icon: 'box', name: 'Склад вкусов', baseCost: 30,
    levels: ['Полка', 'Стеллаж', 'Шкаф', 'Кладовка', 'Склад'],
    effect: (l) => `${mixSlots(l)} вкуса в миксе` + (l > 2 ? `, +${(l - 2) * 3}% к миксу` : ''),
  },
  {
    id: 'bowl', icon: 'bowl', name: 'Чаши', baseCost: 45,
    levels: ['Глиняная', 'Обожжённая', 'Фанел', 'Керамика', 'Фирменная'],
    effect: (l) => `Зелёная зона забивки шире на ${l * 3}%`,
  },
  {
    id: 'kalaud', icon: 'kalaud', name: 'Калауды', baseCost: 45,
    levels: ['Простой', 'С крышкой', 'С заслонкой', 'С регулировкой', 'Мастерский'],
    effect: (l) => `Жар скачет на ${Math.round((1 - windFactor(l)) * 100)}% меньше`,
  },
  {
    id: 'flask', icon: 'flask', name: 'Колбы и шахты', baseCost: 70,
    levels: ['Стекло', 'Толстое стекло', 'Цветное', 'Хрусталь', 'Авторская'],
    effect: (l) => `+${l * 8}% к чаевым и оплате`,
  },
  {
    id: 'interior', icon: 'sofa', name: 'Интерьер', baseCost: 90,
    levels: ['Лавочка', 'Пуфы', 'Гирлянды', 'Диваны', 'Вывеска и музыка'],
    effect: (l) => `+${l * 10}% к чеку, ${seats(l)} ${seats(l) < 5 ? 'места' : 'мест'} в очереди`,
  },
];

export const upgradeCost = (u: Upgrade, lvl: number) => Math.round(u.baseCost * Math.pow(1.22, lvl));

// Эффекты улучшений
export const mixSlots = (storageLvl: number) => Math.min(3, 1 + storageLvl);
export const mixBonus = (storageLvl: number) => Math.max(0, storageLvl - 2) * 0.03;
export const packZone = (bowlLvl: number, d: number) => 16 - 7 * d + bowlLvl * 3;
// Калауд гасит ветер умеренно: максимум −30% на пятом уровне, мастерство всё равно нужно
export const windFactor = (kalaudLvl: number) => 1 - kalaudLvl * 0.06;
export const flaskMult = (flaskLvl: number) => 1 + flaskLvl * 0.08;
export const interiorMult = (interiorLvl: number) => 1 + interiorLvl * 0.1;
export const seats = (interiorLvl: number) => 2 + interiorLvl;

// Помощник
export const HELPER = { name: 'Саня-новичок', look: LOOKS.helper, hireCost: 120, ratePerHour: 60, capHours: 8 };
export const helperUpCost = (lvl: number) => Math.round(HELPER.hireCost * Math.pow(1.5, lvl));

// Уровни игрока
export const xpToNext = (level: number) => 40 + 25 * (level - 1);
