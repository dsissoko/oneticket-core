---
title: 'Runbook — Auth0 Setup & User Management'
---

# Runbook — Auth0 Setup & User Management

## 1. Auth0 Tenant Setup

- Create an Auth0 tenant at [auth0.com](https://auth0.com) (or use an existing one).
- Note the **tenant domain** — it will be used as `VITE_AUTH0_DOMAIN` in the frontend environment.
  - Format: `your-tenant.auth0.com` (or `your-tenant.region.auth0.com` for regional tenants).

## 2. Application Registration

- Navigate to **Auth0 Dashboard → Applications → Applications → Create Application**.
- Create a **Single Page Application (SPA)**.
- Note the **Client ID** — it will be used as `VITE_AUTH0_CLIENT_ID`.
- Configure the following settings under the **Settings** tab:

  | Setting | Development | Production |
  |---|---|---|
  | Allowed Callback URLs | `http://localhost:5173` | `https://<your-domain>/` |
  | Allowed Logout URLs | `http://localhost:5173` | `https://<your-domain>/` |
  | Allowed Web Origins | `http://localhost:5173` | `https://<your-domain>` |

- Set **Token Endpoint Authentication Method** to `None` (PKCE is the default and required for SPAs).

## 3. Environment Variables

Create a `.env.local` file at the project root with the following variables:

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

- Add `.env.example` to version control with placeholder values:

  ```env
  VITE_AUTH0_DOMAIN=<your-tenant>.auth0.com
  VITE_AUTH0_CLIENT_ID=<your-client-id>
  ```

- **Never commit `.env.local`** — it is excluded via `.gitignore`.

## 4. Déploiement des variables d'environnement

Les variables `VITE_AUTH0_DOMAIN` et `VITE_AUTH0_CLIENT_ID` sont **baked dans le bundle JavaScript par Vite au moment du build**. Elles doivent donc être disponibles à la compilation, pas seulement à l'exécution.

### Développement local

`.env.local` suffit — Vite le lit automatiquement au démarrage. Ce fichier ne doit pas être commité.

### Repo privé — GitHub Pages

Le `CLIENT_ID` Auth0 d'une SPA est une donnée semi-publique : il est de toute façon exposé dans le bundle JS livré au navigateur. Dans un **repo privé**, il est acceptable de commiter un fichier `.env.production` avec les valeurs réelles :

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

Vite lit `.env.production` automatiquement lors du `npm run build` en CI — aucune configuration supplémentaire du workflow n'est nécessaire.

> **Important :** Les SPAs Auth0 n'utilisent pas de `CLIENT_SECRET` (PKCE flow). Seuls `DOMAIN` et `CLIENT_ID` sont concernés ici. Ne jamais commiter un `CLIENT_SECRET`.

### Repo public — GitHub Pages

Dans un repo public, les valeurs seraient visibles dans l'historique git — ce qui facilite le phishing même si `CLIENT_ID` n'est pas un secret technique. Utiliser les **secrets GitHub Actions** :

1. `Settings → Secrets and variables → Actions → New repository secret`
2. Créer `VITE_AUTH0_DOMAIN` et `VITE_AUTH0_CLIENT_ID`
3. Les injecter dans le job `build-app` du workflow `docs-site-github-pages.yml` :

```yaml
- name: Build
  working-directory: ${{ needs.resolve-context.outputs.app_path }}
  run: npm run build
  env:
    VITE_BASE_PATH: ...
    VITE_AUTH0_DOMAIN: ${{ secrets.VITE_AUTH0_DOMAIN }}
    VITE_AUTH0_CLIENT_ID: ${{ secrets.VITE_AUTH0_CLIENT_ID }}
```

## 5. User Declaration

- Users can be created via **Auth0 Dashboard → User Management → Users → Create User**.
- **Required fields:**
  - `email` — the user's email address.
  - `password` — set directly or invite via email.
- **Optional fields:**
  - `name` — display name.
  - `picture` — avatar URL.
  - `user_metadata` / `app_metadata` — custom key-value pairs.
- **For team setups:** use **Auth0 Organizations** to manage multiple teams and isolate user pools.

## 6. Auth0 Actions (Optional)

Use Auth0 Actions to inject custom claims into the ID token (e.g., roles, permissions).

### Post-login Action example

```js
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://your-app.example.com';

  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

- Navigate to **Auth0 Dashboard → Actions → Flows → Login** to create and attach the action.
- Custom claims **must** use a namespaced identifier to avoid collisions with Auth0 reserved claims.

## 7. Troubleshooting

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `Invalid callback URL` | Allowed Callback URLs do not match the request exactly | Verify the URL in Auth0 Dashboard matches the frontend callback path, including protocol and port |
| `Missing client_id` | `VITE_AUTH0_CLIENT_ID` is not set or misspelled | Check `.env.local` and ensure the variable is prefixed with `VITE_` |
| `Login required` loop | Allowed Web Origins or CORS settings are misconfigured | Add the frontend origin to Allowed Web Origins |
| Token expiration | Access token expires and no refresh mechanism is configured | Enable **Refresh Token Rotation** in Auth0 Dashboard → Applications → Settings → Advanced |
| `returnTo` mismatch on logout | Allowed Logout URLs does not include the exact URL used | Add the exact URL (including trailing slash) to Allowed Logout URLs |

## 8. Security Checklist

- [ ] PKCE enabled (default for SPA — `@auth0/auth0-react` v2.x)
- [ ] No client secret in frontend code
- [ ] Allowed URLs restricted to known domains
- [ ] Refresh token rotation enabled (if using refresh tokens)
- [ ] Custom claims use namespaced identifiers
- [ ] `.env.local` is gitignored
- [ ] Repo privé : `.env.production` commité avec `DOMAIN` et `CLIENT_ID` uniquement (pas de `CLIENT_SECRET`)
- [ ] Repo public : `VITE_AUTH0_DOMAIN` et `VITE_AUTH0_CLIENT_ID` injectés via secrets GitHub Actions (jamais commitées)
