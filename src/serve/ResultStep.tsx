import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from '../art/Icon';
import { MixPart, ServeResult, shares } from '../game/state';
import { GuestType, flavorById } from '../game/data';
import { haptic } from '../game/telegram';
import { reactionLine, reactionMood } from '../game/reactions';
import { sfx } from '../game/sound';
import { Person } from '../screens/Hall';

interface Props {
  guest: GuestType;
  result: ServeResult;
  parts: MixPart[];
  bossLine?: string;
  onNext: () => void;
}

const VERDICT = ['', 'Ну… покурили', 'Хороший дым', 'Шедевр! Гость в восторге'];

export default function ResultStep({ guest, result: r, parts, bossLine, onNext }: Props) {
  useEffect(() => {
    if (r.stars === 3) haptic.success();
    // Звёзды звенят в такт их появлению (задержки как в CSS), потом монеты
    const timers = Array.from({ length: r.stars }, (_, i) => setTimeout(() => sfx.star(i), 150 + i * 150));
    timers.push(setTimeout(guest.dog ? (r.dogGuessed ? sfx.bark : sfx.whine) : r.stars === 1 ? sfx.fail : sfx.coins, 750));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Цвет облака — смесь цветов вкусов, густота — от итоговой оценки
  const main = shares(parts).sort((a, b) => b.share - a.share)[0];
  const color = main ? flavorById(main.id).color : '#ddd';

  const [line] = useState(() => reactionLine(guest, r));

  return (
    <div className="result">
      {/* Гость выдыхает облако и реагирует */}
      <div className="reaction">
        <div className="smoke" style={{ '--c': color, '--d': 0.35 + r.total * 0.65 } as CSSProperties}>
          {Array.from({ length: 7 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 0.25}s` }} />)}
        </div>
        <div className="reaction-bubble">{line}</div>
        <div className="reaction-person">
          <Person type={guest} mood={reactionMood(guest, r)} />
        </div>
      </div>
      <div className="stars">
        {[1, 2, 3].map((n) => <span key={n} className={n <= r.stars ? 'on' : ''}>★</span>)}
      </div>
      <h2>{VERDICT[r.stars]}</h2>
      {bossLine && <p className="boss-intro">{bossLine}</p>}

      <div className="breakdown">
        <Bar label="Микс" v={r.mix} />
        <Bar label="Забивка" v={r.pack} />
        <Bar label="Жар" v={r.heat} />
      </div>

      <div className="reward">
        +{r.coins} <Icon name="coin" size={18} />{r.tips > 0 && <> · чаевые +{r.tips} <Icon name="coin" size={18} /></>} · +{r.xp} опыта{r.clouds > 0 && <> · +{r.clouds} <Icon name="cloud" size={18} /></>}
      </div>
      {r.signature && (
        <div className="new-recipe">
          {r.signature.bonus > 0
            ? <>Фирменный «{r.signature.name}» зашёл! Надбавка +{r.signature.bonus} <Icon name="coin" size={18} /></>
            : <>Фирменный «{r.signature.name}» не попал в заказ — без надбавки</>}
        </div>
      )}
      {r.secretFlavor && (
        <div className="secret-unlock">
          <Icon name={r.secretFlavor} size={56} />
          <div>
            <div className="boss-tag">Секретный вкус</div>
            <div className="strong">{flavorById(r.secretFlavor).name}</div>
            <div className="small muted">Теперь он есть у тебя в миксах</div>
          </div>
        </div>
      )}
      {r.newRecipes.map((c) => (
        <div key={c.id} className="new-recipe"><Icon name="recipes" size={20} /> Новый рецепт: <b>{c.name}</b></div>
      ))}

      <div className="actions">
        <button className="btn primary big grow" onClick={onNext}>Дальше</button>
      </div>
    </div>
  );
}

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div className="bd-row">
      <span>{label}</span>
      <div className="bd-bar"><div style={{ width: `${Math.round(v * 100)}%` }} /></div>
      <span className="small">{Math.round(v * 100)}%</span>
    </div>
  );
}
