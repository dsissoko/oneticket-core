#!/usr/bin/env bash
# test/create-issues.sh
#
# Lance les tests du workflow oneticket-core.
#
# Modes :
#
#   reply      — agent /po répond sans produire de manifest
#                Valide : Comment Dispatcher → agent-dispatch → Agent Execute → réponse
#
#   manifest   — body de l'issue = manifest JSON complet
#                L'agent /po l'écrit tel quel → FAN-OUT → GATHER → PR
#                Valide le pipeline avec un graphe connu et prédictible
#                Graphe de référence : A,B,C (parallèles) → D(A+B) → E / C → F
#
#   decompose  — body de l'issue = description langage naturel du même graphe
#                L'agent /po décompose et doit produire le même graphe que manifest
#                Valide le flow complet bout-en-bout avec agent
#
#   breakout   — demande riche : jeu Breakout en épics + US
#                Teste la décomposition d'une demande complexe
#
#   all        — enchaîne reply + manifest + decompose + breakout
#
# Prérequis :
#   - gh CLI installé et authentifié
#
# Usage :
#   ./test/create-issues.sh [MODE] [REPO]
#   ./test/create-issues.sh reply
#   ./test/create-issues.sh manifest
#   ./test/create-issues.sh decompose
#   ./test/create-issues.sh breakout
#   ./test/create-issues.sh all
#
# Par défaut : MODE=reply, REPO=dsissoko/oneticket-core

set -euo pipefail

MODE="${1:-reply}"
REPO="${2:-dsissoko/oneticket-core}"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

create_issue() {
  local title="$1"
  local body="$2"
  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    2>&1 | tail -1
}

post_comment() {
  local number="$1"
  local body="$2"
  gh issue comment "$number" --repo "$REPO" --body "$body" > /dev/null
}

issue_number() {
  local url="$1"
  echo "${url##*/}"
}

# ---------------------------------------------------------------------------
# Mode : reply
# Agent /po reçoit une question → répond directement, pas de manifest
# ---------------------------------------------------------------------------

run_reply() {
  echo "=== MODE REPLY — agent /po sans manifest ==="
  echo ""

  URL=$(create_issue \
    "[TEST-REPLY] Agent PO — réponse libre" \
    "Contexte : projet oneticket-core, orchestrateur GitHub-native multi-agents.")
  NUM=$(issue_number "$URL")
  post_comment "$NUM" "/po bonjour, peux-tu te présenter et m'expliquer ce que tu sais faire ?"
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : l'agent répond sur l'issue, aucun manifest produit, aucun FAN-OUT."
}

# ---------------------------------------------------------------------------
# Mode : manifest
# Body de l'issue = manifest JSON complet avec graphe de référence
# L'agent /po l'écrit tel quel → FAN-OUT déterministe
# Graphe : A,B,C (parallèles) → D(dépend A+B) → E(dépend D) / C → F(dépend C)
# ---------------------------------------------------------------------------

