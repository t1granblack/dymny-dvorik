import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { clamp01 } from '../game/state';
import { windFactor } from '../game/data';
import { haptic } from '../game/telegram';
import { sfx } from '../game/sound';

interface Props {
  kalaudLvl: number;
  difficulty: number;
  boss: boolean;
  tutorial: boolean;
  onDone: (score: number) => void;
}

const GRACE = 3; // первые секунды чаша разогревается и не оцениваются
const HEAT_PER_COAL = 20;
const LID_COOLING = 12;

export default function HeatStep({ kalaudLvl, difficulty: d, boss, tutorial, onDone }: Props) {
  // Всё, что усложняется с уровнем: ширина зоны, сила ветра, прогорание углей
  const DURATION = boss ? 20 : 15;
  const LO = 62 - (20 - 6 * d) / 2;
  const HI = 62 + (20 - 6 * d) / 2;
  const BURN_RATE = 0.016 * Math.min(1, d); // к концу заметно слабеют только на поздних уровнях
  const [started, setStarted] = useState(false);
  const [coals, setCoals] = useState(3);
  const [lidOpen, setLidOpen] = useState(false);
  const [view, setView] = useState({ temp: 25, t: 0, inZone: 0 });
  // Симуляция живёт в ref, чтобы интервал не пересоздавался на каждый клик
  const sim = useRef({ temp: 25, wind: 0, t: 0, inZone: 0, coals: 3, lidOpen: false, wasIn: false });
  sim.current.coals = coals;
  sim.current.lidOpen = lidOpen;

  useEffect(() => {
    if (!started) return;
    const amp = windFactor(kalaudLvl) * (0.55 + 0.45 * d);
    const gustChance = 0.008 + 0.017 * d;
    const dt = 0.1;
    const id = setInterval(() => {
      const s = sim.current;
      // Ветер — случайное блуждание, иногда резкий порыв
      s.wind += (Math.random() - 0.5) * 6.5 * amp;
      if (Math.random() < gustChance) s.wind += (Math.random() < 0.5 ? -1 : 1) * 14 * amp;
      s.wind = Math.max(-25 * amp, Math.min(25 * amp, s.wind));
      const burn = 1 - BURN_RATE * s.t;
      const target = s.coals * HEAT_PER_COAL * burn - (s.lidOpen ? LID_COOLING : 0) + s.wind;
      s.temp += (target - s.temp) * 0.9 * dt;
      s.t += dt;
      const inZone = s.temp >= LO && s.temp <= HI;
      if (s.t > GRACE) {
        const near = !inZone && (Math.abs(s.temp - LO) < 5 || Math.abs(s.temp - HI) < 5);
        s.inZone += inZone ? dt : near ? dt * 0.4 : 0;
      }
      if (inZone && !s.wasIn) haptic.hit();
      // Колба булькает, когда чаша прогрелась: чем горячее, тем чаще
      if (s.temp > 45 && Math.random() < (s.temp - 40) / 300) sfx.bubble();
      s.wasIn = inZone;
      setView({ temp: s.temp, t: s.t, inZone: s.inZone });
      if (s.t >= DURATION) {
        clearInterval(id);
        onDone(clamp01(s.inZone / (DURATION - GRACE)));
      }
    }, dt * 1000);
    return () => clearInterval(id);
  }, [started]); // параметры не меняются в рамках шага

  const temp = view.temp;
  const left = Math.max(0, DURATION - view.t);
  const state = temp > HI ? 'Перегрев — горчит!' : temp < LO ? 'Холодно — дым жидкий' : 'Жар в норме';
  const glow = Math.min(1, temp / 90);

  return (
    <div className="heat">
      {tutorial && (
        <p className="hint">
          Держи жар в зелёной зоне {DURATION} секунд. Угли добавляют жар, заслонка калауда немного остужает. Ветер всё время сбивает температуру — подстраивайся.
        </p>
      )}
      <div className="kalaud" style={{ '--glow': glow } as CSSProperties}>
        <div className="coals">
          {Array.from({ length: coals }, (_, i) => (
            <span key={i} className="coal" style={{ opacity: 1 - BURN_RATE * view.t * 1.5 }} />
          ))}
        </div>
        <div className={'lid' + (lidOpen ? ' open' : '')}>{lidOpen ? 'заслонка открыта' : 'заслонка закрыта'}</div>
      </div>

      <div className="meter horizontal">
        <div className="zone" style={{ left: `${LO}%`, width: `${HI - LO}%` }} />
        <div className="needle" style={{ left: `${Math.max(0, Math.min(100, temp))}%` }} />
      </div>
      <div className={'status ' + (temp >= LO && temp <= HI ? 'good' : '')}>
        {started ? `${state} · ${left.toFixed(1)} с` : 'Готов? Жмём «Начать»'}
      </div>

      <div className="actions">
        {!started ? (
          <button className="btn primary big grow" onClick={() => setStarted(true)}>Начать</button>
        ) : (
          <>
            <button className="btn" disabled={coals <= 2} data-sound="own" onClick={() => { haptic.tap(); sfx.coalOff(); setCoals(coals - 1); }}>− уголь</button>
            <button className="btn" data-sound="own" onClick={() => { haptic.tap(); sfx.lid(); setLidOpen(!lidOpen); }}>{lidOpen ? 'Закрыть' : 'Открыть'}</button>
            <button className="btn" disabled={coals >= 4} data-sound="own" onClick={() => { haptic.tap(); sfx.coalOn(); setCoals(coals + 1); }}>+ уголь</button>
          </>
        )}
      </div>
    </div>
  );
}
