# US-005 — Configurer styling avec Tailwind + design tokens + thème light/dark

## Story

En tant que développeur setup AppShell,
Je veux que le système de styling soit complètement configuré avec Tailwind, design tokens et thème réactif,
Afin que tous les écrans et composants héritent d'un système de design cohérent sans inline styles.

## Expected Behavior

### 1. CSS Custom Properties (globals.css)
- `globals.css` définit des CSS custom properties pour `:root` (light mode)
- `:root` contient au minimum : `--background`, `--foreground`, `--accent` (+ spacing, typography si nécessaire)
- `.dark` selecteur override toutes les variables pour dark mode
- Pas d'inline `style` attributes dans le code
- Variables consommées par Tailwind config via `var(--custom-property)`

### 2. Tailwind Configuration
- `tailwind.config.ts` étend le thème avec les variables CSS custom
- Les colors sont mappées via `var(--background)`, `var(--foreground)`, `var(--accent)`
- Spacing et typography hérités de Tailwind defaults ou overridés si nécessaire
- Pas de hardcoded colors en dehors du config

### 3. shadcn/ui Components Installés
Les composants suivants sont installés et fonctionnels :
- `button` — Primary action button with variants
- `card` — Container for grouped content
- `dropdown-menu` — Dropdown navigation menu
- `separator` — Visual divider
- `form` — Form wrapper with React Hook Form integration
- Components stockés dans `src/components/ui/` (code committé, pas node_modules)

### 4. Design Tokens
- **Colors** : primaire, background, foreground, accent, border (light + dark variants)
- **Spacing** : xs, sm, md, lg, xl (conforme Tailwind ou custom)
- **Typography** : font sizes, weights, line heights (si custom définis dans config)
- **Tokens documentés** dans un fichier de référence ou dans le code du config

### 5. Thème Réactif Light/Dark
- `ThemeToggle` composant active light/dark/system modes
- Changement appliqué via `next-themes` sans page reload
- HTML `class="dark"` applied dynamiquement
- `localStorage` persiste le choix utilisateur (key: `theme`)
- CSS custom properties mises à jour instantanément (light ou dark values)

## Acceptance Criteria

```gherkin
Feature: Styling Configuration

Scenario: CSS Custom Properties Defined
Given je consulte src/styles/globals.css
Then :root contains --background, --foreground, --accent
And .dark selector overrides all variables
And no inline style attributes exist in components

Scenario: Tailwind Consumes Variables
Given tailwind.config.ts
Then colors section extends with var(--background), var(--foreground), etc.
And tailwind build includes extended colors

Scenario: shadcn Components Installed
Given je navigate vers src/components/ui/
Then files button.tsx, card.tsx, dropdown-menu.tsx, separator.tsx, form.tsx exist
And imports work without errors
And components render with Tailwind styles only

Scenario: Theme Toggle Functional
Given ThemeToggle component
When user clicks "Light" button
Then HTML class="light" (or removed if default)
And CSS custom properties update to light values
And localStorage['theme'] = 'light'
And no page reload occurs

When user clicks "Dark" button
Then HTML class="dark"
And CSS custom properties update to dark values
And localStorage['theme'] = 'dark'
And no page reload occurs

When user clicks "System"
Then HTML class respects OS preference (prefers-color-scheme)
And localStorage['theme'] = 'system'

Scenario: Theme Persists Across Sessions
Given user selected dark mode
When user closes tab and refreshes page
Then theme selection is restored from localStorage
And page renders dark theme without flicker

Scenario: No Inline Styles
Given all .tsx, .ts files in src/
Then no style={} attributes exist
And all styling via Tailwind classes
And CSS custom properties via var() in tailwind.config.ts
```

## Related Epic

[Epic 0 — AppShell Complete Skeleton Setup](../epic.md)

This user story is **Task 0.2 in the sequential skeleton setup**:
- Task 0.1: Initialize project structure, install dependencies
- **Task 0.2: Configure styling, design tokens, theme** (this story)
- Task 0.3: Establish layout components (AppLayout, Header, Footer)
- Task 0.4+: Implement screens and data fetching

## Related Slices

<!-- @architect fills this section after producing slices -->

## Implementation Notes

### globals.css Structure
```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --accent: #0066cc;
  --border: #e5e7eb;
  /* spacing: inherited from Tailwind */
  /* typography: inherited from Tailwind */
}

.dark {
  --background: #000000;
  --foreground: #ffffff;
  --accent: #66b3ff;
  --border: #333333;
}
```

### tailwind.config.ts Extension
```typescript
export default {
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        accent: 'var(--accent)',
        border: 'var(--border)',
      },
    },
  },
};
```

### ThemeToggle Behavior
- Hook: `next-themes` `useTheme()` provides `theme`, `setTheme()`
- Modes: 'system', 'light', 'dark'
- Renders 3 buttons or dropdown with current selection highlighted
- No manual DOM manipulation — `next-themes` handles HTML class + localStorage

### Design Token Inventory (Minimal)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `#fff` | `#000` | Page background |
| `--foreground` | `#000` | `#fff` | Text, icons |
| `--accent` | `#0066cc` | `#66b3ff` | Links, highlights |
| `--border` | `#e5e7eb` | `#333` | Separators, borders |

## Files Affected
- `src/styles/globals.css` — CSS custom properties, light/dark modes
- `tailwind.config.ts` — Design token mapping
- `src/components/ThemeToggle.tsx` — Theme switcher UI
- `src/components/ui/*` — shadcn/ui component installations
- `main.tsx` — ThemeProvider wrapper (if using next-themes)
- `package.json` — Add `next-themes` dependency if not present

## Success Verification
```bash
# Build without errors
npm run build

# Check CSS custom properties applied
# Inspect HTML element in browser DevTools, verify class="dark" toggles
# Check localStorage['theme'] updates on ThemeToggle click
# Verify theme persists on page refresh
# Verify all components use Tailwind classes only (no inline styles)
```