run_manifest() {
  echo "=== MODE MANIFEST — graphe de référence injecté directement ==="
  echo ""

  URL=$(create_issue \
    "[TEST-MANIFEST] Pipeline FAN-OUT — graphe A/B/C/D/E/F" \
    "$(cat <<'BODY'
```json
{
  "issue": 0,
  "branch_base": "feature/issue-0",
  "tasks": [
    {"id":"A","branch":"task/issue-0-A","file":"tasks/issue-0/subtask-A.txt","content":"Subtask A completed","depends_on":[],"status":"pending"},
    {"id":"B","branch":"task/issue-0-B","file":"tasks/issue-0/subtask-B.txt","content":"Subtask B completed","depends_on":[],"status":"pending"},
    {"id":"C","branch":"task/issue-0-C","file":"tasks/issue-0/subtask-C.txt","content":"Subtask C completed","depends_on":[],"status":"pending"},
    {"id":"D","branch":"task/issue-0-D","file":"tasks/issue-0/subtask-D.txt","content":"Subtask D completed","depends_on":["A","B"],"status":"pending"},
    {"id":"E","branch":"task/issue-0-E","file":"tasks/issue-0/subtask-E.txt","content":"Subtask E completed","depends_on":["D"],"status":"pending"},
    {"id":"F","branch":"task/issue-0-F","file":"tasks/issue-0/subtask-F.txt","content":"Subtask F completed","depends_on":["C"],"status":"pending"}
  ]
}
```
BODY
)")
  NUM=$(issue_number "$URL")

  # Le manifest dans le body contient issue=0 comme placeholder
  # L'agent doit remplacer 0 par le vrai numéro d'issue
  post_comment "$NUM" "/po le body de cette issue contient un manifest au format exact attendu. Remplace toutes les occurrences de \"issue-0\" par \"issue-${NUM}\" et la valeur du champ \"issue\" par ${NUM}, puis écris le résultat dans tasks/issue-${NUM}/manifest.json. Commit avec le message exact : feat: decompose issue #${NUM}"
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : manifest écrit tel quel → FAN-OUT → 6 subtask-X.txt → PR."
}

# ---------------------------------------------------------------------------
# Mode : decompose
# Body = description langage naturel du même graphe que manifest
# L'agent /po décompose — doit aboutir au même graphe A/B/C→D→E, C→F
# ---------------------------------------------------------------------------

run_decompose() {
  echo "=== MODE DECOMPOSE — agent /po décompose une demande ==="
  echo ""

  URL=$(create_issue \
    "[TEST-DECOMPOSE] Pipeline FAN-OUT — décomposition agent" \
    "Une application avec 6 tâches organisées ainsi :
- A, B, C sont indépendantes et peuvent s'exécuter en parallèle
- D dépend de A et B
- E dépend de D
- F dépend de C
Chaque tâche produit un fichier texte subtask-X.txt (où X est l'id de la tâche) avec le contenu 'Subtask X completed'. Les fichiers sont dans tasks/issue-N/ où N est le numéro de l'issue.")
  NUM=$(issue_number "$URL")
  post_comment "$NUM" "/po décompose cette demande en manifest et lance le pipeline"
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : manifest A/B/C→D→E, C→F → FAN-OUT → 6 subtask-X.txt → PR."
}

# ---------------------------------------------------------------------------
# Mode : breakout
# Demande riche : jeu Breakout en épics + US
# ---------------------------------------------------------------------------

run_breakout() {
  echo "=== MODE BREAKOUT — agent /po décomposition épics + US ==="
  echo ""

  URL=$(create_issue \
    "[TEST-BREAKOUT] Jeu Breakout en JS frontend pur — épics et user stories" \
    "Créer un jeu Breakout complet en JavaScript frontend pur (HTML/CSS/JS vanilla).
Le jeu doit avoir : une raquette contrôlable, des briques destructibles,
une balle avec physique simple, un système de score, un écran de game over
et un écran de victoire.")
  NUM=$(issue_number "$URL")
  post_comment "$NUM" "/po lis le body de cette issue et produis une epic et ses US (max 5 US par epic et max 5 epics). Chaque tâche du manifest génère un fichier .md décrivant une epic ou une US. Les US dépendent de leur epic parente. Concernant les epics : en fonction de tes choix de décomposition tu pourras paralléliser ou pas."
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : manifest épics + US → graphe de dépendances → FAN-OUT → fichiers .md → PR."
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------

case "$MODE" in
  reply)
    run_reply
    ;;
  manifest)
    run_manifest
    ;;
  decompose)
    run_decompose
    ;;
  breakout)
    run_breakout
    ;;
  all)
    run_reply
    echo ""
    run_manifest
    echo ""
    run_decompose
    echo ""
    run_breakout
    ;;
  *)
    echo "Mode inconnu : $MODE"
    echo "Usage : $0 [reply|manifest|decompose|breakout|all] [REPO]"
    exit 1
    ;;
esac
