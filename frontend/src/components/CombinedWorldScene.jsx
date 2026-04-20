import { motion } from 'framer-motion';

const W = 800, H = 630;
const ROAD_Y = 380; 

// Capacities — scaled to realistic product range (1k–95k L) so tanks look meaningfully full
const MAX_WATER = 20000;
const TANK_COUNT = 6;
const WATER_PER_TANK = MAX_WATER / TANK_COUNT;

/* ── Seeded RNG for consistent random layouts ── */
function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xFFFFFFFF;
  };
}

// Key (y, leftBankX, rightBankX) anchor points sampled from the river bezier path.
// Right bank: M400,-50 → Q400,100 → 330,200 → T260,340 → Q230,410 → 180,580
// Left bank:  reverse → L130,580 → Q200,410 → 220,340 → T280,200 → Q320,100 → 320,-50
const RIVER_ANCHORS = [
  [-50, 320, 400],
  [ 22, 317, 396],
  [ 88, 310, 382],
  [147, 298, 361],
  [200, 280, 330],
  [270, 245, 285],
  [340, 220, 260],
  [380, 207, 244],
  [415, 193, 230],
  [495, 160, 200],
  [580, 130, 180],
];

function isOnRiver(x, y) {
  if (y < RIVER_ANCHORS[0][0] || y > RIVER_ANCHORS[RIVER_ANCHORS.length - 1][0]) return false;
  for (let i = 0; i < RIVER_ANCHORS.length - 1; i++) {
    const [y0, l0, r0] = RIVER_ANCHORS[i];
    const [y1, l1, r1] = RIVER_ANCHORS[i + 1];
    if (y >= y0 && y <= y1) {
      const t = (y - y0) / (y1 - y0);
      // 20px bank padding so no tree trunk sits at the water's edge
      return x >= (l0 + t * (l1 - l0)) - 20 && x <= (r0 + t * (r1 - r0)) + 20;
    }
  }
  return false;
}

/* ── Determine if a point overlaps the infrastructure ── */
function isExcludedZone(x, y) {
  // Road & Bridge band
  if (y > ROAD_Y - 22 && y < ROAD_Y + 38) return true;
  // Factory zone (top-right)
  if (x > 575 && y > ROAD_Y - 155 && y <= ROAD_Y) return true;
  // Central foreground — tanks/pump zone
  if (x > 175 && x < 710 && y > ROAD_Y + 22) return true;
  // River — accurate curve-traced exclusion
  if (isOnRiver(x, y)) return true;
  return false;
}

/* ── Generate trees (dense, corner-filling) ── */
const TREE_COUNT = 420;
const ALL_TREES = (() => {
  const rand = seededRand(0xDEBB1E);
  const trees = [];
  let tries = 0;
  while (trees.length < TREE_COUNT && tries < 60000) {
    tries++;
    const x = rand() * (W - 16) + 8;
    const y = rand() * (H - 24) + 8;
    if (!isExcludedZone(x, y) && !trees.some(t => Math.hypot(t.x - x, t.y - y) < 12)) {
      trees.push({
        id: trees.length,
        x, y,
        s: 0.42 + rand() * 0.68,
        c: Math.floor(rand() * 3),
        type: rand() > 0.88 ? 'rock' : 'tree',
      });
    }
  }
  return trees.sort((a, b) => a.y - b.y);
})();

// Deforestation sweeps from the top-left corner outward (sorted by x+y Manhattan distance)
const TREES_FROM_CORNER = [...ALL_TREES.filter(t => t.type === 'tree')]
  .sort((a, b) => (a.x + a.y) - (b.x + b.y));

const PALETTES = [
  ['#1b4332', '#2d6a4f', '#52b788'],
  ['#1a3c2f', '#276b4e', '#40916c'],
  ['#204c3b', '#2e7d5a', '#4aad80'],
];

/* ── 🌳 Single Pine Tree or Rock ── */
function ForestElement({ item, isCut, delay }) {
  const { x, y, s, c, type } = item;
  
  if (type === 'rock') {
    return (
      <g transform={`translate(${x},${y})`}>
        <ellipse cx={0} cy={-4*s} rx={12*s} ry={6*s} fill="#6b7280" />
        <ellipse cx={0} cy={-6*s} rx={9*s} ry={4*s} fill="#9ca3af" />
      </g>
    );
  }

  const [dark, mid, light] = PALETTES[c];
  const tw = 8 * s, th = 14 * s, ch = 48 * s, cw = 30 * s;

  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-tw / 2} y={-th} width={tw} height={th} rx={1.5} fill="#5a3212" />
      {isCut && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.55 }}>
          <ellipse cx={0} cy={-th} rx={tw / 2} ry={tw / 3} fill="#8B5E3C" />
          <ellipse cx={0} cy={-th} rx={tw / 3.5} ry={tw / 5} fill="none" stroke="#5a3212" strokeWidth="0.7" />
        </motion.g>
      )}
      <motion.g
        initial={{ rotate: 0, opacity: 1 }}
        animate={isCut ? { rotate: 90, opacity: 0 } : { rotate: 0, opacity: 1 }}
        transformTemplate={(vals) => `rotate(${vals.rotate ?? 0}, 0, 0)`}
        transition={{ delay, duration: 0.5, ease: 'easeIn' }}
      >
        <polygon points={`0,${-(ch + th)} ${-cw / 2},${-(ch * 0.3 + th)} ${cw / 2},${-(ch * 0.3 + th)}`} fill={light} />
        <polygon points={`0,${-(ch * 0.72 + th)} ${-cw * 0.46},${-(ch * 0.26 + th)} ${cw * 0.46},${-(ch * 0.26 + th)}`} fill={mid} />
        <polygon points={`0,${-(ch * 0.46 + th)} ${-cw * 0.28},${-(ch * 0.1 + th)} ${cw * 0.28},${-(ch * 0.1 + th)}`} fill={dark} />
      </motion.g>
    </g>
  );
}

