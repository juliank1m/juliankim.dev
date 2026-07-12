// Regenerates src/data/github-activity.json from the live GitHub GraphQL API.
//
// The site is hosted on GitHub Pages (static), so the /api/github-activity
// serverless function never runs in production. This script bakes a fresh
// snapshot into the bundle at build/deploy time instead.
//
// Token resolution order:
//   GH_PAT / GITHUB_ACTIVITY_TOKEN / GITHUB_TOKEN env var, else `gh auth token`.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { fetchGitHubActivity } from '../api/github-activity-core.js'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../src/data/github-activity.json')
const USERNAME = process.env.GH_ACTIVITY_USER || 'juliank1m'

function resolveToken() {
  const fromEnv = process.env.GH_PAT || process.env.GITHUB_ACTIVITY_TOKEN || process.env.GITHUB_TOKEN
  if (fromEnv) return fromEnv
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

const token = resolveToken()
if (!token) {
  console.error('No GitHub token: set GH_PAT (or run `gh auth login`).')
  process.exit(1)
}

const activity = await fetchGitHubActivity({
  username: USERNAME,
  token,
  userAgent: 'juliankim-profile-updater',
})

writeFileSync(OUT, JSON.stringify(activity, null, 2) + '\n')
console.log(`Updated ${OUT} — ${activity.totalContributions} contributions, fetchedAt ${activity.fetchedAt}`)
