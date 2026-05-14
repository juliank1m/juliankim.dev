#!/usr/bin/env node
// Build-time GitHub activity fetcher. Pulls the contribution calendar via the
// GraphQL API, then aggregates extra stats (monthly totals, weekday histogram,
// streaks, busiest day) and writes a snapshot consumed by the site.

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

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
    console.warn('[fetch-github-activity] No token. Writing empty placeholder.')
    await writeSnapshot(buildSnapshot([]))
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
  const days = calendar.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVEL_MAP[d.contributionLevel] ?? 0,
    })),
  )

  const snapshot = buildSnapshot(days, {
    totalContributions: calendar.totalContributions,
    totalCommits: collection.totalCommitContributions,
    totalPullRequests: collection.totalPullRequestContributions,
    totalIssues: collection.totalIssueContributions,
    totalRepositories: collection.totalRepositoriesWithContributedCommits,
  })

  await writeSnapshot(snapshot)
  console.log(
    `[fetch-github-activity] Wrote ${snapshot.totalContributions} contributions ` +
      `(${snapshot.monthly.length} months, longest streak ${snapshot.longestStreak}d) for @${USERNAME}.`,
  )
}

function buildSnapshot(days, totals = {}) {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? -1 : 1))

  // Build a chronological list of the last 12 month buckets so the chart is
  // stable even when input data is empty.
  const monthly = lastTwelveMonths(sorted)

  // Weekday histogram (Sun..Sat)
  const weekdayCounts = new Array(7).fill(0)
  for (const d of sorted) {
    const weekday = new Date(d.date + 'T00:00:00').getDay()
    weekdayCounts[weekday] += d.count
  }
  const weekdays = weekdayCounts.map((count, idx) => ({
    label: WEEKDAY_NAMES[idx],
    count,
  }))

  // Streaks
  let longestStreak = 0
  let currentStreak = 0
  let runningStreak = 0
  for (const d of sorted) {
    if (d.count > 0) {
      runningStreak += 1
      if (runningStreak > longestStreak) longestStreak = runningStreak
    } else {
      runningStreak = 0
    }
  }
  // Current streak (ending most recent day)
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].count > 0) currentStreak += 1
    else break
  }

  const activeDays = sorted.filter((d) => d.count > 0).length
  const busiest = sorted.reduce(
    (best, d) => (d.count > best.count ? d : best),
    { date: '', count: 0 },
  )
  const busiestWeekday = weekdays.reduce(
    (best, w) => (w.count > best.count ? w : best),
    { label: '—', count: 0 },
  )

  return {
    username: USERNAME,
    fetchedAt: new Date().toISOString(),
    totalContributions: totals.totalContributions ?? sorted.reduce((s, d) => s + d.count, 0),
    totalCommits: totals.totalCommits ?? 0,
    totalPullRequests: totals.totalPullRequests ?? 0,
    totalIssues: totals.totalIssues ?? 0,
    totalRepositories: totals.totalRepositories ?? 0,
    activeDays,
    longestStreak,
    currentStreak,
    busiestDay: busiest,
    busiestWeekday,
    monthly,
    weekdays,
  }
}

function lastTwelveMonths(sortedDays) {
  const counts = new Map()
  for (const d of sortedDays) {
    const key = d.date.slice(0, 7)
    counts.set(key, (counts.get(key) ?? 0) + d.count)
  }

  const anchor = sortedDays.length
    ? new Date(sortedDays[sortedDays.length - 1].date + 'T00:00:00')
    : new Date()

  const months = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({
      key,
      label: MONTH_NAMES[d.getMonth()],
      count: counts.get(key) ?? 0,
    })
  }
  return months
}

async function writeSnapshot(snapshot) {
  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf8')
}

fetchActivity().catch((err) => {
  console.error('[fetch-github-activity] Failed:', err.message)
  if (!existsSync(OUT_PATH)) {
    console.warn('[fetch-github-activity] Writing empty placeholder.')
    writeSnapshot(buildSnapshot([])).catch(() => {})
  }
  process.exitCode = 0
})
