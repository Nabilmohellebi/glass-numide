// Graphiques SVG maison : courbe de poids (réel + moyenne 7 j + trajectoire cible) et volume hebdo.

import type { AppState } from "../lib/store";
import { daysBetween, isoToDate, sortedWeightDates } from "../lib/calc";

const TARGET_RATE = 0.7; // kg / semaine, rythme cible protecteur du muscle

export function WeightChart({ s, height = 190 }: { s: AppState; height?: number }) {
  const dates = sortedWeightDates(s);
  const profile = s.profile;
  if (!profile || dates.length === 0) {
    return <div className="py-8 text-center text-[12px] text-ink-faint">Enregistre ta première pesée.</div>;
  }

  const w = 320;
  const pad = { l: 30, r: 8, t: 10, b: 18 };
  const plotW = w - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;

  const start = profile.startDate;
  const lastISO = dates[dates.length - 1]!;
  const targetDays = ((profile.startWeight - profile.goal) / TARGET_RATE) * 7;
  const spanDays = Math.max(28, Math.min(targetDays, daysBetween(start, lastISO) + 45));

  const values = dates.map((d) => s.weights[d]!);
  const minW = Math.min(profile.goal, ...values) - 2;
  const maxW = Math.max(profile.startWeight, ...values) + 2;

  const x = (iso: string) => pad.l + Math.min(1, Math.max(0, daysBetween(start, iso) / spanDays)) * plotW;
  const xd = (days: number) => pad.l + Math.min(1, Math.max(0, days / spanDays)) * plotW;
  const y = (v: number) => pad.t + (1 - (v - minW) / (maxW - minW)) * plotH;

  // moyenne mobile 7 jours
  const avgPoints = dates.map((d, i) => {
    const window = dates.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((a, k) => a + s.weights[k]!, 0) / window.length;
    return `${x(d).toFixed(1)},${y(avg).toFixed(1)}`;
  });

  const realPoints = dates.map((d) => `${x(d).toFixed(1)},${y(s.weights[d]!).toFixed(1)}`);
  const gridValues = [profile.startWeight, (profile.startWeight + profile.goal) / 2, profile.goal];

  const targetEndDays = Math.min(spanDays, targetDays);
  const targetEndWeight = profile.startWeight - (targetEndDays / 7) * TARGET_RATE;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      {gridValues.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} y1={y(v)} x2={w - pad.r} y2={y(v)} stroke="var(--color-line)" strokeWidth="1" />
          <text x="2" y={y(v) + 3} fontSize="9" fontFamily="JetBrains Mono, monospace" fill="var(--color-ink-faint)">
            {Math.round(v)}
          </text>
        </g>
      ))}

      <line
        x1={xd(0)}
        y1={y(profile.startWeight)}
        x2={xd(targetEndDays)}
        y2={y(targetEndWeight)}
        stroke="var(--color-steel)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />

      <polyline points={avgPoints.join(" ")} fill="none" stroke="rgba(236,232,223,.55)" strokeWidth="1.5" />

      <polyline
        points={realPoints.join(" ")}
        fill="none"
        stroke="var(--color-ember)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {dates.map((d) => (
        <circle key={d} cx={x(d)} cy={y(s.weights[d]!)} r="2.2" fill="var(--color-ember)" />
      ))}
    </svg>
  );
}

export function MiniChart({
  points,
  height = 90,
  color = "var(--color-steel)",
}: {
  points: { iso: string; v: number }[];
  height?: number;
  color?: string;
}) {
  if (points.length < 2) {
    return <div className="py-5 text-center text-[12px] text-ink-faint">Au moins deux mesures nécessaires.</div>;
  }
  const w = 320;
  const pad = 10;
  const min = Math.min(...points.map((p) => p.v)) - 1;
  const max = Math.max(...points.map((p) => p.v)) + 1;
  const t0 = isoToDate(points[0]!.iso).getTime();
  const t1 = isoToDate(points[points.length - 1]!.iso).getTime();
  const span = Math.max(1, t1 - t0);
  const coords = points.map((p) => {
    const px = pad + ((isoToDate(p.iso).getTime() - t0) / span) * (w - pad * 2);
    const py = pad + (1 - (p.v - min) / (max - min)) * (height - pad * 2);
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <polyline points={coords.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {coords.map((c, i) => {
        const [cx, cy] = c.split(",");
        return <circle key={i} cx={cx} cy={cy} r="2" fill={color} />;
      })}
    </svg>
  );
}

export function VolumeBars({ data }: { data: [string, number][] }) {
  if (!data.length) {
    return <div className="py-5 text-center text-[12px] text-ink-faint">Note tes charges pour suivre ton volume.</div>;
  }
  const max = Math.max(...data.map(([, v]) => v));
  return (
    <div className="flex h-[110px] items-end gap-1.5">
      {data.map(([iso, v]) => (
        <div key={iso} className="flex flex-1 flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-ink-faint">{Math.round(v / 100) / 10}k</span>
          <div
            className="w-full rounded-t-[4px] bg-gradient-to-t from-ember-dim to-ember transition-all"
            style={{ height: `${Math.max(4, (v / max) * 78)}px` }}
          />
          <span className="font-mono text-[8.5px] text-ink-faint">
            {isoToDate(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
          </span>
        </div>
      ))}
    </div>
  );
}
