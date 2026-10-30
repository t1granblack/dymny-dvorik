import { Icon } from '../art/Icon';
import { Character } from '../art/Character';
import { useState } from 'react';
import { Save, moveCheck, moveToNext } from '../game/state';
import { HELPER, MAX_UPGRADE, UPGRADES, helperUpCost, locationById, upgradeCost } from '../game/data';
import { haptic } from '../game/telegram';
import { sfx } from '../game/sound';
import { TopBar } from './Hall';

interface Props {
  save: Save;
  setSave: (s: Save) => void;
  onMoved: (place: string) => void;
}

export default function Upgrades({ save, setSave, onMoved }: Props) {
  const [confirmMove, setConfirmMove] = useState(false);
  const move = moveCheck(save);
  const place = locationById(save.location);

  const doMove = () => {
    const next = moveToNext(save);
    if (next === save) return;
    haptic.success();
    sfx.levelUp();
    setSave(next);
    setConfirmMove(false);
    onMoved(locationById(next.location).name);
  };

  const buy =(id: (typeof UPGRADES)[number]['id'], cost: number) => {
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

      {move && (
        <div className="card move-card">
          <div className="move-title">Новое заведение: {move.next.name}</div>
          <div className="small">
            Переезжаешь — гости платят в {String(move.next.payMult).replace('.', ',')} раза больше, а заказы чуть капризнее.
            Интерьер начнётся заново, всё остальное останется.
          </div>
          <ul className="move-reqs">
            <li className={move.level ? 'ok' : ''}>Уровень {move.next.move!.level} (сейчас {save.level})</li>
            <li className={move.interior ? 'ok' : ''}>Интерьер «{place.name}» прокачан до конца ({save.upgrades.interior}/{MAX_UPGRADE})</li>
            <li className={move.coins ? 'ok' : ''}>
              {move.next.move!.cost} <Icon name="coin" size={14} /> ({Math.min(save.coins, move.next.move!.cost)}/{move.next.move!.cost})
            </li>
          </ul>
          <div className="xpbar"><div style={{ width: `${Math.min(100, (save.coins / move.next.move!.cost) * 100)}%` }} /></div>
          <div className="actions">
            <button
              className="btn primary grow"
              disabled={!(move.level && move.interior && move.coins)}
              onClick={() => setConfirmMove(true)}
            >
              Переехать
            </button>
          </div>
        </div>
      )}
      {!move && save.location !== 'yard' && (
        <div className="card move-card">
          <div className="move-title">Кальянная на крыше</div>
          <div className="small">Следующее заведение уже строится. Скоро!</div>
        </div>
      )}

      {confirmMove && move && (
        <div className="modal-back" onClick={() => setConfirmMove(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Переезд в {move.next.name}</h2>
            <p>«{place.name}» закроется, а ты откроешь новое заведение.</p>
            <ul className="move-reqs">
              <li className="ok">Остаются: монеты после оплаты, уровень, вкусы, рецепты, фирменные миксы, чаши, калауды, колбы, склад и помощник</li>
              <li>Начинается заново: интерьер — у лаунжа он свой</li>
              <li className="ok">Гости платят ×{String(move.next.payMult).replace('.', ',')}</li>
            </ul>
            <div className="actions">
              <button className="btn" onClick={() => setConfirmMove(false)}>Пока нет</button>
              <button className="btn primary grow" onClick={doMove}>
                Переехать за {move.next.move!.cost} <Icon name="coin" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <h2>Прокачка</h2>
      {UPGRADES.map((u) => {
        const lvl = save.upgrades[u.id];
        const maxed = lvl >= MAX_UPGRADE;
        const cost = upgradeCost(u, lvl);
        // У каждого заведения свой интерьер: названия уровней берём из него
        const levels = u.id === 'interior' ? place.interiorLevels : u.levels;
        return (
          <div key={u.id} className="card row">
            <div className="up-icon"><Icon name={u.icon} size={34} /></div>
            <div className="grow">
              <div className="strong">{u.name} {lvl > 0 && <span className="muted">· {levels[lvl - 1]}</span>}</div>
              {!maxed && u.id === 'interior' && <div className="muted small">Следующее: {levels[lvl]}</div>}
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
