# 📖 Guide Utilisateur - Suivi de Flux & Fiches Cartes

Bienvenue dans le manuel d'utilisation de l'application de **Suivi de Flux & Fiches Cartes**. Ce document est conçu pour guider les utilisateurs métier, les commerciales, la direction, les responsables planning et les observateurs dans l'utilisation quotidienne de l'outil.

---

## 1. Présentation Générale

L'application permet d'organiser, de suivre et de valider le passage des **Cartes de Suivi** (ou fiches de production) à travers différentes étapes de fabrication ou de traitement.

### Fonctionnalités principales :
- **Tableau Kanban & Vue Liste** : Visualisation claire et en temps réel de l'avancement des cartes par colonne d'étape.
- **Fiche Identité Complète** : Consultation détaillée de chaque carte (Dossier Technique PDF, image Frame, spécifications textiles/matières, prix, quantités).
- **Checklists d'Étape Imbriquées** : Suivi rigoureux des sous-tâches à réaliser à chaque étape du workflow.
- **Historique d'Audit & Commentaires** : Traçabilité complète de chaque modification (qui a déplacé quoi et quand) et espace de commentaires pour les équipes.

---

## 2. Matrice des Rôles et Droits d'Accès

Afin de garantir la sécurité des données et le respect de la chaîne de validation, les actions autorisées dépendent du poste/rôle de l'utilisateur connecté :

| Rôle / Poste dans l'application | Création de carte | Modification / Déplacement | Validation Checklists | Ajout de Commentaires | Mode Lecture Seule |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Commerciale / Merchandiser (Merch)** | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui | ❌ Non |
| **Directeur (Général ou autre)** | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui | ❌ Non |
| **Responsable Planning / Planification** | ✅ Oui | ✅ Oui | ✅ Oui | ✅ Oui | ❌ Non |
| **Autres utilisateurs / Clients / Opérateurs** | ❌ Non | ❌ Non | ❌ Non | ✅ Oui | ✅ Oui |

> 💡 **Remarque importante** : Les utilisateurs en **Lecture seule** (Opérateurs, Techniciens, Clients) ne voient pas les boutons *"Nouvelle Carte"* ni *"Ajuster Steps"*. Dans la fiche d'une carte, leurs contrôles d'édition sont désactivés, mais ils conserve le droit absolu de rédiger des **remarques et commentaires** dans l'onglet **Historique & Commentaires**.

---

## 3. Prise en Main de l'Interface

L'interface est structurée en 3 grandes zones :

1. **La Barre de Navigation Supérieure (Header)** :
   - **Changement de Vue** : Passez du mode **Kanban** au mode **Liste**.
   - **Barre de Recherche** : Filtrez les cartes instantanément par référence, nom du modèle ou nom du client.
   - **Sélecteur d'Utilisateur** : Permet de changer d'utilisateur simulé pour tester les différents profils et droits d'accès.
   - **Bouton "+ Nouvelle Carte"** *(Éditeurs uniquement)* : Ouvre le formulaire de création de carte.
   - **Bouton "Ajuster Steps"** *(Éditeurs uniquement)* : Permet de configurer les étapes du workflow et leurs checklists par défaut.

2. **La Zone Principale (Kanban / Liste)** :
   - En mode **Kanban**, chaque colonne représente une étape du workflow (ex: *Création*, *Dossier Technique*, *Frame*, *Chaine de Modèle*, *Lancement*, *Séries*).
   - En mode **Liste**, toutes les cartes sont présentées dans un tableau synthétique filtrable.

---

## 4. Gestion des Cartes de Suivi

### A. Créer une Nouvelle Carte *(Commerciales, Directeurs, Resp. Planning)*
1. Cliquez sur le bouton **"+ Nouvelle Carte"** dans la barre supérieure.
2. Renseignez la **Référence** (générée automatiquement, modifiable).
3. Entrez le nom du **Modèle** (ex: *Robe Électrique*, *Pantalon Cargo*).
4. Indiquez le **Nom du Client** ou sélectionnez un client existant.
5. *(Optionnel)* Joignez immédiatement un **Dossier Technique (PDF)** ou un fichier d'image **Frame**.
6. Définissez les métriques de base : Matière, Prix unitaire, Quantités.
7. Cliquez sur **"Créer la Carte"**. La carte apparaît directement dans la première colonne du Kanban.

### B. Déplacer une Carte dans le Workflow
- **Par Glisser-Déposer (Drag & Drop)** : Maintenez le clic sur la carte dans le Kanban et déposez-la dans la colonne souhaitée.
- **Via la Fiche Identité** : Ouvre la carte, et modifiez le statut ou cliquez sur l'action de transfert d'étape.

---

## 5. Utilisation de la Fiche Identité d'une Carte

En cliquant sur une carte, vous ouvrez sa **Fiche Identité**. Elle comprend 5 onglets :

1. **Vue d'Ensemble** :
   - Statut actuel de la carte.
   - Aperçu rapide du **Dossier Technique PDF** et de la photo **Frame**.
   - Liste des membres affectés au suivi.
2. **Spécifications Métier** :
   - Détail du prix, des quantités, de la matière textile et des remarques de fabrication.
3. **Checklists d'Étape** :
   - Arborescence des tâches à cocher pour chaque étape.
   - Cocher une case enregistre automatiquement la date et le nom de la personne ayant validé le point.
4. **Documents & Attachements** :
   - Téléversement et consultation des pièces jointes supplémentaires (Photos de proto, Fiches de mesure, etc.).
   - Visionneuse PDF et galerie d'images intégrées.
5. **Historique & Commentaires** :
   - **Formulaire d'Ajout de Commentaire** : Permet à TOUS les utilisateurs (y compris les observateurs) de laisser un message, une question ou une consigne.
   - **Table d'Audit** : Horodatage précis de toutes les modifications effectuées sur la carte (changement d'étape, complétion de checklist, modification des pièces jointes).

---

## 6. Questions Fréquemment Posées (FAQ)

**Q : Pourquoi le bouton "Nouvelle Carte" n'apparaît-il pas pour mon compte ?**  
*R : Votre compte est configuré sous un poste d'observation (ex: Client ou Opérateur). Seuls les postes Commerciale/Merch, Directeur et Resp. Planning possèdent les droits de création.*

**Q : Comment ajouter un commentaire sur une carte si je suis en lecture seule ?**  
*R : Cliquez sur la carte pour l'ouvrir, rendez-vous dans l'onglet **Historique & Commentaires**, saisissez votre remarque dans le champ de texte puis cliquez sur **Envoyer**.*

**Q : Que se passe-t-il lorsque je me déconnecte de mon compte ?**  
*R : Lors de la déconnexion (bouton "Déconnexion"), l'accès à l'application est totalement verrouillé par un écran de sécurité. Il est impossible de consulter ou de modifier l'outil sans saisir de nouveau votre adresse e-mail et votre mot de passe.*

**Q : Où sont stockés mes fichiers PDF et photos joints ?**  
*R : Les fichiers téléversés dans la version de démonstration sont stockés de manière sécurisée en mémoire navigateur (Data URLs localisées). Dans une version de production complète, ils sont transférés vers un stockage cloud sécurisé.*
