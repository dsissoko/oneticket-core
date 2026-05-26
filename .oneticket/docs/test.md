# Test

Trigger test for docs-site-github-pages.yml workflow.

## Last fixes applied

- `actions/checkout@v4` added to `deploy-preview` and `deploy-prod` jobs — JamesIves requires a git context
- `branches: '**'` added to push trigger — workflow was not firing on branch pushes (tags-only filter)
- `npm ci` added to `resolve-context` job — js-yaml was missing before print-config.mjs
