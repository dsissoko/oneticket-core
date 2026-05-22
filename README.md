# oneticket-core

Orchestrateur déterministe GitHub-native pour le framework OneTicket.

## Principe

Séparation stricte entre :
- **Décisions d'orchestration** — code JS pur, 0 LLM
- **Exécution des tâches** — opencode CLI, uniquement pour générer du contenu

## Flux

```
/start (commentaire issue)
  └─► on-issue-comment.yml
        └─► src/init.mjs
              ├─ Parse les tâches depuis le corps de l'issue (bloc JSON)
              ├─ Crée manifest.json sur feature/issue-<N>
              └─ src/agent-launcher.mjs → déclenche agent-run.yml par tâche prête

push task/issue-<N>-<ID>
  └─► on-task-push.yml
        └─► src/orchestrate.mjs
              ├─ Merge la branche task/* dans feature/issue-<N>
              ├─ Marque la tâche "done" dans manifest.json
              ├─ Identifie les tâches suivantes (dépendances satisfaites)
              ├─ Si tâches prêtes → src/agent-launcher.mjs → agent-run.yml
              └─ Si tout done → crée la PR finale

agent-run.yml (workflow réutilisable)
  └─ Écrit params.json
  └─ Lance opencode --non-interactive avec le prompt minimal
  └─ opencode crée le fichier, commit, push sur task/*
```

## Format du corps d'issue

Pour déclencher l'orchestrateur, le corps de l'issue doit contenir un bloc JSON :

````
```json
{
  "tasks": [
    { "id": "A", "file": "subtask-A.txt", "content": "Subtask A completed", "depends_on": [] },
    { "id": "B", "file": "subtask-B.txt", "content": "Subtask B completed", "depends_on": ["A"] }
  ]
}
```
````

## Secrets requis

| Secret | Usage |
|---|---|
| `OPENCODE_API_KEY` | Clé API pour opencode CLI |
| `ONETICKET_GH_PAT` | PAT GitHub avec droits `contents:write`, `pull-requests:write`, `actions:write` |

## Structure

```
oneticket-core/
├── .github/workflows/
│   ├── on-issue-comment.yml   ← trigger /start → init
│   ├── on-task-push.yml       ← trigger push task/* → orchestrate
│   └── agent-run.yml          ← workflow réutilisable : lance opencode
├── src/
│   ├── init.mjs               ← crée manifest + branche feature, lance les premières tâches
│   ├── orchestrate.mjs        ← merge, met à jour manifest, route ou crée PR
│   └── agent-launcher.mjs     ← marque in_progress, déclenche agent-run.yml via API
├── params.json.tpl             ← template de référence pour params.json
└── package.json
```

## Ce que fait le LLM (opencode)

Uniquement :
1. Lire `params.json`
2. Créer le fichier demandé avec le contenu demandé
3. Commit + push

Aucune décision de routing, aucune gestion d'état, aucune logique d'orchestration.
