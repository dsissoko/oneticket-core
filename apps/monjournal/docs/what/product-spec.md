# Product Specification — MonJournal

<!-- SITE_DESCRIPTION: Un journal personnel simple et jolie pour gérer vos pensées datées -->

## 1. Vision

MonJournal est une application de journal personnel minimaliste et élégante qui permet aux utilisateurs de capturer et organiser leurs pensées quotidiennes. L'application offre une interface intuitive pour créer, éditer et explorer un fil de pensées personnelles, avec des capacités de recherche et de filtrage pour retrouver facilement les moments importants.

## 2. Users and Actors

- **Journal keeper** — Personne qui souhaite documenter ses pensées personnelles datées de manière simple et agréable
- **Seul acteur utilisateur** — L'application est à usage personnel, une seule personne gère son journal

## 3. Problems to Solve

- Difficulté à conserver un journal personnel sans complexité excessive
- Besoin de retrouver rapidement des pensées anciennes par mot-clé ou thème
- Manque d'interface élégante et simple pour la capture rapide de pensées
- Désir d'explorer aléatoirement ses pensées passées pour se redécouvrir

## 4. Product Goals

- Permettre la capture rapide et simple de pensées (max 200 caractères)
- Afficher l'historique complet des pensées du plus récent au plus ancien
- Offrir des capacités de recherche et filtrage par tag
- Fournir une interface unifiée et simple sur une seule page
- Permettre l'exploration aléatoire des pensées via un bouton surprise
- Assurer une expérience visuelle élégante et minimaliste

## 5. Out of Scope

- Synchronisation cloud ou multi-appareils
- Partage social des pensées
- Collaboration ou commentaires d'autres utilisateurs
- Planification ou gestion d'événements
- Pièces jointes ou contenus multimédias (texte et markdown uniquement)
- Authentification ou gestion de plusieurs utilisateurs
- Analyse avancée ou statistiques détaillées

## 6. Business Concepts

### Pensée (Thought)
- **Définition** — Un enregistrement texte daté représentant une pensée personnelle
- **Identité** — Identifiant unique (ID) + timestamp de création
- **Attributs** — Contenu (max 200 caractères, markdown), date, tags, horodatage
- **Cycle de vie** — Créée → Affichée → Peut être éditée ou supprimée

### Tag
- **Définition** — Étiquette associée à une pensée pour catégorisation
- **Identité** — Nom unique du tag
- **Relationship** — Une pensée peut avoir zéro ou plusieurs tags ; un tag peut être utilisé par zéro ou plusieurs pensées

## 7. Product Capabilities

- **Créer une pensée** — Formulaire texte simple, enregistrement avec date/heure automatique
- **Éditer une pensée** — Modification du contenu et des tags existants
- **Supprimer une pensée** — Suppression avec confirmation
- **Tagger une pensée** — Ajouter/retirer des tags lors de la création ou l'édition
- **Filtrer par tag** — Afficher uniquement les pensées associées à un tag sélectionné
- **Rechercher par mot-clé** — Filtrer les pensées par contenu texte
- **Pensée aléatoire (surprise)** — Afficher une pensée choisie aléatoirement parmi l'historique
- **Affichage du fil** — Liste des pensées triées du plus récent au plus ancien
- **Markdown support** — Rendu basique du markdown dans l'affichage des pensées

## 8. High-Level Workflows

### Happy Path — Créer et explorer ses pensées

1. Utilisateur accède à MonJournal
2. Voit le fil de ses pensées récentes (du plus récent au plus ancien)
3. Saisit une nouvelle pensée dans le formulaire en haut (max 200 caractères)
4. Optionnellement ajoute des tags
5. Enregistre la pensée (horodatage automatique)
6. Nouvelle pensée apparaît en haut du fil
7. Utilisateur peut cliquer sur "Surprise" pour voir une pensée aléatoire
8. Utilisateur peut chercher une pensée par mot-clé
9. Utilisateur peut filtrer les pensées par tag sélectionné
10. Utilisateur peut éditer ou supprimer ses pensées anciennes

### Alternative Path — Édition

1. Utilisateur clique sur une pensée existante
2. Accède au mode édition (contenu + tags modifiables)
3. Met à jour la pensée
4. Enregistre les modifications (date de création inchangée, date de modif optionnelle)
5. Le fil se met à jour

### Exception Path — Suppression avec confirmation

1. Utilisateur clique sur l'icône supprimer
2. Dialogue de confirmation s'affiche
3. Si confirmé, la pensée est supprimée définitivement
4. Le fil se met à jour

## 9. Business Rules

1. **Limite de caractères** — Une pensée ne peut dépasser 200 caractères
2. **Horodatage automatique** — Chaque pensée reçoit la date/heure du système à la création (non éditable)
3. **Tri du fil** — Les pensées sont toujours affichées du plus récent au plus ancien
4. **Unicité des tags** — Les tags sont insensibles à la casse (normalisés)
5. **Suppression définitive** — Les pensées supprimées ne peuvent pas être récupérées
6. **Une seule page** — Toute l'interface (création, affichage, filtres, recherche) est sur une seule page
7. **Markdown simple** — Support de base du markdown (bold, italic, listes)
8. **Localisation de stockage** — Les données sont stockées localement (localStorage ou équivalent)

## 10. Success Criteria

- ✅ Utilisateur peut créer une pensée en moins de 5 clics
- ✅ Utilisateur peut retrouver une pensée ancienne par mot-clé en moins de 3 secondes
- ✅ Utilisateur peut filtrer par tag sans latence visible
- ✅ Interface est responsive et fonctionne sur mobile
- ✅ Bouton "Surprise" propose une pensée aléatoire en moins de 1 seconde
- ✅ Design minimaliste et élégant sans distraction
- ✅ Zéro latence de sauvegarde (local-first)

## 11. Open Questions

- Doit-on afficher la date complète ou un format relatif (ex: "il y a 2 jours") ?
- Les pensées supprimées doivent-elles être archivées avant suppression définitive ?
- Faut-il permettre l'export des pensées (JSON, CSV, etc.) ?
- Y a-t-il une limite de stockage local à respecter ou gérer ?
- Le markdown supporté doit-il inclure des liens et des images, ou rester basique ?
- Doit-on afficher une date de dernière modification en plus de la création ?
