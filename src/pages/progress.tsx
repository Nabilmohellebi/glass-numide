// Progrès : courbe de poids, mensurations, volume soulevé, historique.

import { useState } from "react";
import { Empty, Panel, Plate, SectionTitle, Button, useToast } from "../components/ui-kit";
import { MiniChart, VolumeBars, WeightChart } from "../components/charts";
import { removeWeight, setWaist, todayISO, useStore } from "../lib/store";
import {
  currentWeight,
  dayCount,
  fmt,
  movingAverage,
  plateauDays,
  projectionDate,
  sessionVolume,
  streak,
  weeklyRate,
  weeklyVolumes,
} from "../lib/calc";

function ProgressPage() {
  const s = useStore();
  const iso = todayISO();
  const { toast, node } = useToast();
  const [waist, setWaistInput] = useState(s.waist[iso] ? String(s.waist[iso]) : "");

  const profile = s.profile!;
  const now = currentWeight(s);
  const rate = weeklyRate(s);
  const eta = projectionDate(s);
  const avg7 = movingAverage(s, 7);
  const avg30 = movingAverage(s, 30);
  const dates = Object.keys(s.weights).sort().reverse();
  const waistPoints = Object.keys(s.waist)
    .sort()
    .map((k) => ({ iso: k, v: s.waist[k]! }));
  const waistDelta = waistPoints.length > 1 ? waistPoints[0]!.v - waistPoints[waistPoints.length - 1]!.v : null;
  const volumes = weeklyVolumes(s);
  const totalSessions = Object.values(s.sessions).filter((x) => x.done || sessionVolume(x) > 0).length;
  const volTrend =
    volumes.length > 1 && volumes[0]![1] > 0
      ? ((volumes[volumes.length - 1]![1] - volumes[0]![1]) / volumes[0]![1]) * 100
      : null;

  return (
    <>
      {node}
      <SectionTitle sub={`Jour ${dayCount(s)} du programme · ${streak(s)} jours de suite`}>Progrès</SectionTitle>

      <Panel title="Courbe de poids">
        <WeightChart s={s} />
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-ink-faint">
          <Legend color="var(--color-ember)" label="Poids réel" />
          <Legend color="rgba(236,232,223,.55)" label="Moyenne 7 j" />
          <Legend color="var(--color-steel)" label="Trajectoire cible (0,7 kg/sem)" />
        </div>
      </Panel>

      <Panel title="Chiffres clés" delay={60}>
        <div className="grid grid-cols-3 gap-2">
          <Plate value={`${fmt(Math.max(0, profile.startWeight - now))}`} label="kg perdus" tone="good" />
          <Plate value={`${fmt(Math.max(0, now - profile.goal))}`} label="kg restants" />
          <Plate value={rate ? fmt(rate) : "—"} label="kg / semaine" tone="ember" />
          <Plate value={avg7 ? fmt(avg7) : "—"} label="moy. 7 j" />
          <Plate value={avg30 ? fmt(avg30) : "—"} label="moy. 30 j" />
          <Plate value={eta ? eta.toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "—"} label="objectif atteint" />
        </div>
        {plateauDays(s) >= 10 && (
          <p className="mt-3 text-[12px] text-warn">
            Plateau depuis {plateauDays(s)} jours — applique le protocole anti-stagnation (onglet Guide).
          </p>
        )}
      </Panel>

      <Panel title="Muscle : volume soulevé par semaine" delay={100}>
        <VolumeBars data={volumes} />
        <p className="mt-2 text-[11.5px] leading-relaxed text-ink-faint">
          {volTrend !== null
            ? volTrend >= 0
              ? `Volume en hausse de ${Math.round(volTrend)} % sur la période : le poids baisse et la force monte, c'est exactement ce qu'on veut.`
              : `Volume en baisse de ${Math.round(Math.abs(volTrend))} %. Surveille le sommeil et les protéines avant de baisser les calories.`
            : "Note tes charges à chaque séance : c'est la preuve chiffrée que tu gardes ton muscle."}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Plate value={String(totalSessions)} label="séances enregistrées" />
          <Plate
            value={volumes.length ? `${Math.round(volumes[volumes.length - 1]![1]).toLocaleString("fr-FR")}` : "—"}
            label="kg cette semaine"
          />
        </div>
      </Panel>

      <Panel title="Tour de taille (au nombril)" delay={140}>
        <div className="flex gap-2">
          <input
            className="field text-[17px]"
            type="number"
            inputMode="decimal"
            step="0.5"
            placeholder="en cm"
            value={waist}
            onChange={(e) => setWaistInput(e.target.value)}
          />
          <Button
            onClick={() => {
              const v = parseFloat(waist.replace(",", "."));
              if (!v) return toast("Valeur invalide");
              setWaist(iso, v);
              toast("Mesure enregistrée");
            }}
          >
            OK
          </Button>
        </div>
        {waistPoints.length > 1 && (
          <>
            <div className="mt-3">
              <MiniChart points={waistPoints} color="#4a90c2" />
            </div>
            <p className="mt-1 text-[11.5px] text-ink-faint">
              {waistDelta && waistDelta > 0
                ? `− ${fmt(waistDelta)} cm depuis la première mesure. Le tour de taille descend même quand la balance stagne.`
                : "Mesure une fois par semaine, le matin, sans serrer."}
            </p>
          </>
        )}
      </Panel>

      <Panel title="Historique des pesées" delay={180}>
        {dates.length === 0 ? (
          <Empty>Aucune pesée enregistrée.</Empty>
        ) : (
          <ul>
            {dates.slice(0, 30).map((d) => (
              <li key={d} className="flex items-center justify-between border-b border-line py-2 last:border-b-0">
                <span className="font-mono text-[11px] text-ink-faint">
                  {new Date(`${d}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-semibold">{fmt(s.weights[d]!)} kg</span>
                  <button type="button" onClick={() => removeWeight(d)} className="font-mono text-[14px] text-ink-faint" aria-label="Supprimer">
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <i className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export default ProgressPage;
