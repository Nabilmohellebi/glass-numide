// Dépense énergétique : BMR (Mifflin-St Jeor) + activité (pas) + séance du jour.
// Le déficit réel = apport du jour (journal) − dépense estimée du jour.

import type { AppState } from "./store";
import { currentWeight, dayMacros, phaseFor, sessionVolume } from "./calc";
import { todayISO } from "./store";

/** Métabolisme de base — Mifflin-St Jeor, formule homme (le profil ne distingue pas le sexe ici). */
export function bmr(weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

/** kcal brûlées par 1000 pas, à peu près proportionnel au poids porté. */
function kcalPerThousandSteps(weightKg: number): number {
  return weightKg * 0.5;
}

/** kcal brûlées par le volume de musculation (approximation : ~0,1 kcal par kg soulevé). */
function kcalFromVolume(volumeKg: number): number {
  return volumeKg * 0.1;
}

export type EnergyBreakdown = {
  bmr: number;
  fromSteps: number;
  fromTraining: number;
  neat: number;
  totalOut: number;
  intake: number;
  deficit: number;
};

export function energyToday(s: AppState, iso: string = todayISO()): EnergyBreakdown | null {
  if (!s.profile) return null;
  const weight = currentWeight(s);
  const base = bmr(weight, s.profile.heightCm, s.profile.age);
  const steps = s.steps[iso] ?? 0;
  const fromSteps = (steps / 1000) * kcalPerThousandSteps(weight);
  const session = s.sessions[iso];
  const fromTraining = kcalFromVolume(sessionVolume(session));
  // NEAT de base (activité non structurée : se lever, cuisiner, etc.)
  const neat = base * 0.15;
  const totalOut = base + fromSteps + fromTraining + neat;
  const intake = dayMacros(s, iso).kcal;
  return { bmr: base, fromSteps, fromTraining, neat, totalOut, intake, deficit: totalOut - intake };
}

/** Cible de déficit théorique de la phase actuelle, pour comparaison. */
export function targetDeficit(s: AppState): number {
  const phase = phaseFor(currentWeight(s));
  const e = energyToday(s);
  if (!e) return 0;
  return e.totalOut - phase.kcal;
}
