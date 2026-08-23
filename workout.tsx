// Séance : choix du split, jour, saisie des séries, dernière performance, minuteur.

import { useState } from "react";
import { Button, Panel, Plate, SectionTitle, useToast } from "../components/ui-kit";
import { RestTimer } from "../components/rest-timer";
import { DAYS_FR, REST_KEYS, SPLITS, type Exo } from "../lib/program";
import { finishSession, logSet, setSplit, todayISO, useStore, type SetLog } from "../lib/store";
import { lastPerf, sessionVolume, sessionsThisWeek, stepTarget } from "../lib/calc";

function WorkoutPage() {
  const s = useStore();
  const iso = todayISO();
  const { toast, node } = useToast();
  const todayName = DAYS_FR[new Date().getDay()]!;
  const [day, setDay] = useState<string>(todayName);

  const split = SPLITS[s.split];
  const dayKey = split.week[day] ?? "repos";
  const isRest = REST_KEYS.includes(dayKey);
  const workout = isRest ? null : split.days[dayKey]!;
  const isToday = day === todayName;
  const session = isToday ? s.sessions[iso] : undefined;
  const activeSession = session?.dayKey === dayKey ? session : undefined;
  const volume = sessionVolume(activeSession);

  return (
    <>
      {node}
      <SectionTitle sub={split.description}>Séance</SectionTitle>

      <div className="mb-3.5 flex gap-2">
        {(["simple", "full"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSplit(k)}
            className={`flex-1 rounded-[10px] border py-2.5 text-[12.5px] transition ${
              s.split === k ? "border-accent bg-accent/10 text-ink" : "border-line bg-surface-2 text-ink-dim"
            }`}
          >
            {SPLITS[k].label}
          </button>
        ))}
      </div>

      <div className="mb-3.5 flex gap-1.5 overflow-x-auto pb-1">
        {Object.keys(split.week).map((d) => {
          const key = split.week[d]!;
          const rest = REST_KEYS.includes(key);
          const active = d === day;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-[11px] transition ${
                active
                  ? "border-accent bg-accent font-semibold text-[#0a0a0b]"
                  : rest
                    ? "border-line bg-surface text-ink-faint"
                    : "border-line bg-surface-2 text-ink-dim"
              }`}
            >
              {d.slice(0, 3)}
              {d === todayName && <span className={active ? "text-[#0a0a0b]" : "text-accent"}> •</span>}
            </button>
          );
        })}
      </div>

      {isRest ? (
        <Panel title="Récupération">
          <p className="text-[13.5px] leading-relaxed text-ink-dim">
            {dayKey === "repos"
              ? "Repos complet. Étirements 10 min, marche libre si tu en as envie. C'est le jour où le muscle se construit."
              : dayKey === "marche-longue"
                ? "Marche longue : 60 à 75 min à rythme tranquille, en une ou deux fois."
                : "Marche 45 à 60 min + 5 min de gainage."}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Plate value={stepTarget(s).toLocaleString("fr-FR")} label="pas visés" tone="accent" />
            <Plate value={`${sessionsThisWeek(s)}`} label="séances cette semaine" />
          </div>
        </Panel>
      ) : (
        <>
          {isToday && <RestTimer />}
          <Panel
            title={`${workout!.name} — ${workout!.focus}`}
            action={
              <span className="font-mono text-[11px] text-ink-faint">
                {volume > 0 ? `${Math.round(volume).toLocaleString("fr-FR")} kg soulevés` : ""}
              </span>
            }
          >
            {workout!.exos.map((exo, i) => (
              <ExoRow
                key={i}
                exo={exo}
                index={i}
                dayKey={dayKey}
                iso={iso}
                editable={isToday}
                split={s.split}
                sets={activeSession?.exos[i]}
                last={lastPerf(s, dayKey, i, iso)}
              />
            ))}
          </Panel>

          {isToday && (
            <Button
              className="mb-3.5 w-full"
              variant={activeSession?.done ? "ghost" : "solid"}
              onClick={() => {
                finishSession(iso, dayKey, s.split);
                toast(activeSession?.done ? "Séance rouverte" : "Séance validée. Bien joué.");
              }}
            >
              {activeSession?.done ? "Séance validée ✓" : "Terminer la séance"}
            </Button>
          )}
          {!isToday && (
            <p className="mb-3.5 px-1 text-[11.5px] text-ink-faint">
              Aperçu d'un autre jour — la saisie n'est possible que sur la séance du jour.
            </p>
          )}
        </>
      )}
    </>
  );
}

function ExoRow({
  exo,
  index,
  dayKey,
  iso,
  editable,
  split,
  sets,
  last,
}: {
  exo: Exo;
  index: number;
  dayKey: string;
  iso: string;
  editable: boolean;
  split: "simple" | "full";
  sets?: SetLog[];
  last: { iso: string; sets: SetLog[] } | null;
}) {
  const lastText = last
    ? last.sets
        .filter((st) => st.kg || st.reps)
        .map((st) => `${st.kg ? `${st.kg}kg` : "—"}×${st.reps ?? "—"}`)
        .join("  ")
    : null;

  return (
    <div className="border-b border-line py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[14px] font-medium">{exo.n}</div>
          {exo.note && <div className="mt-0.5 text-[11px] text-ink-faint">{exo.note}</div>}
        </div>
        <div className="shrink-0 font-mono text-[12px] text-ink-dim">
          {exo.sets} × {exo.reps}
        </div>
      </div>

      {lastText && (
        <div className="mt-1.5 font-mono text-[10.5px] text-accent">
          dernière fois : {lastText} <span className="text-ink-faint">— bats ça</span>
        </div>
      )}

      {editable && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from({ length: exo.sets }).map((_, si) => (
            <SetInput key={si} value={sets?.[si]} bw={exo.bw} onChange={(v) => logSet(iso, dayKey, split, index, si, v)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SetInput({ value, bw, onChange }: { value?: SetLog; bw?: boolean; onChange: (v: SetLog) => void }) {
  const kg = value?.kg ?? null;
  const reps = value?.reps ?? null;
  const filled = kg !== null || reps !== null;
  return (
    <div
      className={`flex items-center gap-0.5 rounded-[9px] border px-1.5 py-1 ${
        filled ? "border-accent/60 bg-accent/8" : "border-line bg-surface-2"
      }`}
    >
      {!bw && (
        <>
          <input
            type="number"
            inputMode="decimal"
            placeholder="kg"
            value={kg ?? ""}
            onChange={(e) => onChange({ kg: e.target.value === "" ? null : parseFloat(e.target.value), reps })}
            className="w-9 bg-transparent text-center font-mono text-[12px] outline-none"
          />
          <span className="text-[10px] text-ink-faint">×</span>
        </>
      )}
      <input
        type="number"
        inputMode="numeric"
        placeholder={bw ? "reps / s" : "reps"}
        value={reps ?? ""}
        onChange={(e) => onChange({ kg, reps: e.target.value === "" ? null : parseInt(e.target.value, 10) })}
        className={`bg-transparent text-center font-mono text-[12px] outline-none ${bw ? "w-16" : "w-9"}`}
      />
    </div>
  );
}

export default WorkoutPage;
