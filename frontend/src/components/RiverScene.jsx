import { motion } from 'framer-motion';

const W = 500, H = 240;
const RIVER_TOP = 30;
const RIVER_BOT = 110;
const ROAD_Y = 185;
const PUMP_X = 220; // where trucks stop to fill up

/* ── Single Tanker Truck ── */
function Tanker({ index, count, filled }) {
  const cycleTime = 9;
  const delay = (index / count) * cycleTime;
  // Keyframe positions: offscreen-left → pump → offscreen-right
  const xFrames = [-90, PUMP_X - 55, PUMP_X - 55, W + 90];
  const timeFrames = [0, 0.32, 0.55, 1];

  // Tank fill color animates from grey (empty) to blue (full) at pump
  return (
    <motion.g
      animate={{ x: xFrames }}
      transition={{
        times: timeFrames,
        duration: cycleTime,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Cab */}
      <rect x={52} y={ROAD_Y - 30} width={26} height={24} rx={4} fill="#c0392b" />
      <rect x={54} y={ROAD_Y - 28} width={11} height={9} rx={1} fill="#aed6f1" opacity={0.85} />
      {/* Exhaust pipe */}
      <rect x={74} y={ROAD_Y - 40} width={4} height={14} rx={1} fill="#888" />
      {/* Smoke puff from exhaust */}
      <motion.circle
        cx={76} cy={ROAD_Y - 44}
        animate={{ cy: [ROAD_Y - 44, ROAD_Y - 56], opacity: [0.5, 0], r: [3, 6] }}
        transition={{ duration: 1, repeat: Infinity }}
        fill="#aaa"
      />
      {/* Tank body */}
      <rect x={0} y={ROAD_Y - 27} width={55} height={21} rx={10} fill={filled ? '#2980b9' : '#bdc3c7'} />
      <motion.rect
        x={2} y={ROAD_Y - 25} width={51} height={17} rx={9}
        fill="#3498db"
        animate={{ opacity: filled ? [0.3, 0.7, 0.3] : 0 }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      {/* Cap on top */}
      <rect x={20} y={ROAD_Y - 32} width={10} height={6} rx={2} fill="#999" />
      {/* Hose to river – only when at pump */}
      <line x1={28} y1={ROAD_Y - 32} x2={28} y2={RIVER_BOT} stroke="#3498db" strokeWidth={2} strokeDasharray="4 3" opacity={0.6} />
      {/* Wheels */}
      {[10, 56].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy={ROAD_Y - 1} r={8} fill="#222" />
          <circle cx={cx} cy={ROAD_Y - 1} r={3.5} fill="#888" />
        </g>
      ))}
    </motion.g>
  );
}

/* ── Animated water particle flowing through hose ── */
function WaterParticle({ x, delay }) {
  return (
    <motion.circle
      cx={x} cy={RIVER_BOT}
      r={2.5}
      fill="#2980b9"
      animate={{ cy: [RIVER_BOT, ROAD_Y - 30], opacity: [0.8, 0] }}
      transition={{ duration: 0.8, delay, repeat: Infinity, repeatDelay: 0.4 }}
    />
  );
}

export default function RiverScene({ waterLiters }) {
  const TANKER_COUNT = 6;
  const MAX_LITERS = 100000;
  const pct = Math.min(1, waterLiters / MAX_LITERS);
  // River water level drops based on consumption
  const riverLevel = RIVER_BOT - (pct * 35);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Water Consumed</span>
        <span className="text-xl font-bold text-blue-700">
          {waterLiters.toLocaleString()}{' '}
          <span className="text-sm font-normal text-gray-400">litres</span>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl" style={{ border: '1px solid #bae6fd' }}>
        <defs>
          <linearGradient id="riverSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#caf0f8" />
            <stop offset="100%" stopColor="#ade8f4" />
          </linearGradient>
          <linearGradient id="riverFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#48cae4" />
            <stop offset="100%" stopColor="#0096c7" />
          </linearGradient>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>
        </defs>

        {/* Sky background */}
        <rect width={W} height={H} fill="url(#riverSky)" />

        {/* River banks */}
        <rect x={0} y={RIVER_TOP - 8} width={W} height={12} fill="#74c69d" />
        <rect x={0} y={RIVER_BOT} width={W} height={12} fill="#74c69d" />

        {/* River water – level shrinks with use */}
        <motion.rect
          x={0} y={RIVER_TOP}
          width={W}
          initial={{ height: RIVER_BOT - RIVER_TOP }}
          animate={{ height: riverLevel - RIVER_TOP }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          fill="url(#riverFill)"
          opacity={0.85}
        />

        {/* River flow ripple lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.line
            key={i}
            x1={-60} y1={RIVER_TOP + 10 + i * 14}
            x2={W + 60} y2={RIVER_TOP + 10 + i * 14}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1.5}
            strokeDasharray="12 8"
            animate={{ x1: [-60, W + 60], x2: [W + 60, -60] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 0.6 }}
          />
        ))}

        {/* Water level label */}
        <text x={8} y={RIVER_TOP + 22} fill="white" fontSize="10" fontWeight="bold" fontFamily="Inter, sans-serif" opacity={0.8}>
          River Level: {Math.round((1 - pct) * 100)}%
        </text>

        {/* Pump station at river bank */}
        <rect x={PUMP_X} y={RIVER_BOT + 2} width={30} height={20} rx={3} fill="#555" />
        <rect x={PUMP_X + 8} y={RIVER_BOT - 10} width={6} height={16} fill="#777" />

        {/* Road */}
        <rect x={0} y={ROAD_Y + 5} width={W} height={18} fill="url(#roadGrad)" />
        {/* Dashed centre line */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <rect key={i} x={i * 80 + 20} y={ROAD_Y + 13} width={40} height={3} rx={1.5} fill="#d1d5db" opacity={0.6} />
        ))}

        {/* Tanker trucks */}
        {Array.from({ length: TANKER_COUNT }).map((_, i) => (
          <Tanker key={i} index={i} count={TANKER_COUNT} filled={pct > 0.1} />
        ))}

        {/* Water particles flowing down hose from river to truck */}
        {waterLiters > 0 && [0, 0.3, 0.6].map((d, i) => (
          <WaterParticle key={i} x={PUMP_X + 13} delay={d} />
        ))}

        {/* Ground below road */}
        <rect x={0} y={H - 16} width={W} height={16} fill="#6b7280" opacity={0.3} />

        <text x={W / 2} y={H - 4} textAnchor="middle" fill="rgba(30,60,120,0.65)" fontSize="10" fontWeight="bold" fontFamily="Inter, sans-serif">
          {TANKER_COUNT} tankers draining {(waterLiters / TANKER_COUNT).toFixed(0)} L each
        </text>
      </svg>
    </div>
  );
}
