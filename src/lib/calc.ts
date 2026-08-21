// Calculs dérivés : phase, moyennes, vitesse de perte, projection, volume, séries.

import { PHASES, STEP_TARGETS, SPLITS, type Phase } from "./program";
import type { AppState, SessionLog } from "./store";
import { todayISO } from "./store";

export const fmt = (n: number, d = 1) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

export const isoToDate = (iso: string) => new Date(`${iso}T00:00:00`);
export const daysBetween = (a: string, b: string) =>
  Math.round((isoToDate(b).getTime() - isoToDate(a).getTime()) / 86_400_000);

export function sortedWeightDates(s: AppState) {
  return Object.keys(s.weights).sort();
}

export function currentWeight(s: AppState): number {
  const dates = sortedWeightDates(s);
  if (dates.length) return s.weights[dates[dates.length - 1]!]!;
  return s.profile?.startWeight ?? 150;
}

/** Moyenne mobile sur les n derniers jours calendaires renseignés. */
export function movingAverage(s: AppState, days = 7, endISO = todayISO()): number | null {
  const entries = sortedWeightDates(s).filter((d) => {
    const diff = daysBetween(d, endISO);
    return diff >= 0 && diff < days;
  });
  if (!entries.length) return null;
  return entries.reduce((a, d) => a + s.weights[d]!, 0) / entries.length;
}

export function phaseFor(weight: number): Phase {
  return PHASES.find((p) => weight > p.min && weight <= p.max) ?? PHASES[0]!;
}

export function monthsSinceStart(s: AppState): number {
  if (!s.profile) return 0;
  const start = isoToDate(s.profile.startDate);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
}

export function stepTarget(s: AppState): number {
  const m = monthsSinceStart(s);
  let t = STEP_TARGETS[0]!.steps;
  for (const st of STEP_TARGETS) if (m >= st.monthFrom) t = st.steps;
  return t;
}

export function dayCount(s: AppState): number {
  if (!s.profile) return 1;
  return Math.max(1, daysBetween(s.profile.startDate, todayISO()) + 1);
}

export function progressPct(s: AppState): number {
  if (!s.profile) return 0;
  const { startWeight, goal } = s.profile;
  const now = currentWeight(s);
  if (startWeight <= goal) return 1;
  return Math.max(0, Math.min(1, (startWeight - now) / (startWeight - goal)));
}

/** Vitesse de perte en kg/semaine sur les 14 derniers jours (régression simple début/fin lissés). */
export function weeklyRate(s: AppState): number | null {
  const dates = sortedWeightDates(s);
  if (dates.length < 2) return null;
  const last = dates[dates.length - 1]!;
  const window = dates.filter((d) => daysBetween(d, last) <= 21);
  if (window.length < 2) return null;
  const first = window[0]!;
  const span = daysBetween(first, last);
  if (span < 3) return null;
  const half = Math.ceil(window.length / 2);
  const early = window.slice(0, half);
  const late = window.slice(-half);
  const avg = (arr: string[]) => arr.reduce((a, d) => a + s.weights[d]!, 0) / arr.length;
  const midEarly = early.reduce((a, d) => a + daysBetween(first, d), 0) / early.length;
  const midLate = late.reduce((a, d) => a + daysBetween(first, d), 0) / late.length;
  const dt = midLate - midEarly;
  if (dt <= 0) return null;
  return ((avg(early) - avg(late)) / dt) * 7;
}

/** Date estimée d'atteinte de l'objectif au rythme actuel. */
export function projectionDate(s: AppState): Date | null {
  const rate = weeklyRate(s);
  if (!rate || rate <= 0.05 || !s.profile) return null;
  const remaining = currentWeight(s) - s.profile.goal;
  if (remaining <= 0) return null;
  const weeks = remaining / rate;
  if (weeks > 260) return null;
  return new Date(Date.now() + weeks * 7 * 86_400_000);
}

export type Alert = { level: "warn" | "good" | "info"; text: string };

