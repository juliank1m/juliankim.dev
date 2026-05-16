import { useEffect, useState } from 'react'
import activityData from '../data/github-activity.json'
import './GitHubActivity.css'

type Tile = {
  label: string
  value: number
  hue: 'teal' | 'lilac' | 'coral' | 'gold'
  title?: string
}

type MonthBucket = { key: string; label: string; count: number }

type ActivitySnapshot = {
  username: string
  fetchedAt: string
  totalContributions: number
  totalCommits: number
  totalPullRequests: number
  totalIssues: number
  totalPullRequestReviews?: number
  totalRepositoryContributions?: number
  restrictedContributions?: number
  totalRepositories: number
  activeDays: number
  longestStreak: number
  currentStreak: number
  busiestDay: { date: string; count: number }
  busiestWeekday: { label: string; count: number }
  monthly: MonthBucket[]
  weekdays: { label: string; count: number }[]
}

const SNAPSHOT = activityData as ActivitySnapshot

const HUES: Tile['hue'][] = ['teal', 'lilac', 'coral', 'gold']

export default function GitHubActivity() {
  const [activity, setActivity] = useState(SNAPSHOT)
  const a = activity

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/github-activity', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub activity fetch failed: ${res.status}`)
        return res.json() as Promise<ActivitySnapshot>
      })
      .then(setActivity)
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return
      })

    return () => controller.abort()
  }, [])

  const restrictedContributions = a.restrictedContributions ?? 0
  const tiles: Tile[] = [
    {
      label: 'Total',
      value: a.totalContributions,
      hue: 'teal',
      title: 'Matches the GitHub contribution calendar total',
    },
    {
      label: 'Commits',
      value: a.totalCommits,
      hue: 'lilac',
      title: 'Public commit contributions reported by GitHub',
    },
    {
      label: 'PRs',
      value: a.totalPullRequests,
      hue: 'coral',
      title: 'Pull request contributions reported by GitHub',
    },
    {
      label: 'Private',
      value: restrictedContributions,
      hue: 'gold',
      title: 'Restricted private contributions included in the GitHub total',
    },
  ]

  const maxMonthly = Math.max(1, ...a.monthly.map((m) => m.count))

  const monthlyMax = a.monthly.reduce(
    (best, m) => (m.count > best.count ? m : best),
    { key: '', label: '—', count: 0 },
  )

  return (
    <section className="gh-stats" aria-label="GitHub activity">
      <header className="gh-stats-head">
        <span className="gh-stats-label">GitHub activity</span>
        <a
          className="gh-stats-link"
          href={`https://github.com/${a.username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{a.username}
        </a>
      </header>

      <div className="gh-stats-tiles">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={`gh-stats-tile gh-hue-${tile.hue}`}
            title={tile.title}
          >
            <strong>{tile.value.toLocaleString()}</strong>
            <span>{tile.label}</span>
          </div>
        ))}
      </div>

      <div className="gh-stats-bars" aria-label="Monthly contributions">
        <div className="gh-stats-bars-rule" aria-hidden="true">
          <span>Monthly</span>
          <em>
            peak {monthlyMax.label.toUpperCase()} · {monthlyMax.count}
          </em>
        </div>
        <div className="gh-stats-bars-grid">
          {a.monthly.map((m, idx) => {
            const hue = HUES[idx % HUES.length]
            const ratio = m.count / maxMonthly
            const valuePct = Math.max(ratio, m.count > 0 ? 0.06 : 0.04) * 100
            return (
              <div className="gh-stats-bar-col" key={m.key}>
                <span className="gh-stats-bar-month">{m.label}</span>
                <div className="gh-stats-bar-track">
                  <div
                    className={`gh-stats-bar gh-hue-${hue}`}
                    style={{ ['--bar-value' as string]: `${valuePct}%` }}
                    title={`${m.count} contributions in ${m.label}`}
                  >
                    <span className="gh-stats-bar-value">
                      {m.count > 0 ? m.count : ''}
                    </span>
                  </div>
                </div>
                <span className="gh-stats-bar-count">{m.count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <footer className="gh-stats-meta">
        <span>
          <b>{a.longestStreak}d</b> longest streak
        </span>
        <span className="gh-stats-meta-divider" aria-hidden="true">
          ◆
        </span>
        <span>
          busiest day <b>{a.busiestWeekday.label}</b>
        </span>
        <span className="gh-stats-meta-divider" aria-hidden="true">
          ◆
        </span>
        <span>
          <b>{a.activeDays}</b> active days
        </span>
        <span className="gh-stats-meta-divider" aria-hidden="true">
          ◆
        </span>
        <span>
          <b>{a.totalRepositories}</b> repos
        </span>
      </footer>
    </section>
  )
}
