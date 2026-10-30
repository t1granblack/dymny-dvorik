// Звук игры целиком синтезируется Web Audio: ни одного файла, первая загрузка не растёт.
// Браузеры разрешают звук только после касания экрана, поэтому контекст создаётся на первом тапе.

interface AudioPrefs {
  sfx: boolean;
  music: boolean;
}

const PREFS_KEY = 'dymny-dvorik-audio';

function loadPrefs(): AudioPrefs {
  try {
    return { sfx: true, music: true, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') };
  } catch {
    return { sfx: true, music: true };
  }
}

let prefs = loadPrefs();
let ctx: AudioContext | null = null;
let sfxBus: GainNode;
let musicBus: GainNode;
let noiseBuf: AudioBuffer;

function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // настройки звука не критичны
  }
}

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = prefs.sfx ? 1 : 0;
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = prefs.music ? 0.22 : 0;
  musicBus.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

/** Вызывается один раз при старте: звук включится на первом касании */
export function initAudio() {
  const unlock = () => {
    const c = ensure();
    c?.resume();
    if (prefs.music) startMusic();
    document.removeEventListener('pointerdown', unlock);
  };
  document.addEventListener('pointerdown', unlock);
  // Свернули приложение — музыку на паузу
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.visibilityState === 'hidden') ctx.suspend();
    else ctx.resume();
  });
}

// ---------- Примитивы ----------

interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  at?: number; // задержка, с
  slide?: number; // к какой частоте съехать
  attack?: number;
  bus?: GainNode;
}

function tone(freq: number, dur: number, o: ToneOpts = {}) {
  const c = ensure();
  if (!c || !prefs.sfx && (o.bus ?? sfxBus) === sfxBus) return;
  const t = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t);
  if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
  const vol = o.vol ?? 0.2;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + (o.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(o.bus ?? sfxBus);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(dur: number, freq: number, o: { vol?: number; at?: number; q?: number; type?: BiquadFilterType; bus?: GainNode } = {}) {
  const c = ensure();
  if (!c || !prefs.sfx && (o.bus ?? sfxBus) === sfxBus) return;
  const t = c.currentTime + (o.at ?? 0);
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.value = freq;
  f.Q.value = o.q ?? 1;
  const g = c.createGain();
  g.gain.setValueAtTime(o.vol ?? 0.2, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(o.bus ?? sfxBus);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

// ---------- Эффекты ----------

export const sfx = {
  click: () => tone(520, 0.06, { type: 'triangle', vol: 0.08 }),
  /** Щепотка микса в чашу: чем больше насыпал, тем гуще шорох */
  sprinkle: (amount: number) => noise(0.08 + amount * 0.012, 2500 + Math.random() * 1500, { vol: 0.05 + amount * 0.012, q: 0.8 }),
  loosen: () => noise(0.12, 900, { vol: 0.08, type: 'lowpass' }),
  zoneHit: () => tone(880, 0.12, { type: 'sine', vol: 0.12, slide: 1175 }),
  coalOn: () => {
    noise(0.5, 3000, { vol: 0.12, type: 'highpass' });
    tone(140, 0.12, { type: 'triangle', vol: 0.12 });
  },
  blow: () => {
    noise(0.35, 700, { vol: 0.14, type: 'lowpass' });
    noise(0.25, 3500, { vol: 0.06, type: 'highpass', at: 0.1 });
  },
  coalOff: () => tone(300, 0.1, { type: 'triangle', vol: 0.1, slide: 200 }),
  lid: () => {
    tone(1400, 0.08, { type: 'square', vol: 0.04 });
    tone(2100, 0.1, { type: 'triangle', vol: 0.05, at: 0.02 });
  },
  /** Бульк колбы: короткий «пузырь» со скольжением частоты */
  bubble: () => {
    const f = 180 + Math.random() * 160;
    tone(f, 0.09, { type: 'sine', vol: 0.12, slide: f * 2.2, attack: 0.005 });
  },
  star: (n: number) => tone([660, 880, 1175][n] ?? 1175, 0.35, { type: 'triangle', vol: 0.14 }),
  coins: () => [0, 0.07, 0.14].forEach((at, i) => tone(1500 + i * 300, 0.12, { type: 'square', vol: 0.035, at })),
  levelUp: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.13, at: i * 0.1 })),
  fail: () => tone(330, 0.4, { type: 'triangle', vol: 0.12, slide: 180 }),
  doorbell: () => {
    tone(1318, 0.5, { type: 'sine', vol: 0.08 });
    tone(1046, 0.7, { type: 'sine', vol: 0.08, at: 0.18 });
  },
  boss: () => [110, 116.5, 98].forEach((f, i) => tone(f, 1.4, { type: 'sawtooth', vol: 0.05, at: i * 0.25, attack: 0.2 })),
  bark: () =>
    [0, 0.22].forEach((at) => {
      tone(420, 0.12, { type: 'sawtooth', vol: 0.08, slide: 260, at });
      noise(0.1, 900, { vol: 0.1, at });
    }),
  whine: () => tone(900, 0.6, { type: 'sine', vol: 0.06, slide: 500 }),
  buy: () => {
    tone(784, 0.1, { type: 'triangle', vol: 0.1 });
    tone(1175, 0.18, { type: 'triangle', vol: 0.1, at: 0.08 });
  },
};

