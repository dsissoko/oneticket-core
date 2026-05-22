#!/usr/bin/env bash
# test/create-issues.sh
#
# Crée N issues de test sur le repo GitHub pour valider le workflow complet.
# Chaque issue déclenche un /start qui lance le workflow d'orchestration.
#
# Prérequis :
#   - gh CLI installé et authentifié (gh auth login)
#   - Variable REPO définie ou passée en argument (ex: dsissoko/oneticket-core)
#
# Usage :
#   ./test/create-issues.sh [REPO] [N]
#   ./test/create-issues.sh dsissoko/oneticket-core 5
#
# Par défaut : REPO=dsissoko/oneticket-core, N=5

set -euo pipefail

REPO="${1:-dsissoko/oneticket-core}"
N="${2:-5}"

echo "Création de $N issues de test sur $REPO"
echo "Graphe de tâches : A,B,C en parallèle → D(fan-in A+B) → E / C → F"
echo ""

for i in $(seq 1 "$N"); do
  TITLE="[POC] Test issue $i — graphe A/B/C/D/E/F"

  # Corps vide intentionnellement — init.mjs utilisera le fallback tasks-graph.json
  # C'est le comportement qu'on veut valider : pas besoin de JSON dans l'issue
  ISSUE_URL=$(gh issue create \
    --repo "$REPO" \
    --title "$TITLE" \
    --body "" \
    2>&1 | tail -1)

  echo "Issue $i créée : $ISSUE_URL"
done

echo ""
echo "$N issues créées."
echo "Pour déclencher le workflow sur chaque issue, postez un commentaire /start"
echo "ou utilisez le script suivant pour automatiser :"
echo ""
echo "  gh issue list --repo $REPO --label '' --state open --json number,title \\"
echo "    | jq -r '.[] | select(.title | startswith(\"[POC]\")) | .number' \\"
echo "    | xargs -I{} gh issue comment {} --repo $REPO --body '/start'"
