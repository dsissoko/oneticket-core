# User Story 003 — Destruction des briques et détection de victoire

## Titre
Destruction des briques et détection de victoire

## Format Mike Cohn

**En tant que** joueur,
**Je veux** détruire les briques du mur en les frappant avec la balle,
**Afin de** progresser vers la victoire.

## Critères d'acceptation (format Gherkin)

### Scénario 1 : Destruction d'une brique au contact
```gherkin
Given une brique est présente sur le mur
When la balle la touche
Then la brique est détruite
```

### Scénario 2 : Persistance de la destruction
```gherkin
Given une brique est détruite
When la balle la dépasse
Then la brique reste détruite
```

### Scénario 3 : Détection de victoire
```gherkin
Given il existe des briques sur le mur
When toutes sont détruites
Then le jeu affiche l'écran de victoire
```

### Scénario 4 : Redémarrage après victoire
```gherkin
Given l'écran de victoire s'affiche
When le joueur clique sur Rejouer
Then une nouvelle partie commence
```

## Tâches techniques

### Architecture et Données
- Grid de briques : 5 lignes × 10 colonnes (configuration initiale)
- État de chaque brique : présente ou détruite
- Détection victoire : vérification si toutes les briques sont détruites

### Détection de collision
- Implémentation de la collision ball-brick
- Calcul du point d'impact (haut, bas, gauche, droite)
- Réflexion de la balle selon la surface touchée
- Marquer la brique comme détruite lors du contact

### Rendu visuel
- Suppression visuelle de la brique du canvas/DOM
- Animation de disparition (optionnel mais recommandé)
- Mise à jour de l'affichage en temps réel

### Détection d'état final
- Itération sur toutes les briques après chaque collision
- Vérification du nombre de briques restantes
- Déclenchement de l'écran de victoire lorsque le compteur atteint 0

## Dépendances
- Dépend de : `US-002` (Balle avec physique réaliste)
- Dépend de : `US-001` (Raquette contrôlable)

## Critères d'acceptation techniques

1. **Collision précise** : La détection de collision ball-brick fonctionne correctement sans faux positifs
2. **État persistant** : Les briques détruites ne réapparaissent pas
3. **Victoire stable** : L'affichage de victoire est stable et la balle s'arrête
4. **Redémarrage complet** : Le bouton "Rejouer" réinitialise complètement le grid de briques
5. **Performance** : Les vérifications de victoire ne causent pas de ralentissement

## Estimations

- **Complexité** : Moyenne
- **Effort estimé** : 3-5 points (User Story Points)
- **Risques** : Détection de collision précise, performance avec grand nombre de briques

## Notes d'implémentation

- Considérer l'ordre de vérification des collisions (ball-brick avant ball-wall)
- Utiliser un booléen ou un statut (ACTIVE/DESTROYED) pour chaque brique
- Implémenter un compteur de briques actives pour accélérer la vérification de victoire
- Prévoir un délai court avant l'affichage du message de victoire (0.5-1s) pour meilleure UX

---

**Status** : Prêt pour développement
**Créé par** : @analyst
**Date** : 2026-05-27
