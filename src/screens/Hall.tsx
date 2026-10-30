import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Guest, Save, canAffordUpgrade, pendingIncome, helperRate } from '../game/state';
import { GuestType, HELPER, LocationId, locationById, xpToNext } from '../game/data';
import { addToHomeScreen, haptic, homeScreenStatus, tgUser } from '../game/telegram';
import { audioPrefs, setMusic, setSfx, sfx } from '../game/sound';
import { Character, Cheremsha, Dog } from '../art/Character';
import type { Mood } from '../art/Character';
import { Icon } from '../art/Icon';

interface Props {
  save: Save;
  setSave: (s: Save) => void;
  queue: Guest[];
  onServe: (g: Guest) => void;
  onOpenUpgrades: () => void;
  leaving: Leaving | null;
}

/**
 * Как выглядит зал на каждом уровне интерьера (названия уровней — в LOCATIONS).
 * Дворик: 0 — табуретки, 1 — лавочки, 2 — пуфы и ковёр, 3 — гирлянды, 4 — диваны и растение, 5 — неон и музыка.
 * Лаунж: 0 — кожаные кресла и неоновая вывеска, 1 — LED-подсветка, 2 — бар с подсветкой,
 * 3 — бархатные диваны, 4 — VIP-зона, 5 — диджей и световое шоу.
 */
function interiorDecor(location: LocationId, lvl: number) {
  const none = { window: false, art: false, led: false, bar: false, vip: false, dj: false, rug: false, garland: false, plant: false, music: false };
  if (location === 'lounge') {
    return {
      ...none,
      seat: lvl >= 3 ? 'velvet' : 'armchair',
      neon: true,
      art: lvl < 2,
      led: lvl >= 1,
      bar: lvl >= 2,
      plant: lvl >= 3,
      vip: lvl >= 4,
      dj: lvl >= 5,
      music: lvl >= 5,
    };
  }
  return {
    ...none,
    seat: lvl >= 4 ? 'sofa' : lvl >= 2 ? 'pouf' : lvl >= 1 ? 'bench' : 'stool',
    window: true,
    rug: lvl >= 2,
    garland: lvl >= 3,
    plant: lvl >= 4,
    neon: lvl >= 5,
    music: lvl >= 5,
  };
}

/** Гость, которого только что обслужили: уходит к двери с эмоцией */
export interface Leaving {
  guest: Guest;
  mood: Mood;
  happy: boolean;
}

// Места за столиками для ожидающих гостей: left и bottom в % от сцены
const SPOTS = [
  { x: 15, y: 33 },
  { x: 85, y: 33 },
  { x: 30, y: 40 },
  { x: 70, y: 40 },
  { x: 13, y: 24 },
  { x: 87, y: 24 },
  { x: 50, y: 46 }, // седьмое место — когда при полном зале без очереди зашёл босс
];