/* ── 🛢️ Elevated Water Tank ── */
function ElevatedTank({ x, y, fillRatio, capacityLabel }) {
  const tankW = 34;
  const tankH = 50;
  const legH = 30;
  const fillH = fillRatio * tankH;

  return (
    <g transform={`translate(${x},${y})`}>
      <line x1={-14} y1={-legH} x2={-18} y2={0} stroke="#4b5563" strokeWidth={4} />
      <line x1={14} y1={-legH} x2={18} y2={0} stroke="#4b5563" strokeWidth={4} />
      <line x1={-16} y1={-16} x2={16} y2={-16} stroke="#6b7280" strokeWidth={3} />

      <rect x={-tankW/2} y={-legH - tankH} width={tankW} height={tankH} rx={4} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.5} />
      
      <g transform={`translate(${-tankW/2 + 2}, ${-legH - tankH + 2})`}>
        <g clipPath={`url(#tankClip-${x})`}>
          <motion.rect
            x={0} width={tankW - 4}
            initial={{ y: tankH - 4, height: 0 }}
            animate={{ y: tankH - 4 - fillH * 0.9, height: fillH * 0.9 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            fill="#3b82f6"
          />
        </g>
      </g>
      
      {/* Capacity Label — SVG doesn't support CSS textShadow; use stroke for contrast */}
      <text x={0} y={-legH - 8} textAnchor="middle" fill="#1e3a8a" fontSize="10" fontWeight="900" fontFamily="monospace"
        stroke="white" strokeWidth="3" paintOrder="stroke">
        {fillRatio > 0 ? capacityLabel : ''}
      </text>

      <path d={`M ${-tankW/2} ${-legH - tankH} Q 0 ${-legH - tankH - 12} ${tankW/2} ${-legH - tankH} Z`} fill="#94a3b8" />
      <rect x={-4} y={-legH} width={8} height={legH} fill="#374151" />
    </g>
  );
}

/* ── 🏭 Smoke Puff ── */
function SmokePuff({ cx, cy, intensity, delay }) {
  const size = 10 + intensity * 20;
  const color = intensity > 0.65 ? '#1a1a1a' : intensity > 0.35 ? '#444' : '#999';
  const driftX = ((delay * 7) % 2 - 1) * 20;
  const offsetCx = ((delay * 13) % 1 - 0.5) * 15;
  
  return (
    <motion.circle
      cx={cx + offsetCx}
      cy={cy}
      r={size / 2}
      fill={color}
      animate={{
        cy: [cy, cy - 80 - intensity * 60],
        r: [size / 2, size * 2.5],
        opacity: [0.85, 0],
        cx: [cx + offsetCx, cx + offsetCx + driftX],
      }}
      transition={{ duration: 2.5 + intensity, repeat: Infinity, delay, ease: 'easeOut' }}
    />
  );
}

/* ── 🚗 Ambient Traffic ── */
function Vehicle({ type, startX, destX, y, delay, duration }) {
  const isRight = destX > startX;
  // Separate motion (x only) from static positioning (y + directional flip)
  // Mixing framer-motion x with SVG transform scale on the same element
  // inverts the x axis for left-moving vehicles, so they must be kept separate.
  return (
    <motion.g
      initial={{ x: startX }}
      animate={{ x: destX }}
      transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
    >
      <g transform={`translate(0, ${y}) scale(${isRight ? 1 : -1}, 1)`}>
        {type === 'car' ? (
          <g>
            <rect x={-15} y={-8} width={30} height={10} rx={3} fill="#ef4444" />
            <rect x={-5} y={-16} width={14} height={9} rx={2} fill="#b91c1c" />
            <rect x={-3} y={-15} width={5} height={6} rx={1} fill="#bfdbfe" opacity={0.9} />
            <rect x={4}  y={-15} width={4} height={6} rx={1} fill="#bfdbfe" opacity={0.9} />
            <circle cx={14} cy={-3} r={2} fill="#fef9c3" />
            <circle cx={-9} cy={2} r={4} fill="#1f2937" />
            <circle cx={-9} cy={2} r={1.5} fill="#9ca3af" />
            <circle cx={9}  cy={2} r={4} fill="#1f2937" />
            <circle cx={9}  cy={2} r={1.5} fill="#9ca3af" />
          </g>
        ) : (
          <g>
            <rect x={-24} y={-12} width={28} height={14} rx={2} fill="#f59e0b" />
            <rect x={7}   y={-14} width={16} height={16} rx={2} fill="#d97706" />
            <rect x={9}   y={-12} width={9}  height={7}  rx={1} fill="#bfdbfe" opacity={0.9} />
            <circle cx={22}  cy={-2} r={2} fill="#fef9c3" />
            <circle cx={-14} cy={2} r={4} fill="#1f2937" />
            <circle cx={-14} cy={2} r={1.5} fill="#9ca3af" />
            <circle cx={-2}  cy={2} r={4} fill="#1f2937" />
            <circle cx={-2}  cy={2} r={1.5} fill="#9ca3af" />
            <circle cx={14}  cy={2} r={4} fill="#1f2937" />
            <circle cx={14}  cy={2} r={1.5} fill="#9ca3af" />
          </g>
        )}
      </g>
    </motion.g>
  );
}

/* ── 🪓 Lumberjack — fixed position, always chopping ── */
function Axeman({ choppedCount }) {
  const cx = 88;
  const cy = 220;

  // Chop cycle: 0.9s total. Fast downstroke in first 18%, slow raise for remaining 82%.
  // times[1]=0.18 is the IMPACT moment — all effects trigger here.
  const D = 1.0;
  const T = [0, 0.18, 1];
  const E = ['easeIn', 'easeOut'];

  // 6 wood chips, each flying to a different angle from the strike point
  const CHIPS = [
    { dx: 20, dy: -22, r: 10 },
    { dx: 30, dy: -10, r: 80 },
    { dx: 26, dy:  8,  r: 40 },
    { dx: 10, dy: -30, r: -20 },
    { dx: 36, dy: -4,  r: 120 },
    { dx: 14, dy:  14, r: -60 },
  ];

  return (
    <g transform={`translate(${cx}, ${cy})`}>

      {/* ── Tree being chopped ── */}
      <g transform="translate(60, 0)">
        <line x1={-8} y1={0} x2={-14} y2={9}  stroke="#5a3212" strokeWidth={4} strokeLinecap="round" />
        <line x1={8}  y1={0} x2={14}  y2={9}  stroke="#5a3212" strokeWidth={4} strokeLinecap="round" />
        <rect x={-7} y={-64} width={14} height={64} rx={3} fill="#7c4a1e" />
        <rect x={-7} y={-64} width={4}  height={64} rx={2} fill="#92400e" opacity={0.35} />
        {/* V-notch from axe strikes */}
        <path d="M -7,-16 L 7,-12 L -7,-8 Z"  fill="#5a3212" />
        <path d="M  7,-16 L -5,-12 L  7,-8 Z"  fill="#a16207" />
        <ellipse cx={0} cy={-12} rx={5} ry={3} fill="#d97706" opacity={0.55} />
        {/* Crown shakes sharply at impact, settles slowly */}
        <motion.g
          animate={{ x: [0, 0, 5, -4, 2, -1, 0, 0], rotate: [0, 0, 2, -2, 1, 0, 0, 0] }}
          transition={{ duration: D, repeat: Infinity, ease: 'easeOut',
            times: [0, 0.17, 0.22, 0.30, 0.38, 0.46, 0.55, 1] }}
        >
          <polygon points="0,-112 -32,-70  32,-70" fill="#52b788" />
          <polygon points="0,-96  -28,-60  28,-60" fill="#40916c" />
          <polygon points="0,-80  -24,-50  24,-50" fill="#2d6a4f" />
          <polygon points="0,-66  -20,-40  20,-40" fill="#1b4332" />
        </motion.g>
      </g>

      {/* ── Wood chips burst exactly at impact (t=0.18) ── */}
      {CHIPS.map(({ dx, dy, r }, i) => (
        <motion.rect
          key={`chip${i}`}
          width={7} height={3} rx={1}
          fill={i % 2 === 0 ? '#92400e' : '#d97706'}
          animate={{
            x:       [57, 57, 57 + dx, 57 + dx + 4],
            y:       [0,  0,  dy,      dy + 6],
            opacity: [0,  0,  1,       0],
            rotate:  [r,  r,  r + 120, r + 240],
          }}
          transition={{ duration: D, repeat: Infinity, delay: i * 0.02,
            times: [0, 0.16, 0.26, 0.5], ease: 'easeOut' }}
        />
      ))}

      {/* ── Lumberjack body — leaning into the chop ── */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
      >
        {/* Whole-body lean: forward on downstroke, back on raise */}
        <motion.g
          animate={{ rotate: [-3, 7, -3] }}
          transformTemplate={({ rotate }) => `rotate(${rotate ?? -3}, 1, 5)`}
          transition={{ duration: D, repeat: Infinity, times: T, ease: E }}
        >
          {/* Shadow */}
          <ellipse cx={2} cy={22} rx={18} ry={4} fill="rgba(0,0,0,0.18)" />
          {/* Boots */}
          <rect x={-14} y={10} width={12} height={12} rx={3} fill="#111827" />
          <rect x={4}   y={10} width={12} height={12} rx={3} fill="#111827" />
          <rect x={-15} y={17} width={14} height={5}  rx={2} fill="#1c1917" />
          <rect x={3}   y={17} width={14} height={5}  rx={2} fill="#1c1917" />
          {/* Jeans */}
          <rect x={-13} y={-4}  width={11} height={16} rx={2} fill="#1d4ed8" />
          <rect x={4}   y={-4}  width={11} height={16} rx={2} fill="#1d4ed8" />
          <line x1={-7}  y1={0} x2={-7}  y2={9} stroke="#1e40af" strokeWidth={1.5} opacity={0.7} />
          <line x1={10}  y1={0} x2={10}  y2={9} stroke="#1e40af" strokeWidth={1.5} opacity={0.7} />
          {/* Belt */}
          <rect x={-14} y={-7} width={30} height={5} rx={1.5} fill="#78350f" />
          <rect x={-3}  y={-8} width={8}  height={7} rx={1}   fill="#d97706" />
          {/* Red plaid flannel */}
          <rect x={-15} y={-30} width={32} height={25} rx={4} fill="#dc2626" />
          <line x1={-5}  y1={-30} x2={-5}  y2={-5} stroke="#9b1c1c" strokeWidth={3} />
          <line x1={5}   y1={-30} x2={5}   y2={-5} stroke="#9b1c1c" strokeWidth={3} />
          <line x1={-15} y1={-20} x2={17}  y2={-20} stroke="#9b1c1c" strokeWidth={2} />
          <line x1={-15} y1={-11} x2={17}  y2={-11} stroke="#9b1c1c" strokeWidth={2} />
          <path d="M -4,-30 L 1,-22 L 6,-30" fill="none" stroke="#b91c1c" strokeWidth={2.5} />
          {/* Left arm counter-balance */}
          <motion.g
            animate={{ rotate: [10, -18, 10] }}
            transformTemplate={({ rotate }) => `rotate(${rotate ?? 10}, -15, -26)`}
            transition={{ duration: D, repeat: Infinity, times: T, ease: E }}
          >
            <line x1={-15} y1={-26} x2={-26} y2={-8}  stroke="#dc2626" strokeWidth={9} strokeLinecap="round" />
            <line x1={-26} y1={-8}  x2={-24} y2={4}   stroke="#fde68a" strokeWidth={7} strokeLinecap="round" />
          </motion.g>
          {/* Neck */}
          <rect x={-4} y={-34} width={9} height={7} rx={2} fill="#fde68a" />
          {/* Head — nods forward on impact */}
          <motion.g
            animate={{ rotate: [-4, 8, -4] }}
            transformTemplate={({ rotate }) => `rotate(${rotate ?? -4}, 1, -40)`}
            transition={{ duration: D, repeat: Infinity, times: T, ease: E }}
          >
            <circle cx={1} cy={-49} r={17} fill="#fde68a" />
            <ellipse cx={-17} cy={-49} rx={4} ry={5} fill="#fbbf24" />
            <ellipse cx={18}  cy={-49} rx={4} ry={5} fill="#fbbf24" />
            <path d="M -13,-41 Q -16,-26 0,-21 Q 16,-26 13,-41 Z" fill="#92400e" />
            <path d="M -10,-41 Q -11,-29 0,-25 Q 11,-29 10,-41 Z" fill="#a16207" opacity={0.5} />
            {/* Squinting eyes */}
            <path d="M -9,-53 Q -6,-56 -3,-53" stroke="#1f2937" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <path d="M  4,-53 Q  7,-56 10,-53" stroke="#1f2937" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            {/* Furrowed brows */}
            <line x1={-10} y1={-59} x2={-3} y2={-56} stroke="#78350f" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={3}   y1={-56} x2={11} y2={-59} stroke="#78350f" strokeWidth={2.5} strokeLinecap="round" />
            {/* Gritted teeth */}
            <rect x={-5} y={-44} width={12} height={4} rx={1} fill="white" />
            <line x1={-2} y1={-44} x2={-2} y2={-40} stroke="#d1d5db" strokeWidth={1} />
            <line x1={2}  y1={-44} x2={2}  y2={-40} stroke="#d1d5db" strokeWidth={1} />
            <line x1={6}  y1={-44} x2={6}  y2={-40} stroke="#d1d5db" strokeWidth={1} />
            {/* Hard hat */}
            <rect x={-17} y={-73} width={36} height={13} rx={2.5} fill="#f59e0b" />
            <ellipse cx={1} cy={-67} rx={20} ry={7} fill="#fbbf24" />
            <rect x={-7}  y={-77} width={16} height={8} rx={2} fill="#fbbf24" />
            <rect x={-17} y={-70} width={36} height={4} fill="#d97706" />
            <text x={1} y={-61} textAnchor="middle" fontSize="8" fontWeight="900" fill="#92400e">⚡</text>
          </motion.g>

          {/* Swinging arm + axe: fast downstroke, slow raise */}
          <motion.g
            animate={{ rotate: [-44, 36, -44] }}
            transformTemplate={({ rotate }) => `rotate(${rotate ?? -44}, 15, -28)`}
            transition={{ duration: D, repeat: Infinity, times: T, ease: E }}
          >
            <line x1={15} y1={-28} x2={30} y2={-12} stroke="#dc2626" strokeWidth={9} strokeLinecap="round" />
            <line x1={28} y1={-14} x2={36} y2={2}   stroke="#fde68a" strokeWidth={7} strokeLinecap="round" />
            <line x1={34} y1={0}   x2={56} y2={26}  stroke="#92400e" strokeWidth={6} strokeLinecap="round" />
            <path d="M 50,20 C 68,-2 76,14 58,36 Z" fill="#6b7280" />
            <path d="M 50,20 C 56,6  70,10 58,36 Z" fill="#d1d5db" />
            <line x1={58} y1={36} x2={62} y2={20} stroke="#f8fafc" strokeWidth={2.5} strokeLinecap="round" />
            <path d="M 50,20 L 40,12 L 44,18 Z"    fill="#94a3b8" />
          </motion.g>
        </motion.g>

        {/* Speech bubble — outside lean group so it stays level */}
        <g transform="translate(40, -108)">
          <polygon points="0,72 -16,90 18,72" fill="white" stroke="#fca5a5" strokeWidth={1.5} />
          <rect x={0} y={0} width={230} height={76} rx={12}
            fill="white" stroke="#fca5a5" strokeWidth={2.5} />
          <text x={115} y={26} textAnchor="middle" fontSize="12" fontWeight="700" fill="#374151">🪓 For this product I felled</text>
          <text x={115} y={58} textAnchor="middle" fontSize="24" fontWeight="900" fill="#b91c1c">
            {choppedCount.toLocaleString()} trees
          </text>
        </g>
      </motion.g>
    </g>
  );
}

/* ── 💧 Water Operator Character ── */
function WaterOperator({ x, y, liters }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 180, damping: 14 }}
      >
        {/* Shadow */}
        <ellipse cx={1} cy={20} rx={16} ry={3.5} fill="rgba(0,0,0,0.18)" />
        {/* Boots */}
        <rect x={-12} y={9}  width={10} height={11} rx={2.5} fill="#111827" />
        <rect x={3}   y={9}  width={10} height={11} rx={2.5} fill="#111827" />
        <rect x={-13} y={15} width={12} height={5}  rx={2}   fill="#1c1917" />
        <rect x={2}   y={15} width={12} height={5}  rx={2}   fill="#1c1917" />
        {/* Navy trousers */}
        <rect x={-11} y={-4} width={9}  height={15} rx={2} fill="#1e3a5f" />
        <rect x={3}   y={-4} width={9}  height={15} rx={2} fill="#1e3a5f" />
        {/* Dark base shirt */}
        <rect x={-13} y={-26} width={27} height={24} rx={3} fill="#1f2937" />
        {/* Hi-vis yellow vest */}
        <rect x={-13} y={-26} width={11} height={24} rx={3} fill="#eab308" />
        <rect x={3}   y={-26} width={11} height={24} rx={3} fill="#eab308" />
        {/* Reflective strips */}
        <rect x={-13} y={-16} width={27} height={3.5} fill="#fef9c3" opacity={0.98} />
        <rect x={-13} y={-9}  width={27} height={3.5} fill="#fef9c3" opacity={0.98} />
        {/* Vest logo */}
        <text x={-2} y={-18} textAnchor="middle" fontSize="7" fontWeight="900" fill="#713f12">💧</text>
        {/* Left arm at side */}
        <line x1={-13} y1={-22} x2={-20} y2={-8} stroke="#eab308" strokeWidth={8} strokeLinecap="round" />
        <line x1={-20} y1={-8}  x2={-18} y2={4}  stroke="#fde68a" strokeWidth={6} strokeLinecap="round" />
        {/* Right arm holding clipboard */}
        <line x1={13}  y1={-22} x2={20}  y2={-12} stroke="#1f2937" strokeWidth={8} strokeLinecap="round" />
        <line x1={20}  y1={-12} x2={22}  y2={-2}  stroke="#fde68a" strokeWidth={6} strokeLinecap="round" />
        {/* Clipboard */}
        <rect x={19} y={-16} width={18} height={22} rx={2.5} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1.5} />
        <rect x={22} y={-19} width={12} height={6}  rx={1.5} fill="#6b7280" />
        <line x1={22} y1={-9}  x2={34} y2={-9}  stroke="#cbd5e1" strokeWidth={1.5} />
        <line x1={22} y1={-4}  x2={34} y2={-4}  stroke="#cbd5e1" strokeWidth={1.5} />
        <line x1={22} y1={1}   x2={34} y2={1}   stroke="#cbd5e1" strokeWidth={1.5} />
        {/* Neck */}
        <rect x={-4} y={-30} width={9} height={7} rx={2} fill="#fde68a" />
        {/* Head */}
        <circle cx={1} cy={-43} r={15} fill="#fde68a" />
        <ellipse cx={-15} cy={-43} rx={3.5} ry={4.5} fill="#fbbf24" />
        <ellipse cx={16}  cy={-43} rx={3.5} ry={4.5} fill="#fbbf24" />
        {/* Eyes */}
        <circle cx={-5}  cy={-46} r={2.5} fill="#1f2937" />
        <circle cx={6}   cy={-46} r={2.5} fill="#1f2937" />
        <circle cx={-4}  cy={-47} r={0.9} fill="white" />
        <circle cx={7}   cy={-47} r={0.9} fill="white" />
        {/* Friendly raised brows */}
        <path d="M -8,-51 Q -5,-53 -2,-51" stroke="#78350f" strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M 3,-51 Q 6,-53 9,-51"    stroke="#78350f" strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* Big smile */}
        <path d="M -5,-38 Q 1,-34 7,-38" stroke="#92400e" strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* Red hard hat */}
        <rect x={-16} y={-62} width={34} height={13} rx={3} fill="#ef4444" />
        <ellipse cx={1} cy={-57} rx={19} ry={6} fill="#dc2626" />
        <rect x={-5}  y={-66} width={12} height={7} rx={2} fill="#dc2626" />
        <rect x={-16} y={-59} width={34} height={4} fill="#b91c1c" />
        <text x={1} y={-52} textAnchor="middle" fontSize="7" fontWeight="900" fill="#fca5a5">H₂O</text>

        {/* Speech bubble — right, above road */}
        <g transform="translate(18, -130)">
          <rect x={0} y={0} width={210} height={64} rx={11}
            fill="white" stroke="#bfdbfe" strokeWidth={2.5} />
          <polygon points="0,64 -15,80 20,64" fill="white" stroke="#bfdbfe" strokeWidth={1.5} />
          <text x={105} y={22} textAnchor="middle" fontSize="11" fontWeight="700" fill="#374151">💧 I sourced for this Product:</text>
          <text x={105} y={50} textAnchor="middle" fontSize="22" fontWeight="900" fill="#1d4ed8">
            {liters.toLocaleString()} L
          </text>
        </g>
      </motion.g>
    </g>
  );
}

