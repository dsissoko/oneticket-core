---
name: oneticket-skills-health-check
description: Check the integrity and source availability of all skills installed in skills/.
---
# skills-health-check

Check the integrity and source availability of all skills installed in `skills/`.

## When to use

When the user asks to verify, audit, or check the health of installed skills.
Also useful after adding new skills or before a release.

## What it checks

1. **Filesystem integrity** — every skill directory has both `SKILL.md` and `SOURCE.md`
2. **Source availability** — every external skill (non-local) responds HTTP 200 at its source URL

## Steps

### Step 1 — Filesystem check

Run for all skill directories recursively:

```bash
for d in .agents/skills/*/; do
  skill=$(basename "$d")
  [ -f "$d/SKILL.md" ] && s_ok="SKILL.md ✓" || s_ok="SKILL.md ✗"
  [ -f "$d/SOURCE.md" ] && src_ok="SOURCE.md ✓" || src_ok="SOURCE.md ✗"
  echo "local/$skill : $s_ok | $src_ok"
done

for d in skills/*/*/; do
  source=$(basename $(dirname "$d"))
  skill=$(basename "$d")
  [ "$source" = "local" ] && continue
  [ -f "$d/SKILL.md" ] && s_ok="SKILL.md ✓" || s_ok="SKILL.md ✗"
  [ -f "$d/SOURCE.md" ] && src_ok="SOURCE.md ✓" || src_ok="SOURCE.md ✗"
  echo "$source/$skill : $s_ok | $src_ok"
done
```

### Step 2 — Source availability check

Read each external skill's `SOURCE.md` to extract the source URL and `original_path`.
Then for each, run:

```bash
curl -s -o /dev/null -w "%{http_code} <skill-name>\n" <resolved-raw-url>
```

**URL resolution rules by host:**

| Host | Raw URL pattern |
|------|----------------|
| `github.com/<owner>/<repo>` | `https://raw.githubusercontent.com/<owner>/<repo>/main/<original_path>/SKILL.md` |
| `skillkit.io` | use source URL directly |
| `skillsmp.com` | use source URL directly |
| `local` | skip — no external check needed |

Report each result as `200 ✓` or `<code> ✗`.

### Step 3 — Summary report

Produce a clear summary:

```
## Skills Health Check — <date>

### Filesystem
local/discover-skills        : SKILL.md ✓ | SOURCE.md ✓
local/spec-to-site           : SKILL.md ✓ | SOURCE.md ✓
...

### Source availability
vercel-labs/best-practices-for-react : 200 ✓
anthropics/frontend-design          : 200 ✓
openclaw/msw-for-js-ts              : 200 ✓
...

### Result
✓ All X skills healthy
— or —
✗ <N> issue(s) found: [list]
```

## On failure

If a filesystem check fails (`SKILL.md ✗` or `SOURCE.md ✗`):
- report the missing file explicitly
- do not attempt to recreate it automatically — ask the user

If a source check fails (non-200):
- report the URL that failed
- propose either: re-download from the corrected URL, or move to `local/` if source is permanently lost
- do not modify any file without explicit user confirmation
