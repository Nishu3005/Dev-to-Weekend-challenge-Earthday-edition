import { motion } from 'framer-motion';

const W = 500, H = 300;
const GROUND_Y = 220;
const PIPE_Y = GROUND_Y + 10;

const CHIMNEYS = [
  { x: 160, h: 70 },
  { x: 230, h: 90 },
  { x: 300, h: 60 },
];

/* ── A single puff of smoke ── */
function SmokePuff({ cx, intensity, delay }) {
  const size = 8 + intensity * 10;
  const color = intensity > 0.65 ? '#1a1a1a' : intensity > 0.4 ? '#555' : '#888';
  // Use delay as a stable seed for drift direction instead of Math.random()
  const driftX = ((delay * 7) % 2 - 1) * 14;
  const offsetCx = ((delay * 13) % 1 - 0.5) * 10;
  return (
    <motion.circle
      cx={cx + offsetCx}
      cy={GROUND_Y}
      r={size / 2}
      fill={color}
      animate={{
        cy: [GROUND_Y - 5, GROUND_Y - 70 - intensity * 60],
        r: [size / 2, size * 1.8],
        opacity: [0.85, 0],
        cx: [cx + offsetCx, cx + offsetCx + driftX],
      }}
      transition={{ duration: 2.2 + intensity, repeat: Infinity, delay, ease: 'easeOut' }}
    />
  );
}

/* ── Tanker arriving from left with water pipe ── */
function InboundTanker() {
  return (
    <motion.g
      animate={{ x: [-90, 40, 40] }}
      transition={{ times: [0, 0.3, 1], duration: 10, repeat: Infinity, delay: 2, ease: 'linear' }}
    >
      {/* Tank */}
      <rect x={0} y={GROUND_Y - 27} width={55} height={21} rx={10} fill="#2980b9" />
      <motion.rect
        x={2} y={GROUND_Y - 25} width={51} height={17} rx={9}
        fill="#3498db"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {/* Cab */}
      <rect x={52} y={GROUND_Y - 30} width={24} height={24} rx={4} fill="#c0392b" />
      <rect x={54} y={GROUND_Y - 28} width={10} height={9} rx={1} fill="#aed6f1" opacity={0.85} />
      {/* Wheels */}
      {[10, 56].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy={GROUND_Y - 1} r={8} fill="#222" />
          <circle cx={cx} cy={GROUND_Y - 1} r={3.5} fill="#888" />
        </g>
      ))}
    </motion.g>
  );
}

/* ── Animated water flowing through pipe ── */
function PipeWaterFlow({ carbonKg }) {
  const intensity = Math.min(1, carbonKg / 10000);
  const particleCount = Math.round(3 + intensity * 5);
  return (
    <>
      {/* Pipe body */}
      <rect x={90} y={PIPE_Y - 5} width={80} height={10} rx={5} fill="#555" />
      {/* Animated water particles */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.circle
          key={i}
          cy={PIPE_Y}
          r={3}
          fill="#3498db"
          animate={{ cx: [90, 170] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: (i / particleCount) * 0.8, ease: 'linear' }}
        />
      ))}
      {/* Pipe connector to factory */}
      <rect x={165} y={PIPE_Y - 5} width={15} height={10} rx={2} fill="#444" />
    </>
  );
}

export default function FactoryScene({ carbonKg }) {
  const intensity = Math.min(1, carbonKg / 10000); // 0→10000 = 0→1
  const smokeColor = intensity > 0.65 ? '#111' : intensity > 0.35 ? '#555' : '#888';

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Carbon Emissions</span>
        <span className="text-xl font-bold text-slate-700">
          {carbonKg.toLocaleString()}{' '}
          <span className="text-sm font-normal text-gray-400">kg CO₂e</span>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
        <defs>
          <linearGradient id="factSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(220, 15%, ${Math.round(80 - intensity * 35)}%)`} />
            <stop offset="100%" stopColor={`hsl(220, 10%, ${Math.round(70 - intensity * 25)}%)`} />
          </linearGradient>
          <linearGradient id="factGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
        </defs>

        {/* Sky – darkens with intensity */}
        <rect width={W} height={H} fill="url(#factSky)" />

        {/* Smog haze overlay */}
        <motion.rect
          width={W} height={GROUND_Y}
          fill={smokeColor}
          animate={{ opacity: [intensity * 0.18, intensity * 0.28, intensity * 0.18] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* ── Factory Complex ── */}
        {/* Main body */}
        <rect x={140} y={GROUND_Y - 80} width={220} height={80} fill="#374151" />
        <rect x={160} y={GROUND_Y - 95} width={60} height={20} fill="#4b5563" />
        <rect x={280} y={GROUND_Y - 90} width={50} height={15} fill="#4b5563" />
        {/* Windows */}
        {[165, 195, 265, 295, 325].map(x => (
          <rect key={x} x={x} y={GROUND_Y - 68} width={16} height={14} rx={1} fill="#fbbf24" opacity={0.7} />
        ))}
        {/* Factory door */}
        <rect x={225} y={GROUND_Y - 36} width={30} height={36} rx={2} fill="#1f2937" />
        {/* Side building */}
        <rect x={355} y={GROUND_Y - 55} width={70} height={55} fill="#4b5563" />

        {/* ── Chimneys ── */}
        {CHIMNEYS.map((ch) => (
          <g key={ch.x}>
            {/* Chimney shaft */}
            <rect x={ch.x - 9} y={GROUND_Y - 80 - ch.h} width={18} height={ch.h + 5} rx={2} fill="#374151" />
            {/* Chimney rim */}
            <rect x={ch.x - 12} y={GROUND_Y - 80 - ch.h - 5} width={24} height={8} rx={3} fill="#4b5563" />
            {/* Smoke puffs – multiple per chimney */}
            {[0, 0.7, 1.4, 2.1].map((d) => (
              <SmokePuff
                key={d}
                cx={ch.x}
                intensity={intensity}
                delay={d}
              />
            ))}
          </g>
        ))}

        {/* ── Inbound tanker (water delivery from river) ── */}
        <InboundTanker />

        {/* ── Water pipe from tanker → factory ── */}
        <PipeWaterFlow carbonKg={carbonKg} />

        {/* ── Ground ── */}
        <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#factGround)" />

        {/* Carbon severity label */}
        <text
          x={W / 2} y={H - 6}
          textAnchor="middle"
          fill={intensity > 0.6 ? '#ff4444' : intensity > 0.3 ? '#f97316' : '#4ade80'}
          fontSize="11"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          {intensity > 0.6 ? '⚠ Critical Emissions' : intensity > 0.3 ? '⚡ High Emissions' : '✔ Moderate Emissions'}
        </text>
      </svg>
    </div>
  );
}
