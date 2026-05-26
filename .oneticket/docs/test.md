# Test

Trigger test for docs-site-github-pages.yml workflow.

## Last fixes applied

- `actions/checkout@v4` added to `deploy-preview` and `deploy-prod` jobs — JamesIves requires a git context
- `branches: '**'` added to push trigger — workflow was not firing on branch pushes (tags-only filter)
- `npm ci` added to `resolve-context` job — js-yaml was missing before print-config.mjs
- slug `framework` for `oneticket-core` — avoids `/oneticket-core/oneticket-core/` in URL → `https://dsissoko.github.io/oneticket-core/framework/docs/`
- GitHub Pages source fixed: Deploy from branch gh-pages / (root)
