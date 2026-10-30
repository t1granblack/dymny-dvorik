import { useEffect, useRef, useState } from 'react';
import { Icon } from './art/Icon';
import {
  Save, loadSave, storeSave, applyResult, ServeResult, Guest, randomGuest, canAffordUpgrade,
  bossDue, withNewGuest, parseSave, decodeMix, importSignature, refreshDaily, dailyAttention,
} from './game/state';
import { nextStreak } from './game/daily';
import { seats } from './game/data';
import {
  bindBackButton, cloudAvailable, cloudLoad, cloudSave, haptic, setClosingConfirmation, startParam, tgUser,
} from './game/telegram';
import AgeGate from './screens/AgeGate';
import Hall, { TopBar } from './screens/Hall';
import type { Leaving } from './screens/Hall';
import Shop from './screens/Shop';
import DailyModal from './screens/DailyModal';
import { isHappy, reactionMood } from './game/reactions';
import { sfx } from './game/sound';
import { track } from './game/analytics';
import Upgrades from './screens/Upgrades';
import Recipes from './screens/Recipes';
import ServeFlow from './serve/ServeFlow';

type Tab = 'hall' | 'upgrades' | 'recipes' | 'shop';

export default function App() {
  const [save, setSave] = useState<Save>(loadSave);
  const [tab, setTab] = useState<Tab>('hall');
  const [queue, setQueue] = useState<Guest[]>(() => {
    const first = randomGuest(save.level);
    return [first, randomGuest(save.level, first.type.id)];
  });
  const [serving, setServing] = useState<Guest | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [leaving, setLeaving] = useState<Leaving | null>(null);

  useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(() => setLeaving(null), 1800);
    return () => clearTimeout(id);
  }, [leaving]);

  // Внутри Telegram сначала ждём копию из облака (не дольше пары секунд), чтобы на новом
  // устройстве не начать с нуля и не затереть облачный прогресс пустым сохранением
  const [ready, setReady] = useState(() => !cloudAvailable());
  // Время локальной копии на момент запуска: облачная копия новее неё — значит, играли на другом устройстве
  const localAtStart = useRef(save.updatedAt);
  // Пока облако не ответило, в него ничего не пишем: иначе медленный ответ на новом устройстве
  // приведёт к тому, что пустое сохранение затрёт настоящий прогресс
  const cloudChecked = useRef(!cloudAvailable());
  useEffect(() => {
    if (ready) return;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };
    const timeout = setTimeout(finish, 2500);
    cloudLoad().then((raw) => {
      const remote = parseSave(raw);
      if (remote && remote.updatedAt > localAtStart.current) setSave(remote);
      cloudChecked.current = true;
      clearTimeout(timeout);
      finish();
      flushCloud();
    });
    return () => clearTimeout(timeout);
  }, []);

  // Каждое изменение сразу пишем на устройство, а в облако — с задержкой, пачкой
  const pendingCloud = useRef<string | null>(null);
  useEffect(() => {
    if (!ready) return;
    const stamped = { ...save, updatedAt: Date.now() };
    storeSave(stamped);
    if (!cloudAvailable()) return;
    pendingCloud.current = JSON.stringify(stamped);
    const id = setTimeout(flushCloud, 1500);
    return () => clearTimeout(id);
  }, [save, ready]);

  function flushCloud() {
    const json = pendingCloud.current;
    if (!json || !cloudChecked.current) return;
    pendingCloud.current = null;
    // Не получилось записать — вернём в очередь, если за это время не появилось свежее
    cloudSave(json).then((ok) => {
      if (!ok && !pendingCloud.current) pendingCloud.current = json;
    });
  }

  // Игрок свернул Telegram — дописываем в облако то, что не успели
  useEffect(() => {
    // Свернул — дописываем облако; вернулся (возможно, уже на следующий день) — обновляем задания
    const onHide = () => (document.visibilityState === 'hidden' ? flushCloud() : setSave((s) => refreshDaily(s)));
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  const saveRef = useRef(save);
  saveRef.current = save;

  // Очередь гостей: новый гость приходит раз в несколько секунд, пока есть места.
  // Босс заходит, даже если мест нет.
  useEffect(() => {
    const id = setInterval(() => {
      const s = saveRef.current;
      // Сверх мест заходит только сам босс; пока он ждёт, обычные гости не набиваются бесконечно
      setQueue((q) => {
        const bossArrives = bossDue(s) && !q.some((g) => g.type.boss);
        return q.length < seats(s.upgrades.interior) || bossArrives ? withNewGuest(s, q) : q;
      });
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Первый вход за день: свежие задания и окно с наградой за вход
  const dailyShown = useRef(false);
  useEffect(() => {
    if (!ready || !save.ageOk || dailyShown.current) return;
    dailyShown.current = true;
    // Открытие игры: по нему считаются ежедневные игроки и удержание D1/D7/D30
    track('app_open', {
      level: save.level, location: save.location, served: save.served, link: startParam().split('_')[0] || null,
      $set: { level: save.level, location: save.location, served: save.served },
    });
    setSave((s) => refreshDaily(s));
    if (nextStreak(save.daily) !== null) setDailyOpen(true);
  }, [ready, save.ageOk]);

  const gotdKey = queue.find((g) => g.gotd)?.key;
  useEffect(() => {
    if (gotdKey) {
      haptic.success();
      sfx.doorbell();
      setToast('Пришёл гость дня — ищи корону!');
    }
  }, [gotdKey]);

  const bossKey = queue.find((g) => g.type.boss)?.key;
  useEffect(() => {
    if (bossKey) {
      haptic.warn();
      sfx.boss();
      setToast('В дверях кто-то необычный…');
    }
  }, [bossKey]);

  // Колокольчик на двери, когда заходит новый гость; Руби вместо этого гавкает
  const lastGuest = queue[queue.length - 1];
  const seenGuest = useRef(lastGuest?.key);
  useEffect(() => {
    if (!lastGuest || lastGuest.key === seenGuest.current) return;
    if (lastGuest.key > (seenGuest.current ?? 0) && !lastGuest.type.boss) {
      if (lastGuest.type.dog) sfx.bark();
      else sfx.doorbell();
    }
    seenGuest.current = lastGuest.key;
  }, [lastGuest]);

  // Мягкий щелчок на кнопках, у которых нет своего звука
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (btn && !btn.disabled && !btn.dataset.sound) sfx.click();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Игра открыта по ссылке с миксом друга — кладём его к фирменным. Иначе просто здороваемся по имени
  const greeted = useRef(false);
  useEffect(() => {
    if (!ready || !save.ageOk || greeted.current) return;
    greeted.current = true;
    const gift = decodeMix(startParam());
    if (gift) {
      const { save: next, result } = importSignature(save, gift);
      setSave(next);
      // Переход по ссылке «попробуй мой микс» — главный вирусный канал
      track('mix_link_opened', { result, fromFriend: !!gift.from });
      const who = gift.from ? ` от ${gift.from}` : '';
      if (result === 'added') {
        setTab('recipes');
        setToast(`Микс${who} «${gift.name}» — теперь в фирменных!`);
      } else if (result === 'full') {
        setToast('Фирменных уже 6 — удали один, чтобы принять микс друга');
      }
      return;
    }
    const name = tgUser()?.first_name;
    if (name) setToast(`Привет, ${name}! Кальянная открыта`);
  }, [ready, save.ageOk]);

  // Посреди обслуживания Telegram переспросит, точно ли закрыть игру
  useEffect(() => {
    setClosingConfirmation(!!serving);
    return () => setClosingConfirmation(false);
  }, [serving]);

  useEffect(() => bindBackButton(serving ? () => setServing(null) : null), [serving]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  if (!ready) {
    return (
      <div className="gate">
        <div className="gate-logo"><Icon name="smoke" size={90} /></div>
        <p className="muted">Загружаем твою кальянную…</p>
      </div>
    );
  }

  if (!save.ageOk) return <AgeGate onConfirm={() => setSave({ ...save, ageOk: true })} />;

  const finishGuest = (guest: Guest, r: ServeResult) => {
    const { save: next, levelUps } = applyResult(save, r);
    setSave(next);
    track('guest_served', {
      guest: guest.type.id, stars: r.stars, mix: r.mix, pack: r.pack, heat: r.heat, coins: r.coins + r.tips,
      flavors: r.flavors, signature: !!r.signature, boss: r.boss, dog: r.dogGuessed !== null, gotd: r.gotd,
      level: save.level, location: save.location, served: next.served,
    });
    // Обучение — первые 3 гостя: по этому событию видно, где новички бросают игру
    if (save.served < 3) track('tutorial_step', { step: next.served });
    levelUps.forEach((level) => track('level_up', { level }));
    setQueue((q) => {
      const rest = q.filter((g) => g.key !== guest.key);
      return rest.length ? rest : [randomGuest(next.level, guest.type.id)];
    });
    setServing(null);
    setLeaving({ guest, mood: reactionMood(guest.type, r), happy: isHappy(guest.type, r) });
    if (levelUps.length) {
      haptic.success();
      setTimeout(sfx.levelUp, 400);
      setToast(`Уровень ${levelUps[levelUps.length - 1]}! +25 монет, +5 облачков`);
    } else if (r.bossWon) {
      setToast(`Незнакомец доволен! +${r.clouds} облачков`);
    }
  };

  if (serving) {
    return (
      <ServeFlow
        save={save}
        guest={serving}
        onDone={(r) => finishGuest(serving, r)}
        onCancel={(step) => {
          track('serve_cancelled', { guest: serving.type.id, step });
          setServing(null);
        }}
        onSeenHint={(id) => setSave((s) => (s.seenHints.includes(id) ? s : { ...s, seenHints: [...s.seenHints, id] }))}
      />
    );
  }

  return (
    <div className="app">
      <div className="topbar-wrap">
        <TopBar save={save} attention={dailyAttention(save)} onOpenDaily={() => setDailyOpen(true)} />
      </div>
      <main className="screen">
        {tab === 'hall' && (
          <Hall
            save={save}
            setSave={setSave}
            queue={queue}
            onServe={setServing}
            onOpenUpgrades={() => setTab('upgrades')}
            leaving={leaving}
          />
        )}
        {tab === 'upgrades' && (
          <Upgrades
            save={save}
            setSave={setSave}
            onMoved={(place) => {
              setTab('hall');
              setToast(`Добро пожаловать: ${place} открыт!`);
            }}
          />
        )}
        {tab === 'recipes' && <Recipes save={save} setSave={setSave} />}
        {tab === 'shop' && <Shop save={save} setSave={setSave} />}
      </main>
      {dailyOpen && <DailyModal save={save} setSave={setSave} onClose={() => setDailyOpen(false)} />}
      {toast && <div className="toast">{toast}</div>}
      <nav className="tabs">
        <TabBtn active={tab === 'hall'} onClick={() => setTab('hall')} icon="hall" label="Зал" />
        <TabBtn active={tab === 'upgrades'} onClick={() => setTab('upgrades')} icon="upgrades" label="Прокачка" badge={canAffordUpgrade(save)} />
        <TabBtn active={tab === 'recipes'} onClick={() => setTab('recipes')} icon="recipes" label="Рецепты" />
        <TabBtn active={tab === 'shop'} onClick={() => setTab('shop')} icon="cloud" label="Магазин" />
      </nav>
    </div>
  );
}

function TabBtn(p: { active: boolean; onClick: () => void; icon: string; label: string; badge?: boolean }) {
  return (
    <button className={'tab' + (p.active ? ' active' : '')} onClick={p.onClick}>
      <span className="tab-icon">
        <Icon name={p.icon} size={26} />
        {p.badge && <i className="tab-badge" />}
      </span>
      <span>{p.label}</span>
    </button>
  );
}
