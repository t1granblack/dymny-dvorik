// Конструктор мультяшных персонажей на SVG: крупная голова, обводка, плоские цвета.
// Внешность задаётся объектом Look, поэтому новых гостей можно собирать без художника.

/** love — в восторге (3 звезды), sad — расстроен (1 звезда) */
export type Mood = 'smile' | 'happy' | 'neutral' | 'love' | 'sad';

export type HairStyle = 'short' | 'messy' | 'slick' | 'long' | 'bob' | 'curly' | 'bun' | 'ponytail' | 'bald';

export interface Look {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  shirt: string;
  top?: 'tee' | 'suit' | 'hoodie' | 'jacket' | 'coat';
  inner?: string; // цвет футболки под курткой
  tie?: string;
  bowtie?: boolean;
  beard?: 'full' | 'stubble' | 'mustache';
  glasses?: 'round' | 'sun';
  hat?: 'fedora' | 'grad' | 'cap' | 'beanie';
  hatColor?: string;
  headphones?: string;
  earring?: boolean;
  chain?: string; // цвет цепи на шее
  faceTattoo?: boolean;
  pin?: boolean; // значок на лацкане
  lipstick?: string;
  blush?: boolean;
  mood?: Mood;
}

export const INK = '#120b09';
const SW = 3;
const ink = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

interface Props {
  look: Look;
  /** portrait — только голова и плечи, для маленьких аватарок */
  portrait?: boolean;
  className?: string;
}

export function Character({ look, portrait, className }: Props) {
  const viewBox = portrait ? '6 -8 108 108' : '0 -14 120 176';
  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true">
      <BackHair look={look} />
      <Body look={look} />
      {/* шея */}
      <rect x={51} y={74} width={18} height={22} rx={4} fill={look.skin} {...ink} />
      <Collar look={look} />
      {look.chain && (
        <g>
          <path d="M44,94 Q60,124 76,94" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
          <path d="M44,94 Q60,124 76,94" fill="none" stroke={look.chain} strokeWidth={3.5} strokeLinecap="round" strokeDasharray="3 2" />
          <circle cx={60} cy={112} r={6} fill={look.chain} {...ink} />
        </g>
      )}
      {look.pin && <circle cx={44} cy={110} r={3.5} fill="#f2c14e" stroke={INK} strokeWidth={2} />}
      {/* уши */}
      <ellipse cx={28} cy={54} rx={7} ry={8} fill={look.skin} {...ink} />
      <ellipse cx={92} cy={54} rx={7} ry={8} fill={look.skin} {...ink} />
      {look.earring && <circle cx={27} cy={64} r={3} fill="#f2c14e" stroke={INK} strokeWidth={2} />}
      {/* голова */}
      <ellipse cx={60} cy={50} rx={32} ry={34} fill={look.skin} {...ink} />
      <Beard look={look} />
      <FrontHair look={look} />
      <Face look={look} />
      <Glasses look={look} />
      <Hat look={look} />
      {look.headphones && (
        <g>
          <path d="M25,52 C22,4 98,4 95,52" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <path d="M25,52 C22,4 98,4 95,52" fill="none" stroke={look.headphones} strokeWidth={4} strokeLinecap="round" />
          <rect x={17} y={44} width={13} height={22} rx={5} fill={look.headphones} {...ink} />
          <rect x={90} y={44} width={13} height={22} rx={5} fill={look.headphones} {...ink} />
        </g>
      )}
    </svg>
  );
}

