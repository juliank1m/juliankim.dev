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
        totalPullRequestReviewContributions
        totalRepositoryContributions
        restrictedContributionsCount
        totalRepositoriesWithContributedCommits
      }
    }
  }
`

export async function fetchGitHubActivity({
  username = 'juliank1m',
  token,
  userAgent = 'juliankim-profile',
} = {}) {
  if (!token) {
    throw new Error('Missing GitHub token')
  }

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
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

  return buildSnapshot(days, {
    username,
    totalContributions: calendar.totalContributions,
    totalCommits: collection.totalCommitContributions,
    totalPullRequests: collection.totalPullRequestContributions,
    totalIssues: collection.totalIssueContributions,
    totalPullRequestReviews: collection.totalPullRequestReviewContributions,
    totalRepositoryContributions: collection.totalRepositoryContributions,
    restrictedContributions: collection.restrictedContributionsCount,
    totalRepositories: collection.totalRepositoriesWithContributedCommits,
  })
}

function buildSnapshot(days, totals = {}) {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? -1 : 1))
  const monthly = lastTwelveMonths(sorted)

  const weekdayCounts = new Array(7).fill(0)
  for (const d of sorted) {
    const weekday = new Date(d.date + 'T00:00:00').getDay()
    weekdayCounts[weekday] += d.count
  }
  const weekdays = weekdayCounts.map((count, idx) => ({
    label: WEEKDAY_NAMES[idx],
    count,
  }))

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
    { label: '-', count: 0 },
  )

  return {
    username: totals.username ?? 'juliank1m',
    fetchedAt: new Date().toISOString(),
    totalContributions: totals.totalContributions ?? sorted.reduce((s, d) => s + d.count, 0),
    totalCommits: totals.totalCommits ?? 0,
    totalPullRequests: totals.totalPullRequests ?? 0,
    totalIssues: totals.totalIssues ?? 0,
    totalPullRequestReviews: totals.totalPullRequestReviews ?? 0,
    totalRepositoryContributions: totals.totalRepositoryContributions ?? 0,
    restrictedContributions: totals.restrictedContributions ?? 0,
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
