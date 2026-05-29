---
name: oneticket-manifest-generation
description: Know the exact manifest format to produce when decomposing a request into parallel executable tasks for OneTicket.
version: 1.0.0
---

# Skill : oneticket-manifest-generation

## Rôle

Ce skill décrit le format exact du manifest à produire quand une demande
nécessite une décomposition en tâches exécutables par des agents.

---

## Format obligatoire

Le manifest doit être écrit dans le fichier `.oneticket/tasks/issue-{issue_number}/manifest.json`.
Le contenu doit être exactement ce JSON (pas de commentaires, pas de markdown autour) :

```json
{
  "issue": 42,
  "branch_base": "feature/issue-42",
  "tasks": [
    {
      "id": "A",
      "branch": "task/issue-42-A",
      "file": "chemin/vers/fichier.ext",
      "content": "instruction complète et autosuffisante pour l'agent exécuteur",
      "depends_on": [],
      "status": "pending"
    },
    {
      "id": "B",
      "branch": "task/issue-42-B",
      "file": "chemin/vers/autre-fichier.ext",
      "content": "instruction complète et autosuffisante pour l'agent exécuteur",
      "depends_on": ["A"],
      "status": "pending"
    }
  ]
}
```

---

## Règles de validation — champ par champ

| Champ | Règle |
|---|---|
| `issue` | Entier — le numéro d'issue GitHub exact |
| `branch_base` | Toujours `feature/issue-{issue}` |
| `tasks` | Tableau non vide |
| `id` | Lettre majuscule unique : A, B, C... — jamais de doublon |
| `branch` | Toujours `task/issue-{issue}-{id}` — dérivé mécaniquement de l'id |
| `file` | Chemin relatif depuis la racine du repo — pas de `/` initial |
| `content` | Instruction complète, précise, autosuffisante — l'agent n'a pas d'autre contexte |
| `depends_on` | Tableau d'ids existants dans ce même manifest — `[]` si aucune dépendance |
| `status` | Toujours `"pending"` à la création — jamais autre chose |
| `role` | **Optionnel** — nom d'un profil agent (`architect`, `dev`, `qa`, `analyst`). Si présent, le worker reçoit un prompt enrichi avec le profil complet. Si absent, worker générique (comportement par défaut). |

---

## Règles du graphe de dépendances

- **Number of tasks** : the manifest must not exceed `max_tasks` tasks in total. Before finalizing the manifest, count the number of tasks produced. If this number exceeds `max_tasks`, group the closest tasks together (same role, same functional scope) to bring the total down to `max_tasks` or less. Never ignore this constraint.
- **Séquentiel vs parallèle** : privilégie les tâches séquentielles dépendantes les unes des autres en série si tu estimes qu'elles risquent de modifier des fichiers communs. Si certaines tâches sont à priori parallélisables car elles touchent des endroits différents et non communs, préfère les lancer en parallèle. Les tâches en parallèle peuvent toutefois avoir des dépendances en amont.
- **Pas de cycle** : A ne peut pas dépendre de B si B dépend de A
- **Ids référencés valides** : `depends_on` ne peut contenir que des ids définis dans `tasks`
- **Granularité** : une tâche = un fichier produit — si une réalisation nécessite plusieurs fichiers, créer plusieurs tâches

---

## Règle sur le champ `content`

Le champ `content` est **l'unique instruction** que recevra l'agent exécuteur.
Il doit être :
- **Autosuffisant** : l'agent n'a accès à aucun autre contexte que ce champ
- **Précis** : indiquer exactement ce que le fichier doit contenir ou faire
- **Complet** : inclure les références aux fichiers de spec si nécessaire (`lis docs/us/A1.md`)
- **Pas juste un titre** : `"Implémenter le login"` est insuffisant — `"Lis docs/us/login.md et implémente src/auth/login.ts avec les tests associés"` est correct

---

## Exemple complet — 3 épics séquentielles avec US parallèles

```json
{
  "issue": 42,
  "branch_base": "feature/issue-42",
  "tasks": [
    { "id": "A1", "branch": "task/issue-42-A1", "file": "src/models/user.ts",
      "content": "Lis docs/epics/A.md section User Model. Implémente src/models/user.ts avec les champs décrits.",
      "depends_on": [], "status": "pending" },
    { "id": "A2", "branch": "task/issue-42-A2", "file": "src/models/product.ts",
      "content": "Lis docs/epics/A.md section Product Model. Implémente src/models/product.ts.",
      "depends_on": [], "status": "pending" },
    { "id": "B1", "branch": "task/issue-42-B1", "file": "src/services/auth.ts",
      "content": "Lis docs/epics/B.md section Auth. Implémente src/services/auth.ts en utilisant src/models/user.ts.",
      "depends_on": ["A1", "A2"], "status": "pending" },
    { "id": "B2", "branch": "task/issue-42-B2", "file": "src/services/catalog.ts",
      "content": "Lis docs/epics/B.md section Catalog. Implémente src/services/catalog.ts en utilisant src/models/product.ts.",
      "depends_on": ["A1", "A2"], "status": "pending" },
    { "id": "C1", "branch": "task/issue-42-C1", "file": "src/api/routes.ts",
      "content": "Lis docs/epics/C.md. Implémente src/api/routes.ts en intégrant auth et catalog.",
      "depends_on": ["B1", "B2"], "status": "pending" }
  ]
}
```

## Exemple avec champ `role` — tâche confiée à un agent spécialisé

Le champ `role` est optionnel. Sans `role`, la tâche est exécutée par un worker générique.
Avec `role`, le worker reçoit le profil complet de l'agent (profil, contexte projet, contract).

```json
{
  "issue": 42,
  "branch_base": "feature/issue-42",
  "tasks": [
    { "id": "A", "branch": "task/issue-42-A", "file": "apps/breakout/docs/how/architecture.md",
      "content": "Lis apps/breakout/docs/what/product-spec.md et produis l'architecture C4 du projet Breakout.",
      "role": "architect",
      "depends_on": [], "status": "pending" },
    { "id": "B", "branch": "task/issue-42-B", "file": "apps/breakout/app/src/game.ts",
      "content": "Lis apps/breakout/docs/how/architecture.md et implémente le moteur de jeu principal.",
      "role": "dev",
      "depends_on": ["A"], "status": "pending" },
    { "id": "C", "branch": "task/issue-42-C", "file": "apps/breakout/docs/run/changelog.md",
      "content": "Produis le changelog de la v1.0.0 à partir des fichiers modifiés.",
      "depends_on": ["B"], "status": "pending" }
  ]
}
```

`role` absent sur la tâche C → worker générique (créer le fichier tel quel).

---

## Message de commit obligatoire

Après avoir écrit le manifest, exécuter ces commandes exactes :

```bash
git add .oneticket/tasks/issue-<issue_number>/manifest.json
git commit -m "feat: decompose issue #<issue_number>"
```

Remplacer `<issue_number>` par le numéro d'issue réel. Aucune variation acceptée.
Ce message est le signal technique qui déclenche le pipeline d'exécution automatique.

---

## Contraintes absolues

- **Ne jamais pusher** — le push est géré par le pipeline déterministe
- **Ne jamais créer de PR** — la PR est créée automatiquement en fin de pipeline
- **Un seul fichier à produire** : `.oneticket/tasks/issue-{N}/manifest.json`
- **JSON valide** : vérifier la syntaxe avant de commiter
