import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

const W = 800, H = 550;
const ROAD_Y = 380; 

// Capacities
const MAX_WATER = 100000;
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

/* ── Determine if a point overlaps the infrastructure ── */
function isExcludedZone(x, y) {
  // Road & Bridge
  if (y > ROAD_Y - 40 && y < ROAD_Y + 40) return true;
  // Factory zone (top right shifted up to base 370)
  if (x > 580 && y > ROAD_Y - 160 && y <= ROAD_Y) return true;
  // Foreground Tanks & Pump zone (bottom middle)
  // Fix: Allows trees on the far left and right foreground edges
  if (x > 160 && x < 720 && y > ROAD_Y + 20) return true; 
  
  // River zone approximation
  if (x > 380 && x < 520 && y < 150) return true;     
  if (x > 260 && x < 420 && y >= 150 && y < 300) return true; 
  if (x > 180 && x < 320 && y >= 300 && y < 450) return true; 
  if (x > 80 && x < 250 && y >= 450) return true;     

  return false;
}

/* ── Generate 250 trees (Dense) ── */
const TREE_COUNT = 250;
const ALL_TREES = (() => {
  const rand = seededRand(0xDEBB1E);
  const trees = [];
  let tries = 0;
  while (trees.length < TREE_COUNT && tries < 25000) {
    tries++;
    const x = rand() * (W - 30) + 15;
    const y = rand() * (H - 50) + 15;
    
    // Strict exclusion and tight overlap checking for dense forest
    if (!isExcludedZone(x, y) && !trees.some(t => Math.hypot(t.x - x, t.y - y) < 18)) {
      trees.push({
        id: trees.length,
        x, y,
        s: 0.5 + rand() * 0.7,     
        c: Math.floor(rand() * 3), 
        type: rand() > 0.9 ? 'rock' : 'tree' 
      });
    }
  }
  // Sort trees by Y for correct top-to-bottom isometric rendering
  return trees.sort((a, b) => a.y - b.y);
})();

// For directional chopping from left to right
const TREES_BY_X = [...ALL_TREES.filter(t => t.type === 'tree')].sort((a, b) => a.x - b.x);

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
        <clipPath id={`tankClip-${x}`}>
          <rect x={0} y={0} width={tankW - 4} height={tankH - 4} rx={2} />
        </clipPath>
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
      
      {/* Capacity Label - highly visible now */}
      <text x={0} y={-legH - 8} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900" fontFamily="monospace" style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}>
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
  return (
    <motion.g
      initial={{ x: startX }}
      animate={{ x: destX }}
      transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
      transform={`translate(0, ${y}) scale(${isRight ? 1 : -1}, 1)`}
    >
      {type === 'car' ? (
        <g>
          <rect x={-15} y={-8} width={30} height={10} rx={3} fill="#ef4444" />
          <rect x={-5} y={-14} width={15} height={8} rx={2} fill="#b91c1c" />
          <circle cx={-8} cy={2} r={4} fill="#222" /><circle cx={8} cy={2} r={4} fill="#222" />
        </g>
      ) : (
        <g>
          <rect x={-20} y={-14} width={30} height={16} rx={2} fill="#f59e0b" />
          <rect x={12} y={-10} width={12} height={12} rx={2} fill="#d97706" />
          <circle cx={-12} cy={2} r={4} fill="#222" /><circle cx={15} cy={2} r={4} fill="#222" />
        </g>
      )}
    </motion.g>
  );
}

/* ── 🪓 Lumberjack Character ── */
function Axeman({ x, y, choppedCount }) {
  // Flip bubble downwards if he's near the ceiling
  const bubbleOffset = y < 80 ? 30 : -45;
  const bubbleTriangle = y < 80 ? "M 0,-15 L 5,-20 L 10,-15 Z" : "M 0,15 L 5,20 L 10,15 Z";

  return (
    <motion.g 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      transform={`translate(${x}, ${y})`}
    >
      <rect x={-4} y={-12} width={8} height={12} rx={2} fill="#b91c1c" />
      <circle cx={0} cy={-16} r={4} fill="#fcd34d" />
      <line x1={-2} y1={-8} x2={10} y2={-16} stroke="#5a3212" strokeWidth={2} />
      <path d="M 8,-17 L 14,-15 L 12,-11 Z" fill="#9ca3af" />
      <g transform={`translate(10, ${bubbleOffset})`}>
        <path d={bubbleTriangle} fill="white" />
        <rect x={-30} y={-10} width={140} height={25} rx={6} fill="white" stroke="#e5e7eb" />
        <text x={40} y={7} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#7f1d1d">
          Chopped {choppedCount} trees!
        </text>
      </g>
    </motion.g>
  );
}

