#!/usr/bin/env bash
# bootstrap.sh — OneTicket app bootstrap helper
#
# Usage:
#   ./bootstrap.sh prepare <app> <model>        # update config.yml + create PR
#   ./bootstrap.sh <app> doc                    # create doc ticket
#   ./bootstrap.sh <app> doc <comment-id>       # post comment on doc ticket
#   ./bootstrap.sh <app> dev                    # create dev ticket
#   ./bootstrap.sh <app> dev <comment-id>       # post comment on dev ticket
#
# Examples:
#   ./bootstrap.sh prepare spaceinvaders opencode/gpt-5.3-codex
#   ./bootstrap.sh spaceinvaders doc
#   ./bootstrap.sh spaceinvaders doc init-doc
#   ./bootstrap.sh spaceinvaders doc po-request
#   ./bootstrap.sh spaceinvaders dev
#   ./bootstrap.sh spaceinvaders dev init-appshell
#   ./bootstrap.sh spaceinvaders dev leaddev-request

set -euo pipefail

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DATA_DIR="${SCRIPT_DIR}/data"
STATE_DIR="${SCRIPT_DIR}/state"
CONFIG_YML="${REPO_ROOT}/.oneticket/config.yml"

mkdir -p "${STATE_DIR}"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
die() { echo "❌ $*" >&2; exit 1; }
info() { echo "ℹ️  $*"; }
ok() { echo "✅ $*"; }
warn() { echo "⚠️  $*"; }

require_cmd() {
  for cmd in "$@"; do
    command -v "${cmd}" >/dev/null 2>&1 || die "'${cmd}' is required but not installed."
  done
}

require_cmd gh jq python3 git

# ---------------------------------------------------------------------------
# State helpers
# ---------------------------------------------------------------------------
state_file() { echo "${STATE_DIR}/${1}.json"; }

state_read() {
  local app="$1" key="$2"
  local file; file="$(state_file "${app}")"
  if [[ -f "${file}" ]]; then
    jq -r "${key} // \"null\"" "${file}"
  else
    echo "null"
  fi
}

state_write() {
  local app="$1" update="$2"
  local file; file="$(state_file "${app}")"
  local current="{}"
  [[ -f "${file}" ]] && current="$(cat "${file}")"
  echo "${current}" | jq ". * ${update}" > "${file}"
}

state_append_comment() {
  local app="$1" ticket="$2" comment_id="$3"
  local file; file="$(state_file "${app}")"
  local current="{}"
  [[ -f "${file}" ]] && current="$(cat "${file}")"
  echo "${current}" | jq ".${ticket}.comments_posted += [\"${comment_id}\"] | .${ticket}.comments_posted |= unique" > "${file}"
}

comment_already_posted() {
  local app="$1" ticket="$2" comment_id="$3"
  local file; file="$(state_file "${app}")"
  [[ -f "${file}" ]] || return 1
  local found; found="$(jq -r ".${ticket}.comments_posted // [] | index(\"${comment_id}\") != null" "${file}")"
  [[ "${found}" == "true" ]]
}

# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------
data_file() { echo "${DATA_DIR}/${1}.json"; }

require_data() {
  local app="$1"
  local file; file="$(data_file "${app}")"
  [[ -f "${file}" ]] || die "No data file found for app '${app}' at ${file}"
}

get_repo() {
  local app="$1"
  jq -r '.repo' "$(data_file "${app}")"
}

get_ticket_title() {
  local app="$1" ticket="$2"
  jq -r ".tickets.${ticket}.title" "$(data_file "${app}")"
}

get_ticket_body() {
  local app="$1" ticket="$2"
  local body_file; body_file="$(jq -r ".tickets.${ticket}.body_file" "$(data_file "${app}")")"
  local full_path="${DATA_DIR}/../${body_file}"
  [[ -f "${full_path}" ]] || die "Body file not found: ${full_path}"
  cat "${full_path}"
}

