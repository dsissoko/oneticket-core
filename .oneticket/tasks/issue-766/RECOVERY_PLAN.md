# Recovery Plan for Issue #766 Merge Failures

**Status:** 5 branches in merge-failed state (E, I, J, O, S)  
**Root Cause:** Simultaneous modifications to shared configuration files without coordination  
**Commits Behind Base:** I(4), O(19), E(24), J(24), S(35)

---

## Conflict Analysis

All 5 branches conflict on the **same files**:

| File | Conflict Type | Branches Affected |
|------|---|---|
| `apps/monjournal/app/package.json` | content (dependencies) | E, I, J, O, S |
| `apps/monjournal/app/package-lock.json` | add/add | E, I, J, O, S |
| `apps/monjournal/app/tsconfig.json` | add/add | E, I, J, O, S |
| `apps/monjournal/app/vitest.config.ts` | add/add | E, I, J (not O) |
| `apps/monjournal/app/vite.config.ts` | implicit (branch S creates duplicate files) | S only |

### Additional Issues Identified

- **Branch J:** Contains `dist/` artifacts (build output, violates .gitignore)
- **Branch J:** Contains `test-results/.last-run.json` (test artifacts, violates .gitignore)
- **Branch S:** Creates `vite.config.js` and `vite.config.d.ts` as duplicates of `vite.config.ts`

---

## Merge Strategy

**Recommended Order:** `I → O → E → J → S` (least behind → most behind)

**Rationale:**
1. Process least-modified branches first to establish a stable base
2. Each merge reduces the "behind" count for subsequent branches
3. Earlier branches stabilize shared files before later merges attempt them

---

## Step-by-Step Resolution

### Phase 1: Rebase Each Branch

Before merging, rebase each branch onto the latest `feature/issue-766` to minimize conflicts during merge.

```bash
# For each branch in order: I, O, E, J, S
git fetch origin
git checkout task/issue-766-I
git rebase origin/feature/issue-766

# If rebase conflicts occur:
#   git rebase --abort (if too complex)
#   OR manually resolve conflicts, then git rebase --continue
```

**Expected conflicts during rebase:** Same files as merge conflicts (package.json, tsconfig.json, vitest.config.ts)

---

### Phase 2: Merge Each Branch

For each rebased branch, merge into `feature/issue-766`.

#### Branch I: `task/issue-766-I` (Timeline Components)

**Conflicts:**
- `apps/monjournal/app/package.json` — content conflict
- `apps/monjournal/app/package-lock.json` — add/add
- `apps/monjournal/app/vitest.setup.ts` — content conflict

**Resolution Strategy:**
1. Merge `package.json`: Accept **current** (`feature/issue-766`), discard theirs (I)
   - Reason: package.json on main branch is authoritative after previous merges (A, B, C, D, H, M, N, T)
   - Task I only adds React components, no new dependencies expected
2. Merge `package-lock.json`: Use **current**
   - Reason: Lock file is deterministic; regenerate via `npm install` later if needed
3. Merge `vitest.setup.ts`: Inspect both versions, merge changes
   - Reason: Setup file may have been modified by previous tasks

**Command:**
```bash
git merge origin/task/issue-766-I --no-commit
# Resolve conflicts (see below)
# Review changes
git commit -m "chore: merge task I into feature/issue-766"
```

**Conflict Resolution Commands:**
```bash
# Accept current (feature/issue-766) version for lock files
git checkout --ours apps/monjournal/app/package.json
git checkout --ours apps/monjournal/app/package-lock.json

# For vitest.setup.ts, manually inspect:
git diff apps/monjournal/app/vitest.setup.ts
# Then manually merge or accept one side
git add apps/monjournal/app/vitest.setup.ts

git add -A && git commit -m "chore: merge task I into feature/issue-766"
```

---

#### Branch O: `task/issue-766-O` (ThemeSelector Component)

**Conflicts:**
- `apps/monjournal/app/package.json` — content conflict
- `apps/monjournal/app/package-lock.json` — add/add
- `apps/monjournal/app/tsconfig.json` — add/add

**Resolution Strategy:**
1. `package.json`: Accept **current** (feature/issue-766)
   - Task O adds no new dependencies (ThemeSelector is presentational)
2. `package-lock.json`: Use **current**
3. `tsconfig.json`: Accept **current**
   - Previous tasks (A, B, C, D, H, M, N, T, I) already finalized tsconfig

**Command:**
```bash
git merge origin/task/issue-766-O --no-commit
git checkout --ours apps/monjournal/app/package.json
git checkout --ours apps/monjournal/app/package-lock.json
git checkout --ours apps/monjournal/app/tsconfig.json
git add -A && git commit -m "chore: merge task O into feature/issue-766"
```

---

#### Branch E: `task/issue-766-E` (SearchService)

**Conflicts:**
- `apps/monjournal/app/package.json` — content conflict
- `apps/monjournal/app/package-lock.json` — add/add
- `apps/monjournal/app/tsconfig.json` — add/add
- `apps/monjournal/app/vitest.config.ts` — add/add

**Resolution Strategy:**
1. `package.json`: Accept **current**
   - No new dependencies for SearchService (pure TypeScript)
2. `package-lock.json`: Use **current**
3. `tsconfig.json`: Use **current**
4. `vitest.config.ts`: Accept **current**

