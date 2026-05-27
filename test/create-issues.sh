#!/usr/bin/env bash
# test/create-issues.sh
#
# Lance les tests du workflow oneticket-core.
#
# Modes :
#
#   reply      — agent @po répond sans produire de manifest
#                Valide : Comment Dispatcher → agent-dispatch → Agent Execute → réponse
#
#   manifest   — crée l'issue, édite le body avec le manifest exact (bon numéro),
#                poste "@po traite ce manifest"
#                Valide le pipeline FAN-OUT/GATHER de façon déterministe
#                Graphe de référence : A,B,C (parallèles) → D(A+B) → E / C → F
#
#   decompose  — body de l'issue = description langage naturel du même graphe
#                L'agent @po décompose et doit produire le même graphe que manifest
#                Valide le flow complet bout-en-bout avec agent
#
#   breakout   — demande riche : jeu Breakout en épics + US
#                Teste la décomposition d'une demande complexe
#
#   direct    — demande à @po de créer un fichier de test à la racine du dépôt
#                Valide que create-direct-pr.mjs crée bien une PR sans manifest
#
#   parallel   — 2 décompositions simultanées (séquentiel vs parallèle)
#   all        — enchaîne reply + manifest + decompose + parallel + breakout + direct
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
#   ./test/create-issues.sh direct
#   ./test/create-issues.sh parallel
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
# Agent @po reçoit une question → répond directement, pas de manifest
# ---------------------------------------------------------------------------

run_reply() {
  echo "=== MODE REPLY — présentation de chaque agent ==="
  echo ""

  URL=$(create_issue \
    "[TEST-REPLY] Présentation de l'équipe OneTicket" \
    "Contexte : projet oneticket-core, orchestrateur GitHub-native multi-agents.")
  NUM=$(issue_number "$URL")

  post_comment "$NUM" "@po présentes toi et ta team"
  sleep 10
  post_comment "$NUM" "@architect présentes toi et ta team"
  sleep 10
  post_comment "$NUM" "@dev présentes toi et ta team"
  sleep 10
  post_comment "$NUM" "@qa présentes toi et ta team"
  sleep 10
  post_comment "$NUM" "@analyst présentes toi et ta team"
  sleep 10
  post_comment "$NUM" "@leaddev présentes toi et ta team"

  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : chaque agent répond en commentaire avec la bonne équipe, aucun manifest produit, aucun FAN-OUT."
}

# ---------------------------------------------------------------------------
# Mode : manifest
# 1. Créer l'issue
# 2. Éditer le body avec le manifest exact contenant le bon numéro d'issue
# 3. Poster "@po traite ce manifest"
# Valide le pipeline FAN-OUT/GATHER de façon déterministe — sans variabilité LLM
# Graphe : A,B,C (parallèles) → D(dépend A+B) → E(dépend D) / C → F(dépend C)
# ---------------------------------------------------------------------------

