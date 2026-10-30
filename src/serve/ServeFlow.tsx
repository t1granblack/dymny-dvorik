import { useState } from 'react';
import { Icon } from '../art/Icon';
import { Guest, MixPart, Save, ServeResult, buildResult, scoreMix } from '../game/state';
import { Combo, difficulty, flavorById, locationById } from '../game/data';
import { Avatar, Person } from '../screens/Hall';
import MixStep from './MixStep';
import PackStep from './PackStep';
import HeatStep from './HeatStep';
import ResultStep from './ResultStep';

type Step = 'order' | 'mix' | 'pack' | 'heat' | 'result';
const STEPS: Step[] = ['order', 'mix', 'pack', 'heat', 'result'];
const STEP_LABEL: Record<Step, string> = { order: 'Заказ', mix: 'Микс', pack: 'Забивка', heat: 'Жар', result: 'Подача' };

interface Props {
  save: Save;
  guest: Guest;
  onDone: (r: ServeResult) => void;
  onCancel: () => void;
  onSeenHint: (id: string) => void;
}

export default function ServeFlow({ save, guest, onDone, onCancel, onSeenHint }: Props) {
  const [step, setStep] = useState<Step>('order');
  const [mix, setMix] = useState<{ parts: MixPart[]; score: number; combos: Combo[]; signatureId?: string } | null>(null);
  const [pack, setPack] = useState(0);
  const [result, setResult] = useState<ServeResult | null>(null);
  // Первые 3 гостя — обучение с подсказками на каждом шаге
  const tutorial = save.served < 3;
  const boss = guest.type.boss;
  const d = difficulty(save.level, !!boss) + locationById(save.location).difficultyBonus;
  const dogHint = guest.type.dog ? guest.request.hint : undefined;
  // Механики, появившиеся после обучения, объясняем каждому игроку один раз
  const packHint = tutorial || !save.seenHints.includes('pack-even');
  const heatHint = tutorial || !save.seenHints.includes('heat-ash');

  return (
    <div className={'app serve' + (boss ? ' boss-serve' : '')}>
      <header className="serve-head">
        <button className="btn ghost" onClick={onCancel}><Icon name="close" size={22} /></button>
        <div className="steps">
          {STEPS.map((s) => (
            <span key={s} className={s === step ? 'on' : STEPS.indexOf(s) < STEPS.indexOf(step) ? 'done' : ''}>
              {STEP_LABEL[s]}
            </span>
          ))}
        </div>
      </header>

      <div className="mini-guest">
        <Avatar type={guest.type} className="small" />
        <span className="bubble">«{guest.request.text}»</span>
      </div>
      {dogHint && step === 'mix' && <div className="dog-hint">Подсказка: {dogHint}</div>}

      <main className="screen">
        {step === 'order' && (
          <div className="order">
            <div className="order-person">
              <Person type={guest.type} />
            </div>
            {boss && <div className="boss-tag">Мини-босс</div>}
            <h2>{guest.type.name}</h2>
            <p className="bubble big">«{guest.request.text}»</p>
            {boss && <p className="boss-intro">{boss.intro}</p>}
            {dogHint && (
              <p className="boss-intro">
                Говорить Руби не умеет, так что угадывай. Подсказка: {dogHint.toLowerCase()}. Угадаешь — откроешь секретный вкус.
              </p>
            )}
            {tutorial && (
              <p className="hint">Угадай, какие вкусы подойдут под запрос. Подсказка: у каждого вкуса есть теги — кислый, сладкий, свежий…</p>
            )}
            <button className="btn primary big" onClick={() => setStep('mix')}>Собрать микс</button>
          </div>
        )}

        {step === 'mix' && (
          <MixStep
            save={save}
            want={guest.request.tags}
            tutorial={tutorial && !dogHint}
            onDone={(parts, signatureId) => {
              const { score, combos } = scoreMix(parts, guest.request.tags, save.upgrades.storage);
              setMix({ parts, score, combos, signatureId });
              setStep('pack');
            }}
          />
        )}

        {step === 'pack' && mix && (
          <PackStep
            bowlLvl={save.upgrades.bowl}
            difficulty={d}
            colors={mix.parts.map((p) => flavorById(p.id).color)}
            tutorial={packHint}
            onDone={(s) => {
              if (packHint) onSeenHint('pack-even');
              setPack(s);
              setStep('heat');
            }}
          />
        )}

        {step === 'heat' && mix && (
          <HeatStep
            kalaudLvl={save.upgrades.kalaud}
            difficulty={d}
            boss={!!boss}
            tutorial={heatHint}
            onDone={(heat) => {
              if (heatHint) onSeenHint('heat-ash');
              setResult(buildResult(save, guest, mix.score, pack, heat, mix.combos, mix.parts, mix.signatureId));
              setStep('result');
            }}
          />
        )}

        {step === 'result' && result && mix && (
          <ResultStep
            guest={guest.type}
            result={result}
            parts={mix.parts}
            bossLine={
              boss
                ? result.bossWon ? boss.win : boss.lose
                : result.dogGuessed === null ? undefined
                : result.dogGuessed ? 'Руби носится кругами и счастливо гавкает — угадал!'
                : 'Руби вздыхает и кладёт морду на лапы. Не угадал…'
            }
            onNext={() => onDone(result)}
          />
        )}
      </main>
    </div>
  );
}
