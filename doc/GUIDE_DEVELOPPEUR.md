# 💻 Guide Développeur - Suivi de Flux & Fiches Cartes

Ce document est destiné aux développeurs et ingénieurs logiciels souhaitant comprendre la structure du code source, l'architecture des composants React, la gestion de l'état et la méthode pour étendre l'application.

---

## 1. Stack Technique

- **Framework Frontend** : React 19 (avec JSX / TSX)
- **Langage** : TypeScript 5.8 (Typage strict)
- **Outil de Build & Dev Server** : Vite 6
- **Styling & CSS** : Tailwind CSS v4 (Configuration globale via `@import "tailwindcss";`)
- **Icônes** : `lucide-react`
- **Animations UI** : `motion` (Motion for React)
- **Serveur Backend / API** : Express 4 (Node.js)

---

## 2. Structure du Code Source (`/src`)

```
/src
├── App.tsx                    # Composant racine, gestion de l'état global et modals
├── main.tsx                   # Point d'entrée React DOM
├── index.css                  # Directives Tailwind CSS v4
├── types.ts                   # Interfaces & Types TypeScript métier
├── data/
│   └── initialData.ts         # Données de démonstration (Steps, Users, Cards initiales)
├── utils/
│   └── permissions.ts         # Fonction utilitaire de vérification des droits d'accès
└── components/
    ├── Header.tsx             # Barre de navigation supérieure (Filtres, Actions, Profils)
    ├── KanbanBoard.tsx        # Vue Colonnes Kanban (Drag & drop d'étape, badges de statut)
    ├── CardListView.tsx       # Vue Liste synthétique des cartes
    ├── CardIdentityModal.tsx  # Modal Fiche Carte à 5 onglets (Vue d'ensemble, Specs, Checklists, Fichiers, Historique)
    ├── StepChecklistTree.tsx  # Composant d'arborescence des checklists et sous-tâches
    ├── CreateCardModal.tsx    # Modal de création de nouvelle carte
    ├── StepConfigModal.tsx    # Modal de configuration des étapes et checklists par défaut
    ├── HistoryLogTable.tsx    # Tableau d'historique des modifications (Audit Trail)
    ├── FileViewerModal.tsx    # Visionneuse intégrée pour aperçu PDF et images grand format
    └── AuthModal.tsx          # Interface de gestion des profils d'utilisateurs
```

---

## 3. Modèles de Données Structurés (`types.ts`)

### Structure d'une Carte (`Card`)
```typescript
export interface Card {
  id: string;
  reference: string;          // Ex: "REF-2026-001"
  modele: string;             // Ex: "Robe Longue Soie"
  clientName: string;         // Ex: "Maison de Couture X"
  currentStepId: string;      // Référence à l'id d'un StepDefinition
  status: 'en_attente' | 'en_cours' | 'validation' | 'termine';
  dossierTechnique: CardAttachment | null; // Fichier PDF principal
  frame: CardAttachment | null;            // Photo / Schéma de la pièce
  attachments: CardAttachment[];           // Fichiers complémentaires
  dateCreation: string;
  dateLivraison: string;
  members: CardMember[];                   // Utilisateurs assignés à la carte
  descriptionSpec: DescriptionSpec;        // Modèle, matière, prix, quantités
  stepChecklists: Record<string, ChecklistItem[]>; // stepId -> Liste des items
  historyLogs: HistoryLog[];               // Historique complet des événements
}
```

### Structure d'une Entrée d'Historique (`HistoryLog`)
```typescript
export interface HistoryLog {
  id: string;
  cardId: string;
  authorName: string;
  authorRole: UserRole;
  action: string;      // Ex: "Changement d'étape", "Commentaire / Observation"
  details?: string;    // Détail du changement ou texte du commentaire
  timestamp: string;  // Date/Heure formatée
}
```

---

## 4. Logique de Contrôle d'Accès (`src/utils/permissions.ts`)

La fonction `canUserCreateOrEditCards` détermine si l'utilisateur courant possède le statut d'Éditeur ou d'Observateur :

```typescript
import { UserProfile } from '../types';

export function canUserCreateOrEditCards(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  const poste = (user.posteLabel || '').toLowerCase();

  const isCommercialOrMerch =
    role === 'merch' ||
    role === 'commercial' ||
    poste.includes('commercial') ||
    poste.includes('merch');

  const isDirecteur =
    role === 'directeur' ||
    role === 'admin' ||
    poste.includes('directeur') ||
    poste.includes('direction') ||
    poste.includes('admin');

  const isRespPlanning =
    role === 'resp_planning' ||
    role === 'planning' ||
    poste.includes('planning') ||
    poste.includes('planification');

  return isCommercialOrMerch || isDirecteur || isRespPlanning;
}
```

---

## 5. Comment Étendre l'Application

### Ajouter un Nouveau Champ sur la Carte
1. Éditer `/src/types.ts` pour ajouter la propriété dans `DescriptionSpec` ou `Card`.
2. Mettre à jour `/src/components/CreateCardModal.tsx` pour inclure le champ dans le formulaire de création.
3. Modifier `/src/components/CardIdentityModal.tsx` pour afficher et permettre l'édition du nouveau champ.

### Ajouter un Étape de Workflow Complémentaire
1. Les étapes par défaut sont définies dans `/src/data/initialData.ts` (`INITIAL_STEPS`).
2. Vous pouvez également en ajouter dynamiquement via le bouton **"Ajuster Steps"** dans l'application.

### Connecter un Backend API REST
Dans `App.tsx`, remplacer la gestion de l'état `cards` initialisé via `localStorage` par des appels `fetch` / `axios` vers votre serveur Express :
```typescript
// Exemple de synchronisation API
useEffect(() => {
  fetch('/api/cards')
    .then(res => res.json())
    .then(data => setCards(data));
}, []);
```

---

## 6. Qualité du Code et Commandes Utiles

- **Vérifier le typage TypeScript** :
  ```bash
  npm run lint
  ```
- **Tester la compilation Vite** :
  ```bash
  npm run build
  ```
