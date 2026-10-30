import { Icon } from '../art/Icon';
import { track } from '../game/analytics';
export default function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="gate">
      <div className="gate-logo"><Icon name="smoke" size={110} /></div>
      <h1>Дымный дворик</h1>
      <p className="muted">Мультяшный симулятор кальянной. Игра содержит тематику кальянов и предназначена только для взрослых.</p>
      <div className="badge18">18+</div>
      <button className="btn primary big" onClick={() => { track('age_confirmed'); onConfirm(); }}>
        Мне есть 18 лет
      </button>
    </div>
  );
}
