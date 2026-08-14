# 🛠️ Guide Technique & Administration - Suivi de Flux & Fiches Cartes

Ce document détaille l'architecture technique, l'infrastructure d'hébergement, la sécurité, les variables d'environnement et les procédures de déploiement et de maintenance de l'application **Suivi de Flux & Fiches Cartes**.

---

## 1. Architecture Système & Infrastructure

L'application repose sur une architecture conteneurisée moderne basée sur **Node.js**, **Vite** et **React**.

```
  +-------------------------------------------------------------------+
  |                  Navigateur Client (Utilisateur)                  |
  +-------------------------------------------------------------------+
                                   |  (HTTPS / Port 3000)
                                   v
  +-------------------------------------------------------------------+
  |               Reverse-Proxy Nginx (Ingress Isolation)             |
  +-------------------------------------------------------------------+
                                   |
                                   v
  +-------------------------------------------------------------------+
  |            Conteneur Cloud Run (Runtime Sandboxé)                 |
  |                                                                   |
  |   +--------------------------+     +--------------------------+   |
  |   | Serveur Web / API Express|     | App Client Single-Page   |   |
  |   | (Node.js CJS/ESM)        | <-> | (React + Tailwind CSS)   |   |
  |   +--------------------------+     +--------------------------+   |
  +-------------------------------------------------------------------+
```

### Caractéristiques de l'Infrastructure :
- **Port d'Écoute unique** : Port `3000` lié sur l'adresse `0.0.0.0` (redirection gérée par le proxy inverse).
- **Isolation réseau** : L'application s'exécute dans un conteneur Cloud Run sécurisé.
- **Support Multi-Rôles** : Modèle de permissions découpé côté client et renforçable côté API.

---

## 2. Sécurité, Confidentialité et Droits d'Accès

### A. Confidentialité des Données & Sandbox
- **Protection contre le partage de données involontaire** : L'exécution du code se fait dans un environnement isolé par conteneur. Aucune donnée saisie dans l'application n'est transmise à des tiers sans configuration explicite de clés d'API.
- **Sécurisation des Clés d'API** : Les clés secrètes (comme la clé Gemini API) sont conservées exclusivement côté serveur (Node.js) et ne sont **jamais exposées** dans le code client livré au navigateur (`import.meta.env` non préfixé par `VITE_`).

### B. Contrôle d'Accès par Rôle (RBAC)
La logique métier d'autorisation est centralisée dans le module `/src/utils/permissions.ts` :

- **Postes Éditeurs** (`canUserCreateOrEditCards` retourne `true`) :
  - Commerciale / Merchandiser (`role === 'merch'` ou `posteLabel` contenant *"commercial"* / *"merch"*)
  - Directeur Général ou Adjoint (`role === 'directeur'`, `'admin'` ou `posteLabel` contenant *"directeur"* / *"admin"*)
  - Responsable Planning (`role === 'resp_planning'`, `'planning'` ou `posteLabel` contenant *"planning"*)

- **Postes Observateurs** (`canUserCreateOrEditCards` retourne `false`) :
  - Clients, Techniciens, Opérateurs, Utilisateurs invités.
  - Seule la lecture des cartes et l'ajout de commentaires dans la table d'audit sont autorisés.

---

## 3. Configuration & Variables d'Environnement

Le projet utilise un fichier `.env.example` pour déclarer les variables d'environnement nécessaires au fonctionnement.

```env
# .env.example

# Port d'exécution du serveur (Par défaut 3000)
PORT=3000

# Clé API Google Gemini (Si des fonctionnalités IA / assistant sont activées côté serveur)
GEMINI_API_KEY=

# Environnement (development / production)
NODE_ENV=production
```

> ⚠️ **Sécurité** : Ne committez jamais de fichier `.env` contenant de véritables secrets dans votre gestionnaire de version.

---

## 4. Procédures de Compilation et Déploiement

### Prerequisites
- **Node.js** v18.0.0 ou supérieur (v20+ recommandé)
- **npm** v9+ ou **bun**

### A. Déploiement en Mode Production (Standard)

1. **Installation des dépendances** :
   ```bash
   npm install
   ```

2. **Vérification du typage TypeScript** :
   ```bash
   npm run lint
   ```

3. **Compilation des assets statiques & du serveur** :
   ```bash
   npm run build
   ```
   *La commande génère les fichiers optimisés dans le dossier `dist/`.*

4. **Démarrage du serveur de production** :
   ```bash
   npm run start
   ```
   *Le serveur démarre sur `http://0.0.0.0:3000`.*

---

## 5. Intégration de Bases de Données Cloud (Optionnel)

Pour passer d'une conservation en mémoire / `localStorage` à une persistance d'entreprise à long terme :

### Intégration Firebase / Firestore :
1. Activer le produit Firestore sur la plateforme.
2. Installer `@firebase/app` et `firebase/firestore`.
3. Initialiser le SDK dans `/src/lib/firebase.ts`.
4. Remplacer la synchronisation `localStorage` dans `App.tsx` par des écouteurs en temps réel (`onSnapshot`).

### Intégration PostgreSQL / Cloud SQL :
1. Configurer un serveur PostgreSQL ou un composant Cloud SQL.
2. Définir le schéma Drizzle ORM ou Prisma dans `/backend`.
3. Définir des routes REST API (`/api/cards`, `/api/cards/:id/history`) dans `server.ts`.

---

## 6. Journalisation et Diagnostic de Panne (Troubleshooting)

| Erreur Constatée | Cause Possible | Solution |
| :--- | :--- | :--- |
| **Port 3000 déjà utilisé** | Un autre processus occupe le port 3000 | Tuer le processus avec `fuser -k 3000/tcp` ou redémarrer le serveur dev. |
| **Boutons de création masqués** | Utilisateur connecté en rôle restreint | Changer de profil dans le sélecteur d'utilisateur en haut à droite. |
| **Erreur de compilation Vite** | Module manquant dans `node_modules` | Exécuter `npm install` puis nettoyer le cache avec `npm run clean`. |
