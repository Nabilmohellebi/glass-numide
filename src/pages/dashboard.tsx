// Tableau de bord — le cadran du jour.

import { useState } from "react";
import { Link } from "wouter";
import { Gauge } from "../components/gauge";
import { Bar, Button, Panel, Plate, useToast } from "../components/ui-kit";
import { addWater, setSteps, setWeight, setWellbeing, todayISO, toggleCheck, useStore } from "../lib/store";
import {
  alerts,
  currentWeight,
  dayCount,
  dayMacros,
  fmt,
  movingAverage,
  phaseFor,
  progressPct,
  projectionDate,
  sessionsThisWeek,
  stepTarget,
  weeklyRate,
} from "../lib/calc";
import { energyToday } from "../lib/energy";
import { CHECKLIST, DAYS_FR, REST_KEYS, SPLITS, WATER_TARGET_L } from "../lib/program";

function Dashboard() {
  const s = useStore();
  const iso = todayISO();
  const { toast, node } = useToast();
  const [w, setW] = useState(s.weights[iso] ? String(s.weights[iso]) : "");

  const profile = s.profile!;
  const now = currentWeight(s);
  const avg7 = movingAverage(s, 7);
  const phase = phaseFor(now);
  const lost = profile.startWeight - now;
  const toGo = Math.max(0, now - profile.goal);
  const rate = weeklyRate(s);
  const eta = projectionDate(s);
  const macros = dayMacros(s, iso);
  const water = s.water[iso] ?? 0;
  const steps = s.steps[iso] ?? 0;
  const stepGoal = stepTarget(s);
  const checks = s.checklists[iso] ?? {};
  const checkDone = Object.values(checks).filter(Boolean).length;
  const energy = energyToday(s, iso);
  const wb = s.wellbeing[iso] ?? { sleep: null, energy: null, stress: null };

  const dayName = DAYS_FR[new Date().getDay()]!;
  const split = SPLITS[s.split];
  const dayKey = split.week[dayName]!;
  const isRest = REST_KEYS.includes(dayKey);
  const workout = isRest ? null : split.days[dayKey]!;
  const sessionDone = s.sessions[iso]?.done;

  const saveWeight = () => {
    const v = parseFloat(w.replace(",", "."));
    if (!v || v < 40 || v > 350) return toast("Poids invalide");
    setWeight(iso, Math.round(v * 10) / 10);
    toast("Pesée enregistrée");
  };

  return (
    <>
      {node}

      <section className="panel hatch rise relative mb-3.5 overflow-hidden p-4">
        <div className="flex items-center gap-4">
          <Gauge pct={progressPct(s)} />
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] tracking-[0.08em] text-ink-faint uppercase">{phase.label}</div>
            <div className="display mt-0.5 flex items-baseline gap-1 text-[42px] leading-none font-bold">
              {fmt(now)}
              <span className="font-sans text-[16px] font-medium text-ink-faint">kg</span>
            </div>
            <div className="mt-1.5 font-mono text-[12px] text-good">− {fmt(Math.max(0, lost))} kg depuis le départ</div>
            <div className="font-mono text-[11px] text-ink-faint">moy. 7 j {avg7 ? `${fmt(avg7)} kg` : "—"}</div>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-4 gap-2 border-t border-dashed border-line pt-3">
          <Foot value={`${fmt(toGo)}`} unit="kg" label="reste" />
          <Foot value={String(dayCount(s))} label="jour" />
          <Foot value={rate ? fmt(rate) : "—"} unit={rate ? "kg/s" : ""} label="rythme" />
          <Foot
            value={eta ? eta.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) : "—"}
            label="cible"
          />
        </div>
      </section>

      {alerts(s).map((a, i) => (
        <div
          key={i}
          className="rise mb-3.5 flex gap-2.5 rounded-[12px] border px-3.5 py-3 text-[12.5px] leading-relaxed"
          style={{
            animationDelay: `${60 + i * 40}ms`,
            borderColor:
              a.level === "warn" ? "rgba(240,196,106,.35)" : a.level === "good" ? "rgba(126,224,168,.3)" : "var(--color-line)",
            background:
              a.level === "warn" ? "rgba(240,196,106,.07)" : a.level === "good" ? "rgba(126,224,168,.06)" : "var(--color-surface)",
            color: a.level === "warn" ? "#e2b93b" : a.level === "good" ? "#4fae7b" : "var(--color-ink-dim)",
          }}
        >
          <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
          {a.text}
        </div>
      ))}

      {energy && (
        <div className="rise mb-3.5 grid grid-cols-2 gap-3" style={{ animationDelay: "60ms" }}>
          <div className="panel p-4">
            <div className="text-[10.5px] tracking-[0.08em] text-ink-faint uppercase">Dépense estimée</div>
            <div className="display mt-1 text-[32px] leading-none">{Math.round(energy.totalOut)}</div>
            <div className="font-mono text-[10.5px] text-ink-faint">kcal aujourd'hui</div>
          </div>
          <div className="panel p-4">
            <div className="text-[10.5px] tracking-[0.08em] text-ink-faint uppercase">Déficit réel</div>
            <div className={`display mt-1 text-[32px] leading-none ${energy.deficit >= 0 ? "text-good" : "text-bad"}`}>
              {energy.deficit >= 0 ? "−" : "+"}
              {Math.abs(Math.round(energy.deficit))}
            </div>
            <div className="font-mono text-[10.5px] text-ink-faint">
              {Math.round(energy.intake)} kcal mangées / {Math.round(energy.totalOut)} brûlées
            </div>
          </div>
        </div>
      )}

      <Panel title="Pesée du matin" delay={80}>
        <div className="flex gap-2">
          <input
            className="field text-[20px]"
            type="number"
            inputMode="decimal"
            step="0.1"
            value={w}
            onChange={(e) => setW(e.target.value)}
            placeholder="à jeun, après les toilettes"
          />
          <Button onClick={saveWeight}>OK</Button>
        </div>
        <p className="mt-2 text-[11px] text-ink-faint">
          Une seule pesée par jour, toujours dans les mêmes conditions. C'est la moyenne 7 j qui compte.
        </p>
      </Panel>

      <Panel
        title="Nutrition du jour"
        delay={120}
        action={
          <Link href="/nutrition" className="display text-[11px] tracking-[0.08em] text-accent">
            Journal →
          </Link>
        }
      >
        <Bar value={macros.kcal} max={phase.kcal} label="Calories" unit="kcal" />
        <Bar value={macros.prot} max={phase.prot} label="Protéines" unit="g" color="var(--color-good)" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Plate value={`${Math.max(0, Math.round(phase.kcal - macros.kcal))}`} label="kcal restantes" tone="accent" />
          <Plate value={`${Math.round(macros.carbs)}/${phase.carbs}`} label="glucides g" />
          <Plate value={`${Math.round(macros.fat)}/${phase.fat}`} label="lipides g" />
        </div>
      </Panel>

      <Panel
        title="Séance du jour"
        delay={160}
        action={
          <Link href="/seance" className="display text-[11px] tracking-[0.08em] text-accent">
            Ouvrir →
          </Link>
        }
      >
        {isRest ? (
          <div className="text-[13px] text-ink-dim">
            {dayKey === "repos"
              ? "Repos actif — étirements 10 min, marche libre."
              : dayKey === "marche-longue"
                ? "Marche longue : 60 à 75 min à rythme tranquille."
                : "Marche 45 à 60 min + gainage."}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="display text-[15px]">{workout!.name}</div>
              <div className="text-[12px] text-ink-faint">
                {workout!.focus} · {workout!.exos.length} exercices
              </div>
            </div>
            <span
              className={`display rounded-full px-2.5 py-1 text-[10px] ${
                sessionDone ? "bg-good/15 text-good" : "bg-surface-2 text-ink-faint"
              }`}
            >
              {sessionDone ? "faite" : "à faire"}
            </span>
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Plate value={`${sessionsThisWeek(s)}`} label="séances cette semaine" />
          <Plate value={split.short} label="format actuel" />
        </div>
      </Panel>

      <Panel title="Eau & pas" delay={200}>
        <Bar value={water} max={WATER_TARGET_L} label="Eau" unit="L" color="#4a90c2" />
        <div className="mt-2 mb-3 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => addWater(iso, 0.25)}>
            + 25 cl
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => addWater(iso, 0.5)}>
            + 50 cl
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => addWater(iso, -0.25)}>
            −
          </Button>
        </div>
        <Bar value={steps} max={stepGoal} label="Pas" unit="pas" color="var(--color-ink-dim)" />
        <input
          className="field mt-2 text-[14px]"
          type="number"
          inputMode="numeric"
          placeholder={`objectif ${stepGoal.toLocaleString("fr-FR")} pas — saisis le total du jour`}
          value={steps || ""}
          onChange={(e) => setSteps(iso, parseInt(e.target.value || "0", 10))}
        />
      </Panel>

      <Panel title={`Checklist · ${checkDone}/${CHECKLIST.length}`} delay={240}>
        <ul className="flex flex-col">
          {CHECKLIST.map((item, i) => {
            const done = !!checks[i];
            return (
              <li key={i} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleCheck(iso, i)}
                  className="flex w-full items-center gap-3 py-2.5 text-left"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border text-[12px] font-bold transition ${
                      done ? "border-accent bg-accent text-[#0a0a0b]" : "border-ink-faint bg-surface-2 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={`text-[13.5px] ${done ? "text-ink-faint line-through" : "text-ink"}`}>{item}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Sommeil, énergie, stress" delay={280}>
        <WellbeingRow label="Sommeil" value={wb.sleep} onChange={(v) => setWellbeing(iso, { sleep: v })} lowLabel="mauvais" highLabel="excellent" />
        <WellbeingRow label="Énergie" value={wb.energy} onChange={(v) => setWellbeing(iso, { energy: v })} lowLabel="épuisé" highLabel="au top" />
        <WellbeingRow label="Stress" value={wb.stress} onChange={(v) => setWellbeing(iso, { stress: v })} lowLabel="calme" highLabel="sous pression" />
        <p className="mt-1 text-[11px] text-ink-faint">
          Une note de 1 à 5 par jour suffit — la corrélation avec ta courbe de poids apparaît dans l'onglet Progrès.
        </p>
      </Panel>
    </>
  );
}

function WellbeingRow({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <div className="mb-3.5 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] text-ink-dim">{label}</span>
        <span className="font-mono text-[11px] text-ink-faint">
          {lowLabel} → {highLabel}
        </span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 rounded-[9px] border py-2 font-mono text-[12px] transition ${
              value === n ? "border-accent bg-accent text-[#0a0a0b] font-semibold" : "border-line bg-surface-2 text-ink-faint"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function Foot({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div>
      <div className="display text-[14px] leading-none">
        {value}
        {unit && <span className="ml-0.5 font-sans text-[9px] text-ink-faint">{unit}</span>}
      </div>
      <div className="mt-1 text-[9.5px] tracking-[0.05em] text-ink-faint uppercase">{label}</div>
    </div>
  );
}

export default Dashboard;
