import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from '../art/Icon';
import { MAX_SIGNATURES, Save, Signature, encodeMix, shares, signatureText, signatureUsable } from '../game/state';
import { BOSS, COMBOS, DOG, FLAVORS, GUESTS, TAG_LABEL, flavorById, mixSlots } from '../game/data';
import { GAME_URL, shareText, tgUser } from '../game/telegram';
import { Avatar, TopBar } from './Hall';
import SignatureEditor from './SignatureEditor';

/** Почему фирменный пока нельзя подать: закрытый вкус или мало слотов в чаше */
function lockReason(sig: Signature, save: Save) {
  const locked = sig.parts.map((p) => flavorById(p.id)).find((f) => f.unlock > save.level && !save.secretFlavors.includes(f.id));
  if (locked) return `${locked.name} откроется на ур. ${locked.unlock}`;
  return `нужно ${sig.parts.length} слота в чаше — прокачай склад`;
}

export default function Recipes({ save, setSave }: { save: Save; setSave: (s: Save) => void }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const share = async (sig: Signature) => {
    // Ссылка несёт сам микс: друг откроет игру — и микс уже у него в фирменных
    const link = `${GAME_URL}?startapp=${encodeMix(sig, tgUser()?.first_name)}`;
    const how = await shareText(signatureText(sig), link);
    if (how === 'copied') setNote('Текст скопирован — вставь его в любой чат');
    if (how === 'failed') setNote('Не получилось поделиться');
  };

  const remove = (id: string) => setSave({ ...save, signatures: save.signatures.filter((s) => s.id !== id) });

  return (
    <>
      <TopBar save={save} />

      <h2>Фирменные миксы</h2>
      {save.signatures.map((sig) => (
        <div key={sig.id} className="card signature">
          <div className="row">
            <div className="sig-icons">{sig.parts.map((p) => <Icon key={p.id} name={p.id} size={30} />)}</div>
            <div className="grow">
              <div className="strong sig-name">«{sig.name}»</div>
              <div className="muted small">
                {shares(sig.parts).map((s) => `${Math.round(s.share * 100)}% ${flavorById(s.id).name.toLowerCase()}`).join(' · ')}
              </div>
              <div className="muted small">
                {sig.from && <>От друга: {sig.from} · </>}
                {!signatureUsable(sig, save, mixSlots(save.upgrades.storage)) && (
                  <span className="sig-locked">{lockReason(sig, save)} · </span>
                )}
                {sig.served ? `Подан ${sig.served} раз · лучший ${'★'.repeat(sig.best)}` : 'Ещё ни разу не подан'}
              </div>
            </div>
          </div>
          <div className="actions small-actions">
            <button className="btn" onClick={() => remove(sig.id)} aria-label="Удалить"><Icon name="trash" size={18} /></button>
            <button className="btn primary grow" onClick={() => share(sig)}><Icon name="share" size={18} /> Поделиться</button>
          </div>
        </div>
      ))}
      {note && <p className="hint">{note}</p>}
      {save.signatures.length < MAX_SIGNATURES ? (
        <button className="btn new-sig" onClick={() => setEditing(true)}>
          <Icon name="plus" size={18} /> Придумать свой микс
        </button>
      ) : (
        <p className="muted small">Максимум {MAX_SIGNATURES} фирменных. Удали один, чтобы придумать новый.</p>
      )}
      {editing && (
        <SignatureEditor
          save={save}
          onClose={() => setEditing(false)}
          onSave={(sig) => {
            setSave({ ...save, signatures: [...save.signatures, sig] });
            setEditing(false);
          }}
        />
      )}

      <h2>Вкусы</h2>
      <div className="flavor-grid">
        {FLAVORS.map((f) => {
          const open = f.unlock <= save.level || save.secretFlavors.includes(f.id);
          return (
            <div key={f.id} className={'flavor-tile' + (open ? '' : ' locked') + (f.weird ? ' weird' : '')} style={{ '--c': f.color } as CSSProperties}>
              <Icon name={open ? f.id : 'lock'} size={38} />
              <div className="strong small">{open ? f.name : f.secret ? 'Секрет' : `Ур. ${f.unlock}`}</div>
              {open && <div className="tags">{f.tags.map((t) => <span key={t}>{TAG_LABEL[t]}</span>)}</div>}
            </div>
          );
        })}
      </div>

      <h2>Гости</h2>
      <div className="guest-grid">
        {[...GUESTS, DOG, BOSS].map((g) => {
          const open = g.unlock <= save.level && (!g.boss || save.bossWins > 0 || save.lastBossServed > 0);
          return (
            <div key={g.id} className={'guest-tile' + (open ? '' : ' locked') + (g.boss ? ' boss' : '')}>
              {open ? <Avatar type={g} className="big" /> : <div className="avatar big"><Icon name="question" size={40} /></div>}
              <div className="small strong">{open ? g.name : `Ур. ${g.unlock}`}</div>
            </div>
          );
        })}
      </div>

      <h2>Книга рецептов · {save.recipes.length}/{COMBOS.length}</h2>
      <p className="muted small">Удачные сочетания открываются, когда ты их находишь в миксе (каждого вкуса не меньше 20%).</p>
      {COMBOS.map((c) => {
        const open = save.recipes.includes(c.id);
        const a = flavorById(c.a);
        const b = flavorById(c.b);
        return (
          <div key={c.id} className={'card row recipe' + (open ? '' : ' locked')}>
            <div className="recipe-pair">{open ? <><Icon name={a.id} size={30} /><Icon name={b.id} size={30} /></> : <><Icon name="question" size={30} /><Icon name="question" size={30} /></>}</div>
            <div className="grow">
              <div className="strong">{open ? c.name : '???'}</div>
              <div className="muted small">{open ? `${a.name} + ${b.name}` : 'Ещё не открыто'}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}
