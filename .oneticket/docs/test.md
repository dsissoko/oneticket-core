# Test

Trigger test for docs-site-github-pages.yml workflow.

## Last fixes applied

- `actions/checkout@v4` added to `deploy-preview` and `deploy-prod` jobs
- `branches: '**'` added to push trigger
- `npm ci` added to `resolve-context` job
- slug `framework` for `oneticket-core`
- GitHub Pages source fixed: Deploy from branch gh-pages / (root)
- `.nojekyll` committed directly on gh-pages root (persisted by JamesIves)
- `clean-exclude: .nojekyll` protects it from future deploys
