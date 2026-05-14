import activityData from '../data/github-activity.json'
import './GitHubActivity.css'

type Tile = {
  label: string
  value: number
  hue: 'teal' | 'lilac' | 'coral' | 'gold'
}

type MonthBucket = { key: string; label: string; count: number }

type ActivitySnapshot = {
  username: string
  fetchedAt: string
  totalContributions: number
  totalCommits: number
  totalPullRequests: number
  totalIssues: number
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
const CHART_HEIGHT = 96
const BAR_MIN = 6

export default function GitHubActivity() {
  const a = SNAPSHOT
  const tiles: Tile[] = [
    { label: 'Total', value: a.totalContributions, hue: 'teal' },
    { label: 'Commits', value: a.totalCommits, hue: 'lilac' },
    { label: 'PRs', value: a.totalPullRequests, hue: 'coral' },
    { label: 'Repos', value: a.totalRepositories, hue: 'gold' },
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
        <div
          className="gh-stats-bars-grid"
          style={{ ['--chart-h' as string]: `${CHART_HEIGHT}px` }}
        >
          {a.monthly.map((m, idx) => {
            const hue = HUES[idx % HUES.length]
            const ratio = m.count / maxMonthly
            const height = Math.round(ratio * (CHART_HEIGHT - BAR_MIN)) + BAR_MIN
            return (
              <div className="gh-stats-bar-col" key={m.key}>
                <div className="gh-stats-bar-track">
                  <div
                    className={`gh-stats-bar gh-hue-${hue}`}
                    style={{ height: `${height}px` }}
                    title={`${m.count} contributions in ${m.label}`}
                  >
                    <span className="gh-stats-bar-value">
                      {m.count > 0 ? m.count : ''}
                    </span>
                  </div>
                </div>
                <span className="gh-stats-bar-label">{m.label}</span>
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
      </footer>
    </section>
  )
}
