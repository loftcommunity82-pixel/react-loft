# Implementation Plan: Hybrid JSON/API Data Loading

## Goal
Strip `USE_JSON_DATA` branching from all personal/owned hooks so they always call the real API, while keeping it for public browse hooks.

## Tasks

### Task 1: Confirm USE_JSON_DATA = true in config
- File: `client/src/lib/config.ts`
- Ensure `USE_JSON_DATA = true` (it was being set to `false` during earlier work)
- Status: ✅ Complete

### Task 2: Strip USE_JSON_DATA from personal hooks in api-hooks.ts
- Strip from: `useApplications`, `useApplication`, `useAdminApplications`, `useAdminApplication`, `useApplyToJob`, `useSavedJobs`
- Status: ✅ Complete

### Task 3: Strip USE_JSON_DATA from employer/owned hooks
- Strip from: `useCompanyProfile`, `useCompanyJobs`, `useCandidates`, `useJobMetrics`, `useDashboardData`
- Status: ✅ Complete

### Task 4: Strip USE_JSON_DATA from other files
- Files: `SaveJobButton.tsx`, `useHiringWorkflow.ts`, `HiringWorkflow.tsx`
- Status: ✅ Complete

### Task 5: Clean up unused json-service exports
- Remove all functions no longer imported: application CRUD, admin, employer, saved jobs, candidates, metrics, dashboard, helper functions
- Status: ✅ Complete

### Task 6: Verify compilation
- Frontend: `npx tsc --noEmit` + `npx vite build`
- Backend: `npx tsc --noEmit`
- Status: ✅ Complete (zero errors both sides)

### Task 7: Save spec and plan to docs
- Status: ✅ Complete (this file)

## Summary of Remaining `USE_JSON_DATA` Usage
```
client/src/lib/config.ts:1                 — export const USE_JSON_DATA = true
client/src/lib/api-hooks.ts:22             — import { USE_JSON_DATA } from './config'
client/src/lib/api-hooks.ts:54             — useJobs: if (USE_JSON_DATA)
client/src/lib/api-hooks.ts:94             — useJob: if (USE_JSON_DATA)
client/src/lib/api-hooks.ts:641            — useSkillsSearch: USE_JSON_DATA ? searchSkillsFromJson : searchSkills
```

Only 3 hooks remain whitelisted — all public browse operations.
