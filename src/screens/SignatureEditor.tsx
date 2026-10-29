import { useState } from 'react';
import type { CSSProperties } from 'react';
import { MixPart, Save, Signature, shares, unlockedFlavors } from '../game/state';
import { flavorById, mixSlots } from '../game/data';
import { haptic } from '../game/telegram';
import { sfx } from '../game/sound';
import { Icon } from '../art/Icon';

const ADJ = ['Ночной', 'Дворовый', 'Секретный', 'Бабушкин', 'Космический', 'Ленивый', 'Пятничный', 'Запретный', 'Царский', 'Студенческий'];
const PATTERNS = [
  (a: string, _b: string, adj: string) => `${adj} ${a}`,
  (a: string, b: string) => `${cap(a)} и ${b}`,
  (a: string) => `${cap(a)}-вайб`,
  (a: string) => `${cap(a)} по-братски`,
  (a: string, b: string) => `${cap(a)}, но ${b}`,
  (a: string) => `Тот самый ${a}`,
  (a: string) => `${cap(a)} 2.0`,
];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const rnd = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

/** Название из вкусов микса: «Ночной плов», «Сгущёнка, но мята», «Борщ-вайб»… */
function inventName(parts: MixPart[]) {
  const names = shares(parts)
    .sort((x, y) => y.share - x.share)
    .map((s) => flavorById(s.id).name.toLowerCase());
  const [a, b = 'мята'] = names.length ? names : ['дым'];
  return rnd(PATTERNS)(a, b, rnd(ADJ)).slice(0, 28);
}

interface Props {
  save: Save;
  onSave: (sig: Signature) => void;
  onClose: () => void;
}

export default function SignatureEditor({ save, onSave, onClose }: Props) {
  const slots = mixSlots(save.upgrades.storage);
  const flavors = unlockedFlavors(save.level, save.secretFlavors);
  const [parts, setParts] = useState<MixPart[]>([]);
  const [name, setName] = useState('');

  const toggle = (id: string) => {
    haptic.tap();
    setParts((p) => {
      if (p.some((x) => x.id === id)) return p.filter((x) => x.id !== id);
      if (p.length >= slots) return [...p.slice(1), { id, weight: 5 }];
      return [...p, { id, weight: 5 }];
    });
  };

  const submit = () => {
    if (!parts.length) return;
    sfx.buy();
    onSave({ id: String(Date.now()), name: name.trim() || inventName(parts), parts, served: 0, best: 0 });
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Свой фирменный микс</h2>
        <p className="muted small">
          До {slots} вкусов в чаше{slots < 3 ? ' (больше — после прокачки склада)' : ''}. Любые сочетания, даже самые странные. Если фирменный попадёт в заказ гостя — +30% к оплате.
        </p>

        <div className="flavor-grid compact">
          {flavors.map((f) => (
            <button
              key={f.id}
              className={'flavor-tile' + (parts.some((p) => p.id === f.id) ? ' on' : '') + (f.weird ? ' weird' : '')}
              style={{ '--c': f.color } as CSSProperties}
              onClick={() => toggle(f.id)}
            >
              <Icon name={f.id} size={30} />
              <div className="strong small">{f.name}</div>
            </button>
          ))}
        </div>

        {parts.length > 0 && (
          <div className="bowl-split">
            <div className="split-bar">
              {shares(parts).map((s) => (
                <div key={s.id} style={{ flex: s.share, background: flavorById(s.id).color }}>{Math.round(s.share * 100)}%</div>
              ))}
            </div>
            {parts.length > 1 &&
              parts.map((p) => (
                <label key={p.id} className="slider-row">
                  <Icon name={p.id} size={28} />
                  <input
                    type="range" min={1} max={10} value={p.weight}
                    onChange={(e) => setParts((all) => all.map((x) => (x.id === p.id ? { ...x, weight: +e.target.value } : x)))}
                  />
                </label>
              ))}
          </div>
        )}

        <div className="name-row">
          <input
            className="text-input"
            placeholder="Название микса"
            maxLength={28}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn" disabled={!parts.length} onClick={() => setName(inventName(parts))} title="Придумать название">
            <Icon name="dice" size={22} />
          </button>
        </div>

        <div className="actions">
          <button className="btn" onClick={onClose}>Отмена</button>
          <button className="btn primary grow" disabled={!parts.length} onClick={submit}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}
