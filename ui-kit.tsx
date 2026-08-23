// Briques d'interface partagées : panneaux, plaques, barres, boutons, feuilles modales.

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";

export function Panel({
  title,
  action,
  children,
  className,
  delay = 0,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section className={cn("panel rise mb-3.5 p-4", className)} style={{ animationDelay: `${delay}ms` }}>
      {title && (
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 className="display flex items-center gap-2 text-[12px] tracking-[0.12em] text-ink-dim">
            <span className="inline-block h-1.5 w-1.5 rounded-[1px] bg-accent" />
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Plate({
  value,
  label,
  tone = "ink",
}: {
  value: ReactNode;
  label: string;
  tone?: "ink" | "accent" | "good" | "warn";
}) {
  const color =
    tone === "accent" ? "text-accent" : tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : "text-ink";
  return (
    <div className="rounded-[10px] border border-line bg-surface-2 px-1.5 py-2.5 text-center">
      <div className={cn("font-mono text-[15px] font-semibold", color)}>{value}</div>
      <div className="mt-0.5 text-[9px] tracking-[0.06em] text-ink-faint uppercase">{label}</div>
    </div>
  );
}

export function Bar({
  value,
  max,
  label,
  unit,
  color = "var(--color-accent)",
}: {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(1.15, value / max) : 0;
  const over = value > max * 1.05;
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[12px] text-ink-dim">{label}</span>
        <span className="font-mono text-[12px]">
          <span className={over ? "text-warn" : "text-ink"}>{Math.round(value)}</span>
          <span className="text-ink-faint">
            {" / "}
            {Math.round(max)} {unit}
          </span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${Math.min(100, pct * 100)}%`, background: over ? "var(--color-warn)" : color }}
        />
      </div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "solid",
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "ghost" | "quiet";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "display rounded-[10px] px-4 py-2.5 text-[13px] font-semibold transition active:scale-[0.98] disabled:opacity-40";
  const styles = {
    solid: "bg-accent text-[#0a0a0b]",
    ghost: "border border-line bg-surface-2 text-ink-dim",
    quiet: "text-ink-faint",
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(base, styles, className)}>
      {children}
    </button>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="fade-in absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />
      <div className="sheet-up relative mx-auto flex max-h-[85vh] w-full max-w-[480px] flex-col rounded-t-[20px] border border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h3 className="display text-[14px] tracking-[0.08em]">{title}</h3>
          <button type="button" onClick={onClose} className="font-mono text-[18px] text-ink-faint">
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 1900);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? (
    <div className="pointer-events-none fixed inset-x-0 bottom-[96px] z-[60] flex justify-center px-6">
      <div className="fade-in display rounded-full bg-good px-4 py-2 text-[12px] text-[#0c1f14] shadow-lg">{msg}</div>
    </div>
  ) : null;
  return { toast: setMsg, node };
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="py-6 text-center text-[13px] text-ink-faint">{children}</div>;
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mt-1 mb-3.5">
      <h1 className="display text-[20px] leading-tight">{children}</h1>
      {sub && <p className="mt-1 text-[12px] text-ink-faint">{sub}</p>}
    </div>
  );
}
