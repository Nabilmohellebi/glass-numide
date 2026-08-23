// Coque de l'app : barre supérieure sticky + barre d'onglets fixe.

import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { useStore } from "../lib/store";
import { streak } from "../lib/calc";

const TABS = [
  { href: "/", label: "Cadran", icon: GaugeIcon },
  { href: "/nutrition", label: "Repas", icon: PlateIcon },
  { href: "/seance", label: "Séance", icon: DumbbellIcon },
  { href: "/progres", label: "Progrès", icon: ChartIcon },
  { href: "/guide", label: "Guide", icon: BookIcon },
];

export function Shell({ children }: { children: ReactNode }) {
  const state = useStore();
  const [loc] = useLocation();
  const days = streak(state);
  const date = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] pb-[calc(78px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 flex items-baseline justify-between bg-gradient-to-b from-bg via-bg to-transparent px-5 pt-4 pb-2.5">
        <Link href="/" className="display text-[15px] font-bold tracking-[0.16em] text-ink-dim">
          LE <span className="text-accent">CADRAN</span>
        </Link>
        <div className="flex items-center gap-2.5">
          {days > 1 && (
            <span className="font-mono text-[11px] text-accent" title="Jours consécutifs">
              {days} j
            </span>
          )}
          <span className="font-mono text-[11px] text-ink-faint capitalize">{date}</span>
          <Link
            href="/reglages"
            className={cn("text-ink-faint transition", loc === "/reglages" && "text-accent")}
            aria-label="Réglages"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V7a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="px-5 pb-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {TABS.map((t) => {
          const active = loc === t.href;
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 transition",
                active ? "text-accent" : "text-ink-faint",
              )}
            >
              <Icon />
              <span className="display text-[9.5px] tracking-[0.06em]">{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function base(children: ReactNode) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {children}
    </svg>
  );
}

function GaugeIcon() {
  return base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12l4-3" />
    </>,
  );
}

function PlateIcon() {
  return base(
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
    </>,
  );
}

function DumbbellIcon() {
  return base(
    <>
      <path d="M6 7v10M18 7v10M2 10v4M22 10v4M6 12h12" />
    </>,
  );
}

function ChartIcon() {
  return base(
    <>
      <path d="M3 17l5-5 4 4 8-9" />
      <path d="M3 21h18" />
    </>,
  );
}

function BookIcon() {
  return base(
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M8 7h7" />
    </>,
  );
}
