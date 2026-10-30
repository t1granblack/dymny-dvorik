// Аватарка бота (640×640) и обложка Mini App (640×360) для загрузки в @BotFather.
// Запуск: node scripts/make-brand.mjs → папка brand/. В игру эти файлы не попадают.
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';

const INK = '#120b09';
const font = "'Segoe UI', 'Arial', sans-serif";
const ink = `stroke="${INK}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"`;

// Облако с общим контуром: тёмные круги побольше, поверх светлые
const cloud = (puffs, color = '#f4ecff') =>
  puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 9}" fill="${INK}"/>`).join('') +
  puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join('');

// Кальян: x — центр, y — верх чаши, s — масштаб
const hookah = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})" ${ink}>
    <path d="M-70,0 L70,0 L40,70 L-40,70 Z" fill="#b8693f"/>
    <ellipse cx="0" cy="0" rx="70" ry="18" fill="#3b2418"/>
    <rect x="-28" y="70" width="56" height="300" rx="10" fill="#9aa1ad"/>
    <rect x="-70" y="230" width="140" height="26" rx="8" fill="#7c838f"/>
    <path d="M-40,370 L40,370 L50,420 C160,460 200,560 160,660 C130,740 -130,740 -160,660 C-200,560 -160,460 -50,420 Z" fill="#7fd0e8"/>
    <path d="M-148,600 C-80,560 80,640 150,590 C160,680 100,720 0,720 C-100,720 -160,680 -148,600 Z" fill="#4aa6c4" stroke="none"/>
    <path d="M28,300 C220,310 290,420 260,560" fill="none" stroke-width="24"/>
    <path d="M28,300 C220,310 290,420 260,560" fill="none" stroke="#e2553a" stroke-width="10"/>
  </g>
  <circle cx="${x - 35 * s}" cy="${y - 15 * s}" r="${16 * s}" fill="#ff7a2d" stroke="${INK}" stroke-width="${6 * s}"/>
  <circle cx="${x + 35 * s}" cy="${y - 15 * s}" r="${16 * s}" fill="#ff7a2d" stroke="${INK}" stroke-width="${6 * s}"/>`;

const dots = (w, h, step) =>
  Array.from({ length: Math.ceil(w / step) * Math.ceil(h / step) }, (_, i) => {
    const cols = Math.ceil(w / step);
    return `<circle cx="${step / 2 + (i % cols) * step}" cy="${step / 2 + Math.floor(i / cols) * step}" r="3" fill="#ffffff12"/>`;
  }).join('');

// Аватарка: круглая (Telegram обрезает по кругу), кальян с облаком по центру
const avatar = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <rect width="640" height="640" fill="#2a1d1a"/>
  <circle cx="320" cy="320" r="300" fill="#3d2a24"/>
  ${dots(640, 640, 40)}
  ${cloud([[320, 190, 95], [230, 215, 70], [410, 215, 75], [270, 140, 60], [370, 140, 65], [320, 110, 55]])}
  ${hookah(320, 300, 0.42)}
</svg>`;

// Обложка Mini App 640×360: вывеска слева, кальян справа
const cover = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#2a1d1a"/>
  ${dots(640, 360, 36)}
  <g transform="rotate(-3 200 120)">
    <rect x="24" y="82" width="372" height="80" rx="16" fill="#2a1610" stroke="${INK}" stroke-width="8"/>
    <text x="210" y="136" text-anchor="middle" font-family="${font}" font-weight="800" font-size="38" fill="#ffcf6b">Дымный дворик</text>
  </g>
  <text x="210" y="225" text-anchor="middle" font-family="${font}" font-weight="700" font-size="24" fill="#fbefdf">Мультяшная кальянная</text>
  <text x="210" y="258" text-anchor="middle" font-family="${font}" font-size="19" fill="#c8b29c">собирай миксы · радуй гостей · 18+</text>
  ${cloud([[530, 110, 54], [480, 126, 40], [580, 128, 42], [510, 82, 36], [555, 80, 38]])}
  ${hookah(530, 168, 0.24)}
</svg>`;

mkdirSync('brand', { recursive: true });
for (const [name, svg] of [['avatar', avatar], ['cover', cover]]) {
  const png = new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng();
  writeFileSync(`brand/${name}.png`, png);
  console.log(`brand/${name}.png — ${Math.round(png.length / 1024)} КБ`);
}
