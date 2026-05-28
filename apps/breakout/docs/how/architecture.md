---
title: 'Breakout Architecture'
---

# Breakout — Architecture

## 1. Principes d'Architecture

1. **Zéro dépendance** : HTML5/CSS3/JavaScript vanilla uniquement, aucune framework ni librairie externe
2. **Simplicité** : Architecture minimaliste sans couches inutiles
3. **Séparation des préoccupations** : Logique de jeu (game loop, physique), rendu (canvas), entrées utilisateur, interface menus
4. **Maintenabilité** : Code structuré et facile à comprendre pour un jeu frontend simple
5. **Perforance** : Utilisation efficace du Canvas HTML5 et du requestAnimationFrame

## 2. Vue Système

Breakout est une **Single Page Application (SPA)** entièrement client-side :
- Une page HTML unique
- JavaScript vanilla pour la logique et le rendu
- Canvas HTML5 pour le rendu du jeu
- DOM pour les menus et l'UI statique
- Pas de serveur backend, pas de base de données

## 3. Style Architectural

**Monolithe frontend simple** :
- Un seul fichier ou quelques modules JavaScript
- Pas de framework (React, Vue, Angular)
- Pas d'architecture asynchrone complexe (fetch, API)
- Boucle de jeu classique : input → update → render

## 4. Limites Techniques Principales

| Limite | Description |
|---|---|
| **Frontend only** | Aucune persistance, aucun backend |
| **Single player** | Pas de multiplayer, pas de synchronisation réseau |
| **No external libs** | Vanilla JS uniquement |
| **Canvas-based** | Rendu 2D sur HTML5 Canvas |
| **Keyboard + Mouse** | Souris pour menus, clavier pour jeu |

## 5. Composants Clés

### 5.1 Game Engine (Moteur de jeu)

Responsabilités :
- Boucle de jeu (tick à ~60 FPS)
- Logique d'update : positions, collisions, destruction briques
- Gestion des états (menu, en jeu, victoire, défaite)
- Gestion des vies et condition de fin

**Interfaces clés** :
- `update(deltaTime)` : Met à jour la physique et l'état
- `render(canvas)` : Dessine l'état courant sur le canvas

### 5.2 Physics Engine (Moteur de physique)

Responsabilités :
- Mouvement et rebonds de la balle
- Détection de collisions (balle ↔ murs, plafond, raquette, briques)
- Calcul des trajectoires post-collision

**Interfaces clés** :
- `updateBall(deltaTime)` : Met à jour position et vélocité
- `detectCollisions()` : Retourne liste des collisions

### 5.3 Input Handler (Gestionnaire d'entrée)

Responsabilités :
- Écoute des événements clavier (flèches gauche/droite)
- Écoute des événements souris (clics sur menus)
- State du joueur (raquette gauche/droite/neutre)

**Interfaces clés** :
- `onKeyDown(key)`, `onKeyUp(key)` : Événements clavier
- `onMouseClick(x, y)` : Événements souris

### 5.4 Menu UI (Interface utilisateur)

Responsabilités :
- Rendu des menus (HTML/CSS)
- Slider vitesse balle
- Boutons (Démarrer, Paramètres, Rejouer, Quitter)

**Interfaces clés** :
- `show()`, `hide()` : Visibilité des menus
- `getSpeed()` : Retourne la vitesse sélectionnée
- `onStartClick()`, `onSettingsClick()`, etc.

### 5.5 Game State Manager (Gestionnaire d'état)

Responsabilités :
- Stockage de l'état courant (menu, jeu, victoire, défaite)
- Gestion des transitions d'état
- Réinitialisation après défaite/victoire

**Interfaces clés** :
- `setState(state)` : Transition d'état
- `reset()` : Réinitialise le jeu

## 6. Interfaces Clés

### Game Loop
```javascript
function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000; // en secondes
  lastTime = timestamp;
  
  if (gameState === 'PLAYING') {
    gameEngine.update(deltaTime);
    gameEngine.render(canvas);
  }
  
  requestAnimationFrame(gameLoop);
}
```

### Collision Detection
```javascript
function detectCollisions() {
  // Balle ↔ murs, plafond
  // Balle ↔ raquette
  // Balle ↔ briques → destruction
  // Balle ↔ bas écran → perte vie
}
```

### State Transitions
```
MENU → (click Start) → SETTINGS
SETTINGS → (click Play) → PLAYING
PLAYING → (all bricks destroyed) → VICTORY
PLAYING → (no lives left) → DEFEAT
VICTORY/DEFEAT → (click Replay) → PLAYING
```

## 7. Architecture des Données

**Game State** (état global du jeu)
```javascript
{
  state: 'PLAYING' | 'MENU' | 'SETTINGS' | 'VICTORY' | 'DEFEAT',
  lives: 3,
  ballSpeed: 300, // pixels/seconde
  bricks: [ /* array de briques */ ],
  ball: { x, y, vx, vy, radius },
  paddle: { x, y, width, height },
  score: 0 // optionnel V1
}
```

**Pas de persistance** : Données stockées uniquement en mémoire (réinitialisation à chaque partie)

## 8. Architecture Sécurité

- **Pas d'entrée utilisateur sensible** : Le jeu n'accepte que des clics/touches clavier
- **Pas de données personnelles** : Aucune donnée utilisateur collectée
- **Pas de réseau** : Aucune requête HTTP/API
- **XSS minimal** : Contenu statique uniquement, pas d'injection dynamique

**Risques mineurs** :
- Aucun

## 9. Stratégie de Déploiement

1. **Build** : Aucun build tool requis — les fichiers HTML/CSS/JS sont servis directement
2. **Packaging** : Simple ZIP ou dépôt Git
3. **Hosting** : Serveur web statique (nginx, GitHub Pages, etc.)
4. **Versioning** : Versioning sémantique du code source

## 10. Stratégie d'Observabilité

- **Logging** : Console.log pour debug en développement (à retirer en prod)
- **Monitoring** : Aucun (jeu client-side uniquement)
- **Telemetry** : Aucun (pas de backend)

**Pour V2+** : Ajouter localStorage pour tracker le high score local

## 11. Vues C4 Associées

- [System Context](../c4/system-context.md)
- [Containers](../c4/containers.md)
- [Components](../c4/components.md)
- [Deployment](../c4/deployment.md)

## 12. Slices d'Implémentation Associées

Voir [how/slices/](../slices/) pour toutes les slices d'implémentation dérivées de cette architecture.

## 13. Contraintes Techniques

| Contrainte | Impact |
|---|---|
| Pas de dépendances | Tout code custom, pas de réutilisation de libs |
| Frontend only | Pas de données persistentes, pas de multijoueur |
| Canvas 2D | Pas de 3D, graphismes 2D simples |
| Perf 60 FPS | Optimisation du code pour éviter lag |
| Vanilla JS | Pas de syntaxe moderne non supportée (ES5+) |

## 14. Questions Ouvertes

1. Quelle est la résolution cible de l'aire de jeu ? (800x600, 1024x768, responsive ?)
2. Faut-il supporter le responsive design (mobile) ?
3. Y a-t-il une charte visuelle/palette de couleurs définie ?
4. High score persistant en localStorage en V1 ou en V2 ?
