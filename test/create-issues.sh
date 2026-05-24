#!/usr/bin/env bash
# test/create-issues.sh
#
# Lance les tests du workflow oneticket-core.
#
# Modes :
#
#   fanout [N]   — N issues de test FAN-OUT avec fixture (graphe A/B/C/D/E/F)
#                  Teste le flow complet : manifest fixture → FAN-OUT → GATHER → PR
#                  (mode historique, conservé pour régression)
#
#   reply        — 1 issue : agent /po répond librement sans produire de manifest
#                  Valide : Comment Dispatcher → agent-dispatch → Agent Execute → réponse
#
#   decompose    — 1 issue : agent /po produit un manifest basique (3 fichiers texte)
#                  Valide : Comment Dispatcher → Agent Execute → manifest → FAN-OUT → PR
#
#   breakout     — 1 issue : agent /po décompose un jeu Breakout en épics + US
#                  Teste la décomposition d'une demande riche avec graphe de dépendances
#
#   all          — enchaîne reply + decompose + breakout
#
# Prérequis :
#   - gh CLI installé et authentifié
#
# Usage :
#   ./test/create-issues.sh [MODE] [REPO] [N]
#   ./test/create-issues.sh fanout dsissoko/oneticket-core 5
#   ./test/create-issues.sh reply
#   ./test/create-issues.sh decompose
#   ./test/create-issues.sh breakout
#   ./test/create-issues.sh all
#
# Par défaut : MODE=fanout, REPO=dsissoko/oneticket-core, N=1

set -euo pipefail

MODE="${1:-fanout}"
REPO="${2:-dsissoko/oneticket-core}"
N="${3:-1}"

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
# Mode : fanout
# L'agent /po reçoit une demande explicite d'utiliser la fixture de test.
# Pas de /start — tout passe par le pipeline agent standard.
# ---------------------------------------------------------------------------

run_fanout() {
  echo "=== MODE FANOUT — $N issue(s) ==="
  echo "Graphe fixture : A,B,C en parallèle → D(A+B) → E / C → F"
  echo ""

  for i in $(seq 1 "$N"); do
    URL=$(create_issue "[TEST-FANOUT] Issue $i — graphe A/B/C/D/E/F" "")
    NUM=$(issue_number "$URL")
    post_comment "$NUM" "/po utilise le fichier test/fixtures/tasks-graph.json disponible dans le repo pour créer le manifest et lancer le pipeline de tâches."
    echo "Issue #$NUM lancée ($URL)"
  done

  echo ""
  echo "$N issue(s) FAN-OUT lancée(s)."
}

# ---------------------------------------------------------------------------
# Mode : reply
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
# Mode : decompose
# ---------------------------------------------------------------------------

run_decompose() {
  echo "=== MODE DECOMPOSE — agent /po avec manifest basique ==="
  echo ""

  URL=$(create_issue \
    "[TEST-DECOMPOSE] Agent PO — décomposition en tâches" \
    "Créer 3 fichiers texte simples : hello.txt (contenu: Hello World), world.txt (contenu: World), readme.txt (contenu: README).")
  NUM=$(issue_number "$URL")
  post_comment "$NUM" "/po peux-tu décomposer cette demande en tâches et produire le manifest ?"
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : manifest produit sur feature/issue-$NUM → FAN-OUT → PR."
}

# ---------------------------------------------------------------------------
# Mode : breakout
# Agent /po décompose un jeu Breakout en épics + US avec graphe de dépendances
# Teste la décomposition d'une demande riche (max 5 épics, max 5 US par épic)
# Les US dépendent de leur épic parente, les épics peuvent être parallélisées
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
  echo "Attendu : manifest avec épics + US → graphe de dépendances → FAN-OUT → fichiers .md → PR."
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------

case "$MODE" in
  fanout)
    run_fanout
    ;;
  reply)
    run_reply
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
    run_decompose
    echo ""
    run_breakout
    ;;
  *)
    echo "Mode inconnu : $MODE"
    echo "Usage : $0 [fanout|reply|decompose|breakout|all] [REPO] [N]"
    exit 1
    ;;
esac