/** Бигль Руби: трёхцветный, длинные висячие уши, хвост торчком с белым кончиком */
export function Dog({ portrait, className, mood }: { portrait?: boolean; className?: string; mood?: Mood }) {
  const sad = mood === 'sad';
  const tan = '#c97e3b';
  const ear = '#8f4f22';
  const white = '#fbf6ec';
  const black = '#2b2420';
  const viewBox = portrait ? '6 -8 108 108' : '0 -14 120 176';
  return (
    <svg viewBox={viewBox} className={(className ?? '') + (sad ? ' dog-sad' : '')} aria-hidden="true">
      {/* хвост: торчит вверх, кончик белый */}
      <g className="dog-tail">
        <path d="M92,140 C104,128 108,108 102,90" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <path d="M92,140 C104,128 108,108 102,90" fill="none" stroke={tan} strokeWidth={6} strokeLinecap="round" />
        <path d="M105,104 C105,98 104,94 102,90" fill="none" stroke={white} strokeWidth={6} strokeLinecap="round" />
      </g>
      {/* тело: рыжие бока, чёрная «попона» на плечах, белая грудь */}
      <path d="M24,162 C20,120 36,92 60,92 C84,92 100,120 96,162 Z" fill={tan} {...ink} />
      <path d="M26,150 C23,122 32,104 44,97 C39,114 38,134 42,152 Z" fill={black} />
      <path d="M94,150 C97,122 88,104 76,97 C81,114 82,134 78,152 Z" fill={black} />
      <path d="M42,162 C40,128 48,100 60,100 C72,100 80,128 78,162 Z" fill={white} />
      <path d="M24,162 C20,120 36,92 60,92 C84,92 100,120 96,162 Z" fill="none" {...ink} />
      {/* белые лапы */}
      <rect x={37} y={138} width={17} height={24} rx={7} fill={white} {...ink} />
      <rect x={66} y={138} width={17} height={24} rx={7} fill={white} {...ink} />
      <path d="M42,158 L42,162 M48,158 L48,162 M71,158 L71,162 M77,158 L77,162" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      {/* ошейник */}
      <path d="M38,92 Q60,104 82,92" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d="M38,92 Q60,104 82,92" fill="none" stroke="#e2553a" strokeWidth={5} strokeLinecap="round" />
      <circle cx={60} cy={103} r={5} fill="#f2c14e" {...ink} />
      {/* голова: рыжая, с белой проточиной по центру */}
      <ellipse cx={60} cy={50} rx={30} ry={30} fill={tan} {...ink} />
      <path d="M56,21 C58,19 62,19 64,21 L68,52 L52,52 Z" fill={white} />
      {/* длинные висячие уши поверх щёк */}
      <path d="M33,28 C18,28 13,50 15,74 C16,92 33,96 37,82 C40,66 40,44 38,32 Z" fill={ear} {...ink} />
      <path d="M87,28 C102,28 107,50 105,74 C104,92 87,96 83,82 C80,66 80,44 82,32 Z" fill={ear} {...ink} />
      {/* морда */}
      <ellipse cx={60} cy={64} rx={19} ry={14} fill={white} {...ink} />
      <path d="M53,55 C53,51 67,51 67,55 C67,59 62,61 60,61 C58,61 53,59 53,55 Z" fill={INK} />
      <circle cx={57.5} cy={54} r={1.6} fill="#fff" />
      {sad ? (
        <path d="M60,60 L60,65 M53,70 Q60,64 67,70" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      ) : (
        <>
          <path d="M60,60 L60,65 M53,66 Q60,71 67,66" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
          <path d="M56,68 C56,80 64,80 64,68 Z" fill="#ff7b8a" {...ink} />
        </>
      )}
      {/* глаза */}
      {mood === 'love' ? (
        <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round">
          <path d="M41,46 Q46,39 51,46" />
          <path d="M69,46 Q74,39 79,46" />
        </g>
      ) : (
        <>
          <ellipse cx={46} cy={44} rx={4} ry={5} fill={INK} />
          <ellipse cx={74} cy={44} rx={4} ry={5} fill={INK} />
          <circle cx={47.5} cy={42} r={1.5} fill="#fff" />
          <circle cx={75.5} cy={42} r={1.5} fill="#fff" />
        </>
      )}
      {sad && (
        <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round">
          <path d="M39,36 L50,33" />
          <path d="M70,33 L81,36" />
        </g>
      )}
    </svg>
  );
}