export default function Hall({ save, setSave, queue, onServe, onOpenUpgrades, leaving }: Props) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const pending = pendingIncome(save);
  const decor = interiorDecor(save.location, save.upgrades.interior);
  const place = locationById(save.location);
  const owner = tgUser(); // портрет хозяина кальянной — аватарка игрока из Telegram
  const [first, ...rest] = queue;

  const collect = () => {
    if (!pending) return;
    haptic.success();
    sfx.coins();
    setSave({ ...save, coins: save.coins + pending, lastCollect: Date.now() });
  };

  return (
    <>

      <section className={`hall loc-${place.id}` + (first?.type.boss ? ' boss-mode' : '')}>
        <div className="wall">
          {decor.garland && <div className="garland" />}
          {decor.led && <div className="led-strip" />}
          {decor.window && <div className="window"><Icon name="moon" size={22} /></div>}
          {decor.art && <div className="neon-art" />}
          {decor.bar && (
            <div className="backbar">
              {['#3ecf8e', '#ff5a6e', '#ffd23f', '#8e4fbf', '#5b6cff', '#ffa62b'].map((c) => (
                <i key={c} style={{ '--c': c } as CSSProperties} />
              ))}
            </div>
          )}
          <div className={'sign' + (decor.neon ? ' neon' : '')}>{place.sign}</div>
          <div className="door" />
          {decor.vip && <div className="vip-rope" />}
          {owner?.first_name && (
            <div className="owner-frame" title={`Хозяин: ${owner.first_name}`}>
              {owner.photo_url ? <img src={owner.photo_url} alt="" /> : <span>{owner.first_name[0]}</span>}
            </div>
          )}
          {decor.plant && <div className="plant" />}
          {decor.music && (
            <div className="speaker">
              <span className="note n1"><Icon name="note" size={16} /></span>
              <span className="note n2"><Icon name="note" size={13} /></span>
            </div>
          )}
        </div>
        <div className="floor" />
        {decor.rug && <div className="rug" />}
        {decor.dj && (
          <div className="dj-lights" aria-hidden="true">
            <i /><i /><i />
          </div>
        )}

        {rest.slice(0, SPOTS.length).map((g, i) => (
          <div key={g.key} className="seated" style={{ left: `${SPOTS[i].x}%`, bottom: `${SPOTS[i].y}%`, zIndex: 10 - Math.round(SPOTS[i].y / 10) }}>
            <div className={'seat seat-' + decor.seat} />
            <Person type={g.type} />
            <div className="table" />
          </div>
        ))}

        {leaving && (
          <div className={'leaver' + (leaving.happy ? ' happy' : ' sad')} key={'leave-' + leaving.guest.key}>
            <div className="leaver-pop">
              <Icon name={leaving.happy ? 'heart' : 'grumble'} size={34} />
            </div>
            <Person type={leaving.guest.type} mood={leaving.mood} />
          </div>
        )}

        {first ? (
          <button
            className={'hero' + (first.type.boss ? ' boss' : '') + (first.gotd ? ' gotd' : '') + (leaving ? ' after-leave' : '')}
            key={first.key}
            onClick={() => onServe(first)}
            aria-label={`Обслужить: ${first.type.name}`}
          >
            <div className="hero-bubble">
              {first.type.boss && <div className="boss-tag">Мини-босс</div>}
              {first.gotd && <div className="boss-tag gotd-tag"><Icon name="crown" size={14} /> Гость дня</div>}
              <div className="small muted-dark">{first.type.name}</div>
              «{first.request.text}»
            </div>
            <div className="walker">
              <Person type={first.type} />
            </div>
          </button>
        ) : (
          <div className="hall-empty">Пока никого. Сейчас кто-нибудь зайдёт…</div>
        )}

        <div className="counter">
          <div className="counter-top" />
          <div className="counter-decor">
            <span className="jar" style={{ '--c': '#3ecf8e' } as CSSProperties}><Icon name="mint" size={20} /></span>
            <span className="jar" style={{ '--c': '#ffd23f' } as CSSProperties}><Icon name="lemon" size={20} /></span>
            <span className="mini-bowl" />
            <span className="jar" style={{ '--c': '#ff5a6e' } as CSSProperties}><Icon name="watermelon" size={20} /></span>
          </div>
        </div>
      </section>

      {canAffordUpgrade(save) && (
        <button className="upgrade-tip" onClick={onOpenUpgrades}>
          <Icon name="bulb" size={30} />
          <span className="grow">
            <b>Хватает на улучшение!</b>
            <span className="small">
              {save.upgrades.storage === 0 ? ' Купи «Склад вкусов» — сможешь смешивать вкусы.' : ' Загляни в Прокачку.'}
            </span>
          </span>
          <span>›</span>
        </button>
      )}

      {save.helper > 0 && (
        <section className="card row">
          <Character look={HELPER.look} portrait className="avatar" />
          <div className="grow">
            <div className="strong">{HELPER.name} · ур. {save.helper}</div>
            <div className="muted small">{Math.round(helperRate(save))} монет/час, копится до {HELPER.capHours} ч</div>
          </div>
          <button className="btn" disabled={!pending} onClick={collect}>
            +{pending} <Icon name="coin" size={18} />
          </button>
        </section>
      )}

      <div className="actions">
        <button className="btn primary big grow" disabled={!first} onClick={() => first && onServe(first)}>
          Обслужить
        </button>
      </div>
    </>
  );
}

