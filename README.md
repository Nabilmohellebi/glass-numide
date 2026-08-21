# Le Cadran — suivi 150 → 100 kg

App mobile-first (PWA), React + Vite + Tailwind v4. 100 % locale : toutes les données
(pesées, séances, repas, checklist) restent dans le `localStorage` du téléphone.
Aucun serveur, aucune base de données, rien n'est envoyé où que ce soit.

## Développer en local

```bash
npm install
npm run dev
```

## Déployer sur Vercel

**Le plus simple — avec un compte GitHub :**
1. Mets ce dossier dans un dépôt GitHub (le contenu de `cadran-app`, pas un sous-dossier
   dedans — `package.json` doit être à la racine du dépôt).
2. Va sur https://vercel.com → "Add New Project" → importe le dépôt.
3. Vercel détecte automatiquement Vite. Framework Preset : **Vite**. Build Command :
   `npm run build` (déjà par défaut). Output Directory : `dist` (déjà par défaut).
4. Clique "Deploy". Tu obtiens une URL du type `ton-projet.vercel.app`.

Si tu avais déjà un projet Vercel qui pointait vers un sous-dossier (`progress-app` ou
autre) : va dans **Settings → General → Root Directory**, remets-le vide (racine), puis
redéploie.

**En ligne de commande :**
```bash
npm i -g vercel
vercel        # premier déploiement (preview)
vercel --prod # mise en ligne définitive
```

## Installer sur ton téléphone

Une fois l'URL Vercel ouverte dans le navigateur du téléphone :
- **Android (Chrome)** : menu ⋮ → "Ajouter à l'écran d'accueil".
- **iPhone (Safari)** : bouton Partager → "Sur l'écran d'accueil".

## Structure

```
src/
  lib/            programme (phases, séances, aliments), store localStorage, calculs dérivés
  components/     cadran SVG, minuteur de repos, graphiques, coque (barre + onglets), UI kit
  pages/          Cadran, Repas, Séance, Progrès, Guide, Réglages
```

## Sauvegarder / transférer tes données

Onglet **Réglages** → "Exporter (.json)" télécharge toutes tes données. "Importer" les
recharge sur un autre appareil ou après un changement de navigateur.

---
Programme général basé sur l'équation de Mifflin-St Jeor et les recommandations usuelles
en protéines (1,6 à 2 g/kg) pour préserver la masse maigre en déficit calorique. Ne
remplace pas un avis médical individualisé — un bilan sanguin de départ est recommandé.