/* ── 💧 Water Operator Character ── */
function WaterOperator({ x, y, liters }) {
  return (
    <motion.g 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
      transform={`translate(${x}, ${y})`}
    >
      <rect x={-4} y={-12} width={8} height={12} rx={2} fill="#2563eb" />
      <circle cx={0} cy={-16} r={4} fill="#fcd34d" />
      <rect x={4} y={-9} width={3} height={6} fill="#f5f5f5" /> 
      <g transform="translate(-150, -40)">
        <path d="M 135,15 L 140,20 L 145,15 Z" fill="white" />
        <rect x={0} y={-10} width={150} height={25} rx={6} fill="white" stroke="#e5e7eb" />
        <text x={75} y={7} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e3a8a">
          Draining {liters.toLocaleString()} L !
        </text>
      </g>
    </motion.g>
  );
}

/* ── 🔢 Animated Counter ── */
function AnimatedNumber({ value }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState('0');
  useEffect(() => { motionVal.set(value); }, [value]);
  useEffect(() => spring.on('change', (v) => setDisplay(v.toFixed(0))), [spring]);
  return <span>{Number(display).toLocaleString()}</span>;
}

/* ─── Main Combined World Scene ─── */
export default function CombinedWorldScene({ deforestationTrees, waterLiters, carbonKg }) {
  const cutCount = Math.min(TREES_BY_X.length, Math.round((deforestationTrees / 300) * TREES_BY_X.length));
  const cutIds = new Set(TREES_BY_X.slice(0, cutCount).map(t => t.id));
  const axemanLocation = cutCount > 0 ? TREES_BY_X[cutCount - 1] : null;
  const carbonIntensity = Math.min(1, carbonKg / 10000);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ─── 📊 Horizontal UI HUD ─── */}
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex-1 text-center border-r border-gray-100">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">🌳 Deforestation</div>
          <div className="text-2xl font-black text-amber-900">
            <AnimatedNumber value={deforestationTrees} /> <span className="text-sm font-semibold text-amber-600/70">trees</span>
          </div>
        </div>
        <div className="flex-1 text-center border-r border-gray-100">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">🌊 Water Strain</div>
          <div className="text-2xl font-black text-blue-900">
            <AnimatedNumber value={waterLiters} /> <span className="text-sm font-semibold text-blue-600/70">L</span>
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">🏭 Carbon Cost</div>
          <div className="text-2xl font-black text-slate-800">
            <AnimatedNumber value={carbonKg} /> <span className="text-sm font-semibold text-slate-400">kg CO₂e</span>
          </div>
        </div>
      </div>

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
        </defs>

        <rect width={W} height={H} fill="url(#cwGround)" />
        
        <motion.rect
          width={W} height={H}
          fill={carbonIntensity > 0.65 ? '#111' : '#555'}
          animate={{ opacity: [carbonIntensity * 0.15, carbonIntensity * 0.35, carbonIntensity * 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          pointerEvents="none"
        />

        <path 
          d={`M 400,-50 Q 400,100 330,200 T 260,${ROAD_Y-40} Q 230,${ROAD_Y+30} 180,580 L 130,580 Q 200,${ROAD_Y+30} 220,${ROAD_Y-40} T 280,200 Q 320,100 320,-50 Z`} 
          fill="url(#riverFill)" 
          opacity={0.8} 
        />

        {/* ── BACKGROUND TREES ── */}
        {ALL_TREES.filter(t => t.y <= ROAD_Y).map((t, i) => (
          <ForestElement key={t.id} item={t} isCut={cutIds.has(t.id)} delay={i * 0.02} />
        ))}
        {axemanLocation && axemanLocation.y <= ROAD_Y && (
          <Axeman x={axemanLocation.x} y={axemanLocation.y} choppedCount={deforestationTrees} />
        )}

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

        {/* ── UNDERGROUND PIPELINE (Rendered BEFORE road to dive underneath) ── */}
        <g transform={`translate(235, ${ROAD_Y + 65})`}>
          <rect x={435} y={-110} width={10} height={110} fill="#475569" />
          {waterLiters > 0 && [...Array(4)].map((_, i) => (
             <motion.circle
               key={i} cx={440} cy={-110} r={3} fill="#3b82f6"
               animate={{ cy: [5, -110] }}
               transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.35, ease: 'linear' }}
             />
          ))}
        </g>

        {/* ── THE BRIDGE & MAIN ROAD (Overpasses the vertical pipe & river) ── */}
        <g transform={`translate(225, ${ROAD_Y - 10})`}>
          <rect x={5} y={0} width={12} height={40} fill="#4b5563" />
          <rect x={40} y={0} width={12} height={35} fill="#4b5563" />
          <rect x={-30} y={10} width={120} height={30} fill="#6b7280" stroke="#374151" strokeWidth={2} />
          <rect x={-30} y={8} width={120} height={4} fill="#9ca3af" />
          <rect x={-30} y={38} width={120} height={4} fill="#9ca3af" />
        </g>

        <rect x={0} y={ROAD_Y} width={195} height={30} fill="#6b7280" />
        <rect x={315} y={ROAD_Y} width={W-315} height={30} fill="#6b7280" />
        {[...Array(12)].map((_, i) => (
          <rect key={i} x={i * 70 + 10} y={ROAD_Y + 14} width={40} height={2} rx={1} fill="#9ca3af" opacity={0.6} />
        ))}

        {/* 🚗 Traffic on the road */}
        <Vehicle type="car" startX={-50} destX={W+50} y={ROAD_Y + 7} delay={0} duration={8} />
        <Vehicle type="truck" startX={W+50} destX={-50} y={ROAD_Y + 23} delay={2} duration={12} />
        <Vehicle type="car" startX={W+50} destX={-50} y={ROAD_Y + 23} delay={7} duration={9} />

        {/* ── FOREGROUND WATER INFRASTRUCTURE ── */}
        <g transform={`translate(200, ${ROAD_Y + 50})`}>
          <rect x={0} y={0} width={35} height={25} rx={3} fill="#4b5563" />
          <path d="M -10,20 L 5,15" stroke="#374151" strokeWidth={6} fill="none" />
        </g>
        
        {waterLiters > 0 && <WaterOperator x={200} y={ROAD_Y + 45} liters={waterLiters} />}

        {/* Horizontal Surface Pipe connecting to tanks & underground drop */}
        <g transform={`translate(235, ${ROAD_Y + 65})`}>
          <rect x={0} y={0} width={445} height={10} rx={5} fill="#475569" />
          {waterLiters > 0 && [...Array(10)].map((_, i) => (
             <motion.circle
               key={i} cy={5} r={3} fill="#3b82f6"
               animate={{ cx: [0, 440] }}
               transition={{ duration: 3, repeat: Infinity, delay: i * 0.3, ease: 'linear' }}
             />
          ))}

          {/* Render 6 tanks */}
          {[...Array(TANK_COUNT)].map((_, i) => {
            const tankCapacity = WATER_PER_TANK;
            const waterStoredByPrevious = i * tankCapacity;
            let myFill = 0;
            if (waterLiters > waterStoredByPrevious) {
               myFill = Math.min(1, (waterLiters - waterStoredByPrevious) / tankCapacity);
            }
            const label = myFill > 0 ? `${(tankCapacity/1000).toFixed(0)}kL` : '';
            return <ElevatedTank key={i} x={80 + i * 55} y={-10} fillRatio={myFill} capacityLabel={label} />;
          })}
        </g>

        {/* ── FOREGROUND TREES ── */}
        {ALL_TREES.filter(t => t.y > ROAD_Y).map((t, i) => (
          <ForestElement key={t.id} item={t} isCut={cutIds.has(t.id)} delay={i * 0.02} />
        ))}
        {/* Draw axeman cleanly on TOP of foreground layer if he's here */}
        {axemanLocation && axemanLocation.y > ROAD_Y && (
          <Axeman x={axemanLocation.x} y={axemanLocation.y} choppedCount={deforestationTrees} />
        )}

      </svg>
    </div>
  );
}
