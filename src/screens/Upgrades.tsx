import { Icon } from '../art/Icon';
import { Character } from '../art/Character';
import { Save } from '../game/state';
import { HELPER, MAX_UPGRADE, UPGRADES, helperUpCost, upgradeCost } from '../game/data';
import { haptic } from '../game/telegram';
import { sfx } from '../game/sound';
import { TopBar } from './Hall';

export default function Upgrades({ save, setSave }: { save: Save; setSave: (s: Save) => void }) {
  const buy = (id: (typeof UPGRADES)[number]['id'], cost: number) => {
    if (save.coins < cost) return;
    haptic.hit();
    sfx.buy();
    setSave({ ...save, coins: save.coins - cost, upgrades: { ...save.upgrades, [id]: save.upgrades[id] + 1 } });
  };

  const helperCost = helperUpCost(save.helper);
  const buyHelper = () => {
    if (save.coins < helperCost) return;
    haptic.hit();
    sfx.buy();
    // При найме отсчёт офлайн-дохода начинается с этого момента
    setSave({
      ...save,
      coins: save.coins - helperCost,
      helper: save.helper + 1,
      lastCollect: save.helper ? save.lastCollect : Date.now(),
    });
  };

  return (
    <>
      <TopBar save={save} />
      <h2>Прокачка</h2>
      {UPGRADES.map((u) => {
        const lvl = save.upgrades[u.id];
        const maxed = lvl >= MAX_UPGRADE;
        const cost = upgradeCost(u, lvl);
        return (
          <div key={u.id} className="card row">
            <div className="up-icon"><Icon name={u.icon} size={34} /></div>
            <div className="grow">
              <div className="strong">{u.name} {lvl > 0 && <span className="muted">· {u.levels[lvl - 1]}</span>}</div>
              <div className="pips">{Array.from({ length: MAX_UPGRADE }, (_, i) => <i key={i} className={i < lvl ? 'on' : ''} />)}</div>
              <div className="muted small">{maxed ? u.effect(lvl) : `Далее: ${u.effect(lvl + 1)}`}</div>
            </div>
            <button className="btn" disabled={maxed || save.coins < cost} onClick={() => buy(u.id, cost)}>
              {maxed ? 'Макс' : <>{cost} <Icon name="coin" size={16} /></>}
            </button>
          </div>
        );
      })}

      <h2>Помощники</h2>
      <div className="card row">
        <div className="up-icon"><Character look={HELPER.look} portrait className="avatar" /></div>
        <div className="grow">
          <div className="strong">{HELPER.name} {save.helper > 0 && <span className="muted">· ур. {save.helper}</span>}</div>
          <div className="muted small">
            Работает, пока тебя нет · {HELPER.ratePerHour * (save.helper + 1)} монет/ч
          </div>
        </div>
        <button className="btn" disabled={save.coins < helperCost} onClick={buyHelper}>
          {save.helper ? 'Улучшить' : 'Нанять'} · {helperCost} <Icon name="coin" size={16} />
        </button>
      </div>
    </>
  );
}