/* ── 🏭 Factory Worker Character ── */
function FactoryWorker({ x, y, carbonKg }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 180, damping: 14 }}
      >
        {/* Shadow */}
        <ellipse cx={1} cy={20} rx={16} ry={3.5} fill="rgba(0,0,0,0.18)" />
        {/* Boots */}
        <rect x={-12} y={9}  width={10} height={11} rx={2.5} fill="#111827" />
        <rect x={3}   y={9}  width={10} height={11} rx={2.5} fill="#111827" />
        <rect x={-13} y={15} width={12} height={5}  rx={2}   fill="#1c1917" />
        <rect x={2}   y={15} width={12} height={5}  rx={2}   fill="#1c1917" />
        {/* Grey work trousers */}
        <rect x={-11} y={-4} width={9}  height={15} rx={2} fill="#4b5563" />
        <rect x={3}   y={-4} width={9}  height={15} rx={2} fill="#4b5563" />
        {/* Dark coverall */}
        <rect x={-13} y={-26} width={27} height={24} rx={3} fill="#374151" />
        {/* Hi-vis orange vest */}
        <rect x={-13} y={-26} width={10} height={24} rx={3} fill="#f97316" />
        <rect x={4}   y={-26} width={10} height={24} rx={3} fill="#f97316" />
        {/* Reflective strips */}
        <rect x={-13} y={-16} width={27} height={3.5} fill="#fef9c3" opacity={0.98} />
        <rect x={-13} y={-9}  width={27} height={3.5} fill="#fef9c3" opacity={0.98} />
        {/* CO2 badge */}
        <rect x={-3} y={-24} width={7} height={7} rx={1} fill="#1f2937" />
        <text x={1} y={-18} textAnchor="middle" fontSize="5" fontWeight="900" fill="#f97316">CO₂</text>
        {/* Left arm */}
        <line x1={-13} y1={-22} x2={-21} y2={-8} stroke="#f97316" strokeWidth={8} strokeLinecap="round" />
        <line x1={-21} y1={-8}  x2={-19} y2={4}  stroke="#fde68a" strokeWidth={6} strokeLinecap="round" />
        {/* Right arm — waving */}
        <motion.g
          animate={{ rotate: [-30, 30, -30] }}
          transformTemplate={({ rotate }) => `rotate(${rotate ?? -30}, 13, -22)`}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <line x1={13} y1={-22} x2={22} y2={-10} stroke="#374151" strokeWidth={8} strokeLinecap="round" />
          <line x1={22} y1={-10} x2={24} y2={0}   stroke="#fde68a" strokeWidth={6} strokeLinecap="round" />
        </motion.g>
        {/* Neck */}
        <rect x={-4} y={-30} width={9} height={7} rx={2} fill="#fde68a" />
        {/* Head */}
        <circle cx={1} cy={-43} r={15} fill="#fde68a" />
        <ellipse cx={-15} cy={-43} rx={3.5} ry={4.5} fill="#fbbf24" />
        <ellipse cx={16}  cy={-43} rx={3.5} ry={4.5} fill="#fbbf24" />
        {/* Eyes */}
        <circle cx={-5} cy={-46} r={2.5} fill="#1f2937" />
        <circle cx={6}  cy={-46} r={2.5} fill="#1f2937" />
        <circle cx={-4} cy={-47} r={0.9} fill="white" />
        <circle cx={7}  cy={-47} r={0.9} fill="white" />
        {/* Smile */}
        <path d="M -5,-38 Q 1,-34 7,-38" stroke="#92400e" strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* Raised brow (concerned) */}
        <line x1={-9} y1={-52} x2={-2} y2={-50} stroke="#78350f" strokeWidth={2} strokeLinecap="round" />
        <line x1={2}  y1={-50} x2={9}  y2={-52} stroke="#78350f" strokeWidth={2} strokeLinecap="round" />
        {/* Yellow hard hat */}
        <rect x={-16} y={-62} width={34} height={13} rx={3} fill="#fbbf24" />
        <ellipse cx={1} cy={-57} rx={19} ry={6} fill="#f59e0b" />
        <rect x={-5}  y={-66} width={12} height={7} rx={2} fill="#f59e0b" />
        <rect x={-16} y={-59} width={34} height={4} fill="#d97706" />
        <text x={1} y={-52} textAnchor="middle" fontSize="7" fontWeight="900" fill="#92400e">🏭</text>

        {/* Speech bubble — goes LEFT */}
        <g transform="translate(-238, -130)">
          <rect x={0} y={0} width={230} height={64} rx={11}
            fill="white" stroke="#fed7aa" strokeWidth={2.5} />
          <polygon points="230,64 214,64 242,80" fill="white" stroke="#fed7aa" strokeWidth={1.5} />
          <text x={115} y={22} textAnchor="middle" fontSize="11" fontWeight="700" fill="#374151">🏭 This order emits:</text>
          <text x={115} y={50} textAnchor="middle" fontSize="22" fontWeight="900" fill="#374151">
            {carbonKg.toLocaleString()} kg CO₂e
          </text>
        </g>
      </motion.g>
    </g>
  );
}

