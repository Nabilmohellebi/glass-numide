// Store local : tout est conservé dans le localStorage du téléphone.
// Aucun appel réseau, aucune donnée envoyée nulle part.

import { useSyncExternalStore } from "react";

export const STORE_KEY = "cadran_v2";
export const SCHEMA_VERSION = 2;

export type MealEntry = {
  id: string;
  name: string;
  kcal: number;
  prot: number;
  carbs: number;
  fat: number;
  qty: number;
};

export type SetLog = { kg: number | null; reps: number | null };

export type SessionLog = {
  dayKey: string;
  split: "simple" | "full";
  /** index d'exercice -> séries */
  exos: Record<number, SetLog[]>;
  done?: boolean;
};

export type Profile = {
  name: string;
  startWeight: number;
  goal: number;
  heightCm: number;
  age: number;
  startDate: string;
};

/** Aliment personnel, valeurs toujours exprimées pour 100 g / 100 ml. */
export type CustomFood = {
  id: string;
  name: string;
  kcal100: number;
  prot100: number;
  carbs100: number;
  fat100: number;
};

export type Wellbeing = { sleep: number | null; energy: number | null; stress: number | null };

export type Reminders = {
  enabled: boolean;
  water: boolean;
  weighIn: boolean;
  workout: boolean;
  weighInTime: string; // "HH:MM"
  waterTimes: string[]; // ["10:00","14:00","18:00"]
  workoutTime: string;
};

export type AppState = {
  version: number;
  profile: Profile | null;
  split: "simple" | "full";
  /** ISO date -> valeur */
  weights: Record<string, number>;
  waist: Record<string, number>;
  steps: Record<string, number>;
  water: Record<string, number>;
  checklists: Record<string, Record<number, boolean>>;
  meals: Record<string, MealEntry[]>;
  /** ISO date -> séance du jour */
  sessions: Record<string, SessionLog>;
  notes: Record<string, string>;
  customFoods: Record<string, CustomFood>;
  /** ISO date -> notation sommeil/énergie/stress */
  wellbeing: Record<string, Wellbeing>;
  reminders: Reminders;
};

export const defaultReminders = (): Reminders => ({
  enabled: false,
  water: true,
  weighIn: true,
  workout: true,
  weighInTime: "07:30",
  waterTimes: ["10:00", "14:00", "18:00"],
  workoutTime: "17:30",
});

export const emptyState = (): AppState => ({
  version: SCHEMA_VERSION,
  profile: null,
  split: "simple",
  weights: {},
  waist: {},
  steps: {},
  water: {},
  checklists: {},
  meals: {},
  sessions: {},
  notes: {},
  customFoods: {},
  wellbeing: {},
  reminders: defaultReminders(),
});

function read(): AppState {
  if (typeof localStorage === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...emptyState(),
      ...parsed,
      reminders: { ...defaultReminders(), ...(parsed.reminders ?? {}) },
      version: SCHEMA_VERSION,
    };
  } catch {
    return emptyState();
  }
}

let state: AppState = read();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* quota dépassé : on garde l'état en mémoire */
  }
}

export function getState(): AppState {
  return state;
}

export function update(fn: (draft: AppState) => AppState | void) {
  const next = fn(state);
  state = (next as AppState) ?? { ...state };
  persist();
  emit();
}

export function replaceState(next: AppState) {
  state = { ...emptyState(), ...next, version: SCHEMA_VERSION };
  persist();
  emit();
}

