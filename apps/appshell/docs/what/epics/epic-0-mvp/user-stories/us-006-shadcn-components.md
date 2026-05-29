# US-006 — Install and Configure shadcn/ui Components

## Story

As a **skeleton setup engineer**, I need to install and configure the required shadcn/ui components (button, card, dropdown-menu, separator, form) so that all feature screens have access to high-quality, pre-configured UI primitives without duplicating installation work.

## Expected Behavior

- [ ] All five shadcn/ui components are installed via the shadcn CLI for Vite
- [ ] Each component is copied into `src/components/ui/` directory
- [ ] All components are importable from `src/components/ui/{ComponentName}.tsx`
- [ ] No TypeScript errors or type mismatches
- [ ] Components are ready for use in screens (HomeScreen, AboutScreen, HelpScreen)
- [ ] Installation artifacts are committed to the repository
- [ ] No uncommitted `.env` files or temporary build artifacts

## Acceptance Criteria

### Component Installation
- [ ] **button** component is installed and functional
  - Can render with variant props (primary, secondary, etc.)
  - Supports onClick handlers
  - Works with lucide-react icons

- [ ] **card** component is installed and functional
  - Has Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter subcomponents
  - Supports flexible content layout
  - Styles apply correctly in light and dark modes

- [ ] **dropdown-menu** component is installed and functional
  - Has DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem subcomponents
  - Renders without console errors
  - Supports nested menu items

- [ ] **separator** component is installed and functional
  - Renders as visual divider
  - Respects light/dark theme styling
  - Can be used horizontally and vertically

- [ ] **form** component is installed and functional
  - Integrates with react-hook-form
  - Has Form, FormField, FormItem, FormLabel, FormControl, FormMessage subcomponents
  - Supports form validation via Zod schemas
  - Error messages display correctly

### TypeScript & Build
- [ ] `npm run build` completes without type errors related to UI components
- [ ] `npm run type-check` (or equivalent) passes with no component-related errors
- [ ] All component exports are correctly typed in `src/components/ui/`
- [ ] No `any` types used for component imports or props

### Integration Readiness
- [ ] All components are importable in example screens without additional configuration
- [ ] Components follow Tailwind naming conventions (no inline styles)
- [ ] Components are styled consistently with light/dark mode via CSS custom properties
- [ ] No circular dependencies or import errors

### Repository Cleanliness
- [ ] All component files (from `src/components/ui/`) are committed
- [ ] No `.env` file committed (only `.env.example`)
- [ ] No temporary installation files (node_modules, dist, etc.) left in staging
- [ ] `.gitignore` correctly excludes build artifacts

## Implementation Notes

### Installation Method
Use the shadcn/ui CLI for Vite as specified in the official documentation:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add form
```

### File Structure After Installation
```
src/components/ui/
├── button.tsx
├── card.tsx
├── dropdown-menu.tsx
├── separator.tsx
└── form.tsx
```

### Configuration Notes
- **Tailwind Integration**: shadcn components rely on Tailwind CSS and CSS custom properties defined in `src/styles/globals.css`
- **Theme Support**: Components inherit light/dark mode from CSS variables (`:root` and `.dark` selectors)
- **No Customization in Task**: This task installs components as-is; design token modifications are out of scope

### Validation Pattern
After installation, verify each component with minimal test imports:

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// ... etc
```

## Related Epic

- [Epic 0 — AppShell Complete Skeleton Setup](../epic.md)
  - Section 8: Component Library (shadcn/ui)
  - Section 9.4: Package Dependencies (shadcn components listed)

## Related Slices

<!-- To be filled by @architect after producing implementation slices -->

## Success Metrics

- **Build Quality**: `npm run build` exits with code 0
- **Type Safety**: TypeScript compiler reports 0 errors for component imports
- **Repository State**: All source files committed, no uncommitted changes except `.env`
- **Integration Ready**: Other tasks (screens, hooks) can import these components without setup

## Definition of Done

This story is complete when:
1. All five components are installed via shadcn CLI
2. Each component is verified as importable with correct TypeScript types
3. All files are committed to the branch
4. No TypeScript errors in the build
5. Integration test imports succeed
