---
name: oneticket-architecture-for-vite-react-primer
description: Enforce a clean, readable React + Primer frontend architecture with strict separation of UI, hooks, domain rules, validation, API, and view models.
---

# React + Primer Feature Architecture

## Objective

Provide a clear and maintainable frontend architecture for React applications using Primer.

This skill ensures:
- clean separation of concerns
- readable components
- isolated business rules
- explicit validation
- scalable feature-based structure

---

## Core Principles

1. UI components are passive
2. Business rules are pure functions
3. Validation is explicit and centralized
4. API access is isolated
5. Hooks orchestrate logic
6. Data is transformed via ViewModels

---

## Target Architecture

```
Feature-based architecture
+ UI (Primer components)
+ Hooks (orchestration)
+ Model (types, rules, validation)
+ API (backend access)
+ ViewModel (display mapping)
```

---

## Folder Structure

```
features/
  feature-name/
    api/
      feature.api.ts

    hooks/
      useFeature.ts

    model/
      feature.types.ts
      feature.schema.ts
      feature.rules.ts

    view-model/
      feature.viewModel.ts
      feature.mapper.ts

    ui/
      FeaturePage.tsx
      FeatureCard.tsx
      FeatureForm.tsx
```

---

## Responsibilities

### UI (ui/)

- render with Primer
- display state
- trigger actions

Must NOT:
- call APIs
- implement business rules
- perform complex validation

---

### Hooks (hooks/)

- orchestrate logic
- appeler les APIs (lib au choix)
- gérer les états loading / error / succès

Must NOT:
- contain domain logic
- contain heavy validation

---

### Model (model/)

- types
- validation (Zod)
- business rules

Must:
- be pure
- be testable
- have no React dependency

---

### API (api/)

- HTTP calls only
- no business logic

---

### ViewModel (view-model/)

- format data for UI
- derive display values

---

## Pattern Mapping

```
Model      = model/
View       = ui/
ViewModel  = view-model/
Controller = hooks/
```

---

## Rules

### Forbidden

- API calls in components
- business rules in JSX
- validation scattered in UI
- direct backend model rendering
- global state misuse

---

### Preferred Flow

```
UI event
→ Hook
→ Validation (Zod)
→ Business rule check
→ API call
→ ViewModel mapping
→ UI render
```

---

## Primer Usage

Primer must be used ONLY in UI layer.

---

## Validation

Always use schemas:

```
input → schema → rules → API
```

---

## Business Rules

Example:

```
function canStart(session) {
  return session.status === 'idle'
}
```

Never embed in JSX.

---

## TanStack Query (optionnel)

- TanStack Query **n’est pas obligatoire** dans ce template.
- Il ne doit être **installé et mis en œuvre** que si l’utilisateur le demande **explicitement** dans `architecture.md` ou dans la conversation.
- Par défaut, les hooks peuvent utiliser :
  - `fetch` / `axios` + `useState` / `useEffect`,
  - ou toute autre approche simple documentée dans `architecture.md`.

Quand l’utilisateur demande explicitement TanStack Query, les hooks peuvent s’appuyer dessus pour :
- fetching
- caching
- mutations

---

## Final Rule

If a component becomes complex:

1. extract rules
2. extract validation
3. extract API
4. extract hook
5. extract ViewModel

---

## Goal

Produce frontend code that is:
- readable
- testable
- scalable
- aligned with modern React practices