function Body({ look }: { look: Look }) {
  const shade = 'rgba(0,0,0,.18)';
  return (
    <g>
      {look.top === 'hoodie' && <path d="M32,100 C30,84 90,84 88,100 Z" fill={look.shirt} {...ink} />}
      <path d="M12,162 L15,122 C18,100 36,92 60,92 C84,92 102,100 105,122 L108,162 Z" fill={look.shirt} {...ink} />
      {/* линии рук */}
      <path d="M32,162 L34,126" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M88,162 L86,126" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M15,122 C18,100 36,92 60,92 L60,96 C40,96 26,104 22,124 L20,162 L12,162 Z" fill={shade} />
      {look.top === 'jacket' && (
        <>
          <path d="M48,94 L50,162 L70,162 L72,94 C66,98 54,98 48,94 Z" fill={look.inner ?? '#eee'} {...ink} />
          <path d="M48,94 L42,104 L50,130" fill="none" {...ink} />
          <path d="M72,94 L78,104 L70,130" fill="none" {...ink} />
        </>
      )}
      {look.top === 'hoodie' && (
        <>
          <path d="M54,98 L53,116" {...ink} fill="none" />
          <path d="M66,98 L67,116" {...ink} fill="none" />
          <path d="M40,140 L80,140 L78,156 L42,156 Z" fill="rgba(0,0,0,.15)" {...ink} />
        </>
      )}
      {look.top === 'suit' && (
        <>
          <path d="M48,93 L60,126 L72,93 Z" fill="#fff" {...ink} />
          <path d="M48,93 L40,102 L52,132 L60,126 Z" fill={look.shirt} {...ink} />
          <path d="M72,93 L80,102 L68,132 L60,126 Z" fill={look.shirt} {...ink} />
          {look.tie && <path d="M57,97 L63,97 L65,120 L60,127 L55,120 Z" fill={look.tie} {...ink} />}
          {look.bowtie && <path d="M50,94 L60,99 L70,94 L70,106 L60,101 L50,106 Z" fill="#1a1a1a" {...ink} />}
        </>
      )}
      {look.top === 'coat' && (
        <>
          <path d="M60,96 L60,162" {...ink} fill="none" />
          <path d="M44,90 L38,106 L56,122 L60,100 Z" fill={look.shirt} {...ink} />
          <path d="M76,90 L82,106 L64,122 L60,100 Z" fill={look.shirt} {...ink} />
          <circle cx={66} cy={136} r={2.5} fill={INK} />
          <circle cx={66} cy={150} r={2.5} fill={INK} />
        </>
      )}
    </g>
  );
}

// Вырез футболки поверх шеи
function Collar({ look }: { look: Look }) {
  if (look.top && look.top !== 'tee') return null;
  return <path d="M47,93 Q60,104 73,93" fill="none" {...ink} />;
}

function BackHair({ look }: { look: Look }) {
  const h = look.hair;
  switch (look.hairStyle) {
    case 'long':
      return <path d="M22,50 C20,10 100,10 98,50 L103,112 C92,120 82,114 80,104 L40,104 C38,114 28,120 17,112 Z" fill={h} {...ink} />;
    case 'bob':
      return <path d="M22,50 C20,12 100,12 98,50 L100,84 C92,92 84,90 82,82 L38,82 C36,90 28,92 20,84 Z" fill={h} {...ink} />;
    case 'bun':
      return <circle cx={60} cy={10} r={13} fill={h} {...ink} />;
    case 'ponytail':
      return (
        <g>
          <path d="M84,36 C110,38 116,78 104,104 C98,90 96,66 86,54 Z" fill={h} {...ink} />
          <rect x={86} y={38} width={10} height={9} rx={3} transform="rotate(20 91 42)" fill="#c23b3b" {...ink} />
        </g>
      );
    default:
      return null;
  }
}

