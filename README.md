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

L'app est une vraie PWA installable (manifest + icônes + service worker) : une bannière
"Installer Le Cadran" apparaît directement sur le tableau de bord.

- **Android (Chrome)** : appuie sur "Installer" dans la bannière — invite native du
  navigateur, l'app s'ajoute à l'écran d'accueil et s'ouvre en plein écran.
- **iPhone (Safari)** : Safari ne propose pas d'invite automatique (limitation d'Apple).
  La bannière affiche les 3 étapes : Partager → "Sur l'écran d'accueil" → "Ajouter".

Si la bannière a été fermée, le bouton "Installer l'application" reste disponible dans
l'onglet **Réglages**.

## Structure

```
src/
  lib/            programme (phases, séances, aliments), store localStorage, calculs dérivés,
                  dépense énergétique (BMR + activité), rappels (Notification API)
  components/     cadran SVG, minuteur de repos, graphiques, coque (barre + onglets), UI kit
  pages/          Cadran, Repas, Séance, Progrès, Guide, Réglages
```

## Fonctionnalités

- **Cadran** : poids du jour, % de progression, dépense estimée (Mifflin-St Jeor + pas +
  volume de séance) et déficit réel affichés en grand, checklist, notation quotidienne
  sommeil / énergie / stress.
- **Repas** : base d'aliments courants + tes propres aliments enregistrés aux 100 g, avec
  calcul automatique de la portion selon le grammage réel saisi.
- **Séance** : split 3 j ou 6 j (PPL), saisie des séries, dernière performance affichée
  pour progresser, minuteur de repos.
- **Progrès** : courbe de poids réelle vs trajectoire cible, volume soulevé par semaine,
  corrélation entre sommeil/stress notés et variation de poids du lendemain.
- **Réglages** : profil, rappels (pesée, eau, séance) via notifications du navigateur —
  tant que l'app reste ouverte, aucun serveur push —, export/import JSON.

Thème monochrome (fond quasi-noir `#0A0A0B`, blanc comme unique accent), typographie
Archivo/Manrope/JetBrains Mono, cartes bento.

## Sauvegarder / transférer tes données

Onglet **Réglages** → "Exporter (.json)" télécharge toutes tes données (y compris aliments
perso et notations bien-être). "Importer" les recharge sur un autre appareil ou après un
changement de navigateur.

## Notifications

Les rappels utilisent l'API `Notification` du navigateur — pas de service worker, pas de
serveur push : ils ne se déclenchent que si l'onglet ou l'app (installée sur l'écran
d'accueil) reste ouvert(e) en arrière-plan. C'est un choix délibéré pour rester 100 % local.

---
Programme général basé sur l'équation de Mifflin-St Jeor et les recommandations usuelles
en protéines (1,6 à 2 g/kg) pour préserver la masse maigre en déficit calorique. Ne
remplace pas un avis médical individualisé — un bilan sanguin de départ est recommandé.
