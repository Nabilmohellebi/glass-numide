// Base d'aliments pour le journal rapide. Valeurs par portion indiquée (approximations usuelles).

export type Food = {
  id: string;
  name: string;
  portion: string;
  kcal: number;
  prot: number;
  carbs: number;
  fat: number;
  cat: "Protéines" | "Féculents" | "Légumes & fruits" | "Laitiers" | "Matières grasses" | "En-cas";
};

export const FOODS: Food[] = [
  // Protéines
  { id: "poulet150", name: "Blanc de poulet grillé", portion: "150 g", kcal: 248, prot: 46, carbs: 0, fat: 6, cat: "Protéines" },
  { id: "dinde150", name: "Escalope de dinde", portion: "150 g", kcal: 220, prot: 44, carbs: 0, fat: 4, cat: "Protéines" },
  { id: "boeuf150", name: "Steak de bœuf 5 %", portion: "150 g", kcal: 250, prot: 40, carbs: 0, fat: 10, cat: "Protéines" },
  { id: "viandehachee", name: "Viande hachée 15 %", portion: "150 g", kcal: 330, prot: 37, carbs: 0, fat: 20, cat: "Protéines" },
  { id: "thon", name: "Thon en boîte (au naturel)", portion: "1 boîte 140 g", kcal: 150, prot: 33, carbs: 0, fat: 2, cat: "Protéines" },
  { id: "sardines", name: "Sardines à l'huile égouttées", portion: "1 boîte 100 g", kcal: 210, prot: 25, carbs: 0, fat: 12, cat: "Protéines" },
  { id: "merlan", name: "Poisson blanc (merlan, colin)", portion: "200 g", kcal: 190, prot: 40, carbs: 0, fat: 3, cat: "Protéines" },
  { id: "oeufs2", name: "Œufs entiers", portion: "2 œufs", kcal: 156, prot: 13, carbs: 1, fat: 11, cat: "Protéines" },
  { id: "blancsoeufs", name: "Blancs d'œufs", portion: "4 blancs", kcal: 68, prot: 15, carbs: 1, fat: 0, cat: "Protéines" },
  { id: "lentilles", name: "Lentilles cuites", portion: "200 g", kcal: 232, prot: 18, carbs: 40, fat: 1, cat: "Protéines" },
  { id: "poischiches", name: "Pois chiches cuits", portion: "150 g", kcal: 246, prot: 13, carbs: 40, fat: 4, cat: "Protéines" },
  { id: "whey", name: "Whey (1 dose)", portion: "30 g", kcal: 118, prot: 24, carbs: 3, fat: 1.5, cat: "Protéines" },

  // Féculents
  { id: "riz200", name: "Riz cuit", portion: "200 g", kcal: 260, prot: 5, carbs: 56, fat: 1, cat: "Féculents" },
  { id: "couscous200", name: "Semoule / couscous cuit", portion: "200 g", kcal: 224, prot: 8, carbs: 46, fat: 1, cat: "Féculents" },
  { id: "pates200", name: "Pâtes cuites", portion: "200 g", kcal: 262, prot: 10, carbs: 52, fat: 2, cat: "Féculents" },
  { id: "pomdeterre250", name: "Pommes de terre vapeur", portion: "250 g", kcal: 215, prot: 5, carbs: 48, fat: 0, cat: "Féculents" },
  { id: "paincomplet", name: "Pain complet", portion: "2 tranches 60 g", kcal: 150, prot: 6, carbs: 28, fat: 2, cat: "Féculents" },
  { id: "baguette", name: "Baguette", portion: "1/4 (60 g)", kcal: 165, prot: 5, carbs: 33, fat: 1, cat: "Féculents" },
  { id: "khobzdar", name: "Galette / khobz dar", portion: "1 part 80 g", kcal: 230, prot: 6, carbs: 40, fat: 5, cat: "Féculents" },
  { id: "avoine60", name: "Flocons d'avoine", portion: "60 g", kcal: 228, prot: 8, carbs: 38, fat: 5, cat: "Féculents" },

  // Légumes & fruits
  { id: "salade", name: "Salade composée (crudités)", portion: "1 grand bol", kcal: 60, prot: 3, carbs: 10, fat: 1, cat: "Légumes & fruits" },
  { id: "legumescuits", name: "Légumes cuits (courgette, haricots…)", portion: "300 g", kcal: 90, prot: 5, carbs: 15, fat: 1, cat: "Légumes & fruits" },
  { id: "chorba", name: "Chorba / soupe de légumes", portion: "1 bol 300 ml", kcal: 140, prot: 8, carbs: 18, fat: 4, cat: "Légumes & fruits" },
  { id: "banane", name: "Banane", portion: "1 moyenne", kcal: 105, prot: 1, carbs: 27, fat: 0, cat: "Légumes & fruits" },
  { id: "pomme", name: "Pomme", portion: "1 moyenne", kcal: 80, prot: 0, carbs: 21, fat: 0, cat: "Légumes & fruits" },
  { id: "orange", name: "Orange", portion: "1 moyenne", kcal: 70, prot: 1, carbs: 17, fat: 0, cat: "Légumes & fruits" },
  { id: "dattes3", name: "Dattes", portion: "3 pièces", kcal: 120, prot: 1, carbs: 32, fat: 0, cat: "Légumes & fruits" },

  // Laitiers
  { id: "yaourtnature", name: "Yaourt nature", portion: "1 pot 125 g", kcal: 75, prot: 6, carbs: 8, fat: 2, cat: "Laitiers" },
  { id: "fromageblanc", name: "Fromage blanc 0 %", portion: "200 g", kcal: 96, prot: 16, carbs: 8, fat: 0, cat: "Laitiers" },
  { id: "lait250", name: "Lait demi-écrémé", portion: "250 ml", kcal: 115, prot: 8, carbs: 12, fat: 4, cat: "Laitiers" },
  { id: "fromage30", name: "Fromage à pâte dure", portion: "30 g", kcal: 110, prot: 7, carbs: 0, fat: 9, cat: "Laitiers" },

  // Matières grasses
  { id: "huile1", name: "Huile d'olive", portion: "1 c. à soupe (10 g)", kcal: 90, prot: 0, carbs: 0, fat: 10, cat: "Matières grasses" },
  { id: "beurre10", name: "Beurre", portion: "10 g", kcal: 75, prot: 0, carbs: 0, fat: 8, cat: "Matières grasses" },
  { id: "amandes30", name: "Amandes", portion: "30 g", kcal: 174, prot: 6, carbs: 6, fat: 15, cat: "Matières grasses" },
  { id: "avocat", name: "Avocat", portion: "1/2", kcal: 160, prot: 2, carbs: 8, fat: 15, cat: "Matières grasses" },

  // En-cas
  { id: "cafe", name: "Café / thé sans sucre", portion: "1 tasse", kcal: 2, prot: 0, carbs: 0, fat: 0, cat: "En-cas" },
  { id: "chocolatnoir", name: "Chocolat noir 70 %", portion: "2 carrés (20 g)", kcal: 116, prot: 2, carbs: 9, fat: 8, cat: "En-cas" },
  { id: "pizzapart", name: "Écart : part de pizza", portion: "1 part", kcal: 285, prot: 12, carbs: 34, fat: 11, cat: "En-cas" },
  { id: "soda", name: "Écart : soda", portion: "33 cl", kcal: 139, prot: 0, carbs: 35, fat: 0, cat: "En-cas" },
];

export const FOOD_CATEGORIES = [
  "Protéines",
  "Féculents",
  "Légumes & fruits",
  "Laitiers",
  "Matières grasses",
  "En-cas",
] as const;
