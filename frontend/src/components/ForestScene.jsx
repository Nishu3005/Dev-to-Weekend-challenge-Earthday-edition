import { motion } from 'framer-motion';
import { useMemo } from 'react';

const W = 500, H = 380;
const TREE_COUNT = 100;

/* ── Seeded RNG for consistent random layouts ── */
function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xFFFFFFFF;
  };
}

/* ── Generate 100 non-overlapping trees ── */
const ALL_TREES = (() => {
  const rand = seededRand(0xF04E5710);
  const trees = [];
  let tries = 0;
  while (trees.length < TREE_COUNT && tries < 8000) {
    tries++;
    const x = rand() * (W - 60) + 30;
    const y = rand() * (H - 100) + 30;
    if (!trees.some(t => Math.hypot(t.x - x, t.y - y) < 34)) {
      trees.push({
        id: trees.length,
        x, y,
        s: 0.6 + rand() * 0.75,   // size scale
        c: Math.floor(rand() * 3), // color palette index
        lean: (rand() - 0.5) * 6,  // slight horizontal lean
      });
    }
  }
  return trees.sort((a, b) => a.y - b.y); // painter's sort
})();

const PALETTES = [
  ['#1b4332', '#2d6a4f', '#52b788'],
  ['#1a3c2f', '#276b4e', '#40916c'],
  ['#204c3b', '#2e7d5a', '#4aad80'],
];

/* ── Single pine tree or stump ── */
function PineTree({ tree, isCut, delay }) {
  const { x, y, s, c } = tree;
  const [dark, mid, light] = PALETTES[c];
  const tw = 8 * s;
  const th = 14 * s;
  const ch = 48 * s;
  const cw = 30 * s;

  return (
    <g transform={`translate(${x},${y})`}>
      {/* Trunk – always visible */}
      <rect x={-tw / 2} y={-th} width={tw} height={th} rx={1.5} fill="#5a3212" />

      {/* Stump top – fades in after tree falls */}
      {isCut && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.55 }}
        >
          <ellipse cx={0} cy={-th} rx={tw / 2} ry={tw / 3} fill="#8B5E3C" />
          <ellipse cx={0} cy={-th} rx={tw / 3.5} ry={tw / 5} fill="none" stroke="#5a3212" strokeWidth="0.7" />
          <ellipse cx={0} cy={-th} rx={tw / 7} ry={tw / 10} fill="none" stroke="#5a3212" strokeWidth="0.4" />
        </motion.g>
      )}

      {/* Canopy – rotates and fades when cut */}
      <motion.g
        initial={{ rotate: 0, opacity: 1 }}
        animate={isCut ? { rotate: 90, opacity: 0 } : { rotate: 0, opacity: 1 }}
        transformTemplate={(vals) => `rotate(${vals.rotate ?? 0}, 0, 0)`}
        transition={{ delay, duration: 0.5, ease: 'easeIn' }}
      >
        {/* Bottom layer – widest */}
        <polygon
          points={`0,${-(ch + th)} ${-cw / 2},${-(ch * 0.3 + th)} ${cw / 2},${-(ch * 0.3 + th)}`}
          fill={light}
        />
        {/* Middle layer */}
        <polygon
          points={`0,${-(ch * 0.72 + th)} ${-cw * 0.46},${-(ch * 0.26 + th)} ${cw * 0.46},${-(ch * 0.26 + th)}`}
          fill={mid}
        />
        {/* Top layer – darkest */}
        <polygon
          points={`0,${-(ch * 0.46 + th)} ${-cw * 0.28},${-(ch * 0.1 + th)} ${cw * 0.28},${-(ch * 0.1 + th)}`}
          fill={dark}
        />
      </motion.g>
    </g>
  );
}

export default function ForestScene({ deforestationTrees }) {
  const cutCount = Math.min(ALL_TREES.length, Math.round((deforestationTrees / 300) * ALL_TREES.length));
  const cutIds = useMemo(
    () => new Set(ALL_TREES.slice(0, cutCount).map(t => t.id)),
    [cutCount]
  );
  const pct = Math.round((cutCount / ALL_TREES.length) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deforestation</span>
        <span className="text-xl font-bold text-amber-700">
          {deforestationTrees.toLocaleString()}{' '}
          <span className="text-sm font-normal text-gray-400">trees</span>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl" style={{ border: '1px solid #d1fae5' }}>
        <defs>
          <linearGradient id="fSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bde0fe" />
            <stop offset="70%" stopColor="#d8f3dc" />
            <stop offset="100%" stopColor="#95d5b2" />
          </linearGradient>
          <linearGradient id="fGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#74c69d" />
            <stop offset="100%" stopColor="#52b788" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#fSky)" />
        <rect x={0} y={H - 28} width={W} height={28} fill="url(#fGround)" />

        {ALL_TREES.map((tree, i) => (
          <PineTree
            key={tree.id}
            tree={tree}
            isCut={cutIds.has(tree.id)}
            delay={i * 0.035}
          />
        ))}

        {/* Impact label */}
        {cutCount > 0 && (
          <text
            x={W / 2} y={H - 8}
            textAnchor="middle"
            fill="rgba(120,40,0,0.8)"
            fontSize="11"
            fontWeight="bold"
            fontFamily="Inter, sans-serif"
          >
            {pct}% of forest cleared in this order
          </text>
        )}
      </svg>
    </div>
  );
}