function FrontHair({ look }: { look: Look }) {
  const h = look.hair;
  switch (look.hairStyle) {
    case 'short':
      return <path d="M27,52 C24,24 44,12 62,14 C82,15 97,28 93,52 C90,40 84,34 76,32 C66,38 50,38 40,33 C33,37 29,44 27,52 Z" fill={h} {...ink} />;
    case 'messy':
      return <path d="M27,52 C25,36 30,26 36,22 L37,8 L48,17 L55,3 L64,15 L74,5 L77,19 L89,15 L86,29 C92,36 94,44 93,52 C88,40 80,34 72,33 C62,39 48,39 40,34 C34,38 29,44 27,52 Z" fill={h} {...ink} />;
    case 'slick':
    case 'ponytail':
      return (
        <g>
          <path d="M27,54 C24,26 44,13 64,14 C84,15 96,30 93,54 C91,42 86,34 78,30 C62,29 44,30 34,40 C30,44 28,48 27,54 Z" fill={h} {...ink} />
          <path d="M44,22 C52,18 62,17 70,18" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    case 'long':
    case 'bob':
      return <path d="M28,52 C25,22 46,12 62,14 C82,15 97,28 92,52 C82,42 72,32 64,28 C56,38 42,44 28,52 Z" fill={h} {...ink} />;
    case 'bun':
      return <path d="M28,50 C26,22 46,14 60,15 C76,15 95,24 92,50 C88,36 76,28 60,28 C44,28 32,36 28,50 Z" fill={h} {...ink} />;
    case 'curly': {
      const pts = [[29, 46], [32, 32], [42, 22], [54, 16], [67, 16], [79, 21], [88, 31], [91, 45]];
      return (
        <g>
          {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill={h} {...ink} />)}
          <path d="M34,40 C44,30 76,30 86,40 L86,30 L34,30 Z" fill={h} />
        </g>
      );
    }
    case 'bald':
      return (
        <g>
          <path d="M28,50 C27,42 30,37 34,36 L34,54 Z" fill={h} {...ink} />
          <path d="M92,50 C93,42 90,37 86,36 L86,54 Z" fill={h} {...ink} />
          <path d="M44,24 C50,20 58,19 64,20" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
  }
}

function Face({ look }: { look: Look }) {
  const mood = look.mood ?? 'smile';
  const hidden = look.glasses === 'sun';
  const brow = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinecap: 'round' } as const;
  return (
    <g>
      {(look.blush || mood === 'love') && (
        <>
          <ellipse cx={39} cy={64} rx={6} ry={3.5} fill="#ff7b7b" opacity={mood === 'love' ? 0.8 : 0.55} />
          <ellipse cx={81} cy={64} rx={6} ry={3.5} fill="#ff7b7b" opacity={mood === 'love' ? 0.8 : 0.55} />
        </>
      )}
      {/* брови: у расстроенного — домиком, видны даже над тёмными очками */}
      {mood === 'sad' ? (
        <>
          <path d="M40,42 L52,37" {...brow} />
          <path d="M68,37 L80,42" {...brow} />
        </>
      ) : (
        !hidden && (
          <>
            <path d="M40,42 Q46,38 52,41" {...brow} />
            <path d="M68,41 Q74,38 80,42" {...brow} />
          </>
        )
      )}
      {!hidden && mood === 'love' && (
        <>
          <path d="M42,53 Q47,46 52,53" {...brow} />
          <path d="M68,53 Q73,46 78,53" {...brow} />
        </>
      )}
      {!hidden && mood !== 'love' && (
        <>
          <ellipse cx={47} cy={52} rx={4} ry={5} fill={INK} />
          <ellipse cx={73} cy={52} rx={4} ry={5} fill={INK} />
          <circle cx={48.5} cy={50} r={1.5} fill="#fff" />
          <circle cx={74.5} cy={50} r={1.5} fill="#fff" />
        </>
      )}
      {mood === 'sad' && <path d="M88,30 C84,38 84,42 88,42 C92,42 92,38 88,30 Z" fill="#8fd3ff" stroke={INK} strokeWidth={2} />}
      {look.faceTattoo && (
        <g fill={INK}>
          <path d="M80,62 l1.5,3 l3.3,.3 l-2.5,2.2 l.8,3.2 l-3.1,-1.7 l-3,1.7 l.8,-3.2 l-2.5,-2.2 l3.3,-.3 Z" />
          <path d="M38,64 l2,2 M42,62 l1,3" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      )}
      {/* нос */}
      <path d="M58,57 Q61,62 64,59" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      {mood === 'smile' && <path d="M51,67 Q60,75 69,67" fill="none" stroke={look.lipstick ?? INK} strokeWidth={3} strokeLinecap="round" />}
      {(mood === 'happy' || mood === 'love') && <path d="M50,66 Q60,80 70,66 Z" fill="#7a1f1f" {...ink} />}
      {mood === 'sad' && <path d="M51,72 Q60,64 69,72" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />}
      {mood === 'neutral' && <path d="M53,69 L67,68" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />}
    </g>
  );
}

