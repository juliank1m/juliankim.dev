#!/usr/bin/env node
// Fetches GitHub contribution data via the GraphQL API and writes a static
// JSON snapshot that the site bundles at build time. Runs as a `prebuild`
// step; no token => skips silently so existing JSON is used.

import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const USERNAME = process.env.GH_ACTIVITY_USER || 'juliank1m'
const TOKEN =
  process.env.GH_PAT ||
  process.env.GITHUB_ACTIVITY_TOKEN ||
  process.env.GITHUB_TOKEN

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const OUT_PATH = resolve(__dirname, '..', 'src', 'data', 'github-activity.json')

const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

const QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalRepositoriesWithContributedCommits
      }
    }
  }
`

async function fetchActivity() {
  if (!TOKEN) {
    if (existsSync(OUT_PATH)) {
      console.warn(
        '[fetch-github-activity] No GH_PAT / GITHUB_TOKEN set. Keeping existing snapshot at',
        OUT_PATH,
      )
      return
    }
    console.warn(
      '[fetch-github-activity] No token and no existing snapshot. Writing empty placeholder.',
    )
    await writeSnapshot(emptySnapshot())
    return
  }

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'juliankim-profile-build',
    },
    body: JSON.stringify({ query: QUERY, variables: { username: USERNAME } }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(
      `GitHub GraphQL request failed (${res.status}): ${text || res.statusText}`,
    )
  }

  const payload = await res.json()
  if (payload.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(payload.errors)}`)
  }

  const collection = payload.data?.user?.contributionsCollection
  if (!collection) {
    throw new Error('Missing contributionsCollection in response')
  }

  const calendar = collection.contributionCalendar
  const snapshot = {
    username: USERNAME,
    fetchedAt: new Date().toISOString(),
    totalContributions: calendar.totalContributions,
    totalCommits: collection.totalCommitContributions,
    totalPullRequests: collection.totalPullRequestContributions,
    totalIssues: collection.totalIssueContributions,
    totalRepositories: collection.totalRepositoriesWithContributedCommits,
    weeks: calendar.weeks.map((week) => ({
      days: week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVEL_MAP[day.contributionLevel] ?? 0,
      })),
    })),
  }

  await writeSnapshot(snapshot)
  console.log(
    `[fetch-github-activity] Wrote ${calendar.totalContributions} contributions across ${calendar.weeks.length} weeks for @${USERNAME}.`,
  )
}

function emptySnapshot() {
  const today = new Date()
  const weeks = []
  for (let w = 51; w >= 0; w--) {
    const days = []
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today)
      date.setDate(today.getDate() - (w * 7 + d))
      days.push({
        date: date.toISOString().slice(0, 10),
        count: 0,
        level: 0,
      })
    }
    weeks.push({ days })
  }
  return {
    username: USERNAME,
    fetchedAt: new Date().toISOString(),
    totalContributions: 0,
    totalCommits: 0,
    totalPullRequests: 0,
    totalIssues: 0,
    totalRepositories: 0,
    weeks,
  }
}

async function writeSnapshot(snapshot) {
  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf8')
}

fetchActivity().catch((err) => {
  console.error('[fetch-github-activity] Failed:', err.message)
  if (!existsSync(OUT_PATH)) {
    console.warn('[fetch-github-activity] Writing empty placeholder snapshot.')
    writeSnapshot(emptySnapshot()).catch(() => {})
  }
  process.exitCode = 0
})
