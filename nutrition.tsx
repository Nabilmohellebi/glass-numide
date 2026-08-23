// Journal alimentaire du jour : objectifs de la phase, ajout rapide, historique du jour.

import { useEffect, useMemo, useState } from "react";
import { Bar, Button, Empty, Panel, SectionTitle, Sheet, useToast } from "../components/ui-kit";
import { FOODS, FOOD_CATEGORIES, type Food } from "../lib/foods";
import {
  addMeal,
  addWater,
  removeCustomFood,
  removeMeal,
  saveCustomFood,
  todayISO,
  useStore,
  type CustomFood,
} from "../lib/store";
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
  const [editingFood, setEditingFood] = useState<CustomFood | null>(null);
  const customFoods = Object.values(s.customFoods).sort((a, b) => a.name.localeCompare(b.name));

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
        <Bar value={macros.carbs} max={phase.carbs} label="Glucides" unit="g" color="var(--color-ink-dim)" />
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
              className="rounded-[10px] border border-line bg-surface-2 px-3 py-2.5 text-left active:border-accent"
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
          <Button
            variant="ghost"
            onClick={() => {
              setEditingFood(null);
              setCustom(true);
            }}
          >
            + Aliment perso
          </Button>
        </div>
      </Panel>

      <Panel title={`Mes aliments · ${customFoods.length}`} delay={80}>
        {customFoods.length === 0 ? (
          <Empty>Ajoute tes plats habituels aux 100 g — tu les retrouveras ici à chaque repas.</Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {customFoods.map((f) => (
              <CustomFoodRow
                key={f.id}
                food={f}
                onAdd={(grams) => {
                  const qty = grams / 100;
                  addMeal(iso, {
                    name: `${f.name} (${grams} g)`,
                    kcal: f.kcal100,
                    prot: f.prot100,
                    carbs: f.carbs100,
                    fat: f.fat100,
                    qty,
                  });
                  toast(`${f.name} ajouté`);
                }}
                onEdit={() => {
                  setEditingFood(f);
                  setCustom(true);
                }}
                onDelete={() => removeCustomFood(f.id)}
              />
            ))}
          </div>
        )}
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

      <CustomFoodSheet
        open={custom}
        onClose={() => setCustom(false)}
        editing={editingFood}
        onSaved={() => toast(editingFood ? "Aliment mis à jour" : "Aliment enregistré")}
      />
    </>
  );
}

function CustomFoodRow({
  food,
  onAdd,
  onEdit,
  onDelete,
}: {
  food: CustomFood;
  onAdd: (grams: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [grams, setGrams] = useState("100");
  const g = parseFloat(grams.replace(",", ".")) || 0;
  const scale = g / 100;

  return (
    <div className="rounded-[14px] border border-line bg-surface-2 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] text-ink">{food.name}</div>
          <div className="font-mono text-[10.5px] text-ink-faint">
            /100g · {food.kcal100} kcal · {food.prot100} g P · {food.carbs100} g G · {food.fat100} g L
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onEdit} className="font-mono text-[11px] text-ink-faint">
            éditer
          </button>
          <button type="button" onClick={onDelete} className="ml-1 font-mono text-[14px] text-ink-faint">
            ×
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          className="field w-20 text-[13px]"
          type="number"
          inputMode="numeric"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
        />
        <span className="text-[11px] text-ink-faint">g</span>
        <span className="flex-1 text-right font-mono text-[11px] text-ink-dim">
          {Math.round(food.kcal100 * scale)} kcal · {Math.round(food.prot100 * scale)} g P
        </span>
        <Button
          variant="ghost"
          className="px-3 py-1.5 text-[11px]"
          onClick={() => {
            if (g > 0) onAdd(g);
          }}
        >
          Ajouter
        </Button>
      </div>
    </div>
  );
}

function CustomFoodSheet({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: CustomFood | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [kcal, setKcal] = useState(editing ? String(editing.kcal100) : "");
  const [prot, setProt] = useState(editing ? String(editing.prot100) : "");
  const [carbs, setCarbs] = useState(editing ? String(editing.carbs100) : "");
  const [fat, setFat] = useState(editing ? String(editing.fat100) : "");

  // Recharge les champs quand on ouvre en édition sur un aliment différent.
  useEffect(() => {
    setName(editing?.name ?? "");
    setKcal(editing ? String(editing.kcal100) : "");
    setProt(editing ? String(editing.prot100) : "");
    setCarbs(editing ? String(editing.carbs100) : "");
    setFat(editing ? String(editing.fat100) : "");
  }, [editing]);

  const save = () => {
    const k = parseFloat(kcal.replace(",", "."));
    if (!name.trim() || !k) return;
    saveCustomFood({
      id: editing?.id,
      name: name.trim(),
      kcal100: k,
      prot100: parseFloat(prot.replace(",", ".")) || 0,
      carbs100: parseFloat(carbs.replace(",", ".")) || 0,
      fat100: parseFloat(fat.replace(",", ".")) || 0,
    });
    onSaved();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={editing ? "Modifier l'aliment" : "Nouvel aliment (pour 100 g)"}>
      <input className="field mb-2.5" placeholder="Nom du plat" value={name} onChange={(e) => setName(e.target.value)} />
      <p className="mb-2.5 text-[11px] text-ink-faint">Valeurs pour 100 g / 100 ml — la portion sera calculée automatiquement.</p>
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <input className="field" type="number" inputMode="decimal" placeholder="kcal /100g" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        <input
          className="field"
          type="number"
          inputMode="decimal"
          placeholder="protéines g /100g"
          value={prot}
          onChange={(e) => setProt(e.target.value)}
        />
        <input
          className="field"
          type="number"
          inputMode="decimal"
          placeholder="glucides g /100g"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
        />
        <input
          className="field"
          type="number"
          inputMode="decimal"
          placeholder="lipides g /100g"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
        />
      </div>
      <Button className="w-full" onClick={save}>
        {editing ? "Enregistrer les modifications" : "Ajouter à mes aliments"}
      </Button>
    </Sheet>
  );
}

export default NutritionPage;
