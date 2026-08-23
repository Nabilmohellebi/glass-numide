// Écran d'accueil : création du profil. Aucune donnée ne quitte l'appareil.

import { useState, type ReactNode } from "react";
import { Gauge } from "./gauge";
import { Button } from "./ui-kit";
import { setProfile, todayISO } from "../lib/store";
import { GOAL_DEFAULT, START_DEFAULT } from "../lib/program";

export function Onboarding() {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState(String(GOAL_DEFAULT));
  const [height, setHeight] = useState("180");
  const [age, setAge] = useState("30");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const w = parseFloat(weight.replace(",", "."));
    const g = parseFloat(goal.replace(",", "."));
    if (!w || w < 40 || w > 350) return setError("Entre un poids de départ réaliste (40 à 350 kg).");
    if (!g || g >= w) return setError("L'objectif doit être inférieur au poids de départ.");
    setProfile({
      name: name.trim() || "Champion",
      startWeight: w,
      goal: g,
      heightCm: parseFloat(height) || 180,
      age: parseFloat(age) || 30,
      startDate: todayISO(),
    });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center px-6 py-10">
      <div className="rise mb-6 flex items-center gap-4">
        <Gauge pct={0.62} size={104} />
        <div>
          <h1 className="display text-[26px] leading-[1.1]">
            Le <span className="text-accent">Cadran</span>
          </h1>
          <p className="mt-1 text-[13px] text-ink-dim">
            Perdre du gras, garder — et gagner — du muscle. Un instrument, pas une application de plus.
          </p>
        </div>
      </div>

      <div className="rise panel p-4" style={{ animationDelay: "80ms" }}>
        <Field label="Prénom">
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton prénom" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Poids de départ (kg)">
            <input
              className="field"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={String(START_DEFAULT)}
            />
          </Field>
          <Field label="Objectif (kg)">
            <input
              className="field"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </Field>
          <Field label="Taille (cm)">
            <input
              className="field"
              type="number"
              inputMode="numeric"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </Field>
          <Field label="Âge">
            <input className="field" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
          </Field>
        </div>
        {error && <p className="mb-3 text-[12px] text-warn">{error}</p>}
        <Button onClick={submit} className="w-full">
          Démarrer le programme
        </Button>
      </div>

      <p className="rise mt-4 text-center text-[11px] leading-relaxed text-ink-faint" style={{ animationDelay: "160ms" }}>
        Tes données restent dans le stockage de ton téléphone. Rien n'est envoyé sur internet.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[11px] tracking-[0.06em] text-ink-faint uppercase">{label}</span>
      {children}
    </label>
  );
}
