import { Icon } from '../art/Icon';
import { GOTD_AFTER, GOTD_CLOUDS, DAILY_REWARDS, nextStreak, questText, today } from '../game/daily';
import { Save, claimDaily, claimQuest } from '../game/state';
import { haptic } from '../game/telegram';
import { sfx } from '../game/sound';
import { track } from '../game/analytics';

interface Props {
  save: Save;
  setSave: (s: Save) => void;
  onClose: () => void;
}

/** Награда за вход, задания на сегодня и статус гостя дня — в одном окне */
export default function DailyModal({ save, setSave, onClose }: Props) {
  const streakIfClaimed = nextStreak(save.daily);
  const claimedToday = streakIfClaimed === null;
  // Какая клетка серии сегодняшняя: уже забранная или та, что заберётся сейчас
  const current = claimedToday ? save.daily.streak : streakIfClaimed;

  const takeDaily = () => {
    const { save: next, reward } = claimDaily(save);
    if (!reward) return;
    track('daily_claimed', { streak: next.daily.streak });
    haptic.success();
    sfx.coins();
    setSave(next);
  };

  const takeQuest = (id: string) => {
    haptic.success();
    sfx.coins();
    track('quest_claimed', { kind: save.quests.list.find((q) => q.id === id)?.kind });
    setSave(claimQuest(save, id));
  };

  const gotd = save.gotd;
  const waitGuests = Math.max(0, GOTD_AFTER - (save.served - gotd.startServed));
  const gotdText =
    save.level < 2 ? 'Откроется со 2-го уровня'
    : gotd.day !== today() ? 'Придёт сегодня'
    : gotd.done ? 'Уже был сегодня — заходи завтра'
    : waitGuests > 0 ? `Придёт после ещё ${waitGuests} гостей`
    : 'Уже в зале — ищи гостя с короной';

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal daily" onClick={(e) => e.stopPropagation()}>
        <h2>Награда за вход</h2>
        <div className="daily-strip">
          {DAILY_REWARDS.map((r, i) => {
            const day = i + 1;
            const state = day < current || (claimedToday && day === current) ? 'taken' : day === current ? 'today' : '';
            return (
              <div key={day} className={'daily-cell ' + state + (day === 7 ? ' chest' : '')}>
                <div className="small">{day === 7 ? 'Сундук' : `День ${day}`}</div>
                {r.coins && <div><Icon name="coin" size={16} />{r.coins}</div>}
                {r.clouds && <div><Icon name="cloud" size={16} />{r.clouds}</div>}
              </div>
            );
          })}
        </div>
        <p className="muted small">Заходи каждый день: пропустишь — серия начнётся заново.</p>
        <button className="btn primary big daily-take" disabled={claimedToday} onClick={takeDaily}>
          {claimedToday ? 'Сегодня уже забрано' : 'Забрать награду'}
        </button>

        <h2>Задания на сегодня</h2>
        {save.quests.list.map((q) => {
          const done = q.progress >= q.target;
          return (
            <div key={q.id} className={'card quest' + (q.claimed ? ' claimed' : '')}>
              <div className="row">
                <div className="grow">
                  <div className="strong">{questText(q)}</div>
                  <div className="muted small">
                    Награда: {q.reward.coins ? <>{q.reward.coins} <Icon name="coin" size={14} /> </> : null}
                    {q.reward.clouds ? <>{q.reward.clouds} <Icon name="cloud" size={14} /></> : null}
                  </div>
                </div>
                {q.claimed ? (
                  <Icon name="scroll" size={28} />
                ) : (
                  <button className="btn primary" disabled={!done} onClick={() => takeQuest(q.id)}>Забрать</button>
                )}
              </div>
              <div className="xpbar"><div style={{ width: `${(q.progress / q.target) * 100}%` }} /></div>
              <div className="small muted right">{Math.min(q.progress, q.target)}/{q.target}</div>
            </div>
          );
        })}

        <h2>Гость дня</h2>
        <div className="card row">
          <Icon name="crown" size={34} />
          <div className="grow">
            <div className="strong">{gotdText}</div>
            <div className="muted small">Трудный заказ из трёх вкусов. Платит вдвое, опыт ×2 и +{GOTD_CLOUDS} облачков за 2+ звезды.</div>
          </div>
        </div>

        <div className="actions">
          <button className="btn grow" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
}
