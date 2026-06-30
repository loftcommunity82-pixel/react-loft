# Hybrid JSON/API Data Loading Architecture

## Problem
The Vite client uses `USE_JSON_DATA = true` to serve mock JSON data for development speed. However, for personal/owned data (applications, admin, employer dashboard), we need real API responses that reflect actual database state.

## Solution
A **whitelist approach**: only public browse hooks use JSON mock data; all personal/owned/admin/employer hooks always hit the real API.

### Whitelist (honors `USE_JSON_DATA = true`)
- `useJobs` — public job listing with filters/pagination
- `useJob` — single job detail by slug
- `searchSkills` — skill autocomplete from job data
- `useRemoteJobs` — remote jobs (always uses API directly, no JSON fallback)

### Always uses real API (regardless of `USE_JSON_DATA`)
- `useApplications` / `useApplication` — user's applications
- `useAdminApplications` / `useAdminApplication` — admin all-applications view
- `useApplyToJob` — submitting applications
- `useSavedJobs` / `SaveJobButton` — saved jobs (fetch + toggle)
- `useCompanyProfile` — employer's company profile
- `useCompanyJobs` — employer's job listings
- `useCandidates` — job candidates
- `useJobMetrics` — per-job analytics
- `useDashboardData` — user dashboard
- `useHiringWorkflow` (in `features/hiring-workflow/`) — hiring pipeline
- `HiringWorkflowPage` — toggle shortlist action

## Files Changed

### `client/src/lib/config.ts`
- `USE_JSON_DATA` remains `true` (controls only whitelisted hooks)

### `client/src/lib/json-service.ts`
- Stripped to only 3 exports: `getJobsFromJson`, `getJobFromJson`, `searchSkillsFromJson`
- All other functions removed (dead code): application CRUD, admin, employer, saved jobs, candidates, metrics, dashboard

### `client/src/lib/api-hooks.ts`
- Stripped `USE_JSON_DATA` branching from: `useApplications`, `useApplication`, `useAdminApplications`, `useAdminApplication`, `useApplyToJob`, `useSavedJobs`, `useCompanyProfile`, `useCompanyJobs`, `useCandidates`, `useJobMetrics`, `useDashboardData`
- Removed unused json-service imports
- Kept `USE_JSON_DATA` branching in: `useJobs`, `useJob`, `searchSkills`

### `client/src/components/sections/jobs/SaveJobButton.tsx`
- Stripped `USE_JSON_DATA` branching — always uses API directly

### `client/src/features/hiring-workflow/hooks/useHiringWorkflow.ts`
- Stripped `USE_JSON_DATA` branching — always uses `hiringService` API calls

### `client/src/pages/HiringWorkflow.tsx`
- Stripped `USE_JSON_DATA` branching — always uses `toggleShortlist` from api.ts

## Verification
- `npx tsc --noEmit` — zero errors
- `npx vite build` — builds successfully
- Backend (`loft-api`) compiles clean with `npx tsc --noEmit`
