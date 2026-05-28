# Journal Personnel — Spécification produit

<!-- SITE_DESCRIPTION: Une application web de journal intime simple et élégante pour écrire et gérer son journal personnel avec recherche et lecture aléatoire. -->

## 1. Vision

Journal Personnel est une application web de journal intime simple, élégante et privée. Elle permet à un individu d'écrire, de gérer et de découvrir ses entrées de journal personnel avec une interface épurée inspirée du style GitHub. L'application valorise la simplicité, la facilité d'accès et l'absence de complexité administrative.

## 2. Users and Actors

### Primary User
- **Diariste** : Individu qui souhaite écrire et gérer son journal personnel. Il écrit régulièrement, relit ses entrées anciennes et découvre des moments oubliés de sa vie.

### Secondary Actors
- **Navigateur web** : Accès via React + Vite, aucun compte requis.

## 3. Problems to Solve

1. **Absence d'un outil simple et privé** : La plupart des applications de journal sont trop complexes, imposent une authentification ou une synchronisation.
2. **Difficulté à retrouver des entrées** : L'utilisateur oublie facilement où il a écrit sur un sujet donné, sur une période donnée.
3. **Manque de redécouverte** : Il n'existe aucun moyen aléatoire et agréable de retrouver des moments oubliés.
4. **Absence de contexte visuel** : Un journal textuel linéaire manque de repères visuels temporels.

## 4. Product Goals

1. **Permettre l'écriture facile et rapide** : Créer une entrée datée en moins de 3 clics.
2. **Faciliter la recherche par période** : Retrouver toutes les entrées entre deux dates.
3. **Encourager la redécouverte** : Un bouton surprise qui affiche une entrée aléatoire du passé.
4. **Visualiser l'historique** : Une timeline chronologique des entrées avec ancres de dates.
5. **Maintenir la simplicité** : Zéro coût, stockage local, aucune dépendance externe.

## 5. Out of Scope

- Synchronisation avec d'autres appareils ou comptes
- Chiffrement ou authentification multi-utilisateurs
- Export automatique ou sauvegarde cloud
- Partage d'entrées
- Notifications ou rappels
- Étiquettes (tags) ou catégories
- Statistiques d'écriture
- Collaboration ou commentaires

## 6. Business Concepts

### Entrée de Journal (Journal Entry)
- **Identité** : Date + position en cas d'entrées multiples pour la même date (index)
- **Attributs** : Date, texte libre, timestamp de création, timestamp de dernière modification
- **États** : Brouillon (optionnel), publiée (locale), supprimée

### Timeline
- Représentation visuelle de l'ordre chronologique des entrées.
- Ancres de dates comme points de repère.

### Recherche par Période
- Paramétrée par date de début et date de fin (incluses).
- Retourne toutes les entrées dans cette plage.

### Lecture Aléatoire (Surprise)
- Sélectionne une entrée au hasard parmi toutes les entrées existantes.
- Affiche l'entrée complète avec date.

## 7. Product Capabilities

### Création d'entrée
- Formulaire simple : date (calendrier ou saisie), texte libre.
- Possibilité de créer plusieurs entrées pour la même date.
- Sauvegarde automatique en localStorage.

### Édition d'entrée
- Modifier le texte ou la date d'une entrée existante.
- Historique des modifications (timestamp conservé).

### Suppression d'entrée
- Supprimer une entrée avec confirmation.
- Suppression définitive de localStorage.

### Recherche par Période
- Sélectionner une plage de dates (début / fin).
- Résultats affichés en liste ou timeline.

### Lecture Aléatoire (Bouton Surprise)
- Affiche une entrée passée aléatoire.
- Redémarrer pour une autre entrée aléatoire.

### Timeline Visuelle
- Fil chronologique avec ancres de dates.
- Clic sur une date pour filtrer / afficher les entrées du jour.

### Thèmes et Skins
- Mode clair / sombre (system preference + sélecteur manuel).
- Skins Primer (GitHub Primer design system).

## 8. High-Level Workflows

### Workflow 1 : Écrire une nouvelle entrée
1. Utilisateur clique "Nouvelle entrée"
2. Sélectionne une date (aujourd'hui par défaut)
3. Écrit le texte dans un textarea
4. Clique "Sauvegarder"
5. Entrée apparaît dans la timeline et la liste

### Workflow 2 : Rechercher par période
1. Utilisateur clique "Recherche"
2. Sélectionne date de début et date de fin
3. Clique "Chercher"
4. Résultats affichés dans une liste ou timeline filtrée

### Workflow 3 : Découvrir une entrée aléatoire
1. Utilisateur clique "Surprise"
2. Une entrée aléatoire s'affiche
3. Clique "Autre surprise" pour en découvrir une autre

### Workflow 4 : Visualiser la timeline
1. Page d'accueil affiche la timeline complète
2. Utilisateur scrolle pour naviguer les dates
3. Clique sur une date pour afficher les entrées du jour
4. Clique sur une entrée pour lire ou éditer

## 9. Business Rules

1. **Unicité de date + index** : Une entrée est unique par sa combinaison (date + index). Plusieurs entrées peuvent exister pour la même date.
2. **Pas de suppression en cascade** : La suppression d'une entrée n'affecte aucune autre donnée.
3. **Persistance locale** : Toutes les données sont stockées en localStorage du navigateur. Aucune synchronisation.
4. **Pas de limite de texte** : Une entrée peut contenir du texte de n'importe quelle longueur.
5. **Dates valides** : Les dates doivent être valides et ne peuvent pas être futures (optionnel : vérifier côté UI).
6. **Sélection aléatoire** : La sélection aléatoire s'effectue uniformément parmi toutes les entrées existantes.
7. **Affichage chronologique** : La timeline affiche les entrées par date décroissante (plus récentes d'abord) ou croissante (au choix de l'utilisateur).

## 10. Success Criteria

1. **Utilisabilité** : Un nouvel utilisateur crée une entrée en moins de 1 minute sans aide.
2. **Performance** : La recherche par période retourne les résultats en moins de 100ms pour 1000 entrées.
3. **Fiabilité** : Aucune perte de données après un rechargement de page.
4. **Accessibilité** : Conforme aux standards WCAG 2.1 (niveau AA minimum).
5. **Esthétique** : Interface cohérente avec GitHub Primer, réactive et épurée.
6. **Déploiement** : Fonctionne sur GitHub Pages sans configuration additionnelle.

## 11. Open Questions

1. **Limites de localStorage** : Quel est le comportement si le stockage local est plein (max ~5-10 MB selon navigateur) ?
2. **Suppression définitive** : Existe-t-il une corbeille ou la suppression est-elle immédiate et irréversible ?
3. **Format de date** : Doit-on afficher les dates au format français (JJ/MM/AAAA) ou international (AAAA-MM-JJ) ?
4. **Importer / Exporter** : L'utilisateur souhaite-t-il pouvoir exporter/importer son journal en JSON ou autre format ?
5. **Récurrence** : La possibilité de planifier une entrée récurrente (quotidienne, hebdomadaire) est-elle envisagée pour une phase 2 ?
6. **Sauvegarde de secours** : Y a-t-il un mécanisme de sauvegarde sur disque (download manuel) ou dépôt-t-on entièrement sur localStorage ?
