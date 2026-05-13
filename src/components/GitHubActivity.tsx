import { useMemo } from 'react'
import activityData from '../data/github-activity.json'
import './GitHubActivity.css'

type ActivityDay = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

type ActivityWeek = {
  days: ActivityDay[]
}

type ActivitySnapshot = {
  username: string
  fetchedAt: string
  totalContributions: number
  totalCommits: number
  totalPullRequests: number
  totalIssues: number
  totalRepositories: number
  weeks: ActivityWeek[]
}

const SNAPSHOT = activityData as ActivitySnapshot

const PALETTE = ['#ecfbf7', '#c6f0e2', '#9ee7dc', '#5fc4b1', '#2f8273']

const CELL = 12
const GAP = 3
const COL = CELL + GAP
const CHART_LEFT = 24
const CHART_TOP = 18

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const WEEKDAY_LABELS: { label: string; rowIndex: number }[] = [
  { label: 'Mon', rowIndex: 1 },
  { label: 'Wed', rowIndex: 3 },
  { label: 'Fri', rowIndex: 5 },
]

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function GitHubActivity() {
  const weeks = SNAPSHOT.weeks
  const totalContributions = SNAPSHOT.totalContributions

  const monthLabels = useMemo(() => {
    const labels: { column: number; month: string }[] = []
    let lastMonth = -1
    weeks.forEach((week, weekIndex) => {
      const firstDay = week.days[0]
      if (!firstDay) return
      const month = new Date(firstDay.date + 'T00:00:00').getMonth()
      if (month !== lastMonth) {
        labels.push({ column: weekIndex, month: MONTH_NAMES[month] })
        lastMonth = month
      }
    })
    return labels
  }, [weeks])

  const chartWidth = weeks.length * COL - GAP
  const totalWidth = CHART_LEFT + chartWidth
  const chartHeight = 7 * COL - GAP
  const totalHeight = CHART_TOP + chartHeight

  return (
    <section className="gh-activity" aria-label="GitHub activity">
      <header className="gh-activity-head">
        <span className="gh-activity-label">GitHub activity</span>
        <a
          className="gh-activity-link"
          href={`https://github.com/${SNAPSHOT.username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{SNAPSHOT.username}
        </a>
      </header>

      <div className="gh-activity-chart-wrap">
        <svg
          className="gh-activity-svg"
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          preserveAspectRatio="xMinYMid meet"
          role="img"
          aria-label={`${totalContributions} contributions in the last year`}
        >
          {monthLabels.map((m) => (
            <text
              key={`month-${m.column}-${m.month}`}
              x={CHART_LEFT + m.column * COL}
              y={11}
              className="gh-activity-month-label"
            >
              {m.month}
            </text>
          ))}

          {WEEKDAY_LABELS.map(({ label, rowIndex }) => (
            <text
              key={label}
              x={0}
              y={CHART_TOP + rowIndex * COL + CELL - 2}
              className="gh-activity-weekday-label"
            >
              {label}
            </text>
          ))}

          {weeks.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => (
              <rect
                key={day.date || `${weekIndex}-${dayIndex}`}
                x={CHART_LEFT + weekIndex * COL}
                y={CHART_TOP + dayIndex * COL}
                width={CELL}
                height={CELL}
                rx={1.5}
                ry={1.5}
                fill={PALETTE[day.level] ?? PALETTE[0]}
                className="gh-activity-cell"
              >
                <title>
                  {day.count} contribution{day.count === 1 ? '' : 's'}
                  {day.date ? ` · ${formatDate(day.date)}` : ''}
                </title>
              </rect>
            )),
          )}
        </svg>
      </div>

      <footer className="gh-activity-foot">
        <div className="gh-activity-total">
          <strong>{totalContributions.toLocaleString()}</strong>
          <span>contributions in the last year</span>
        </div>
        <div className="gh-activity-legend" aria-hidden="true">
          <span>Less</span>
          {PALETTE.map((color) => (
            <i key={color} style={{ background: color }} />
          ))}
          <span>More</span>
        </div>
      </footer>
    </section>
  )
}