export function alerts(s: AppState): Alert[] {
  const out: Alert[] = [];
  const rate = weeklyRate(s);
  const w = currentWeight(s);
  if (rate !== null) {
    const pctWeek = (rate / w) * 100;
    if (pctWeek > 1.2)
      out.push({
        level: "warn",
        text: `Perte de ${fmt(rate)} kg/semaine — trop rapide. Remonte de 150 à 200 kcal : au-delà de 1,2 %/semaine tu brûles du muscle.`,
      });
    else if (rate < 0.15 && plateauDays(s) >= 14)
      out.push({
        level: "warn",
        text: `Plateau depuis ${plateauDays(s)} jours. Applique le protocole anti-stagnation dans l'onglet Guide.`,
      });
    else if (rate >= 0.4 && rate <= 1.2)
      out.push({ level: "good", text: `Rythme idéal : ${fmt(rate)} kg/semaine. Tu gardes ton muscle.` });
  }
  const iso = todayISO();
  if (!s.weights[iso]) out.push({ level: "info", text: "Pesée du jour pas encore enregistrée." });
  return out;
}

/** Nombre de jours depuis la dernière baisse significative de la moyenne. */
export function plateauDays(s: AppState): number {
  const dates = sortedWeightDates(s);
  if (dates.length < 2) return 0;
  const last = dates[dates.length - 1]!;
  const lastW = s.weights[last]!;
  let best = lastW;
  let bestDate = last;
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = dates[i]!;
    if (s.weights[d]! < best - 0.3) break;
    if (s.weights[d]! <= best) {
      best = s.weights[d]!;
      bestDate = d;
    }
  }
  return daysBetween(bestDate, last);
}

// ---------- Nutrition ----------

export function dayMacros(s: AppState, iso: string) {
  const list = s.meals[iso] ?? [];
  return list.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal * m.qty,
      prot: acc.prot + m.prot * m.qty,
      carbs: acc.carbs + m.carbs * m.qty,
      fat: acc.fat + m.fat * m.qty,
    }),
    { kcal: 0, prot: 0, carbs: 0, fat: 0 },
  );
}

// ---------- Entraînement ----------

export function sessionVolume(session: SessionLog | undefined): number {
  if (!session) return 0;
  let total = 0;
  for (const sets of Object.values(session.exos)) {
    for (const st of sets) {
      if (st.kg && st.reps) total += st.kg * st.reps;
    }
  }
  return total;
}

/** Volume total soulevé par semaine ISO, pour le graphique de progression musculaire. */
export function weeklyVolumes(s: AppState, weeks = 8) {
  const buckets = new Map<string, number>();
  for (const [iso, session] of Object.entries(s.sessions)) {
    const vol = sessionVolume(session);
    if (!vol) continue;
    const d = isoToDate(iso);
    const monday = new Date(d);
    const dow = (d.getDay() + 6) % 7;
    monday.setDate(d.getDate() - dow);
    const key = monday.toLocaleDateString("sv-SE");
    buckets.set(key, (buckets.get(key) ?? 0) + vol);
  }
  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-weeks);
}

/** Dernière performance enregistrée pour un exercice donné (hors date du jour). */
export function lastPerf(s: AppState, dayKey: string, exoIndex: number, excludeISO: string) {
  const dates = Object.keys(s.sessions)
    .filter((d) => d !== excludeISO && s.sessions[d]!.dayKey === dayKey)
    .sort()
    .reverse();
  for (const d of dates) {
    const sets = s.sessions[d]!.exos[exoIndex];
    if (sets?.some((st) => st.kg || st.reps)) return { iso: d, sets };
  }
  return null;
}

export function sessionsThisWeek(s: AppState): number {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
  return Object.entries(s.sessions).filter(
    ([iso, ses]) => isoToDate(iso) >= monday && (ses.done || sessionVolume(ses) > 0),
  ).length;
}

/** Jours consécutifs avec au moins une action enregistrée (pesée, repas, séance, checklist). */
export function streak(s: AppState): number {
  let count = 0;
  const d = new Date();
  for (let i = 0; i < 400; i++) {
    const iso = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i).toLocaleDateString("sv-SE");
    const active =
      s.weights[iso] !== undefined ||
      (s.meals[iso]?.length ?? 0) > 0 ||
      s.sessions[iso] !== undefined ||
      Object.values(s.checklists[iso] ?? {}).some(Boolean);
    if (active) count++;
    else if (i > 0) break;
  }
  return count;
}

export function todayWorkout(s: AppState, dayName: string) {
  const split = SPLITS[s.split];
  const key = split.week[dayName];
  return { split, key };
}
