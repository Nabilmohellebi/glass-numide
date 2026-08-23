// Contenu du programme : phases nutritionnelles, checklist, splits d'entraînement, guide.
// Aucune donnée utilisateur ici — uniquement le référentiel du programme.

export type Phase = {
  min: number;
  max: number;
  label: string;
  kcal: number;
  prot: number;
  carbs: number;
  fat: number;
};

export type Exo = {
  n: string;
  sets: number;
  reps: string;
  note?: string;
  /** Exercice au poids du corps / gainage : pas de charge à saisir. */
  bw?: boolean;
};

export type WorkoutDay = { name: string; focus: string; exos: Exo[] };
export type DayKey = string;

export type Split = {
  label: string;
  short: string;
  description: string;
  week: Record<string, DayKey>;
  days: Record<string, WorkoutDay>;
};

export const DAYS_FR = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
] as const;

export const GOAL_DEFAULT = 100;
export const START_DEFAULT = 150;

export const PHASES: Phase[] = [
  { min: 150, max: 999, label: "Phase 1 — Base", kcal: 2500, prot: 190, carbs: 265, fat: 70 },
  { min: 140, max: 150, label: "Phase 1 — Base", kcal: 2400, prot: 185, carbs: 250, fat: 68 },
  { min: 130, max: 140, label: "Phase 2 — Perte active", kcal: 2300, prot: 180, carbs: 230, fat: 65 },
  { min: 122, max: 130, label: "Phase 2 — Perte active", kcal: 2200, prot: 175, carbs: 210, fat: 62 },
  { min: 113, max: 122, label: "Phase 3 — Recomposition", kcal: 2100, prot: 170, carbs: 195, fat: 60 },
  { min: 107, max: 113, label: "Phase 3 — Recomposition", kcal: 2000, prot: 165, carbs: 185, fat: 58 },
  { min: 100, max: 107, label: "Phase 4 — Finition", kcal: 1950, prot: 160, carbs: 180, fat: 56 },
  { min: 0, max: 100, label: "Objectif atteint — maintien", kcal: 2600, prot: 155, carbs: 260, fat: 70 },
];

export const CHECKLIST = [
  "Pesée du matin à jeun, notée",
  "Protéines du jour atteintes",
  "Calories respectées (huile pesée)",
  "3,5 L d'eau",
  "Objectif de pas atteint",
  "Séance faite (si prévue)",
  "Zéro soda, zéro friture",
  "Au lit avant 23h30",
];

export const STEP_TARGETS = [
  { monthFrom: 0, steps: 7000 },
  { monthFrom: 1, steps: 8000 },
  { monthFrom: 2, steps: 9000 },
  { monthFrom: 3, steps: 10000 },
  { monthFrom: 4, steps: 11000 },
  { monthFrom: 6, steps: 12000 },
];

export const WATER_TARGET_L = 3.5;

const REST = "repos";
const WALK = "marche";
const WALK_LONG = "marche-longue";

export const REST_KEYS = [REST, WALK, WALK_LONG];