export function resetState() {
  state = emptyState();
  persist();
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useStore(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

// ---------- Mutations ----------

export const todayISO = (d: Date = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString("sv-SE");

export function setProfile(p: Profile) {
  update((s) => {
    s.profile = p;
    if (!Object.keys(s.weights).length) s.weights[todayISO()] = p.startWeight;
  });
}

export function updateProfile(patch: Partial<Profile>) {
  update((s) => {
    if (!s.profile) return;
    s.profile = { ...s.profile, ...patch };
  });
}

export function setWeight(iso: string, kg: number) {
  update((s) => {
    s.weights = { ...s.weights, [iso]: kg };
  });
}

export function removeWeight(iso: string) {
  update((s) => {
    const next = { ...s.weights };
    delete next[iso];
    s.weights = next;
  });
}

export function setWaist(iso: string, cm: number) {
  update((s) => {
    s.waist = { ...s.waist, [iso]: cm };
  });
}

export function setSteps(iso: string, steps: number) {
  update((s) => {
    s.steps = { ...s.steps, [iso]: steps };
  });
}

export function addWater(iso: string, litres: number) {
  update((s) => {
    const v = Math.max(0, Math.round(((s.water[iso] ?? 0) + litres) * 4) / 4);
    s.water = { ...s.water, [iso]: v };
  });
}

export function toggleCheck(iso: string, index: number) {
  update((s) => {
    const day = { ...(s.checklists[iso] ?? {}) };
    day[index] = !day[index];
    s.checklists = { ...s.checklists, [iso]: day };
  });
}

export function addMeal(iso: string, entry: Omit<MealEntry, "id">) {
  update((s) => {
    const list = s.meals[iso] ?? [];
    s.meals = {
      ...s.meals,
      [iso]: [...list, { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }],
    };
  });
}

export function removeMeal(iso: string, id: string) {
  update((s) => {
    s.meals = { ...s.meals, [iso]: (s.meals[iso] ?? []).filter((m) => m.id !== id) };
  });
}

export function setSplit(split: "simple" | "full") {
  update((s) => {
    s.split = split;
  });
}

export function logSet(
  iso: string,
  dayKey: string,
  split: "simple" | "full",
  exoIndex: number,
  setIndex: number,
  value: SetLog,
) {
  update((s) => {
    const prev: SessionLog = s.sessions[iso] ?? { dayKey, split, exos: {} };
    const base = prev.dayKey === dayKey ? prev : { dayKey, split, exos: {} };
    const exoSets = [...(base.exos[exoIndex] ?? [])];
    while (exoSets.length <= setIndex) exoSets.push({ kg: null, reps: null });
    exoSets[setIndex] = value;
    s.sessions = {
      ...s.sessions,
      [iso]: { ...base, dayKey, split, exos: { ...base.exos, [exoIndex]: exoSets } },
    };
  });
}

export function finishSession(iso: string, dayKey: string, split: "simple" | "full") {
  update((s) => {
    const prev: SessionLog = s.sessions[iso] ?? { dayKey, split, exos: {} };
    s.sessions = { ...s.sessions, [iso]: { ...prev, dayKey, split, done: !prev.done } };
  });
}

export function setNote(iso: string, text: string) {
  update((s) => {
    s.notes = { ...s.notes, [iso]: text };
  });
}

// ---------- Aliments personnels (saisie aux 100 g) ----------

export function saveCustomFood(food: Omit<CustomFood, "id"> & { id?: string }) {
  const id = food.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  update((s) => {
    s.customFoods = { ...s.customFoods, [id]: { ...food, id } };
  });
  return id;
}

export function removeCustomFood(id: string) {
  update((s) => {
    const next = { ...s.customFoods };
    delete next[id];
    s.customFoods = next;
  });
}

// ---------- Bien-être (sommeil / énergie / stress) ----------

export function setWellbeing(iso: string, patch: Partial<Wellbeing>) {
  update((s) => {
    const prev = s.wellbeing[iso] ?? { sleep: null, energy: null, stress: null };
    s.wellbeing = { ...s.wellbeing, [iso]: { ...prev, ...patch } };
  });
}

// ---------- Rappels ----------

export function setReminders(patch: Partial<Reminders>) {
  update((s) => {
    s.reminders = { ...s.reminders, ...patch };
  });
}
