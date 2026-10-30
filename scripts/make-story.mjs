// Рисует картинку для историй Telegram (1080×1920) и сохраняет её в public/stories.
// Запуск: npm run story. Результат коммитится — на сборку и CI этот скрипт не влияет.
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';

const INK = '#120b09';
const font = "'Segoe UI', 'Arial', sans-serif";

const star = (cx, cy, r) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  });
  return `<polygon points="${pts.join(' ')}" fill="#ffc93a" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>`;
};

// Облако: сначала толстые тёмные круги (общий контур), поверх — светлые без обводки, чтобы не было швов
const PUFFS = [[540, 640, 170], [400, 700, 130], [690, 700, 140], [470, 520, 120], [630, 540, 130], [540, 420, 110], [360, 590, 90], [740, 600, 95]];
const puffs =
  PUFFS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 10}" fill="${INK}"/>`).join('') +
  PUFFS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f4ecff"/>`).join('') +
  `<path d="M430,520 Q470,470 520,480 M600,600 Q650,560 700,580" fill="none" stroke="#d9ccff" stroke-width="14" stroke-linecap="round"/>`;

// Точечный фон как в игре: ровная сетка
const dots = Array.from({ length: 12 * 22 }, (_, i) => {
  const x = 45 + (i % 12) * 90;
  const y = 45 + Math.floor(i / 12) * 90;
  return `<circle cx="${x}" cy="${y}" r="4" fill="#ffffff12"/>`;
}).join('');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <rect width="1080" height="1920" fill="#2a1d1a"/>
  ${dots}
  <g transform="rotate(-3 540 210)">
    <rect x="100" y="140" width="880" height="140" rx="24" fill="#2a1610" stroke="${INK}" stroke-width="12"/>
    <text x="540" y="236" text-anchor="middle" font-family="${font}" font-weight="800" font-size="76" fill="#ffcf6b">Дымный дворик</text>
  </g>

  ${puffs}

  <!-- кальян -->
  <g stroke="${INK}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round">
    <path d="M470,860 L610,860 L580,930 L500,930 Z" fill="#b8693f"/>
    <ellipse cx="540" cy="860" rx="70" ry="18" fill="#3b2418"/>
    <rect x="512" y="930" width="56" height="320" rx="10" fill="#9aa1ad"/>
    <rect x="470" y="1100" width="140" height="26" rx="8" fill="#7c838f"/>
    <path d="M500,1250 L580,1250 L590,1300 C700,1340 740,1440 700,1540 C670,1620 410,1620 380,1540 C340,1440 380,1340 490,1300 Z" fill="#7fd0e8"/>
    <path d="M392,1480 C460,1440 620,1520 690,1470 C700,1560 640,1600 540,1600 C440,1600 380,1560 392,1480 Z" fill="#4aa6c4" stroke="none"/>
    <path d="M568,1180 C760,1190 830,1300 800,1440" fill="none" stroke-width="24"/>
    <path d="M568,1180 C760,1190 830,1300 800,1440" fill="none" stroke="#e2553a" stroke-width="10"/>
    <rect x="780" y="1430" width="40" height="60" rx="10" fill="#c48a5e"/>
  </g>
  <circle cx="505" cy="845" r="16" fill="#ff7a2d" stroke="${INK}" stroke-width="6"/>
  <circle cx="575" cy="845" r="16" fill="#ff7a2d" stroke="${INK}" stroke-width="6"/>

  ${star(330, 1745, 70)}${star(540, 1725, 88)}${star(750, 1745, 70)}

  <text x="540" y="1885" text-anchor="middle" font-family="${font}" font-weight="700" font-size="52" fill="#fbefdf">Шедевр на 3 звезды</text>
</svg>`;

mkdirSync('public/stories', { recursive: true });
const png = new Resvg(svg, { font: { loadSystemFonts: true }, fitTo: { mode: 'width', value: 1080 } }).render().asPng();
writeFileSync('public/stories/three-stars.png', png);
console.log(`public/stories/three-stars.png — ${Math.round(png.length / 1024)} КБ`);
