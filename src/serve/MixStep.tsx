import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from '../art/Icon';
import { MixPart, Save, Signature, findCombos, shares, signatureUsable, unlockedFlavors } from '../game/state';
import { Flavor, TAG_LABEL, Tag, UPGRADES, flavorById, mixSlots, upgradeCost } from '../game/data';
import { haptic } from '../game/telegram';

interface Props {
  save: Save;
  want: Tag[];
  tutorial: boolean;
  onDone: (parts: MixPart[], signatureId?: string) => void;
}

export default function MixStep({ save, want, tutorial, onDone }: Props) {
  const [parts, setParts] = useState<MixPart[]>([]);
  // Выбранный фирменный; любое ручное изменение микса превращает его в обычный
  const [sigId, setSigId] = useState<string | undefined>();
  const slots = mixSlots(save.upgrades.storage);
  const flavors = unlockedFlavors(save.level, save.secretFlavors);
  const regular = flavors.filter((f) => !f.weird);
  const weird = flavors.filter((f) => f.weird);
  const signatures = save.signatures.filter((s) => signatureUsable(s, save, slots));

  const pickSignature = (sig: Signature) => {
    haptic.tap();
    setParts(sig.parts);
    setSigId(sig.id);
  };

  const toggle = (id: string) => {
    haptic.tap();
    setSigId(undefined);
    setParts((p) => {
      if (p.some((x) => x.id === id)) return p.filter((x) => x.id !== id);
      if (p.length >= slots) return [...p.slice(1), { id, weight: 5 }];
      return [...p, { id, weight: 5 }];
    });
  };

  const setWeight = (id: string, weight: number) => {
    setSigId(undefined);
    setParts((p) => p.map((x) => (x.id === id ? { ...x, weight } : x)));
  };

  const tile = (f: Flavor) => {
    const on = parts.some((p) => p.id === f.id);
    return (
      <button
        key={f.id}
        className={'flavor-tile' + (on ? ' on' : '') + (f.weird ? ' weird' : '')}
        style={{ '--c': f.color } as CSSProperties}
        onClick={() => toggle(f.id)}
      >
        <Icon name={f.id} size={38} />
        <div className="strong small">{f.name}</div>
        <div className="tags">{f.tags.map((t) => <span key={t} className={tutorial && want.includes(t) ? 'hit' : ''}>{TAG_LABEL[t]}</span>)}</div>
      </button>
    );
  };

  const sh = shares(parts);
  const combos = findCombos(parts);
  const known = combos.filter((c) => save.recipes.includes(c.id));

  return (
    <div className="mix">
      <div className="muted small">
        Слотов в чаше: {slots}. Выбери вкусы{slots > 1 ? ' и раздели чашу ползунками' : ''}.
      </div>
      {slots === 1 && (
        <p className="hint upsell">
          <Icon name="lock" size={18} /> Пока в чаше помещается только один вкус. Чтобы смешивать 2–3 вкуса, купи <b>Склад вкусов</b> во вкладке <b>Прокачка</b> — первый уровень стоит {upgradeCost(UPGRADES[0], 0)} <Icon name="coin" size={16} />.
        </p>
      )}
      {tutorial && (
        <p className="hint">
          Гость хочет: {want.map((t) => <b key={t}>{TAG_LABEL[t]} </b>)}— ищи вкусы с этими тегами.
        </p>
      )}

      {signatures.length > 0 && (
        <div className="sig-chips">
          <span className="muted small">Фирменные:</span>
          {signatures.map((s) => (
            <button key={s.id} className={'sig-chip' + (sigId === s.id ? ' on' : '')} onClick={() => pickSignature(s)}>
              {s.parts.map((p) => <Icon key={p.id} name={p.id} size={18} />)} {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="flavor-grid">{regular.map(tile)}</div>
      {weird.length > 0 && (
        <>
          <div className="shelf-title">Странная полка</div>
          <div className="flavor-grid">{weird.map(tile)}</div>
        </>
      )}

      {parts.length > 0 && (
        <div className="bowl-split">
          <div className="split-bar">
            {sh.map((s) => (
              <div key={s.id} style={{ flex: s.share, background: flavorById(s.id).color }}>
                {Math.round(s.share * 100)}%
              </div>
            ))}
          </div>
          {parts.length > 1 &&
            parts.map((p) => (
              <label key={p.id} className="slider-row">
                <Icon name={p.id} size={28} />
                <input type="range" min={1} max={10} value={p.weight} onChange={(e) => setWeight(p.id, +e.target.value)} />
              </label>
            ))}
          {known.length > 0 && <div className="combo-hint"><Icon name="recipes" size={18} /> {known.map((c) => c.name).join(', ')}</div>}
        </div>
      )}

      <div className="actions">
        <button className="btn primary big grow" disabled={!parts.length} onClick={() => onDone(parts, sigId)}>
          {sigId ? 'Забивать фирменный' : 'Забивать'}
        </button>
      </div>
    </div>
  );
}
