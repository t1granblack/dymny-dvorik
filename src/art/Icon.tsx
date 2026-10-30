// Набор иконок игры в одном стиле с персонажами: плоская заливка и тёмная обводка.
import type { ReactNode } from 'react';
import { INK } from './Character';

const ink = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
const line = { fill: 'none', ...ink } as const;

const ICONS: Record<string, ReactNode> = {
  // ---------- Валюта и интерфейс ----------
  coin: (
    <>
      <circle cx={24} cy={24} r={17} fill="#f2c14e" {...ink} />
      <circle cx={24} cy={24} r={11} fill="#e0a72e" {...ink} />
      <path d="M20,18 Q24,14 28,18 Q24,22 28,26 Q24,30 20,26" {...line} strokeWidth={2.2} />
      <path d="M12,18 Q14,12 19,10" fill="none" stroke="#fff6" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  cloud: (
    <path d="M13,34 C6,34 5,24 12,22 C11,14 21,10 25,16 C28,9 40,11 38,20 C45,21 45,34 37,34 Z" fill="#d9ccff" {...ink} />
  ),
  hall: (
    <>
      <path d="M8,22 L24,9 L40,22 L40,40 L8,40 Z" fill="#e2553a" {...ink} />
      <rect x={18} y={26} width={12} height={14} rx={2} fill="#5a3420" {...ink} />
      <circle cx={27} cy={33} r={1.3} fill="#f2c14e" />
      <path d="M12,22 L36,22" stroke="#ffd76a" strokeWidth={2.5} strokeDasharray="1 4" strokeLinecap="round" />
    </>
  ),
  upgrades: (
    <>
      <rect x={19} y={18} width={7} height={28} rx={3} transform="rotate(45 22 31)" fill="#c48a5e" {...ink} />
      <rect x={18} y={15} width={28} height={12} rx={3} transform="rotate(45 32 21)" fill="#9aa1ad" {...ink} />
    </>
  ),
  recipes: (
    <>
      <path d="M8,12 C14,9 20,10 24,13 L24,39 C20,36 14,35 8,38 Z" fill="#fff6e8" {...ink} />
      <path d="M40,12 C34,9 28,10 24,13 L24,39 C28,36 34,35 40,38 Z" fill="#f2a93b" {...ink} />
      <path d="M12,19 L19,18 M12,25 L19,24" {...line} strokeWidth={2} />
    </>
  ),
  bulb: (
    <>
      <path d="M24,7 C14,7 10,16 13,23 C15,27 18,29 18,33 L30,33 C30,29 33,27 35,23 C38,16 34,7 24,7 Z" fill="#ffd76a" {...ink} />
      <rect x={18} y={33} width={12} height={7} rx={2} fill="#9aa1ad" {...ink} />
      <path d="M20,17 Q22,13 26,13" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  bolt: <path d="M27,5 L11,27 L22,27 L19,43 L37,19 L26,19 Z" fill="#ffd76a" {...ink} />,
  lock: (
    <>
      <path d="M16,22 L16,15 C16,7 32,7 32,15 L32,22" {...line} strokeWidth={4} />
      <rect x={11} y={21} width={26} height={20} rx={4} fill="#f2a93b" {...ink} />
      <circle cx={24} cy={30} r={2.5} fill={INK} />
    </>
  ),
  question: (
    <>
      <circle cx={24} cy={24} r={16} fill="#4c362e" {...ink} />
      <path d="M19,19 C19,13 29,13 29,19 C29,23 24,23 24,28" fill="none" stroke="#fbefdf" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={24} cy={34} r={2.2} fill="#fbefdf" />
    </>
  ),
  close: <path d="M14,14 L34,34 M34,14 L14,34" fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" />,
  moon: <path d="M30,8 C20,10 15,22 19,31 C23,39 34,42 41,36 C30,36 22,26 30,8 Z" fill="#ffe08a" {...ink} />,
  smoke: (
    <>
      <path d="M14,40 C8,40 6,32 12,30 C8,24 14,18 20,21 C20,13 32,12 33,19 C40,16 46,24 40,29 C44,34 40,40 34,40 Z" fill="#efe6dc" {...ink} />
      <path d="M18,32 C22,28 28,34 32,29" {...line} strokeWidth={2} />
    </>
  ),

  heart: (
    <path d="M24,40 C10,30 5,22 8,15 C11,8 20,8 24,15 C28,8 37,8 40,15 C43,22 38,30 24,40 Z" fill="#ff5a7a" {...ink} />
  ),
  grumble: (
    <>
      <path d="M12,30 C5,30 5,20 11,19 C11,11 21,9 24,15 C27,9 38,10 37,18 C44,19 44,30 36,30 Z" fill="#6b6378" {...ink} />
      <path d="M16,36 L13,43 M24,35 L22,43 M32,36 L30,42" {...line} stroke="#8fd3ff" strokeWidth={3} />
      <path d="M17,22 l3,3 m0,-3 l-3,3 M27,22 l4,0 M33,21 l-2,4" {...line} stroke="#fff" strokeWidth={2} />
    </>
  ),
  speaker: (
    <>
      <path d="M8,19 L16,19 L26,10 L26,38 L16,29 L8,29 Z" fill="#fbefdf" {...ink} />
      <path d="M31,18 Q35,24 31,30 M35,13 Q42,24 35,35" {...line} stroke="currentColor" />
    </>
  ),
  mute: (
    <>
      <path d="M8,19 L16,19 L26,10 L26,38 L16,29 L8,29 Z" fill="#fbefdf" {...ink} />
      <path d="M32,18 L42,30 M42,18 L32,30" {...line} stroke="currentColor" strokeWidth={3} />
    </>
  ),
  dice: (
    <>
      <rect x={8} y={8} width={32} height={32} rx={7} fill="#fbefdf" {...ink} />
      {[[16, 16], [32, 16], [24, 24], [16, 32], [32, 32]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill={INK} />)}
    </>
  ),
  share: (
    <>
      <path d="M6,24 L42,8 L32,42 L22,28 Z" fill="#8fd3ff" {...ink} />
      <path d="M22,28 L42,8" {...line} />
    </>
  ),
  trash: (
    <>
      <path d="M12,14 L36,14 L33,42 L15,42 Z" fill="#9aa1ad" {...ink} />
      <path d="M8,14 L40,14 M19,14 L19,8 L29,8 L29,14 M20,20 L21,36 M28,20 L27,36" {...line} />
    </>
  ),
  plus: <path d="M24,10 L24,38 M10,24 L38,24" fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" />,
  note: (
    <>
      <path d="M18,34 L18,10 L38,6 L38,30" {...line} stroke="currentColor" strokeWidth={3} />
      <ellipse cx={14} cy={35} rx={6} ry={5} fill="currentColor" {...ink} />
      <ellipse cx={34} cy={31} rx={6} ry={5} fill="currentColor" {...ink} />
    </>
  ),

  // ---------- Улучшения ----------
  box: (
    <>
      <path d="M6,18 L24,10 L42,18 L42,36 L24,44 L6,36 Z" fill="#c48a5e" {...ink} />
      <path d="M6,18 L24,26 L42,18 M24,26 L24,44" {...line} />
      <path d="M15,14 L33,22 L33,28" {...line} strokeWidth={2} />
    </>
  ),
  bowl: (
    <>
      <path d="M8,14 L40,14 L32,32 L16,32 Z" fill="#b8693f" {...ink} />
      <ellipse cx={24} cy={14} rx={16} ry={4} fill="#3b2418" {...ink} />
      <rect x={20} y={32} width={8} height={10} rx={2} fill="#9a5432" {...ink} />
    </>
  ),
  kalaud: (
    <>
      <path d="M8,32 C8,14 40,14 40,32 Z" fill="#9aa1ad" {...ink} />
      <rect x={6} y={31} width={36} height={7} rx={3} fill="#7c838f" {...ink} />
      <path d="M20,9 Q24,4 24,11 Q28,6 28,13" {...line} stroke="#e2553a" />
      <circle cx={17} cy={26} r={2} fill={INK} />
      <circle cx={24} cy={24} r={2} fill={INK} />
      <circle cx={31} cy={26} r={2} fill={INK} />
    </>
  ),
  flask: (
    <>
      <rect x={21} y={4} width={6} height={16} rx={2} fill="#9aa1ad" {...ink} />
      <path d="M19,18 L29,18 L29,22 C38,25 41,32 37,39 C34,44 14,44 11,39 C7,32 10,25 19,22 Z" fill="#7fd0e8" {...ink} />
      <path d="M12,34 C18,31 30,37 36,33 C37,38 34,42 24,42 C14,42 11,38 12,34 Z" fill="#4aa6c4" />
      <path d="M16,28 Q18,25 21,24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  sofa: (
    <>
      <rect x={10} y={14} width={28} height={16} rx={4} fill="#e2553a" {...ink} />
      <rect x={4} y={22} width={10} height={16} rx={4} fill="#c9452c" {...ink} />
      <rect x={34} y={22} width={10} height={16} rx={4} fill="#c9452c" {...ink} />
      <rect x={13} y={28} width={22} height={10} rx={2} fill="#e2553a" {...ink} />
      <path d="M8,38 L8,42 M40,38 L40,42" {...line} />
    </>
  ),

  // ---------- Вкусы ----------
  mint: (
    <>
      <path d="M24,42 C10,36 6,20 16,8 C30,14 32,30 24,42 Z" fill="#3ecf8e" {...ink} />
      <path d="M24,42 C38,38 44,24 38,12 C26,16 22,30 24,42 Z" fill="#2fae74" {...ink} />
      <path d="M24,40 C20,30 18,22 16,12 M24,40 C28,32 32,24 37,15" {...line} strokeWidth={2} />
    </>
  ),
  watermelon: (
    <>
      <path d="M5,16 L43,16 C43,30 34,40 24,40 C14,40 5,30 5,16 Z" fill="#3a9d4a" {...ink} />
      <path d="M10,16 L38,16 C38,27 31,34 24,34 C17,34 10,27 10,16 Z" fill="#ff5a6e" />
      <path d="M5,16 L43,16" {...line} />
      <path d="M18,22 l1.5,3 M24,25 l0,3 M30,22 l-1.5,3" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  lemon: (
    <>
      <path d="M6,25 C6,14 16,8 24,8 C32,8 42,14 42,25 C42,34 32,40 24,40 C16,40 6,34 6,25 Z" fill="#ffd23f" {...ink} />
      <path d="M6,25 L2,23 M42,25 L46,23" {...line} strokeWidth={3} />
      <path d="M14,18 Q18,13 24,13" fill="none" stroke="#fff8" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  blueberry: (
    <>
      <circle cx={16} cy={30} r={10} fill="#5b6cff" {...ink} />
      <circle cx={32} cy={30} r={10} fill="#4a58d8" {...ink} />
      <circle cx={24} cy={17} r={10} fill="#6a7bff" {...ink} />
      <path d="M21,15 L24,18 L27,15 M24,12 L24,18" {...line} strokeWidth={2} />
    </>
  ),
  vanilla: (
    <>
      <path d="M10,42 C16,30 22,22 36,8" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M10,42 C16,30 22,22 36,8" fill="none" stroke="#5a3420" strokeWidth={3} strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={24} cy={16} rx={5} ry={9} transform={`rotate(${a} 24 24)`} fill="#fff3c8" {...ink} />
      ))}
      <circle cx={24} cy={24} r={4} fill="#f2c14e" {...ink} />
    </>
  ),
  cardamom: (
    <>
      <path d="M24,6 C34,14 36,32 24,42 C12,32 14,14 24,6 Z" fill="#9cc25a" {...ink} />
      <path d="M24,8 L24,40 M18,14 C16,24 17,32 21,38 M30,14 C32,24 31,32 27,38" {...line} strokeWidth={2} />
    </>
  ),
  mango: (
    <>
      <path d="M12,30 C8,18 16,8 28,10 C40,12 44,26 36,36 C30,43 16,42 12,30 Z" fill="#ffa62b" {...ink} />
      <path d="M30,36 C38,32 41,24 38,18 C42,24 40,34 30,36 Z" fill="#e2553a" opacity={0.6} />
      <path d="M26,10 C28,4 36,2 40,6 C36,10 30,11 26,10 Z" fill="#3ecf8e" {...ink} />
    </>
  ),
  grapefruit: (
    <>
      <circle cx={24} cy={24} r={18} fill="#ff7b54" {...ink} />
      <circle cx={24} cy={24} r={13} fill="#ff9c86" stroke="#fff3" strokeWidth={2} />
      {[0, 60, 120].map((a) => (
        <path key={a} d="M24,11 L24,37" transform={`rotate(${a} 24 24)`} stroke="#fff8" strokeWidth={2} />
      ))}
      <circle cx={24} cy={24} r={2.5} fill="#fff" />
    </>
  ),
  strawberry: (
    <>
      <path d="M24,43 C12,36 6,24 10,16 C14,10 34,10 38,16 C42,24 36,36 24,43 Z" fill="#ff4f81" {...ink} />
      <path d="M14,12 L18,6 L22,11 L26,5 L30,11 L35,7 L34,14 C28,16 20,16 14,12 Z" fill="#3ecf8e" {...ink} />
      {[[17, 22], [24, 21], [31, 22], [20, 29], [28, 29], [24, 36]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={1.2} ry={1.8} fill="#ffe08a" />
      ))}
    </>
  ),
  cinnamon: (
    <>
      <rect x={8} y={8} width={11} height={34} rx={5} transform="rotate(-18 13 25)" fill="#a0522d" {...ink} />
      <rect x={24} y={8} width={11} height={34} rx={5} transform="rotate(12 29 25)" fill="#b8693f" {...ink} />
      <path d="M14,9 C17,12 17,15 14,17" transform="rotate(-18 13 25)" {...line} strokeWidth={2} />
      <path d="M30,9 C33,12 33,15 30,17" transform="rotate(12 29 25)" {...line} strokeWidth={2} />
    </>
  ),
  kiwi: (
    <>
      <circle cx={24} cy={24} r={18} fill="#8a6a3a" {...ink} />
      <circle cx={24} cy={24} r={14} fill="#9be15d" />
      <ellipse cx={24} cy={24} rx={5} ry={4} fill="#f6f2c8" />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={24 + 8 * Math.cos((i * Math.PI) / 5)} cy={24 + 8 * Math.sin((i * Math.PI) / 5)} r={1.3} fill={INK} />
      ))}
    </>
  ),
  caramel: (
    <>
      <path d="M14,18 L4,12 L6,24 L4,36 L14,30 Z" fill="#f2c14e" {...ink} />
      <path d="M34,18 L44,12 L42,24 L44,36 L34,30 Z" fill="#f2c14e" {...ink} />
      <rect x={12} y={14} width={24} height={20} rx={8} fill="#d98b3a" {...ink} />
      <path d="M17,20 Q20,17 24,18" fill="none" stroke="#fff8" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  bubblegum: (
    <>
      <circle cx={26} cy={22} r={15} fill="#ff8fc8" {...ink} />
      <path d="M18,16 Q21,11 27,11" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <path d="M8,40 C10,34 16,34 18,36 C20,32 26,33 26,37" fill="#ff6fb5" {...ink} />
    </>
  ),
  cola: (
    <>
      <path d="M20,4 L28,4 L28,10 C34,14 34,20 32,24 C34,30 34,38 32,44 L16,44 C14,38 14,30 16,24 C14,20 14,14 20,10 Z" fill="#7a3b1e" {...ink} />
      <rect x={15} y={26} width={18} height={9} fill="#e2553a" {...ink} />
      <path d="M18,30 Q24,27 30,31" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M20,14 L20,20" stroke="#fff6" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  peach: (
    <>
      <path d="M24,12 C10,10 4,24 10,34 C15,42 33,42 38,34 C44,24 38,10 24,12 Z" fill="#ffb07a" {...ink} />
      <path d="M24,13 C20,22 21,32 24,41" fill="none" stroke="#e8875a" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M24,12 C26,6 34,4 38,6 C34,11 28,13 24,12 Z" fill="#3ecf8e" {...ink} />
      <ellipse cx={14} cy={24} rx={3} ry={5} fill="#fff7" />
    </>
  ),
  passionfruit: (
    <>
      <circle cx={24} cy={24} r={18} fill="#8e4fbf" {...ink} />
      <circle cx={24} cy={24} r={12.5} fill="#ffc93a" />
      {[[20, 19], [28, 19], [24, 24], [18, 27], [30, 27], [24, 31]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.2} fill={INK} />
      ))}
    </>
  ),
  coconut: (
    <>
      <path d="M5,24 C5,36 14,42 24,42 C34,42 43,36 43,24 Z" fill="#7a4a2a" {...ink} />
      <path d="M10,24 C10,33 16,37 24,37 C32,37 38,33 38,24 Z" fill="#fbf7ee" />
      <path d="M5,24 L43,24" {...line} />
      <path d="M16,14 C20,8 30,8 34,14" {...line} stroke="#7a4a2a" strokeWidth={3} />
    </>
  ),
  doubleapple: (
    <>
      <path d="M17,16 C8,14 4,24 8,32 C11,38 17,40 20,37 C24,38 28,34 28,28 C28,18 22,15 17,16 Z" fill="#b8e05a" {...ink} />
      <path d="M31,16 C24,14 20,22 22,30 C24,38 30,41 33,38 C37,40 44,35 44,27 C44,19 38,15 31,16 Z" fill="#d23b3b" {...ink} />
      <path d="M31,16 C31,12 33,8 36,6 M17,16 C17,12 15,9 13,7" {...line} />
      <path d="M36,10 C40,8 44,10 44,12 C40,13 37,12 36,10 Z" fill="#3ecf8e" {...ink} />
    </>
  ),
  // ---------- Странная полка ----------
  plov: (
    <>
      <path d="M8,26 C10,16 38,16 40,26 Z" fill="#f6ead0" {...ink} />
      <path d="M14,22 l3,-1 M22,19 l3,1 M30,21 l3,-1 M18,24 l2,1 M27,24 l3,0" stroke="#e8873a" strokeWidth={3} strokeLinecap="round" />
      <path d="M4,26 L44,26 C42,38 34,42 24,42 C14,42 6,38 4,26 Z" fill="#3a7fc4" {...ink} />
      <path d="M10,32 Q24,36 38,32" fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="2 3" />
    </>
  ),
  zira: (
    <>
      <path d="M6,40 C10,26 38,26 42,40 Z" fill="#8a6a3a" {...ink} />
      {[[16, 34], [22, 31], [28, 33], [34, 36], [20, 37], [27, 38]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={3.2} ry={1.4} transform={`rotate(${i * 30 - 30} ${x} ${y})`} fill="#c9a46a" stroke={INK} strokeWidth={1.2} />
      ))}
      <path d="M24,8 C30,14 30,20 24,24 C18,20 18,14 24,8 Z" fill="#c9a46a" {...ink} />
    </>
  ),
  pickle: (
    <>
      <rect x={6} y={16} width={36} height={16} rx={8} transform="rotate(-25 24 24)" fill="#5f9e3a" {...ink} />
      {[[14, 26], [21, 22], [28, 19], [34, 16], [18, 31], [26, 28], [33, 24]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.4} fill="#c7e89a" />
      ))}
    </>
  ),
  condensed: (
    <>
      <rect x={10} y={8} width={28} height={34} rx={4} fill="#3a6fc4" {...ink} />
      <rect x={10} y={16} width={28} height={16} fill="#f3e7cf" {...ink} />
      <path d="M15,24 Q24,20 33,24" fill="none" stroke="#3a6fc4" strokeWidth={2.5} strokeLinecap="round" />
      <ellipse cx={24} cy={8} rx={14} ry={3} fill="#9aa1ad" {...ink} />
    </>
  ),
  seeds: (
    <>
      {[[16, 18, -20], [30, 16, 25], [22, 30, 10], [34, 32, -35], [12, 34, 40]].map(([x, y, a], i) => (
        <g key={i} transform={`rotate(${a} ${x} ${y})`}>
          <path d={`M${x},${y - 9} C${x + 6},${y - 4} ${x + 5},${y + 6} ${x},${y + 9} C${x - 5},${y + 6} ${x - 6},${y - 4} ${x},${y - 9} Z`} fill="#2f2924" {...ink} />
          <path d={`M${x},${y - 6} L${x},${y + 6}`} stroke="#d9d2c4" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      ))}
    </>
  ),
  shawarma: (
    <>
      <path d="M14,6 L34,6 L38,42 L10,42 Z" fill="#f6e2c4" {...ink} />
      <path d="M14,6 C18,14 30,14 34,6" fill="#d9a05b" {...ink} />
      <path d="M17,10 l3,3 M25,9 l-2,4 M30,10 l-2,3" stroke="#3ecf8e" strokeWidth={3} strokeLinecap="round" />
      <path d="M12,24 L36,20 M11,32 L37,28" fill="none" stroke="#d9a05b" strokeWidth={2.5} />
    </>
  ),
  borscht: (
    <>
      <path d="M4,20 L44,20 C42,36 34,42 24,42 C14,42 6,36 4,20 Z" fill="#f6efe2" {...ink} />
      <ellipse cx={24} cy={20} rx={18} ry={5} fill="#b0243a" {...ink} />
      <ellipse cx={24} cy={19} rx={6} ry={2.2} fill="#fff" />
      <path d="M20,13 Q22,9 20,6 M28,13 Q30,9 28,6" fill="none" stroke="#c9b8ff" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  noodles: (
    <>
      <path d="M8,14 L40,14 L35,42 L13,42 Z" fill="#f2c14e" {...ink} />
      <rect x={12} y={22} width={24} height={9} fill="#e2553a" {...ink} />
      <path d="M14,14 C16,8 20,12 22,7 C24,12 28,8 30,12 C32,8 34,10 34,14" fill="none" stroke="#fff3c8" strokeWidth={3} strokeLinecap="round" />
      <path d="M34,4 L26,20 M38,6 L30,20" stroke="#b07a50" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  protein: (
    <>
      <path d="M14,14 L34,14 L32,44 L16,44 Z" fill="#f4f1ea" {...ink} />
      <rect x={12} y={6} width={24} height={9} rx={3} fill="#2a2a2a" {...ink} />
      <rect x={16} y={24} width={16} height={12} fill="#3a7fc4" />
      <path d="M19,30 L29,30" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
  dogjoy: (
    <>
      <path d="M12,18 C6,14 8,6 14,8 C16,4 24,6 21,12 L30,21 C36,18 44,20 40,26 C44,30 36,36 32,30 L23,21 C18,26 10,24 12,18 Z" fill="#f6e2c4" {...ink} />
      <path d="M30,30 C32,36 26,40 22,38" fill="none" stroke="#e2553a" strokeWidth={0} />
      <path d="M34,38 C34,34 40,33 41,37 C42,33 48,34 46,39 C45,42 41,44 41,44 C41,44 36,42 34,38 Z" fill="#e2553a" {...ink} />
    </>
  ),
};

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={'icon ' + (className ?? '')} aria-hidden="true">
      {ICONS[name] ?? ICONS.question}
    </svg>
  );
}
