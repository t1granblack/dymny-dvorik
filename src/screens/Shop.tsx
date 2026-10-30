import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from '../art/Icon';
import { Save } from '../game/state';
import { FLAVORS, TAG_LABEL } from '../game/data';
import { haptic } from '../game/telegram';
import { sfx } from '../game/sound';
import { track } from '../game/analytics';

// Что можно купить за облачка. Цены — стартовый баланс, правим по аналитике
const BOOST_PRICE = 10;
const BOOST_GUESTS = 10;
const BAG_PRICE = 12;
const bagCoins = (level: number) => 150 + 50 * level;

export default function Shop({ save, setSave }: { save: Save; setSave: (s: Save) => void }) {
  const [note, setNote] = useState<string | null>(null);

  const spend = (price: number, next: Save, text: string, item: string) => {
    if (save.clouds < price) return;
    track('shop_purchase', { item, price, currency: 'clouds' });
    haptic.success();
    sfx.buy();
    setSave({ ...next, clouds: save.clouds - price });
    setNote(text);
  };

  const premium = FLAVORS.filter((f) => f.premium);

  return (
    <>
      <h2>Магазин</h2>
      <p className="muted small">
        Облачка дают за уровни, гостя дня, задания, ежедневную награду и победу над незнакомцем.
      </p>
      {note && <p className="hint">{note}</p>}

      <div className="card row">
        <div className="up-icon"><Icon name="rocket" size={34} /></div>
        <div className="grow">
          <div className="strong">Ускоритель ×2</div>
          <div className="muted small">
            Следующие {BOOST_GUESTS} гостей платят вдвое{save.boost > 0 ? ` · сейчас осталось ${save.boost}` : ''}
          </div>
        </div>
        <button
          className="btn"
          disabled={save.clouds < BOOST_PRICE}
          onClick={() => spend(BOOST_PRICE, { ...save, boost: save.boost + BOOST_GUESTS }, `Ускоритель включён: ещё ${save.boost + BOOST_GUESTS} гостей платят ×2`, 'boost')}
        >
          {BOOST_PRICE} <Icon name="cloud" size={16} />
        </button>
      </div>

      <div className="card row">
        <div className="up-icon"><Icon name="bag" size={34} /></div>
        <div className="grow">
          <div className="strong">Мешок монет</div>
          <div className="muted small">{bagCoins(save.level)} монет сразу (растёт с уровнем)</div>
        </div>
        <button
          className="btn"
          disabled={save.clouds < BAG_PRICE}
          onClick={() => spend(BAG_PRICE, { ...save, coins: save.coins + bagCoins(save.level) }, `+${bagCoins(save.level)} монет`, 'coin_bag')}
        >
          {BAG_PRICE} <Icon name="cloud" size={16} />
        </button>
      </div>

      <h2>Премиальные вкусы</h2>
      {premium.map((f) => {
        const owned = save.secretFlavors.includes(f.id);
        return (
          <div key={f.id} className="card row" style={{ '--c': f.color } as CSSProperties}>
            <div className="up-icon"><Icon name={f.id} size={34} /></div>
            <div className="grow">
              <div className="strong">{f.name}</div>
              <div className="tags left">{f.tags.map((t) => <span key={t}>{TAG_LABEL[t]}</span>)}</div>
            </div>
            <button
              className="btn"
              disabled={owned || save.clouds < f.premium!}
              onClick={() => spend(f.premium!, { ...save, secretFlavors: [...save.secretFlavors, f.id] }, `«${f.name}» теперь в твоих миксах`, f.id)}
            >
              {owned ? 'Куплено' : <>{f.premium} <Icon name="cloud" size={16} /></>}
            </button>
          </div>
        );
      })}

      <div className="card soon">
        <div className="strong">Облачка за Telegram Stars</div>
        <div className="muted small">Скоро: пакеты облачков и стартовый набор.</div>
      </div>
    </>
  );
}