**Command:**
```bash
git merge origin/task/issue-766-E --no-commit
git checkout --ours apps/monjournal/app/package.json
git checkout --ours apps/monjournal/app/package-lock.json
git checkout --ours apps/monjournal/app/tsconfig.json
git checkout --ours apps/monjournal/app/vitest.config.ts
git add -A && git commit -m "chore: merge task E into feature/issue-766"
```

---

#### Branch J: `task/issue-766-J` (RandomSelector)

**Conflicts:**
- `apps/monjournal/app/package.json` — content conflict
- `apps/monjournal/app/package-lock.json` — add/add
- `apps/monjournal/app/tsconfig.json` — add/add
- `apps/monjournal/app/vitest.config.ts` — add/add
- `dist/` — build artifacts to **exclude**
- `test-results/.last-run.json` — test artifact to **exclude**

**Resolution Strategy:**
1. Same as E for config files: Accept **current**
2. **Exclude build artifacts:**
   ```bash
   git rm --cached dist/ test-results/.last-run.json
   # Do NOT commit these files — they belong in .gitignore only
   ```

**Command:**
```bash
git merge origin/task/issue-766-J --no-commit
git checkout --ours apps/monjournal/app/package.json
git checkout --ours apps/monjournal/app/package-lock.json
git checkout --ours apps/monjournal/app/tsconfig.json
git checkout --ours apps/monjournal/app/vitest.config.ts

# Remove unwanted artifacts
git rm --cached dist/ test-results/ 2>/dev/null || true

git add -A && git commit -m "chore: merge task J into feature/issue-766"
```

---

#### Branch S: `task/issue-766-S` (Vite Config Optimization)

**Conflicts:**
- `apps/monjournal/app/package.json` — add/add (S treats it as new file)
- `apps/monjournal/app/package-lock.json` — add/add
- `apps/monjournal/app/tsconfig.json` — add/add
- `vite.config.js` — **duplicate file, should be removed**
- `vite.config.d.ts` — **duplicate file, should be removed**

**Resolution Strategy:**
1. `package.json`: Accept **current**
   - S only modifies vite.config.ts, no dependency changes
2. `package-lock.json`: Use **current**
3. `tsconfig.json`: Use **current**
4. Remove duplicate Vite config files:
   ```bash
   git rm vite.config.js vite.config.d.ts 2>/dev/null || true
   ```

**Command:**
```bash
git merge origin/task/issue-766-S --no-commit
git checkout --ours apps/monjournal/app/package.json
git checkout --ours apps/monjournal/app/package-lock.json
git checkout --ours apps/monjournal/app/tsconfig.json

# Remove duplicate vite config files
git rm vite.config.js vite.config.d.ts 2>/dev/null || true

git add -A && git commit -m "chore: merge task S into feature/issue-766"
```

---

## Phase 3: Verify & Post-Merge Cleanup

After all 5 merges complete:

1. **Run build to ensure no broken configs:**
   ```bash
   npm install
   npm run build
   ```

2. **Verify no build artifacts committed:**
   ```bash
   git status
   # Should only show changes to src/, tests/, and config files
   # Should NOT show dist/, node_modules/, .last-run.json
   ```

3. **Push to origin:**
   ```bash
   git push origin feature/issue-766
   ```

---

## Phase 4: Unblock Pending Tasks

After all merges succeed and base branch is stable:

**Pending tasks (currently blocked):**
- `F`, `G`, `K`, `L`, `P`, `Q`, `R`, `U`

**Re-trigger via manifest:**
1. Update `manifest.json`: Change status of all merge-failed branches to `done`
   ```json
   {
     "id": "E",
     "status": "done"
   },
   {
     "id": "I",
     "status": "done"
   },
   {
     "id": "J",
     "status": "done"
   },
   {
     "id": "O",
     "status": "done"
   },
   {
     "id": "S",
     "status": "done"
   }
   ```

2. Commit with message: `chore: mark recovered tasks as done`

3. Pending tasks will automatically enter `in_progress` when orchestration processes dependencies.

---

## Risk Mitigation

| Risk | Mitigation |
|------|---|
| Lost code from accepting "current" version | All 5 branches only add **new files** (components, hooks, services). Accepting current package.json preserves all previous dependencies. Review output of each merge to confirm. |
| Circular dependencies or missing packages | Run `npm install` and `npm run build` after each merge to catch issues early. |
| Duplicated or conflicting implementations | All 5 tasks are independent (different slices). No overlapping file edits. |
| Lock file divergence | Lock file conflicts are expected. Accepting `current` and regenerating via `npm install` is safe. |

---

## Rollback Strategy

If a merge fails unexpectedly:

```bash
# Abort current merge
git merge --abort

# Revert to last successful state
git reset --hard origin/feature/issue-766

# Restart from the failed merge, investigating the error
```

---

## Estimated Time

- Phase 1 (Rebase): 5–10 minutes
- Phase 2 (Merge all 5): 10–15 minutes (mostly conflict resolution)
- Phase 3 (Verify): 5 minutes
- Phase 4 (Unblock pending): 2 minutes

**Total:** ~25–35 minutes

---

## Files Summary

After successful execution:

- ✅ All 5 branches merged
- ✅ No build artifacts in repo
- ✅ Single `vite.config.ts` (no duplicates)
- ✅ Unified `package.json` with all dependencies
- ✅ 8 pending tasks unblocked
- ✅ Pipeline ready to proceed to final integration tasks (P, Q, R, U)
