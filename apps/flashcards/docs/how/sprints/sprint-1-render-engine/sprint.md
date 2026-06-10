---
title: 'Sprint 1 — RenderEngine Foundation'
---

# Sprint 1 — RenderEngine Foundation

This sprint introduces the generic RenderEngine mechanism to the flashcards app. It defines the RenderEngine interface, implements TextEngine and MarkdownEngine, creates the engine registry with normalization, implements the precompute lifecycle in SessionScreen, and migrates all 3 existing themes to the extended CardSide format with zero visual regression.

## Cross-references

- Epic: [Epic 1 — RenderEngine Refactoring](epic-1-render-engine/epic.md)
- us-005 — [US-005 — RenderEngine Interface and Registry](us-005-render-engine-interface.md) — pending
- us-006 — [US-006 — TextEngine and MarkdownEngine Implementations](us-006-text-markdown-engines.md) — pending
- us-007 — [US-007 — SessionScreen Precompute Lifecycle](us-007-session-preload.md) — pending
- us-008 — [US-008 — Dataset Migration to Extended CardSide Format](us-008-dataset-migration.md) — pending

---

## Technical Notes

### Architecture Decisions

**ADR-001 — RenderEngine Strategy Pattern**
The RenderEngine interface uses the Strategy pattern to decouple rendering logic from card display. Each engine implements `render(data, target)` for synchronous rendering and optionally `precompute(data)` for async preparation.

**ADR-002 — Engine Registry with Fallback**
Engine registry uses a Map-based lookup keyed by `renderEngineId`. Unknown or missing IDs fall back to `TextEngine`, ensuring backward compatibility with legacy plain string card sides.

**ADR-003 — CardSide Union Type**
`CardSide = string | { data: any; renderEngineId: string }` — the union type allows gradual migration. Plain strings are normalized at runtime, not at data level.

### Implementation Guidance

#### 1. RenderEngine Interface
```typescript
interface RenderEngine {
  render(data: any, target: HTMLElement): void
  precompute?(data: any): Promise<void>
}
```
- `render` is synchronous — always completes before return
- `precompute` is optional — only async engines implement it
- Engines must be pure — no side effects beyond target DOM

#### 2. Engine Registry
```typescript
class EngineRegistry {
  private engines = new Map<string, RenderEngine>()
  
  register(id: string, engine: RenderEngine): void
  resolve(id?: string): RenderEngine  // defaults to TextEngine
}
```
- Register engines at app startup
- `resolve()` never throws — always returns a valid engine

#### 3. Normalization Helper
```typescript
function normalizeCardSide(side: CardSide): { data: any; renderEngineId: string } {
  if (typeof side === 'string') return { data: side, renderEngineId: 'text' }
  return side
}
```
- Type guard for CardSide union
- Called at render time, not at data load time

#### 4. Precompute Lifecycle in SessionScreen
```typescript
// After question display:
const precomputePromise = engine.precompute?.(back.data)

// On flip:
if (precomputePromise) {
  await precomputePromise  // waits if still running, instant if done
}
engine.render(back.data, target)
```
- Store precompute promise in component state
- Cancel previous precompute when card changes
- Handle errors gracefully — fallback to direct render

#### 5. Backward Compatibility
- Plain string card sides auto-normalize to TextEngine
- No data migration required — normalization happens at render time
- Existing tests pass without modification

#### 6. Theme Data Migration
Existing themes adopt explicit format:
```json
{ "front": { "data": "France", "renderEngineId": "text" },
  "back":  { "data": "Paris",  "renderEngineId": "text" } }
```
Conjugaisons back side: `renderEngineId: "markdown"`

### Related Architecture
- See [architecture.md](../architecture.md) — RenderEngine Architecture section
- See [containers.md](../c4/containers.md) — RenderEngine Layer section
