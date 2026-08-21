// Minuteur de repos entre les séries. Bip léger via WebAudio à la fin.

import { useEffect, useRef, useState } from "react";

function beep() {
  try {
    const Ctx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    setTimeout(() => void ctx.close(), 700);
  } catch {
    /* audio indisponible */
  }
}

export function RestTimer() {
  const [left, setLeft] = useState(0);
  const [total, setTotal] = useState(90);
  const raf = useRef<number | null>(null);
  const endAt = useRef(0);

  useEffect(() => {
    if (!left) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining <= 0) {
        beep();
        if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
        return;
      }
      raf.current = window.setTimeout(tick, 250);
    };
    raf.current = window.setTimeout(tick, 250);
    return () => {
      if (raf.current) clearTimeout(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const start = (sec: number) => {
    setTotal(sec);
    endAt.current = Date.now() + sec * 1000;
    setLeft(sec);
  };

  const pct = left && total ? left / total : 0;

  return (
    <div className="panel mb-3.5 p-3">
      <div className="flex items-center gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
            <circle cx="20" cy="20" r="17" fill="none" stroke="var(--color-surface-2)" strokeWidth="4" />
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="var(--color-ember)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 17 * pct} ${2 * Math.PI * 17}`}
            />
          </svg>
          <span className="font-mono text-[12px] font-semibold">{left || "–"}</span>
        </div>
        <div className="flex flex-1 gap-1.5">
          {[45, 60, 90, 120].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => start(sec)}
              className="flex-1 rounded-[9px] border border-line bg-surface-2 py-2 font-mono text-[11px] text-ink-dim active:border-ember"
            >
              {sec}s
            </button>
          ))}
          {left > 0 && (
            <button
              type="button"
              onClick={() => setLeft(0)}
              className="rounded-[9px] border border-line px-2.5 font-mono text-[11px] text-ink-faint"
            >
              stop
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-[10.5px] text-ink-faint">Repos : 90-120 s sur les gros exercices, 45-60 s sur l'isolation.</p>
    </div>
  );
}