get_comment_text() {
  local app="$1" ticket="$2" comment_id="$3"
  local text; text="$(jq -r ".tickets.${ticket}.comments[\"${comment_id}\"] // \"null\"" "$(data_file "${app}")")"
  [[ "${text}" == "null" ]] && die "Unknown comment-id '${comment_id}' for ticket '${ticket}' in app '${app}'"
  echo "${text}"
}

# ---------------------------------------------------------------------------
# Command: prepare
# ---------------------------------------------------------------------------
cmd_prepare() {
  local app="$1" model="$2"
  require_data "${app}"

  local expected_project; expected_project="$(jq -r '.config.current_project' "$(data_file "${app}")")"
  local current_project; current_project="$(yq -r '.current_project' "${CONFIG_YML}")"
  local current_model; current_model="$(yq -r '.agent_config.opencode.model' "${CONFIG_YML}")"

  info "current_project : ${current_project} → ${expected_project}"
  info "model           : ${current_model} → ${model}"

  if [[ "${current_project}" == "${expected_project}" && "${current_model}" == "${model}" ]]; then
    ok "config.yml already up to date — nothing to do"
    return 0
  fi

  local branch="chore/bootstrap-${app}"
  cd "${REPO_ROOT}"

  # Checkout or create branch
  if git show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
    git checkout "${branch}" 2>/dev/null || git checkout -b "${branch}" "origin/${branch}"
  else
    git checkout main
    git pull origin main
    git checkout -b "${branch}"
  fi

  # Update current_project — line-level substitution preserving comments and structure
  if [[ "${current_project}" != "${expected_project}" ]]; then
    python3 - "${CONFIG_YML}" "current_project" "${expected_project}" <<'PYEOF'
import sys, re
path, key, value = sys.argv[1], sys.argv[2], sys.argv[3]
lines = open(path).readlines()
out = []
for line in lines:
    if re.match(rf'^{key}:\s', line):
        line = f'{key}: {value}\n'
    out.append(line)
open(path, 'w').writelines(out)
PYEOF
    info "Updated current_project: ${current_project} → ${expected_project}"
  fi

  # Update model — targets only the active (non-commented) model line under agent_config.opencode
  if [[ "${current_model}" != "${model}" ]]; then
    python3 - "${CONFIG_YML}" "${current_model}" "${model}" <<'PYEOF'
import sys, re
path, old, new = sys.argv[1], sys.argv[2], sys.argv[3]
lines = open(path).readlines()
out = []
replaced = False
for line in lines:
    if not replaced and not line.lstrip().startswith('#') \
       and re.match(r'^\s+model:\s+' + re.escape(old), line):
        line = line.replace(old, new, 1)
        replaced = True
    out.append(line)
open(path, 'w').writelines(out)
PYEOF
    info "Updated model: ${current_model} → ${model}"
  fi

  git add "${CONFIG_YML}"
  git commit -m "chore(config): bootstrap ${app} — current_project=${expected_project}, model=${model}"
  git push -u origin "${branch}"

  local repo; repo="$(get_repo "${app}")"
  local pr_url; pr_url="$(gh pr create \
    --repo "${repo}" \
    --title "chore(config): bootstrap ${app} — current_project + model" \
    --body "## Summary
- \`current_project\`: ${current_project} → ${expected_project}
- \`model\`: ${current_model} → ${model}
" \
    --base main \
    --head "${branch}")"

  local pr_number; pr_number="$(echo "${pr_url}" | grep -o '[0-9]*$')"
  ok "PR created: ${pr_url}"

  state_write "${app}" "{\"prepare\": {\"pr\": ${pr_number}, \"branch\": \"${branch}\"}}"
  ok "State saved → state/${app}.json"

  git checkout main
}

# ---------------------------------------------------------------------------
# Command: create ticket
# ---------------------------------------------------------------------------
cmd_create_ticket() {
  local app="$1" ticket="$2"
  require_data "${app}"

  # Check if already created
  local existing; existing="$(state_read "${app}" ".${ticket}.issue")"
  if [[ "${existing}" != "null" ]]; then
    warn "Ticket '${ticket}' already created — issue #${existing}"
    warn "Use './bootstrap.sh ${app} ${ticket} <comment-id>' to post a comment"
    return 0
  fi

  local repo; repo="$(get_repo "${app}")"
  local title; title="$(get_ticket_title "${app}" "${ticket}")"
  local body; body="$(get_ticket_body "${app}" "${ticket}")"

  info "Creating ticket '${ticket}' for app '${app}'..."
  local issue_url; issue_url="$(gh issue create \
    --repo "${repo}" \
    --title "${title}" \
    --body "${body}")"

  local issue_number; issue_number="$(echo "${issue_url}" | grep -o '[0-9]*$')"
  ok "Issue #${issue_number} created: ${issue_url}"

  state_write "${app}" "{\"${ticket}\": {\"issue\": ${issue_number}, \"comments_posted\": []}}"
  ok "State saved → state/${app}.json"
}

# ---------------------------------------------------------------------------
# Command: post comment
# ---------------------------------------------------------------------------
cmd_post_comment() {
  local app="$1" ticket="$2" comment_id="$3" yes="${4:-}"
  require_data "${app}"

  # Get issue number from state
  local issue_number; issue_number="$(state_read "${app}" ".${ticket}.issue")"
  [[ "${issue_number}" == "null" ]] && die "No issue found for ticket '${ticket}'. Run './bootstrap.sh ${app} ${ticket}' first."

  # Warn if already posted
  if comment_already_posted "${app}" "${ticket}" "${comment_id}"; then
    warn "Comment '${comment_id}' already posted on issue #${issue_number}"
    if [[ "${yes}" != "--yes" ]]; then
      read -r -p "Post again? [y/N] " confirm
      [[ "${confirm}" =~ ^[Yy]$ ]] || { info "Skipped."; return 0; }
    fi
  fi

  local repo; repo="$(get_repo "${app}")"
  local text; text="$(get_comment_text "${app}" "${ticket}" "${comment_id}")"

  # Stop before any agent invocation (text starts with @)
  if [[ "${text}" == @* ]] && [[ "${yes}" != "--yes" ]]; then
    echo ""
    echo "📋 Comment to post on issue #${issue_number}:"
    echo "─────────────────────────────────────────────"
    echo "${text}"
    echo "─────────────────────────────────────────────"
    read -r -p "Post this agent invocation? [y/N] " confirm
    [[ "${confirm}" =~ ^[Yy]$ ]] || { info "Skipped."; return 0; }
  fi

  info "Posting comment '${comment_id}' on issue #${issue_number}..."
  gh issue comment "${issue_number}" \
    --repo "${repo}" \
    --body "${text}"

  state_append_comment "${app}" "${ticket}" "${comment_id}"
  ok "Comment '${comment_id}' posted — state updated"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
usage() {
  echo "Usage:"
  echo "  ./bootstrap.sh prepare <app> <model>             — update config.yml + create PR"
  echo "  ./bootstrap.sh <app> doc                         — create doc ticket"
  echo "  ./bootstrap.sh <app> doc <comment-id> [--yes]   — post comment on doc ticket"
  echo "  ./bootstrap.sh <app> dev                         — create dev ticket"
  echo "  ./bootstrap.sh <app> dev <comment-id> [--yes]   — post comment on dev ticket"
  exit 1
}

[[ $# -lt 2 ]] && usage

if [[ "$1" == "prepare" ]]; then
  [[ $# -lt 3 ]] && die "Usage: ./bootstrap.sh prepare <app> <model>"
  cmd_prepare "$2" "$3"
else
  app="$1"
  ticket="$2"
  [[ "${ticket}" == "doc" || "${ticket}" == "dev" ]] || die "Ticket must be 'doc' or 'dev', got '${ticket}'"

  if [[ $# -eq 2 ]]; then
    cmd_create_ticket "${app}" "${ticket}"
  elif [[ $# -eq 3 ]]; then
    cmd_post_comment "${app}" "${ticket}" "$3"
  elif [[ $# -eq 4 ]]; then
    cmd_post_comment "${app}" "${ticket}" "$3" "$4"
  else
    usage
  fi
fi