run_manifest() {
  echo "=== MODE MANIFEST — graphe de référence injecté directement ==="
  echo ""

  # 1. Créer l'issue avec body placeholder
  URL=$(create_issue \
    "[TEST-MANIFEST] Pipeline FAN-OUT — graphe A/B/C/D/E/F" \
    "Manifest de test — sera mis à jour avec le bon numéro d'issue.")
  NUM=$(issue_number "$URL")

  # 2. Éditer le body avec le manifest contenant le bon numéro
  gh issue edit "$NUM" --repo "$REPO" --body "$(cat <<BODY
\`\`\`json
{
  "issue": ${NUM},
  "branch_base": "feature/issue-${NUM}",
  "tasks": [
    {"id":"A","branch":"task/issue-${NUM}-A","file":".oneticket/tasks/issue-${NUM}/subtask-A.txt","content":"Subtask A completed","depends_on":[],"status":"pending"},
    {"id":"B","branch":"task/issue-${NUM}-B","file":".oneticket/tasks/issue-${NUM}/subtask-B.txt","content":"Subtask B completed","depends_on":[],"status":"pending"},
    {"id":"C","branch":"task/issue-${NUM}-C","file":".oneticket/tasks/issue-${NUM}/subtask-C.txt","content":"Subtask C completed","depends_on":[],"status":"pending"},
    {"id":"D","branch":"task/issue-${NUM}-D","file":".oneticket/tasks/issue-${NUM}/subtask-D.txt","content":"Subtask D completed","depends_on":["A","B"],"status":"pending"},
    {"id":"E","branch":"task/issue-${NUM}-E","file":".oneticket/tasks/issue-${NUM}/subtask-E.txt","content":"Subtask E completed","depends_on":["D"],"status":"pending"},
    {"id":"F","branch":"task/issue-${NUM}-F","file":".oneticket/tasks/issue-${NUM}/subtask-F.txt","content":"Subtask F completed","depends_on":["C"],"status":"pending"}
  ]
}
\`\`\`
BODY
)"

  # 3. Poster le commentaire
  post_comment "$NUM" "@po le body de cette issue contient un manifest JSON. Écris-le tel quel dans .oneticket/tasks/issue-${NUM}/manifest.json et commite avec le message exact : feat: decompose issue #${NUM}"
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : manifest écrit tel quel → FAN-OUT → 6 subtask-X.txt → PR."
}

# ---------------------------------------------------------------------------
# Mode : decompose
# Body = description langage naturel du même graphe que manifest
# L'agent @po décompose — doit aboutir au même graphe A/B/C→D→E, C→F
# ---------------------------------------------------------------------------

run_decompose() {
  echo "=== MODE DECOMPOSE — agent @po décompose une demande ==="
  echo ""

  URL=$(create_issue \
    "[TEST-DECOMPOSE] Pipeline FAN-OUT — décomposition agent" \
    "Une application avec 6 tâches organisées ainsi :
- A, B, C sont indépendantes et peuvent s'exécuter en parallèle
- D dépend de A et B
- E dépend de D
- F dépend de C
Chaque tâche produit un fichier texte subtask-X.txt (où X est l'id de la tâche) avec le contenu 'Subtask X completed'. Les fichiers sont dans .oneticket/tasks/issue-N/ où N est le numéro de l'issue.")
  NUM=$(issue_number "$URL")
  post_comment "$NUM" "@po décompose cette demande en manifest et lance le pipeline"
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : manifest A/B/C→D→E, C→F → FAN-OUT → 6 subtask-X.txt → PR."
}

# ---------------------------------------------------------------------------
# Mode : direct
# Demande à @po de créer un fichier directement (sans manifest)
# Valide que create-direct-pr.mjs génère bien une PR sans FAN-OUT
# ---------------------------------------------------------------------------

run_direct() {
  echo "=== MODE DIRECT — @po crée un fichier sans manifest → PR attendue ==="
  echo ""

  URL=$(create_issue \
    "[TEST-DIRECT] Création de fichier sans manifest — PR directe" \
    "Test de validation du pipeline create-direct-pr.")
  NUM=$(issue_number "$URL")
  post_comment "$NUM" "@po crée le fichier test/direct-test-${NUM}.md à la racine du dépôt avec le contenu exactement : 'direct PR test for issue #${NUM}'. Commite et pushe uniquement ce fichier."
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : fichier créé + commité + pushé par @po, aucun manifest, PR créée automatiquement par create-direct-pr.mjs."
}

# ---------------------------------------------------------------------------
# Mode : breakout
# Demande riche : jeu Breakout en épics + US
# ---------------------------------------------------------------------------

run_breakout() {
  echo "=== MODE BREAKOUT — agent @po initialisation base de connaissance ==="
  echo ""

  URL=$(create_issue \
    "[TEST-BREAKOUT] Jeu Breakout en JS frontend pur — base de connaissance" \
    "Breakout est un jeu arcade frontend en JavaScript vanilla (HTML/CSS/JS, aucune dépendance externe).

L'aire de jeu contient un mur de briques organisé sur 5 lignes. Une balle rebondit sur les murs, le plafond et la raquette. Le joueur dispose de 3 vies ; il en perd une à chaque fois que la balle atteint le bas de l'écran. La partie se termine soit par épuisement des vies (game over), soit par destruction de toutes les briques (victoire).

La raquette se déplace exclusivement avec les flèches gauche et droite du clavier. La souris est réservée à la navigation dans les menus de l'application (démarrer, rejouer, quitter).

La vitesse de la balle est réglable via un slider accessible depuis le menu, avec une plage allant de très lente à très rapide. Il n'y a pas de système de niveaux ni de progression pour l'instant.")
  NUM=$(issue_number "$URL")
  post_comment "$NUM" "@po ce projet n'a pas encore de base de connaissance. À partir de la description de l'application ci-dessus, initialise la base de connaissance du projet."
  echo "Issue #$NUM lancée ($URL)"
  echo ""
  echo "Attendu : base de connaissance initialisée (product-spec, architecture, epic-0) → PR."
}

# ---------------------------------------------------------------------------
# Mode : parallel
# 2 issues lancées simultanément avec des graphes différents
# Issue 1 : A → B → C (séquence pure)
# Issue 2 : A, B (parallèles) → C (dépend de A et B)
# Valide que le pipeline ne mélange pas les branches et manifests entre issues
# ---------------------------------------------------------------------------

run_parallel() {
  echo "=== MODE PARALLEL — 2 décompositions simultanées ==="
  echo ""

  # Issue 1 : graphe séquentiel A → B → C
  URL1=$(create_issue \
    "[TEST-PARALLEL-1] Pipeline séquentiel A→B→C" \
    "Créer 3 fichiers texte en séquence :
- Tâche A : crée le fichier output/step-A.txt avec le contenu 'Step A done'
- Tâche B : crée le fichier output/step-B.txt avec le contenu 'Step B done' (dépend de A)
- Tâche C : crée le fichier output/step-C.txt avec le contenu 'Step C done' (dépend de B)
Les 3 tâches doivent être exécutées dans cet ordre strict.")
  NUM1=$(issue_number "$URL1")
  post_comment "$NUM1" "@po décompose cette demande en manifest avec les 3 tâches dans l'ordre séquentiel A→B→C et lance le pipeline"
  echo "Issue #$NUM1 lancée ($URL1)"

  # Issue 2 : graphe avec parallélisme — lancée immédiatement, sans attendre
  URL2=$(create_issue \
    "[TEST-PARALLEL-2] Pipeline parallèle A+B→C" \
    "Créer 3 fichiers texte avec du parallélisme :
- Tâche A : crée le fichier output/result-A.txt avec le contenu 'Result A done' (indépendante)
- Tâche B : crée le fichier output/result-B.txt avec le contenu 'Result B done' (indépendante)
- Tâche C : crée le fichier output/result-C.txt avec le contenu 'Result C done' (dépend de A ET de B)
A et B peuvent s'exécuter en parallèle. C attend que A et B soient terminées.")
  NUM2=$(issue_number "$URL2")
  post_comment "$NUM2" "@po décompose cette demande en manifest avec A et B en parallèle et C dépendant de A et B, puis lance le pipeline"
  echo "Issue #$NUM2 lancée ($URL2)"
  echo ""
  echo "Attendu : 2 pipelines indépendants → 2 PRs distinctes, aucun croisement de branches."
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
  direct)
    run_direct
    ;;
  breakout)
    run_breakout
    ;;
  parallel)
    run_parallel
    ;;
  all)
    run_reply
    echo ""
    run_manifest
    echo ""
    run_decompose
    echo ""
    run_parallel
    echo ""
    run_breakout
    echo ""
    run_direct
    ;;
  *)
    echo "Mode inconnu : $MODE"
    echo "Usage : $0 [reply|manifest|decompose|direct|breakout|parallel|all] [REPO]"
    exit 1
    ;;
esac
