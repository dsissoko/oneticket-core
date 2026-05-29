---
title: US-003 — Exclusive Ownership
---

# US-003 — Exclusive Ownership

## Story

En tant que lead dev, je veux que chaque fichier screen et hook soit la propriété exclusive d'une seule tâche de dev, afin d'éviter les merge errors lors de la parallélisation.

## Expected Behavior

- Chaque fichier dans `src/screens/` appartient à exactement une tâche de dev
- Chaque fichier dans `src/hooks/` appartient à exactement une tâche de dev
- Les fichiers partagés (configuration, layout, composants) sont modifiés une seule fois, dans la tâche initiale (task-0)
- La convention d'ownership est documentée clairement dans le skill `oneticket-appshell`
- Aucun conflit de merge ne survient lors du développement parallèle

## Acceptance Criteria

1. **Ownership in src/screens/** — One screen per file, one task per file
   - `src/screens/HomeScreen.tsx` → owned by one task only
   - `src/screens/AboutScreen.tsx` → owned by one task only
   - No two parallel tasks modify the same screen file

2. **Ownership in src/hooks/** — One hook per file, one task per file
   - `src/hooks/useUsers.ts` → owned by one task only
   - `src/hooks/useXxx.ts` → each new hook is a dedicated file owned by one task
   - No two parallel tasks modify the same hook file

3. **Shared files owned by task-0 only**
   - `vite.config.ts` — configured once, never modified by feature tasks
   - `tsconfig.json` — configured once, never modified by feature tasks
   - `tailwind.config.ts` — design tokens configured once, never modified by feature tasks
   - `src/layouts/AppLayout.tsx` — structure defined once, never modified by feature tasks
   - `src/components/Header.tsx` — defined once, never modified by feature tasks
   - `src/components/Footer.tsx` — defined once, never modified by feature tasks

4. **shadcn/ui components installed once in task-0**
   - All shadcn components are installed and configured in the initial task
   - Feature tasks import from `src/components/ui/` but do not add new shadcn components
   - shadcn version and component set is frozen after task-0

5. **Clear documentation in skill oneticket-appshell**
   - File ownership semantics are documented in the skill with explicit examples
   - The skill includes a table showing which files are exclusive (one task) vs. shared (task-0 only)
   - New developers understand instantly which files they can modify and which they must coordinate around

## Related Epic

[../epic.md](../epic.md)

## Related Slices

<!-- @architect fills this section after producing slices -->
