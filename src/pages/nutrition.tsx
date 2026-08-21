// Journal alimentaire du jour : objectifs de la phase, ajout rapide, historique du jour.

import { useMemo, useState } from "react";
import { Bar, Button, Empty, Panel, SectionTitle, Sheet, useToast } from "../components/ui-kit";
import { FOODS, FOOD_CATEGORIES, type Food } from "../lib/foods";
import { addMeal, addWater, removeMeal, todayISO, useStore } from "../lib/store";
import { currentWeight, dayMacros, phaseFor } from "../lib/calc";
import { WATER_TARGET_L } from "../lib/program";

const QUICK_IDS = ["poulet150", "oeufs2", "riz200", "yaourtnature", "thon", "salade", "huile1", "paincomplet"];

function NutritionPage() {
  const s = useStore();
  const iso = todayISO();
  const { toast, node } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [custom, setCustom] = useState(false);

  const phase = phaseFor(currentWeight(s));
  const macros = dayMacros(s, iso);
  const meals = s.meals[iso] ?? [];
  const water = s.water[iso] ?? 0;

  const quick = useMemo(() => QUICK_IDS.map((id) => FOODS.find((f) => f.id === id)!).filter(Boolean), []);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FOODS;
    return FOODS.filter((f) => f.name.toLowerCase().includes(q));
  }, [search]);

  const add = (f: Food, qty = 1) => {
    addMeal(iso, { name: `${f.name} (${f.portion})`, kcal: f.kcal, prot: f.prot, carbs: f.carbs, fat: f.fat, qty });
    toast(`${f.name} ajouté`);
  };

  const protPerKg = macros.prot / Math.max(1, currentWeight(s));

  return (
    <>
      {node}
      <SectionTitle sub={`${phase.label} · objectifs calculés sur ton poids actuel`}>Repas du jour</SectionTitle>

      <Panel title="Objectifs">
        <Bar value={macros.kcal} max={phase.kcal} label="Calories" unit="kcal" />
        <Bar value={macros.prot} max={phase.prot} label="Protéines" unit="g" color="var(--color-good)" />
        <Bar value={macros.carbs} max={phase.carbs} label="Glucides" unit="g" color="var(--color-steel)" />
        <Bar value={macros.fat} max={phase.fat} label="Lipides" unit="g" color="#b08968" />
        <p className="mt-2 text-[11px] text-ink-faint">
          {protPerKg >= 1.6
            ? `${protPerKg.toFixed(2)} g de protéines par kg — suffisant pour construire du muscle en déficit.`
            : `${protPerKg.toFixed(2)} g/kg de protéines. Vise au moins 1,6 g/kg : c'est ce qui protège ton muscle.`}
        </p>
      </Panel>

      <Panel title="Ajout rapide" delay={60}>
        <div className="grid grid-cols-2 gap-2">
          {quick.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => add(f)}
              className="rounded-[10px] border border-line bg-surface-2 px-3 py-2.5 text-left active:border-ember"
            >
              <div className="truncate text-[12.5px] text-ink">{f.name}</div>
              <div className="font-mono text-[10.5px] text-ink-faint">
                {f.kcal} kcal · {f.prot} g P
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Button className="flex-1" onClick={() => setOpen(true)}>
            Chercher un aliment
          </Button>
          <Button variant="ghost" onClick={() => setCustom(true)}>
            Perso
          </Button>
        </div>
      </Panel>

      <Panel title={`Journal · ${meals.length} entrée${meals.length > 1 ? "s" : ""}`} delay={100}>
        {meals.length === 0 ? (
          <Empty>Rien d'enregistré aujourd'hui. Commence par ton petit-déjeuner.</Empty>
        ) : (
          <ul>
            {meals.map((m) => (
              <li key={m.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px]">
                    {m.name}
                    {m.qty !== 1 && <span className="text-ink-faint"> ×{m.qty}</span>}
                  </div>
                  <div className="font-mono text-[10.5px] text-ink-faint">
                    {Math.round(m.kcal * m.qty)} kcal · P {Math.round(m.prot * m.qty)} · G {Math.round(m.carbs * m.qty)} · L{" "}
                    {Math.round(m.fat * m.qty)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMeal(iso, m.id)}
                  className="px-1 font-mono text-[16px] text-ink-faint"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Hydratation" delay={140}>
        <Bar value={water} max={WATER_TARGET_L} label="Eau" unit="L" color="#4a90c2" />
        <div className="mt-2 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => addWater(iso, 0.25)}>
            + 25 cl
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => addWater(iso, 0.5)}>
            + 50 cl
          </Button>
          <Button variant="ghost" className="flex-1" onClick={() => addWater(iso, 1)}>
            + 1 L
          </Button>
        </div>
      </Panel>

      <Sheet open={open} onClose={() => setOpen(false)} title="Aliments">
        <input
          className="field mb-3 text-[14px]"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {FOOD_CATEGORIES.map((cat) => {
          const list = filtered.filter((f) => f.cat === cat);
          if (!list.length) return null;
          return (
            <div key={cat} className="mb-4">
              <div className="display mb-1.5 text-[11px] tracking-[0.1em] text-ink-faint">{cat}</div>
              {list.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    add(f);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-line py-2.5 text-left last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px]">{f.name}</div>
                    <div className="text-[10.5px] text-ink-faint">{f.portion}</div>
                  </div>
                  <div className="shrink-0 text-right font-mono text-[11px] text-ink-dim">
                    <div>{f.kcal} kcal</div>
                    <div className="text-good">{f.prot} g P</div>
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </Sheet>

      <CustomSheet open={custom} onClose={() => setCustom(false)} iso={iso} onSaved={() => toast("Ajouté")} />
    </>
  );
}

function CustomSheet({
  open,
  onClose,
  iso,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  iso: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [prot, setProt] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const save = () => {
    const k = parseFloat(kcal);
    if (!name.trim() || !k) return;
    addMeal(iso, {
      name: name.trim(),
      kcal: k,
      prot: parseFloat(prot) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      qty: 1,
    });
    setName("");
    setKcal("");
    setProt("");
    setCarbs("");
    setFat("");
    onSaved();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Aliment personnalisé">
      <input className="field mb-2.5" placeholder="Nom du plat" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <input className="field" type="number" inputMode="numeric" placeholder="kcal" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        <input
          className="field"
          type="number"
          inputMode="numeric"
          placeholder="protéines g"
          value={prot}
          onChange={(e) => setProt(e.target.value)}
        />
        <input
          className="field"
          type="number"
          inputMode="numeric"
          placeholder="glucides g"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
        />
        <input className="field" type="number" inputMode="numeric" placeholder="lipides g" value={fat} onChange={(e) => setFat(e.target.value)} />
      </div>
      <Button className="w-full" onClick={save}>
        Ajouter au journal
      </Button>
    </Sheet>
  );
}

export default NutritionPage;
