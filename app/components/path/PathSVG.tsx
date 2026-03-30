import Svg, { Path } from 'react-native-svg';
import { POS } from '../../data/levels';
import { PATH_HEIGHT } from '../../constants/config';

interface Props {
  width: number;
}

export function PathSVG({ width }: Props) {
  const W = width;
  const H = PATH_HEIGHT;
  const pts = POS.map(p => ({ x: p.x * W, y: p.y * H }));

  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const q = pts[i];
    const cx = (p.x + q.x) / 2;
    d += ` C${cx.toFixed(1)} ${p.y.toFixed(1)},${cx.toFixed(1)} ${q.y.toFixed(1)},${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }

  return (
    <Svg
      style={{ position: 'absolute', top: 0, left: 0 }}
      width={W}
      height={H}
    >
      {/* Soft glow */}
      <Path
        d={d}
        fill="none"
        stroke="rgba(255,209,102,0.1)"
        strokeWidth={20}
        strokeLinecap="round"
      />
      {/* Dashed guide line */}
      <Path
        d={d}
        fill="none"
        stroke="rgba(255,209,102,0.3)"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeDasharray="10 8"
      />
    </Svg>
  );
}