// ---------- Фоновая музыка ----------
// Неспешный лоу-фай: аккорды Cmaj7 → Am7 → Dm7 → G7, мягкий бас, бочка и шорох тарелки.

const CHORDS = [
  [261.6, 329.6, 392.0, 493.9],
  [220.0, 261.6, 329.6, 392.0],
  [293.7, 349.2, 440.0, 523.3],
  [196.0, 246.9, 293.7, 349.2],
];
const BPM = 76;
let musicTimer: number | null = null;
let nextBeat = 0;
let beat = 0;

function scheduleBeat(t: number, b: number) {
  const c = ctx!;
  const at = t - c.currentTime;
  const chord = CHORDS[Math.floor(b / 4) % CHORDS.length];
  if (b % 4 === 0) {
    chord.forEach((f) => tone(f, (60 / BPM) * 4, { type: 'triangle', vol: 0.05, at, attack: 0.3, bus: musicBus }));
    tone(chord[0] / 2, (60 / BPM) * 2, { type: 'sine', vol: 0.18, at, bus: musicBus });
  }
  if (b % 4 === 2) tone(chord[2] / 2, (60 / BPM) * 1.5, { type: 'sine', vol: 0.14, at, bus: musicBus });
  if (b % 2 === 0) tone(110, 0.25, { type: 'sine', vol: 0.35, slide: 45, at, bus: musicBus });
  noise(0.05, 7000, { vol: b % 2 ? 0.05 : 0.025, at: at + (60 / BPM) * 0.5, type: 'highpass', bus: musicBus });
  // иногда — нотка мелодии сверху
  if (Math.random() < 0.35) tone(chord[Math.floor(Math.random() * 4)] * 2, 0.5, { type: 'sine', vol: 0.04, at: at + 0.2, attack: 0.05, bus: musicBus });
}

function startMusic() {
  const c = ensure();
  if (!c || musicTimer !== null) return;
  nextBeat = c.currentTime + 0.1;
  musicTimer = window.setInterval(() => {
    while (nextBeat < c.currentTime + 0.3) {
      scheduleBeat(nextBeat, beat++);
      nextBeat += 60 / BPM;
    }
  }, 100);
}

function stopMusic() {
  if (musicTimer !== null) clearInterval(musicTimer);
  musicTimer = null;
}

// ---------- Настройки ----------

export const audioPrefs = () => prefs;

export function setSfx(on: boolean) {
  prefs = { ...prefs, sfx: on };
  savePrefs();
  if (ctx) sfxBus.gain.value = on ? 1 : 0;
}

export function setMusic(on: boolean) {
  prefs = { ...prefs, music: on };
  savePrefs();
  if (!ctx) return;
  musicBus.gain.value = on ? 0.22 : 0;
  if (on) startMusic();
  else stopMusic();
}
