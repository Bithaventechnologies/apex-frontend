import { money } from "../lib/format";

export type Point = { label: string; value: number };

export default function EarningsChart({ data, height = 200 }: { data: Point[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 640, H = height, padL = 44, padR = 8, padT = 10, padB = 26;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const bw = innerW / Math.max(data.length, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Earnings over the last ${data.length} days. Highest day ${money(max)}.`} className="w-full">
      {[0, 0.5, 1].map((t) => {
        const y = padT + innerH - t * innerH;
        return (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} className="stroke-apex-100" />
            <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="10" className="fill-muted">{`$${(t * max).toFixed(max < 10 ? 1 : 0)}`}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = padL + i * bw + bw * 0.15;
        return (
          <rect key={i} x={x} y={padT + innerH - h} width={bw * 0.7} height={Math.max(h, d.value > 0 ? 2 : 0)} rx="3" className="fill-apex-500 hover:fill-gold-500">
            <title>{`${d.label}: ${money(d.value)}`}</title>
          </rect>
        );
      })}
      {data.map((d, i) =>
        i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2) ? (
          <text key={`l${i}`} x={padL + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" className="fill-muted">{d.label}</text>
        ) : null,
      )}
    </svg>
  );
}