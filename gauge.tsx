// Cadran signature : arc 270°, graduations, aiguille, compteur animé.

import { useEffect, useState } from "react";

export function Gauge({ pct, size = 132 }: { pct: number; size?: number }) {
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = anim;
    const duration = 700;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setAnim(from + (pct - from) * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  const cx = 60;
  const cy = 60;
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const arcFraction = 0.75;
  const dashTotal = circumference * arcFraction;
  const rotate = 135;

  const ticks = [];
  const nTicks = 12;
  for (let i = 0; i <= nTicks; i++) {
    const a = ((rotate + (270 * i) / nTicks) * Math.PI) / 180;
    const major = i % 3 === 0;
    const inner = r + 6;
    const outer = r + (major ? 12 : 9);
    ticks.push(
      <line
        key={i}
        x1={(cx + inner * Math.cos(a)).toFixed(1)}
        y1={(cy + inner * Math.sin(a)).toFixed(1)}
        x2={(cx + outer * Math.cos(a)).toFixed(1)}
        y2={(cy + outer * Math.sin(a)).toFixed(1)}
        stroke={major ? "var(--color-ink-dim)" : "var(--color-line)"}
        strokeWidth={major ? 2 : 1.4}
        strokeLinecap="round"
      />,
    );
  }

  const needleAngle = ((rotate + 270 * anim) * Math.PI) / 180;
  const nx = cx + (r - 14) * Math.cos(needleAngle);
  const ny = cy + (r - 14) * Math.sin(needleAngle);

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="shrink-0">
      <defs>
        <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c8c8ca" />
        </linearGradient>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-surface-2)"
        strokeWidth={9}
        strokeDasharray={`${dashTotal} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(${rotate} ${cx} ${cy})`}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#accentGrad)"
        strokeWidth={9}
        strokeDasharray={`${dashTotal * anim} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(${rotate} ${cx} ${cy})`}
      />
      {ticks}
      <line
        x1={cx}
        y1={cy}
        x2={nx.toFixed(1)}
        y2={ny.toFixed(1)}
        stroke="var(--color-ink)"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.75}
      />
      <circle cx={cx} cy={cy} r={3.4} fill="var(--color-ink)" />
      <text
        x={cx}
        y={cy + 26}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="17"
        fontWeight="600"
        fill="var(--color-ink)"
      >
        {Math.round(anim * 100)}%
      </text>
      <text
        x={cx}
        y={cy + 36}
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontSize="7"
        letterSpacing="1"
        fill="var(--color-ink-faint)"
      >
        PARCOURU
      </text>
    </svg>
  );
}
