# 📋 Application de Suivi de Flux & Fiches Cartes

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61dafb.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)

Bienvenue dans le dépôt du système de **Suivi de Flux de Production et Fiches Identitaires de Cartes**.
Cette application web full-stack permet la gestion, la traçabilité et le suivi rigoureux des cartes de fabrication à travers des étapes configurables, des checklists imbriquées, la gestion des pièces jointes (PDF/Images) et un journal d'audit des modifications.

---

## 🌟 Fonctionnalités Clés

- 📊 **Tableau Kanban & Vue Liste Synchronisés** : Suivez le flux de production colonne par colonne ou sous forme de tableau détaillé.
- 🔐 **Gestion des Permissions & Rôles Métier** :
  - **Création / Édition** réservées aux postes : *Commerciale (Merch)*, *Directeur (Général ou Adjoint)*, *Responsable Planning*.
  - **Mode Observation / Lecture Seule** pour les autres profils, avec possibilité d'ajouter des **remarques et commentaires**.
- 📑 **Fiche Identité de Carte Complète** :
  - Consultation et aperçu du **Dossier Technique PDF** et de la photo **Frame**.
  - Gestion des spécifications (Matières, Modèle, Prix unitaire, Quantités).
  - Équipe projet / Membres affectés.
- ✅ **Checklists d'Étape Imbriquées** : Arborescence de sous-tâches avec enregistrement de l'auteur et horodatage lors de la validation.
- 📑 **Historique d'Audit & Commentaires** : Traçabilité chronologique de toutes les actions et espace de discussion par carte.

---

## 📚 Documentation Détaillée

Pour répondre aux besoins de chaque intervenant, une documentation complète est disponible dans le dossier [`/doc`](./doc) :

- 📖 **[Guide Utilisateur](./doc/GUIDE_UTILISATEUR.md)** : Manuel d'utilisation métier pour les Commerciales, Directeurs, Responsables Planning, Opérateurs et Clients.
- 🛠️ **[Guide Technique & Administration](./doc/GUIDE_TECHNIQUE.md)** : Architecture système, infrastructure conteneurisée, sécurité, variables d'environnement et déploiement.
- 💻 **[Guide Développeur](./doc/GUIDE_DEVELOPPEUR.md)** : Structure du code React/TypeScript, modèle de données, fonctions de permissions et procédures d'extension.

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) v18.0.0 ou supérieur
- `npm` ou `bun`

### Installation
```bash
# 1. Cloner le dépôt et accéder au dossier
cd react-example

# 2. Installer les dépendances
npm install
```

### Lancement en DÉVELOPPEMENT
```bash
npm run dev
```
Accédez ensuite à l'application dans votre navigateur sur `http://localhost:3000`.

### Compilation et Lancement en PRODUCTION
```bash
# Compilation du code client et du serveur
npm run build

# Démarrage du serveur de production
npm run start
```

---

## 📁 Structure du Projet

```
.
├── doc/                        # Documentation complète (Utilisateur, Technique, Développeur)
│   ├── GUIDE_UTILISATEUR.md
│   ├── GUIDE_TECHNIQUE.md
│   └── GUIDE_DEVELOPPEUR.md
├── src/                        # Code source TypeScript / React
│   ├── components/             # Composants UI (Kanban, Listes, Modals, Forms)
│   ├── data/                   # Données de démonstration (Initial Steps, Users)
│   ├── utils/                  # Utilitaires et fonctions de permissions (RBAC)
│   ├── types.ts                # Typage strict TypeScript (Card, Step, User, History)
│   ├── App.tsx                 # Composant principal et état global
│   └── main.tsx                # Point d'entrée React
├── backend/                    # Code ou adaptateurs serveur
├── metadata.json               # Métadonnées de l'application
├── package.json                # Fichier de dépendances et scripts npm
└── vite.config.ts              # Configuration de build Vite
```

---

## 🛡️ Licences et Confidentialité

L'application s'exécute dans un conteneur sécurisé et isolé. Aucune donnée saisie n'est transmise vers des services tiers sans configuration explicite de l'administrateur.
