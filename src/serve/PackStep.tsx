import { useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { clamp01 } from '../game/state';
import { packZone } from '../game/data';
import { haptic } from '../game/telegram';
import { sfx } from '../game/sound';

interface Props {
  bowlLvl: number;
  difficulty: number;
  colors: string[];
  tutorial: boolean;
  onDone: (score: number) => void;
}

// Радиус углубления чаши в % от её ширины (совпадает с фоном .bowl в CSS)
const BOWL_R = 41;
// Чаша делится на 7 участков: центр и 6 секторов по кругу. Микс надо распределить по всем
const CENTER_R = 0.4; // доля радиуса, которую занимает центральный участок
const SECTORS = 6;
const CELLS = SECTORS + 1;

// Кусочек микса — изогнутый лепесток со своим размером, поворотом и оттенком
interface Grain {
  x: number;
  y: number;
  c: string;
  w: number;
  h: number;
  rot: number;
  shade: number;
}

/** В какой участок попал тап: 0 — центр, 1..6 — секторы */
function cellAt(x: number, y: number) {
  const r = Math.hypot(x - 50, y - 50) / BOWL_R;
  if (r < CENTER_R) return 0;
  const angle = Math.atan2(y - 50, x - 50) + Math.PI; // 0..2π
  return (Math.floor(angle / ((2 * Math.PI) / SECTORS)) % SECTORS) + 1;
}

/** Насыпанное в участок немного ссыпается к соседям */
function spread(cell: number): number[] {
  const w = new Array(CELLS).fill(0);
  if (cell === 0) {
    w[0] = 0.4;
    for (let i = 1; i < CELLS; i++) w[i] = 0.1;
  } else {
    w[cell] = 0.7;
    w[((cell - 2 + SECTORS) % SECTORS) + 1] = 0.1;
    w[(cell % SECTORS) + 1] = 0.1;
    w[0] = 0.1;
  }
  return w;
}

/** Контур сектора для подсветки в SVG 100×100 */
function sectorPath(i: number) {
  const ri = BOWL_R * CENTER_R;
  const ro = BOWL_R;
  const a0 = -Math.PI + (i * 2 * Math.PI) / SECTORS;
  const a1 = a0 + (2 * Math.PI) / SECTORS;
  const p = (r: number, a: number) => `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(ri, a0)} L${p(ro, a0)} A${ro},${ro} 0 0 1 ${p(ro, a1)} L${p(ri, a1)} A${ri},${ri} 0 0 0 ${p(ri, a0)} Z`;
}

export default function PackStep({ bowlLvl, difficulty: d, colors, tutorial, onDone }: Props) {
  const width = packZone(bowlLvl, d);
  const center = useMemo(() => 55 + Math.random() * 15, []);
  const lo = center - width / 2;
  const hi = center + width / 2;
  const [cells, setCells] = useState<number[]>(() => new Array(CELLS).fill(0));
  const [grains, setGrains] = useState<Grain[]>([]);
  const wasIn = useRef(false);
  const [lastTap, setLastTap] = useState<{ x: number; y: number; amount: number; id: number } | null>(null);

  // Общая плотность — среднее по участкам; равномерность — насколько участки похожи друг на друга
  const density = Math.min(100, cells.reduce((s, c) => s + c, 0) / CELLS);
  const evenness = useMemo(() => {
    if (density < 1) return 1;
    const sd = Math.sqrt(cells.reduce((s, c) => s + (c - density) ** 2, 0) / CELLS);
    const tolerance = 0.6 - 0.25 * Math.min(1, d); // с уровнем требования к равномерности строже
    return clamp01(1 - sd / density / tolerance);
  }, [cells, density, d]);

  const apply = (next: number[]) => {
    setCells(next);
    const dens = next.reduce((s, c) => s + c, 0) / CELLS;
    const inZone = dens >= lo && dens <= hi;
    if (inZone && !wasIn.current) {
      haptic.hit();
      sfx.zoneHit();
    } else haptic.tap();
    wasIn.current = inZone;
  };

  const sprinkle = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * 100;
    const cy = ((e.clientY - rect.top) / rect.height) * 100;
    const r = Math.hypot(cx - 50, cy - 50) / BOWL_R;
    if (r > 1.15) return; // мимо чаши
    const amount = 3 + Math.random() * 2;
    setLastTap({ x: cx, y: cy, amount, id: Date.now() });
    const add = Array.from({ length: 3 }, () => ({
      x: cx + (Math.random() - 0.5) * 18,
      y: cy + (Math.random() - 0.5) * 18,
      c: colors[Math.floor(Math.random() * colors.length)],
      w: 18 + Math.random() * 14,
      h: 9 + Math.random() * 6,
      rot: Math.random() * 360,
      shade: 0.7 + Math.random() * 0.5,
    })).filter((g) => Math.hypot(g.x - 50, g.y - 50) < BOWL_R - 2);
    setGrains((g) => [...g, ...add].slice(-260));
    sfx.sprinkle(amount);
    const w = spread(cellAt(cx, cy));
    apply(cells.map((c, i) => Math.min(140, c + amount * CELLS * w[i])));
  };

  const loosen = () => {
    sfx.loosen();
    setGrains((g) => g.slice(0, Math.max(0, g.length - 10)));
    const minus = 2 + Math.random() * 2;
    apply(cells.map((c) => Math.max(0, c - minus)));
  };

  const score = () => {
    const dens = density >= lo && density <= hi
      ? clamp01(1 - (0.3 * Math.abs(density - center)) / (width / 2))
      : clamp01(0.65 - (density < lo ? lo - density : density - hi) / 20);
    return dens * (0.4 + 0.6 * evenness);
  };

  // Участки, где заметно меньше среднего, подсвечиваем: «сюда досыпь»
  const thin = cells.map((c) => density > 8 && c < density * 0.8);
  const status = density < lo ? 'Недобил' : density > hi ? 'Перебил' : 'Плотность в норме';
  const evenText = evenness >= 0.8 ? 'равномерно' : evenness >= 0.5 ? 'есть пустоты' : 'всё в одной куче';

  return (
    <div className="pack">
      {tutorial && (
        <p className="hint">
          Тапай по всей чаше, чтобы микс лёг равномерно, — подсвеченные места пустые, досыпь туда. Останавливайся, когда стрелка в зелёной зоне.
        </p>
      )}
      <div className="pack-row">
        <div className="bowl" onPointerDown={sprinkle}>
          {grains.map((g, i) => (
            <i
              key={i}
              style={{
                left: `${g.x}%`,
                top: `${g.y}%`,
                width: g.w,
                height: g.h,
                '--c': g.c,
                transform: `translate(-50%, -50%) rotate(${g.rot}deg)`,
                filter: `brightness(${g.shade})`,
              } as CSSProperties}
            />
          ))}
          <svg className="bowl-cells" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx={50} cy={50} r={BOWL_R * CENTER_R} className={thin[0] ? 'thin' : ''} />
            {Array.from({ length: SECTORS }, (_, i) => (
              <path key={i} d={sectorPath(i)} className={thin[i + 1] ? 'thin' : ''} />
            ))}
          </svg>
          {lastTap && (
            <span key={lastTap.id} className="tap-pop" style={{ left: `${lastTap.x}%`, top: `${lastTap.y}%` }}>
              +{lastTap.amount.toFixed(1)}
            </span>
          )}
        </div>
        <div className="meter vertical">
          <div className="zone" style={{ bottom: `${lo}%`, height: `${width}%` }} />
          <div className="needle" style={{ bottom: `${density}%` }} />
        </div>
      </div>
      <div className={'status ' + (density >= lo && density <= hi && evenness >= 0.8 ? 'good' : '')}>
        {density === 0 ? 'Чаша пустая' : `${status} · ${Math.round(density)}% · ${evenText}`}
      </div>
      <div className="even-bar" title="Равномерность">
        <span>Равномерность</span>
        <div><i style={{ width: `${Math.round(evenness * 100)}%` }} /></div>
      </div>
      <div className="actions">
        <button className="btn" onClick={loosen} disabled={density === 0}>Разрыхлить</button>
        <button className="btn primary big grow" disabled={density === 0} onClick={() => onDone(score())}>
          Ставить угли
        </button>
      </div>
    </div>
  );
}