/* ─── Main Combined World Scene ─── */
export default function CombinedWorldScene({ deforestationTrees, waterLiters, carbonKg, productName }) {
  const cutCount = Math.min(TREES_FROM_CORNER.length, Math.round((deforestationTrees / 400) * TREES_FROM_CORNER.length));
  const cutIds = new Set(TREES_FROM_CORNER.slice(0, cutCount).map(t => t.id));
  const carbonIntensity = Math.min(1, carbonKg / 10000);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ─── 🌍 3D Canvas View ─── */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-3xl overflow-hidden" style={{ border: '2px solid #e2e8f0', background: '#d8f3dc', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <defs>
          <linearGradient id="cwGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a3b18a" />
            <stop offset="100%" stopColor="#588157" />
          </linearGradient>
          <linearGradient id="riverFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#48cae4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <clipPath id="riverClip">
            <path d={`M 400,-50 Q 400,100 330,200 T 260,${ROAD_Y-40} Q 230,${ROAD_Y+30} 180,580 L 130,580 Q 200,${ROAD_Y+30} 220,${ROAD_Y-40} T 280,200 Q 320,100 320,-50 Z`} />
          </clipPath>
          {/* Tank fill clipPaths in defs — required for cross-browser correctness.
              Absolute coords: group(235,ROAD_Y+65) + tank(tx,-10) + inner translate(-15,-78) */}
          {[...Array(TANK_COUNT)].map((_, i) => {
            const tx = 80 + i * 55;
            return (
              <clipPath key={i} id={`tankClip-${tx}`}>
                <rect x={220 + tx} y={ROAD_Y - 3} width={30} height={46} rx={2} />
              </clipPath>
            );
          })}
        </defs>

        <rect width={W} height={H} fill="url(#cwGround)" />
        
        {/* Carbon smog haze — max opacity capped at 0.12 so it doesn't obscure scene detail */}
        <motion.rect
          width={W} height={H}
          fill={carbonIntensity > 0.65 ? '#332200' : '#554400'}
          animate={{ opacity: [carbonIntensity * 0.04, carbonIntensity * 0.12, carbonIntensity * 0.04] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          pointerEvents="none"
        />

        <path
          d={`M 400,-50 Q 400,100 330,200 T 260,${ROAD_Y-40} Q 230,${ROAD_Y+30} 180,580 L 130,580 Q 200,${ROAD_Y+30} 220,${ROAD_Y-40} T 280,200 Q 320,100 320,-50 Z`}
          fill="url(#riverFill)"
          opacity={0.8}
        />

        {/* ── RIVER FLOW ANIMATION ── */}
        <g clipPath="url(#riverClip)">
          {[
            { delay: 0,   sx: 358, sy: -20 },
            { delay: 0.8, sx: 370, sy: 30  },
            { delay: 1.5, sx: 345, sy: 80  },
            { delay: 2.2, sx: 360, sy: -50 },
            { delay: 2.9, sx: 340, sy: 50  },
            { delay: 3.6, sx: 372, sy: -10 },
            { delay: 0.4, sx: 346, sy: 120 },
            { delay: 1.1, sx: 328, sy: 160 },
          ].map(({ delay, sx, sy }, i) => (
            <motion.ellipse
              key={i}
              rx={5} ry={14}
              fill="rgba(255,255,255,0.4)"
              animate={{
                cx:      [sx,      sx - 195],
                cy:      [sy,      sy + 590],
                opacity: [0,  0.7, 0.5, 0],
                ry:      [12, 16,  12],
              }}
              transition={{ duration: 4.5, repeat: Infinity, delay, ease: 'linear' }}
            />
          ))}
          {/* Subtle darker current streak down centre */}
          {[{ delay: 0.2, sx: 358 }, { delay: 2.3, sx: 354 }].map(({ delay, sx }, i) => (
            <motion.ellipse
              key={`d${i}`}
              rx={3} ry={22}
              fill="rgba(2,132,199,0.35)"
              animate={{ cx: [sx, sx - 195], cy: [-30, 570] }}
              transition={{ duration: 5, repeat: Infinity, delay, ease: 'linear' }}
            />
          ))}
        </g>

        {/* ── BACKGROUND TREES ── */}
        {ALL_TREES.filter(t => t.y <= ROAD_Y).map((t, i) => (
          <ForestElement key={t.id} item={t} isCut={cutIds.has(t.id)} delay={i * 0.015} />
        ))}
        {/* Axeman always visible at fixed position, always chopping */}
        <Axeman choppedCount={deforestationTrees} />

        {/* ── FACTORY COMPLEX (Shifted back to Base Y=370, BEFORE road!) ── */}
        <g transform={`translate(615, ${ROAD_Y - 130})`}>
          <rect x={0} y={30} width={170} height={90} fill="#374151" />
          <rect x={-35} y={50} width={35} height={70} fill="#4b5563" />
          <rect x={40} y={90} width={40} height={30} fill="#1f2937" />
          {[10, 50, 90, 130].map(wx => <rect key={`w1-${wx}`} x={wx} y={45} width={16} height={12} fill="#fbbf24" opacity={0.8} />)}
          {[10, 50, 90, 130].map(wx => <rect key={`w2-${wx}`} x={wx} y={65} width={16} height={12} fill="#fbbf24" opacity={0.8} />)}
          {[20, 75, 130].map((cx, idx) => (
             <g key={cx}>
               <rect x={cx} y={-40 + idx*10} width={22} height={70 - idx*10} fill="#1f2937" />
               <rect x={cx-3} y={-46 + idx*10} width={28} height={10} rx={2} fill="#475569" />
               <rect x={cx-3} y={-30 + idx*10} width={28} height={4} fill="#475569" />
               {[0, 0.7, 1.4].map(d => (
                 <SmokePuff key={d} cx={cx+11} cy={-46 + idx*10} intensity={carbonIntensity} delay={d} />
               ))}
             </g>
          ))}
        </g>

        {/* ── SUPPLY PIPE: last tank → factory ── */}
        {/* Last tank top at (abs x=590, y=ROAD_Y-25). Route goes:
            right side of last tank → LEFT to x=577 (outside annex left wall at x=580) →
            UP to y=ROAD_Y-92 (above factory annex top at ROAD_Y-80) →
            RIGHT into factory main wall at x=616 */}
        <path
          d={`M 590,${ROAD_Y - 5} L 577,${ROAD_Y - 5} L 577,${ROAD_Y - 92} L 616,${ROAD_Y - 92}`}
          stroke="#475569" strokeWidth={8} fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Factory water inlet fitting */}
        <circle cx={616} cy={ROAD_Y - 92} r={7} fill="#374151" stroke="#94a3b8" strokeWidth={2} />
        <circle cx={616} cy={ROAD_Y - 92} r={3} fill="#60a5fa" />
        {/* Animated water: tanks → left stub → up riser → right into factory. Gate: tanks 50%+ */}
        {waterLiters > MAX_WATER * 0.5 && (
          <g>
            {[...Array(3)].map((_, i) => (
              <motion.circle key={`s1${i}`} cy={ROAD_Y - 5} r={3} fill="#3b82f6"
                animate={{ cx: [590, 578] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.17, ease: 'linear' }}
              />
            ))}
            {[...Array(4)].map((_, i) => (
              <motion.circle key={`s2${i}`} cx={577} r={3} fill="#3b82f6"
                animate={{ cy: [ROAD_Y - 5, ROAD_Y - 91] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3, ease: 'linear' }}
              />
            ))}
            {[...Array(3)].map((_, i) => (
              <motion.circle key={`s3${i}`} cy={ROAD_Y - 92} r={3} fill="#3b82f6"
                animate={{ cx: [578, 614] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.27, ease: 'linear' }}
              />
            ))}
          </g>
        )}

        {/* ── MAIN ROAD (left and right of bridge) ── */}
        <rect x={0}   y={ROAD_Y} width={193}     height={30} fill="#6b7280" />
        <rect x={317} y={ROAD_Y} width={W - 317} height={30} fill="#6b7280" />
        {/* Road edge lines (white kerb markings) */}
        <rect x={0}   y={ROAD_Y}      width={193}     height={2} fill="white" opacity={0.45} />
        <rect x={317} y={ROAD_Y}      width={W - 317} height={2} fill="white" opacity={0.45} />
        <rect x={0}   y={ROAD_Y + 28} width={193}     height={2} fill="white" opacity={0.45} />
        <rect x={317} y={ROAD_Y + 28} width={W - 317} height={2} fill="white" opacity={0.45} />

        {/* ── BRIDGE OVER THE RIVER ── */}
        <g>
          {/* Underside arch — rendered first so deck sits on top */}
          <path
            d={`M 190,${ROAD_Y + 32} Q 255,${ROAD_Y + 68} 320,${ROAD_Y + 32}`}
            stroke="#374151" strokeWidth={7} fill="none" strokeLinecap="round"
          />
          {/* Deck — darker metallic shade to distinguish from asphalt */}
          <rect x={192} y={ROAD_Y} width={126} height={30} fill="#4b5563" />
          {/* Top railing beam */}
          <rect x={189} y={ROAD_Y - 6} width={132} height={5} fill="#64748b" rx={1} />
          {/* Bottom railing beam */}
          <rect x={189} y={ROAD_Y + 31} width={132} height={5} fill="#64748b" rx={1} />
          {/* Top railing posts */}
          {[0, 18, 36, 54, 72, 90, 108, 126].map((px) => (
            <rect key={`rt${px}`} x={192 + px} y={ROAD_Y - 12} width={3} height={16} fill="#94a3b8" rx={1} />
          ))}
          {/* Bottom railing posts */}
          {[0, 18, 36, 54, 72, 90, 108, 126].map((px) => (
            <rect key={`rb${px}`} x={192 + px} y={ROAD_Y + 31} width={3} height={16} fill="#94a3b8" rx={1} />
          ))}
        </g>

        {/* Road centre dashes — skip the bridge zone (x 192–318) */}
        {[...Array(14)].map((_, i) => {
          const dx = i * 62 + 8;
          if (dx + 38 > 192 && dx < 318) return null;
          return <rect key={i} x={dx} y={ROAD_Y + 14} width={38} height={2} rx={1} fill="#9ca3af" opacity={0.6} />;
        })}

        {/* 🚗 Traffic — upper lane L→R, lower lane R→L, staggered timing */}
        <Vehicle type="car"   startX={-50}    destX={W + 50} y={ROAD_Y + 10} delay={0}  duration={8}  />
        <Vehicle type="car"   startX={W + 50} destX={-50}    y={ROAD_Y + 10} delay={5}  duration={11} />
        <Vehicle type="truck" startX={W + 50} destX={-50}    y={ROAD_Y + 22} delay={2}  duration={12} />

        {/* ── RIVER INTAKE PIPE (river bank → pump) ── */}
        <rect x={175} y={ROAD_Y + 82} width={62} height={10} rx={4} fill="#374151" />
        {/* Intake screen / grate */}
        <rect x={172} y={ROAD_Y + 78} width={8} height={18} rx={2} fill="#1e3a5f" />
        {[2, 5, 8].map(gy => (
          <line key={gy} x1={173} y1={ROAD_Y + 79 + gy * 3.5} x2={179} y2={ROAD_Y + 79 + gy * 3.5}
            stroke="#3b82f6" strokeWidth={1} opacity={0.6} />
        ))}

        {/* ── PUMP STATION ── */}
        <g transform={`translate(200, ${ROAD_Y + 70})`}>
          <rect x={0} y={0} width={42} height={32} rx={3} fill="#334155" />
          <rect x={4} y={4} width={34} height={16} rx={2} fill="#1e293b" />
          <circle cx={12} cy={12} r={5} fill="#475569" stroke="#64748b" strokeWidth={1.5} />
          <circle cx={12} cy={12} r={2} fill="#22d3ee" />
          <circle cx={28} cy={12} r={5} fill="#475569" stroke="#64748b" strokeWidth={1.5} />
          <line x1={28} y1={8} x2={30} y2={12} stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" />
          <rect x={6}  y={24} width={6} height={4} rx={1} fill="#22c55e" />
          <rect x={15} y={24} width={6} height={4} rx={1} fill="#f59e0b" />
          <rect x={24} y={24} width={6} height={4} rx={1} fill="#475569" />
        </g>

        {/* Operator stands AT the pump */}
        {waterLiters > 0 && <WaterOperator x={196} y={ROAD_Y + 66} liters={waterLiters} />}

        {/* ── INTAKE FLOW: river → pump ── */}
        {waterLiters > 0 && [...Array(5)].map((_, i) => (
          <motion.circle
            key={i} cy={ROAD_Y + 87} r={2.5} fill="#60a5fa"
            animate={{ cx: [178, 234] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.28, ease: 'linear' }}
          />
        ))}

        {/* Horizontal Surface Pipe: pump → all 6 tanks */}
        <g transform={`translate(235, ${ROAD_Y + 85})`}>
          {/* Pipe from pump (x=0) to last tank center (x=355, abs=590) */}
          <rect x={0} y={0} width={360} height={10} rx={5} fill="#475569" />
          {waterLiters > 0 && [...Array(10)].map((_, i) => (
             <motion.circle
               key={i} cy={5} r={3} fill="#3b82f6"
               animate={{ cx: [0, 355] }}
               transition={{ duration: 3, repeat: Infinity, delay: i * 0.3, ease: 'linear' }}
             />
          ))}

          {/* 6 tanks — all fill equally (water split evenly across all tanks) */}
          {[...Array(TANK_COUNT)].map((_, i) => {
            // Equal distribution: every tank gets waterLiters/MAX_WATER fill ratio
            const myFill = Math.min(1, waterLiters / MAX_WATER);
            const label = myFill > 0.02 ? `${Math.round(myFill * WATER_PER_TANK / 1000)}kL` : '';
            const tx = 80 + i * 55;
            return (
              <g key={i}>
                <ElevatedTank x={tx} y={-10} fillRatio={myFill} capacityLabel={label} />
                {/* Water rising up the stem while tanks are filling (not yet full) */}
                {myFill > 0 && myFill < 1 && [...Array(3)].map((_, j) => (
                  <motion.circle
                    key={j} cx={tx} r={2} fill="#60a5fa"
                    animate={{ cy: [5, -40] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: j * 0.3, ease: 'linear' }}
                  />
                ))}
              </g>
            );
          })}
        </g>

        {/* ── FOREGROUND TREES ── */}
        {ALL_TREES.filter(t => t.y > ROAD_Y).map((t, i) => (
          <ForestElement key={t.id} item={t} isCut={cutIds.has(t.id)} delay={i * 0.015} />
        ))}

        {/* Factory worker stands inside the factory building */}
        {carbonKg > 0 && <FactoryWorker x={648} y={ROAD_Y - 42} carbonKg={carbonKg} />}

      </svg>
    </div>
  );
}