function Beard({ look }: { look: Look }) {
  const h = look.hair;
  switch (look.beard) {
    case 'full':
      return <path d="M28,54 C29,84 46,94 60,94 C74,94 91,84 92,54 C86,68 78,74 70,72 C64,70 56,70 50,72 C42,74 34,68 28,54 Z" fill={h} {...ink} />;
    case 'stubble':
      return <path d="M30,58 C32,82 46,90 60,90 C74,90 88,82 90,58 C84,70 76,74 60,74 C44,74 36,70 30,58 Z" fill={h} opacity={0.3} />;
    case 'mustache':
      return <path d="M47,65 C51,59 57,61 60,63 C63,61 69,59 73,65 C67,68 63,66 60,65 C57,66 53,68 47,65 Z" fill={h} {...ink} />;
    default:
      return null;
  }
}

function Glasses({ look }: { look: Look }) {
  if (look.glasses === 'round')
    return (
      <g fill="rgba(255,255,255,.15)" stroke={INK} strokeWidth={2.5}>
        <circle cx={47} cy={52} r={9} />
        <circle cx={73} cy={52} r={9} />
        <path d="M56,51 Q60,48 64,51" fill="none" />
      </g>
    );
  if (look.glasses === 'sun')
    return (
      <g>
        <path d="M34,46 L58,46 L56,58 C54,62 40,62 37,58 Z" fill={INK} />
        <path d="M62,46 L86,46 L83,58 C80,62 66,62 64,58 Z" fill={INK} />
        <path d="M58,48 L62,48" stroke={INK} strokeWidth={3} />
        <path d="M40,49 L46,49" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        <path d="M68,49 L74,49" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      </g>
    );
  return null;
}

function Hat({ look }: { look: Look }) {
  const c = look.hatColor ?? '#333';
  switch (look.hat) {
    case 'fedora':
      return (
        <g>
          <path d="M34,26 C33,6 40,-6 60,-6 C80,-6 87,6 86,26 Z" fill={c} {...ink} />
          <path d="M50,-4 Q60,4 70,-4" fill="none" {...ink} />
          <rect x={34} y={16} width={52} height={7} fill="#8a5cf6" {...ink} />
          <ellipse cx={60} cy={26} rx={47} ry={8} fill={c} {...ink} />
        </g>
      );
    case 'grad':
      return (
        <g>
          <path d="M36,26 C36,14 84,14 84,26 Z" fill={c} {...ink} />
          <path d="M60,0 L102,12 L60,24 L18,12 Z" fill={c} {...ink} />
          <path d="M60,12 L94,16 L94,32" fill="none" stroke="#f2c14e" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M27,40 C26,12 94,12 93,40 Z" fill={c} {...ink} />
          <path d="M66,38 C80,34 100,36 106,44 C96,46 78,44 66,42 Z" fill={c} {...ink} />
          <circle cx={60} cy={15} r={3} fill={INK} />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <circle cx={60} cy={4} r={7} fill={c} {...ink} />
          <path d="M28,40 C26,10 94,10 92,40 Z" fill={c} {...ink} />
          <rect x={26} y={32} width={68} height={11} rx={4} fill={c} {...ink} />
        </g>
      );
    default:
      return null;
  }
}
