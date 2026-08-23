// Guide : méthode, règles muscle, erreurs, plateau, signaux d'alerte, phases.

import { useState, type ReactNode } from "react";
import { Panel, SectionTitle } from "../components/ui-kit";
import { INTENSIFICATION, MISTAKES, MUSCLE_RULES, PHASES, PLATEAU_PROTOCOL, RED_FLAGS } from "../lib/program";
import { currentWeight, phaseFor } from "../lib/calc";
import { useStore } from "../lib/store";

function GuidePage() {
  const s = useStore();
  const active = phaseFor(currentWeight(s));

  return (
    <>
      <SectionTitle sub="Le programme, en clair. Ouvre une section quand tu en as besoin.">Guide</SectionTitle>

      <Panel title="Construire du muscle en perdant du gras">
        <ul className="space-y-2">
          {MUSCLE_RULES.map((r, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-dim">
              <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-accent" />
              {r}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Paliers de calories" delay={60}>
        <div className="overflow-hidden rounded-[10px] border border-line">
          <table className="w-full font-mono text-[11px]">
            <thead>
              <tr className="bg-surface-2 text-ink-faint">
                <th className="px-2 py-2 text-left font-normal">Poids</th>
                <th className="px-1 py-2 text-right font-normal">kcal</th>
                <th className="px-1 py-2 text-right font-normal">P</th>
                <th className="px-1 py-2 text-right font-normal">G</th>
                <th className="px-2 py-2 text-right font-normal">L</th>
              </tr>
            </thead>
            <tbody>
              {PHASES.map((p, i) => {
                const on = p === active;
                return (
                  <tr key={i} className={on ? "bg-accent/10 text-ink" : "text-ink-dim"}>
                    <td className="px-2 py-1.5 text-left">
                      {p.max === 999 ? "150+" : p.min === 0 ? "< 100" : `${p.min}-${p.max}`}
                      {on && <span className="ml-1 text-accent">•</span>}
                    </td>
                    <td className="px-1 py-1.5 text-right">{p.kcal}</td>
                    <td className="px-1 py-1.5 text-right">{p.prot}</td>
                    <td className="px-1 py-1.5 text-right">{p.carbs}</td>
                    <td className="px-2 py-1.5 text-right">{p.fat}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-ink-faint">Les macros s'ajustent automatiquement dès que ton poids change de palier.</p>
      </Panel>

      <Panel title="Sections détaillées" delay={100}>
        <Acc title="Progresser avec 2 haltères de 10 kg">
          <ul className="space-y-2">
            {INTENSIFICATION.map((x, i) => (
              <li key={i}>
                <b className="text-ink">
                  Mois {x.months} — {x.method}.
                </b>{" "}
                {x.how}
              </li>
            ))}
          </ul>
        </Acc>
        <Acc title="Protocole anti-stagnation (plateau ≥ 14 jours)">
          <List items={PLATEAU_PROTOCOL} />
        </Acc>
        <Acc title="10 erreurs qui font échouer">
          <List items={MISTAKES} ordered />
        </Acc>
        <Acc title="Signaux d'alerte — consulte un médecin">
          <List items={RED_FLAGS} />
        </Acc>
      </Panel>

      <p className="px-1 pb-2 text-[11px] leading-relaxed text-ink-faint">
        Programme général basé sur l'équation de Mifflin-St Jeor et les recommandations usuelles en protéines (1,6 à 2 g/kg)
        pour préserver la masse maigre en déficit. Il ne remplace pas un avis médical individualisé — un bilan sanguin de
        départ est recommandé.
      </p>
    </>
  );
}

function Acc({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-b-0">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 py-3 text-left">
        <span className="text-[13.5px] font-medium">{title}</span>
        <span className={`font-mono text-[14px] text-accent transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <div className="fade-in pb-3.5 text-[12.5px] leading-relaxed text-ink-dim">{children}</div>}
    </div>
  );
}

function List({ items, ordered }: { items: string[]; ordered?: boolean }) {
  return (
    <ol className="space-y-2">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="shrink-0 font-mono text-[11px] text-accent">{ordered ? `${i + 1}.` : "—"}</span>
          <span>{x}</span>
        </li>
      ))}
    </ol>
  );
}

export default GuidePage;