/** Нарисованный гость; компания — несколько фигурок рядом. mood подменяет обычное выражение лица */
export function Person({ type, mood }: { type: GuestType; mood?: Mood }) {
  if (type.dog) return <div className="person dog"><Dog className="char" mood={mood} /></div>;
  if (type.creature === 'cheremsha') return <div className="person"><Cheremsha className="char" mood={mood} /></div>;
  const looks = Array.isArray(type.look) ? type.look : [type.look];
  return (
    <div className={'person' + (looks.length > 1 ? ' duo' : '')}>
      {looks.map((l, i) => <Character key={i} look={mood ? { ...l, mood } : l} className="char" />)}
    </div>
  );
}

/** Маленькая аватарка гостя: голова и плечи */
export function Avatar({ type, className }: { type: GuestType; className?: string }) {
  if (type.dog) return <Dog portrait className={'avatar ' + (className ?? '')} />;
  if (type.creature === 'cheremsha') return <Cheremsha portrait className={'avatar ' + (className ?? '')} />;
  const look = Array.isArray(type.look) ? type.look[0] : type.look;
  return <Character look={look} portrait className={'avatar ' + (className ?? '')} />;
}

/** Общая верхняя панель: уровень, валюта, награды и задания, звук */
export function TopBar({ save, attention, onOpenDaily }: { save: Save; attention: boolean; onOpenDaily: () => void }) {
  const need = xpToNext(save.level);
  return (
    <header className="topbar">
      <div className="lvl">
        <span className="lvl-num">{save.level}</span>
        <div className="xpbar"><div style={{ width: `${(save.xp / need) * 100}%` }} /></div>
      </div>
      <div className="money"><Icon name="coin" size={20} /> {save.coins}</div>
      <div className="money"><Icon name="cloud" size={20} /> {save.clouds}</div>
      <button className="money icon-btn daily-btn" onClick={onOpenDaily} aria-label="Награды и задания">
        <Icon name="scroll" size={20} />
        {attention && <i className="tab-badge" />}
      </button>
      <AudioMenu />
    </header>
  );
}

/** Кнопка звука: открывает два переключателя — эффекты и музыка */
function AudioMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(audioPrefs);
  const toggle = (kind: 'sfx' | 'music') => {
    const on = !prefs[kind];
    if (kind === 'sfx') setSfx(on);
    else setMusic(on);
    setPrefs({ ...audioPrefs() });
  };
  const allOff = !prefs.sfx && !prefs.music;
  // Ярлык игры на экран телефона — предлагаем, только если Telegram это умеет и ярлыка ещё нет
  const [homeMissing, setHomeMissing] = useState(false);
  useEffect(() => {
    if (open) homeScreenStatus().then((s) => setHomeMissing(s === 'missing'));
  }, [open]);
  return (
    <div className="audio-menu">
      <button className="money icon-btn" onClick={() => setOpen(!open)} aria-label="Звук">
        <Icon name={allOff ? 'mute' : 'speaker'} size={20} />
      </button>
      {open && <div className="pop-backdrop" onClick={() => setOpen(false)} />}
      {open && (
        <div className="audio-pop">
          <button className={'switch' + (prefs.sfx ? ' on' : '')} onClick={() => toggle('sfx')}>
            <Icon name="speaker" size={20} /> Звуки <i />
          </button>
          <button className={'switch' + (prefs.music ? ' on' : '')} onClick={() => toggle('music')}>
            <Icon name="note" size={20} /> Музыка <i />
          </button>
          {homeMissing && (
            <button className="switch home-add" onClick={() => { addToHomeScreen(); setOpen(false); }}>
              <Icon name="hall" size={20} /> На экран «Домой»
            </button>
          )}
        </div>
      )}
    </div>
  );
}
