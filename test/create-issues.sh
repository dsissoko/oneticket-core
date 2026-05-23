#!/usr/bin/env bash
# test/create-issues.sh
#
# Lance les tests du workflow oneticket-core.
#
# Trois modes :
#
#   fanout [N]   — N issues de test FAN-OUT avec fixture (graphe A/B/C/D/E/F)
#                  Teste le flow complet : manifest fixture → FAN-OUT → GATHER → PR
#                  (mode historique, conservé pour régression)
#
#   reply        — 1 issue : agent /po répond librement sans produire de manifest
#                  Valide : Comment Dispatcher → agent-dispatch → Agent Execute → réponse
#
#   decompose    — 1 issue : agent /po produit un manifest et déclenche le FAN-OUT
#                  Valide : Comment Dispatcher → Agent Execute → manifest → Workflow Scatter
#                           → init.mjs MANIFEST_ALREADY_PRESENT → FAN-OUT → GATHER → PR
#
#   all          — enchaîne reply + decompose
#
# Prérequis :
#   - gh CLI installé et authentifié
#
# Usage :
#   ./test/create-issues.sh [MODE] [REPO] [N]
#   ./test/create-issues.sh fanout dsissoko/oneticket-core 5
#   ./test/create-issues.sh reply
#   ./test/create-issues.sh decompose
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
# Issues avec corps vide → init.mjs utilise la fixture tasks-graph.json
# Déclenché par /start (mode bootstrap direct, sans agent)
# ---------------------------------------------------------------------------

run_fanout() {
  echo "=== MODE FANOUT — $N issue(s) ==="
  echo "Graphe : A,B,C en parallèle → D(A+B) → E / C → F"
  echo ""

  for i in $(seq 1 "$N"); do
    URL=$(create_issue "[TEST-FANOUT] Issue $i — graphe A/B/C/D/E/F" "")
    NUM=$(issue_number "$URL")
    post_comment "$NUM" "/start"
    echo "Issue #$NUM lancée ($URL)"
  done

  echo ""
  echo "$N issue(s) FAN-OUT lancée(s)."
}

# ---------------------------------------------------------------------------
# Mode : reply
# Agent /po reçoit une question simple → répond sans produire de manifest
# Valide le flow : Comment Dispatcher → agent-dispatch → Agent Execute → réponse
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
# Agent /po reçoit une demande de réalisation → produit un manifest → FAN-OUT
# Valide le flow complet bout-en-bout via Workflow Scatter
# ---------------------------------------------------------------------------

run_decompose() {
  echo "=== MODE DECOMPOSE — agent /po avec manifest ==="
  echo ""

  URL=$(create_issue \
    "[TEST-DECOMPOSE] Agent PO — décomposition en tâches" \
    "Créer 3 fichiers texte simples : hello.txt (contenu: Hello World), world.txt (contenu: World), readme.txt (contenu: README).")
  NUM=$(issue_number "$URL")
  post_comment "$NUM" "/po peux-tu décomposer cette demande en tâches et produire le manifest ?"
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : manifest produit sur feature/issue-$NUM → Workflow Scatter → FAN-OUT → PR."
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
  all)
    run_reply
    echo ""
    run_decompose
    ;;
  *)
    echo "Mode inconnu : $MODE"
    echo "Usage : $0 [fanout|reply|decompose|all] [REPO] [N]"
    exit 1
    ;;
esac