export const SPLITS: Record<"simple" | "full", Split> = {
  simple: {
    label: "3 jours / semaine",
    short: "3 j",
    description:
      "Full body réparti en 3 séances. Idéal pour démarrer, pour les semaines chargées, ou quand la récupération est courte.",
    week: {
      Lundi: "A",
      Mardi: WALK,
      Mercredi: "B",
      Jeudi: WALK,
      Vendredi: "C",
      Samedi: WALK_LONG,
      Dimanche: REST,
    },
    days: {
      A: {
        name: "Séance A",
        focus: "Haut du corps",
        exos: [
          { n: "Développé haltères au sol", sets: 4, reps: "12", note: "Tempo 3-1-1" },
          { n: "Rowing penché 1 bras", sets: 4, reps: "12 / bras", note: "Serre l'omoplate 1 s en haut" },
          { n: "Pompes (mur → genoux → sol)", sets: 4, reps: "max", note: "Progression selon niveau", bw: true },
          { n: "Élévations latérales", sets: 3, reps: "15" },
          { n: "Curl biceps", sets: 3, reps: "12", note: "Pas d'élan" },
          { n: "Extension triceps 2 haltères", sets: 3, reps: "12", note: "Coudes serrés" },
          { n: "Gainage planche", sets: 3, reps: "20-40 s", bw: true },
        ],
      },
      B: {
        name: "Séance B",
        focus: "Bas du corps",
        exos: [
          { n: "Squat sur chaise (assis-debout)", sets: 4, reps: "15", note: "Sans puis avec haltères" },
          { n: "Fentes en marchant", sets: 3, reps: "10 / jambe" },
          { n: "Soulevé de terre roumain", sets: 4, reps: "12", note: "Dos droit, bassin en arrière" },
          { n: "Pont fessier", sets: 4, reps: "15", note: "Serre 2 s en haut" },
          { n: "Montées sur marche", sets: 3, reps: "12 / jambe" },
          { n: "Mollets debout", sets: 3, reps: "20" },
          { n: "Gainage latéral", sets: 3, reps: "20 s / côté", bw: true },
        ],
      },
      C: {
        name: "Séance C",
        focus: "Circuit corps entier",
        exos: [
          { n: "Goblet squat", sets: 4, reps: "15", note: "Format circuit — 20 s de repos entre exos" },
          { n: "Rowing penché 2 haltères", sets: 4, reps: "12" },
          { n: "Développé militaire debout", sets: 4, reps: "12" },
          { n: "Soulevé de terre roumain", sets: 4, reps: "12" },
          { n: "Marche du fermier", sets: 4, reps: "30-40 m" },
          { n: "Gainage planche", sets: 4, reps: "30 s", bw: true },
        ],
      },
    },
  },
  full: {
    label: "6 jours / semaine (PPL)",
    short: "6 j",
    description:
      "Push / Pull / Legs x2. Volume maximal pour construire du muscle pendant la perte de gras. À réserver aux semaines où le sommeil suit.",
    week: {
      Lundi: "PUSH_A",
      Mardi: "PULL_A",
      Mercredi: "LEGS_A",
      Jeudi: "PUSH_B",
      Vendredi: "PULL_B",
      Samedi: "FULL",
      Dimanche: REST,
    },
    days: {
      PUSH_A: {
        name: "Push A",
        focus: "Pecs / Épaules / Triceps",
        exos: [
          { n: "Développé couché haltères", sets: 4, reps: "10-12", note: "Descente 3 s" },
          { n: "Développé militaire debout", sets: 4, reps: "10-12" },
          { n: "Écarté couché", sets: 3, reps: "12-15" },
          { n: "Élévations latérales", sets: 4, reps: "15-20" },
          { n: "Pompes inclinées", sets: 3, reps: "max", bw: true },
          { n: "Extension triceps", sets: 3, reps: "12-15" },
          { n: "Gainage planche", sets: 3, reps: "30-45 s", bw: true },
        ],
      },
      PULL_A: {
        name: "Pull A",
        focus: "Dos / Biceps",
        exos: [
          { n: "Rowing penché 2 haltères", sets: 4, reps: "10-12" },
          { n: "Rowing unilatéral", sets: 4, reps: "12 / bras" },
          { n: "Soulevé de terre roumain", sets: 4, reps: "12-15" },
          { n: "Tirage menton", sets: 3, reps: "12-15" },
          { n: "Oiseau (arrière d'épaule)", sets: 3, reps: "15" },
          { n: "Curl biceps alterné", sets: 3, reps: "12 / bras" },
          { n: "Curl marteau", sets: 3, reps: "12-15" },
          { n: "Superman au sol", sets: 3, reps: "15", bw: true },
        ],
      },
      LEGS_A: {
        name: "Legs A",
        focus: "Jambes / Core",
        exos: [
          { n: "Goblet squat", sets: 4, reps: "12-15" },
          { n: "Fentes statiques", sets: 3, reps: "10-12 / jambe" },
          { n: "Soulevé de terre jambes tendues", sets: 4, reps: "12" },
          { n: "Hip thrust", sets: 4, reps: "15-20" },
          { n: "Step-up", sets: 3, reps: "12 / jambe" },
          { n: "Mollets debout", sets: 4, reps: "20" },
          { n: "Dead bug", sets: 3, reps: "12 / côté", bw: true },
          { n: "Gainage latéral", sets: 3, reps: "25 s / côté", bw: true },
        ],
      },
      PUSH_B: {
        name: "Push B",
        focus: "Variante volume",
        exos: [
          { n: "Développé incliné haltères", sets: 4, reps: "10-12" },
          { n: "Développé Arnold", sets: 4, reps: "12" },
          { n: "Pompes", sets: 4, reps: "max", bw: true },
          { n: "Élévations frontales", sets: 3, reps: "12-15" },
          { n: "Pull-over haltère", sets: 3, reps: "15" },
          { n: "Kickback triceps", sets: 3, reps: "15 / bras" },
          { n: "Dips sur chaise", sets: 3, reps: "max", bw: true },
        ],
      },
      PULL_B: {
        name: "Pull B",
        focus: "Variante force",
        exos: [
          { n: "Rowing Pendlay", sets: 4, reps: "10" },
          { n: "Soulevé de terre complet", sets: 4, reps: "12" },
          { n: "Rowing unilatéral lourd", sets: 4, reps: "10 / bras", note: "Tempo 3 s" },
          { n: "Shrugs", sets: 4, reps: "15-20" },
          { n: "Face pull (serviette / élastique)", sets: 3, reps: "20", bw: true },
          { n: "Curl concentré", sets: 3, reps: "12 / bras" },
          { n: "Bird dog", sets: 3, reps: "12 / côté", bw: true },
        ],
      },
      FULL: {
        name: "Full Body",
        focus: "Force + circuit métabolique",
        exos: [
          { n: "Goblet squat", sets: 3, reps: "15", note: "Partie force" },
          { n: "Développé couché haltères", sets: 3, reps: "12", note: "Partie force" },
          { n: "Rowing 2 haltères", sets: 3, reps: "12", note: "Partie force" },
          { n: "Soulevé de terre roumain", sets: 3, reps: "15", note: "Partie force" },
          {
            n: "Circuit métabolique",
            sets: 4,
            reps: "40 s / 20 s",
            note: "Squat, développé léger, genoux hauts, rowing, gainage, fentes",
            bw: true,
          },
        ],
      },
    },
  },
};

