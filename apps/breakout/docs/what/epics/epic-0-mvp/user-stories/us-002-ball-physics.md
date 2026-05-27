# US-002 — Physique de la balle rebondissante

## Titre
Physique de la balle rebondissante

## Format Mike Cohn

**En tant que** joueur,
**Je veux** voir la balle rebondir réalistically sur les murs, le plafond et la raquette,
**Afin de** jouer correctement et prévoir les trajectoires.

## Critères d'acceptation (format Gherkin)

### Scénario 1 : Rebond sur les murs latéraux
```gherkin
Given la balle se déplace vers un mur latéral
When elle le touche
Then elle rebondit avec l'angle de réflexion correct
  And sa composante horizontale de vélocité est inversée
  And sa composante verticale de vélocité reste inchangée
```

### Scénario 2 : Rebond sur le plafond
```gherkin
Given la balle se déplace vers le plafond
When elle le touche
Then elle rebondit vers le bas
  And sa composante verticale de vélocité est inversée
  And sa composante horizontale de vélocité reste inchangée
```

### Scénario 3 : Rebond sur la raquette
```gherkin
Given la balle se déplace vers la raquette
When elle la touche
Then elle rebondit vers le haut
  And l'angle de rebond dépend du point d'impact sur la raquette
  And la vitesse totale reste constante
```

### Scénario 4 : Perte de la balle
```gherkin
Given la balle est en mouvement
When elle sort par le bas de l'aire de jeu
Then elle est considérée perdue
  And une vie est soustraite du joueur
  And la balle est réinitialisée au centre avec une direction aléatoire
```

## Tâches techniques

### Animation Loop
- [ ] Implémenter une boucle de jeu avec `requestAnimationFrame`
- [ ] Mettre à jour la position de la balle à chaque frame
- [ ] Calculer les nouvelles coordonnées basées sur les vecteurs de vélocité
- [ ] Limiter le taux de rafraîchissement pour une cohérence visuelle

### Collision Detection
- [ ] Détecter les collisions balle-murs (gauche, droit, haut)
- [ ] Détecter les collisions balle-raquette avec zone d'impact variable
- [ ] Détecter les collisions balle-briques
- [ ] Détecter si la balle sort par le bas de l'aire de jeu
- [ ] Implémenter un système de padding/margin pour éviter les collisions multiples par frame

### Velocity Vectors
- [ ] Initialiser les vecteurs de vélocité (vx, vy) basés sur un angle et une vitesse
- [ ] Inverser la composante vx lors des collisions latérales
- [ ] Inverser la composante vy lors des collisions verticales
- [ ] Ajuster l'angle de rebond sur la raquette selon le point d'impact
- [ ] Maintenir une vitesse constante après chaque rebond

### Gestion des Rebonds
- [ ] Implémenter la réflexion simple sur les murs
- [ ] Implémenter la réflexion angulaire sur la raquette (plus rapide aux extrémités)
- [ ] Implémenter la destruction et le rebond sur les briques
- [ ] Gérer les cas limites (coins, rebonds multiples, etc.)

## Dépendances
- Dépend de : `US-001` (Contrôle de la raquette au clavier)
- Bloque : `US-003` (Système de vies et game over), `US-004` (Destruction des briques)

## Notes d'implémentation

### Physique recommandée
La physique de rebond suit le principe de réflexion de la lumière :
- **Angle d'incidence = Angle de réflexion**
- Les composantes de vélocité sont inversées indépendamment selon l'axe de collision
- La vitesse totale reste inchangée pour maintenir une difficulté stable

### Gestion des cas limites
- Éviter les collisions répétées en marquant les objets comme "en collision" pour un frame
- Gérer les coins arrondis vs. angles vifs des briques
- Assurer que la balle ne se coinçe jamais dans un objet

### Performance
- Utiliser des calculs simples pour les vecteurs (pas de trigonométrie lourde)
- Optimiser les vérifications de collision (test AABB rapide avant test plus précis)
- Prioriser la réactivité sur la précision physique ultra-réaliste

---

**Status** : Pending (En attente de développement)
**Priorité** : Haute (bloqueuse pour la jouabilité)
