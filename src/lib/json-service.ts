import rawData from '@/data/jobs.json'
import type { Job } from './types'
import { normalizeJob } from './mappers'

const BASE_DELAY = 400
const JITTER = 300
const CACHE_TTL = 60000

let cache: Record<string, { data: any; ts: number }> = {}

function randomDelay(): Promise<void> {
  const ms = BASE_DELAY + Math.random() * JITTER
  return new Promise(r => setTimeout(r, ms))
}

function fromCache<T>(key: string): T | null {
  const entry = cache[key]
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T
  return null
}

function toCache(key: string, data: any): void {
  cache[key] = { data, ts: Date.now() }
}

function matchJob(job: any, params: Record<string, string>): boolean {
  for (const [key, val] of Object.entries(params)) {
    if (!val) continue
    const lower = val.toLowerCase()
    if (key === 'search') {
      const match = job.title?.toLowerCase().includes(lower)
        || (job.company?.companyName || '').toLowerCase().includes(lower)
        || (job.skills || []).some((s: string) => s.toLowerCase().includes(lower))
      if (!match) return false
    } else if (key === 'jobType') {
      if ((job.jobType || '').toLowerCase() !== lower) return false
    } else if (key === 'experienceLevel') {
      if ((job.experienceLevel || '').toLowerCase() !== lower) return false
    } else if (key === 'workMode') {
      if ((job.workMode || '').toLowerCase() !== lower) return false
    } else if (key === 'featured') {
      if (val === 'true' && !job.isFeatured) return false
    } else if (key === 'status') {
      if ((job.status || '').toLowerCase() !== lower) return false
    } else if (key === 'location') {
      if (!(job.location || '').toLowerCase().includes(lower)) return false
    }
  }
  return true
}

export async function getJobsFromJson(params?: Record<string, string>): Promise<{
  jobs: Job[]
  total: number
  page: number
  totalPages: number
}> {
  const cacheKey = 'jobs:' + JSON.stringify(params)
  const cached = fromCache<{ jobs: Job[]; total: number; page: number; totalPages: number }>(cacheKey)
  if (cached) return cached

  await randomDelay()

  let results = (rawData.jobs || []).map(normalizeJob)

  if (params) {
    results = results.filter(j => matchJob(j, params))
  }

  const limit = params?.limit ? parseInt(params.limit, 10) : results.length
  const page = params?.page ? parseInt(params.page, 10) : 1
  const total = results.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paged = results.slice(start, start + limit)

  const out = { jobs: paged, total, page, totalPages }
  toCache(cacheKey, out)
  return out
}

export async function getJobFromJson(slug: string): Promise<Job | null> {
  const cacheKey = 'job:' + slug
  const cached = fromCache<Job | null>(cacheKey)
  if (cached !== null) return cached

  await randomDelay()
  const job = (rawData.jobs || []).find(j => j.slug === slug) || null
  const result = job ? normalizeJob(job) : null
  toCache(cacheKey, result)
  return result
}

export async function searchSkillsFromJson(query: string): Promise<{ id: number; name: string }[]> {
  await randomDelay()
  const allSkills = new Set<string>()
  for (const job of rawData.jobs || []) {
    for (const skill of job.requiredSkills || []) {
      if (skill.toLowerCase().includes(query.toLowerCase())) {
        allSkills.add(skill)
      }
    }
  }
  return Array.from(allSkills).map((name, i) => ({ id: i + 1, name }))
}