export const INTENSIFICATION = [
  { months: "1-2", method: "Technique + répétitions", how: "Maîtrise le mouvement, passe de 10 à 15 reps propres." },
  { months: "3-4", method: "Volume", how: "Ajoute une 4ᵉ puis une 5ᵉ série sur les gros exercices." },
  { months: "5-6", method: "Tempo", how: "3 s de descente – 1 s de pause – 1 s de montée." },
  { months: "7-8", method: "Unilatéral", how: "Un bras / une jambe à la fois : double la charge relative." },
  { months: "9-10", method: "Pauses & isométrie", how: "3 s d'arrêt en position basse sur chaque rep." },
  { months: "11-12", method: "Densité", how: "Réduis le repos de 90 s à 45 s à charge égale." },
  { months: "13+", method: "Rest-pause / matériel", how: "Bandes élastiques, sac à dos lesté, disques additionnels." },
];

export const MISTAKES = [
  "Croire que le cardio seul suffit — sans muscu, jusqu'à 30 % de la perte peut être du muscle.",
  "Manquer de protéines : c'est le point non négociable de tout le programme.",
  "Descendre sous 1700-1900 kcal sans avis médical.",
  "Ne pas peser l'huile — l'erreur la plus fréquente et la plus invisible.",
  "Paniquer sur la pesée du jour au lieu de suivre la moyenne 7 jours.",
  "Sauter la marche les jours de musculation.",
  "Transformer un écart d'un repas en semaine d'abandon.",
  "Comparer sa vitesse de perte à celle des autres.",
  "Attendre la motivation au lieu de s'appuyer sur la routine.",
  "Arrêter le jour où l'objectif est atteint.",
];

export const RED_FLAGS = [
  "Douleur thoracique, essoufflement anormal ou palpitations à l'effort → arrête immédiatement.",
  "Vertiges, malaises ou évanouissements répétés.",
  "Douleur articulaire qui persiste plus de 3 jours et empire.",
  "Soif intense + urines fréquentes + fatigue → fais tester la glycémie.",
  "Ronflements forts avec pauses respiratoires, somnolence en journée → apnée du sommeil probable.",
  "Perte de poids > 2 kg / semaine de façon soutenue au-delà du 1ᵉʳ mois.",
  "Aucune perte sur 4 semaines malgré une application stricte → bilan thyroïdien.",
];

export const PLATEAU_PROTOCOL = [
  "Vérifie d'abord ce que tu manges vraiment : pèse tout pendant 5 jours, honnêtement.",
  "Ajoute 1500 pas par jour avant de toucher aux calories.",
  "Vérifie ton sommeil — moins de 6 h = rétention d'eau qui masque la perte.",
  "Si rien ne bouge après 5 jours : −150 kcal / jour. Jamais sous 1700-1900 kcal sans avis médical.",
  "Garde les charges : en plateau de poids, la progression en force prouve que tu construis du muscle.",
];

export const MUSCLE_RULES = [
  "Protéines à chaque repas : 35-45 g, réparties sur 4 prises.",
  "Bats la dernière performance affichée sous l'exercice : +1 rep ou +1 kg, chaque semaine.",
  "Deux séries d'échauffement légères avant le premier exercice lourd.",
  "Ne descends jamais sous 3 séances de musculation par semaine, même en semaine chargée.",
  "Sommeil 7-8 h : c'est là que le muscle se construit, pas à la salle.",
  "Jour de faible énergie : garde la séance, réduis le volume de moitié. Ne saute jamais.",
];
