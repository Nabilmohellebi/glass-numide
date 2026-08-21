// Réglages : profil, export/import des données, réinitialisation.

import { useRef, useState } from "react";
import { Button, Panel, SectionTitle, useToast } from "../components/ui-kit";
import { getState, replaceState, resetState, updateProfile, useStore } from "../lib/store";

function SettingsPage() {
  const s = useStore();
  const { toast, node } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const profile = s.profile!;

  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(String(profile.goal));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [age, setAge] = useState(String(profile.age));

  const saveProfile = () => {
    const g = parseFloat(goal.replace(",", "."));
    updateProfile({
      name: name.trim() || profile.name,
      goal: g && g > 0 ? g : profile.goal,
      heightCm: parseFloat(height) || profile.heightCm,
      age: parseFloat(age) || profile.age,
    });
    toast("Profil mis à jour");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cadran-sauvegarde-${new Date().toLocaleDateString("sv-SE")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Export téléchargé");
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        replaceState(parsed);
        toast("Données importées");
      } catch {
        toast("Fichier invalide");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {node}
      <SectionTitle sub="Ton profil, tes données, ton espace">Réglages</SectionTitle>

      <Panel title="Profil">
        <Field label="Prénom">
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-2.5">
          <Field label="Objectif kg">
            <input className="field" type="number" inputMode="decimal" step="0.1" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </Field>
          <Field label="Taille cm">
            <input className="field" type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} />
          </Field>
          <Field label="Âge">
            <input className="field" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
          </Field>
        </div>
        <p className="mb-3 text-[11px] text-ink-faint">
          Poids de départ : {profile.startWeight} kg, enregistré le{" "}
          {new Date(`${profile.startDate}T00:00:00`).toLocaleDateString("fr-FR")}. Non modifiable — c'est ton point de
          référence.
        </p>
        <Button onClick={saveProfile}>Enregistrer</Button>
      </Panel>

      <Panel title="Sauvegarde" delay={60}>
        <p className="mb-3 text-[12.5px] leading-relaxed text-ink-dim">
          Tes données vivent uniquement dans ce navigateur. Exporte-les régulièrement pour ne rien perdre si tu changes de
          téléphone ou vides le cache.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={exportData}>
            Exporter (.json)
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => fileRef.current?.click()}>
            Importer
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importData(f);
            e.target.value = "";
          }}
        />
      </Panel>

      <Panel title="Zone sensible" delay={100}>
        {!confirmReset ? (
          <Button variant="ghost" className="w-full" onClick={() => setConfirmReset(true)}>
            Réinitialiser toutes les données
          </Button>
        ) : (
          <div>
            <p className="mb-3 text-[12.5px] text-warn">
              Toutes tes pesées, séances et repas seront supprimés définitivement. Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  resetState();
                  toast("Données réinitialisées");
                  setConfirmReset(false);
                }}
              >
                Confirmer la suppression
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmReset(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[11px] tracking-[0.06em] text-ink-faint uppercase">{label}</span>
      {children}
    </label>
  );
}

export default SettingsPage;
