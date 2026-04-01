import Svg, { Path } from 'react-native-svg';
import { POS } from '../../data/levels';
import { PATH_HEIGHT } from '../../constants/config';

interface Props {
  width: number;
}

// One path-data string from a slice of the 50 POS points
function buildSegment(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const q = pts[i];
    const cx = (p.x + q.x) / 2;
    d += ` C${cx.toFixed(1)} ${p.y.toFixed(1)},${cx.toFixed(1)} ${q.y.toFixed(1)},${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }
  return d;
}

// World road colours (slightly transparent so bg shows through)
const WORLD_COLORS = [
  'rgba(74, 222, 128, 0.75)',   // W1 Forest  · green
  'rgba(56, 189, 248, 0.75)',   // W2 Ocean   · sky blue
  'rgba(251, 191, 36, 0.80)',   // W3 Desert  · amber
  'rgba(167, 139, 250, 0.75)',  // W4 Mountain· purple
  'rgba(99, 229, 213, 0.80)',   // W5 Space   · cyan-teal
];

// World 1: indices 0-9, W2: 9-19 (shared endpoint = seamless join), etc.
const WORLD_RANGES: [number, number][] = [
  [0, 10],
  [9, 20],
  [19, 30],
  [29, 40],
  [39, 50],
];

export function PathSVG({ width }: Props) {
  const W = width;
  const H = PATH_HEIGHT;
  const pts = POS.map(p => ({ x: p.x * W, y: p.y * H }));

  // Build per-world segment paths
  const segments = WORLD_RANGES.map(([from, to]) => buildSegment(pts.slice(from, to)));

  // Full path for the drop-shadow layer
  const fullPath = buildSegment(pts);

  return (
    <Svg
      style={{ position: 'absolute', top: 0, left: 0 }}
      width={W}
      height={H}
    >
      {/* Drop shadow (single wide stroke behind everything) */}
      <Path
        d={fullPath}
        fill="none"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth={26}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* World-coloured road segments */}
      {segments.map((d, i) => (
        <Path
          key={i}
          d={d}
          fill="none"
          stroke={WORLD_COLORS[i]}
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Road edge highlight (thin, lighter top coat) */}
      {segments.map((d, i) => (
        <Path
          key={`hl-${i}`}
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Centre dashed lane marking */}
      <Path
        d={fullPath}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="12 14"
      />
    </Svg>
  );
}
