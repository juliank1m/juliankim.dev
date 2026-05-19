import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projects, type Project, type ProjectCategory } from '../data/projects'
import './Projects.css'

type Filter = 'all' | ProjectCategory

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web Apps' },
  { id: 'data', label: 'Data & ML' },
  { id: 'game', label: 'Games' },
]

function ProjectPreview({ project }: { project: Project }) {
  const livePreview = Boolean(project.previewSrc) && !project.previewBlocked
  const isGame = !livePreview && project.category === 'game'

  return (
    <div className="row-preview" aria-hidden="true">
      <div className="pv-bar">
        <span>
          {project.title.toUpperCase()}.{isGame ? 'EXE' : 'APP'}
        </span>
        <span className="dots">
          <span />
          <span />
          <span />
        </span>
      </div>
      {livePreview ? (
        <div className="pv-body is-live">
          <iframe
            className="pv-frame"
            src={project.previewSrc}
            title={`${project.title} live preview`}
            loading="lazy"
            tabIndex={-1}
          />
        </div>
      ) : isGame ? (
        <div className="pv-body">
          <div className="pv-screen">
            <span className="pv-play">▶</span>
          </div>
          <div className="pv-pad">
            <span className="pv-dpad" />
            <span className="pv-btns">
              <span />
              <span />
            </span>
          </div>
        </div>
      ) : (
        <div className="pv-body">
          <div className="pv-line full" />
          <div className="pv-line medium" />
          <div className="pv-line short" />
          <div className="pv-grid">
            <div />
            <div />
            <div />
          </div>
          <div className="pv-line faint medium" />
        </div>
      )}
      <div className="pv-foot">
        <span>{project.tags[0]?.toUpperCase()}</span>
        <span>v{project.year}</span>
      </div>
    </div>
  )
}

function ProjectRow({
  project,
  index,
  expanded,
  filtered,
  onToggle,
}: {
  project: Project
  index: number
  expanded: boolean
  filtered: boolean
  onToggle: () => void
}) {
  const panelId = `proj-panel-${project.id}`

  return (
    <article
      className={`proj-row theme-${project.theme}${expanded ? ' expanded' : ''}${filtered ? ' filtered' : ''}`}
      style={{ animationDelay: `${200 + index * 80}ms` }}
    >
      <h2 className="row-heading">
        <button
          type="button"
          className="row-head"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="row-num">{String(index + 1).padStart(2, '0')}</span>
          <span className="row-body">
            <span className="row-title">{project.title}</span>
            <span className="row-sub">
              <span className="kind">{project.kind}</span>
              <span className="dot">·</span>
              <span>{project.year}</span>
              {project.liveDemo ? (
                <>
                  <span className="dot">·</span>
                  <span>Live</span>
                </>
              ) : null}
            </span>
          </span>
          <span className="row-head-end">
            <span className="row-tags">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="row-tag">
                  {tag}
                </span>
              ))}
            </span>
            <span className="row-chevron" aria-hidden="true">
              ▾
            </span>
          </span>
        </button>
      </h2>

      <div className="row-panel" id={panelId} inert={!expanded}>
        <div className="row-panel-inner">
          <div className="row-panel-content">
            <div className="row-panel-main">
              <p className="row-summary">{project.description}</p>
              {project.featureHighlights?.length ? (
                <ul className="row-features">
                  {project.featureHighlights.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : null}
              <div className="row-actions">
                {project.liveDemo ? (
                  <a className="row-btn primary" href={project.liveDemo} target="_blank" rel="noopener noreferrer">
                    ▶ Live Demo
                  </a>
                ) : null}
                <a className="row-btn" href={project.github} target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
                {project.githubExtra ? (
                  <a className="row-btn ghost" href={project.githubExtra.url} target="_blank" rel="noopener noreferrer">
                    {project.githubExtra.label} ↗
                  </a>
                ) : null}
                <Link className="row-btn ghost" to={`/projects/${project.id}`}>
                  Full Details →
                </Link>
              </div>
            </div>
            <ProjectPreview project={project} />
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const toggle = (id: string) => setExpandedId((current) => (current === id ? null : id))

  const counts: Record<Filter, number> = {
    all: projects.length,
    web: projects.filter((project) => project.category === 'web').length,
    data: projects.filter((project) => project.category === 'data').length,
    game: projects.filter((project) => project.category === 'game').length,
  }

  return (
    <section className="projects-page">
      <header className="proj-head">
        <div className="eyebrow">Select Work · 2023 → 2026</div>
        <h1>Projects, shipped and in flight.</h1>
        <p className="lede">
          A small collection of things I've built — backend platforms, data pipelines, AI tools, and a couple of
          games. Tap any row to expand the details inline; live demos open in a new tab.
        </p>
        <div className="meta-row">
          <span className="meta-pill">
            <b>{projects.length}</b> projects
          </span>
          <span className="meta-pill">
            <b>4</b> shipped
          </span>
          <span className="meta-pill">
            <b>Stacks</b> Python · TS · C#
          </span>
        </div>
      </header>

      <div className="filter-row" role="group" aria-label="Filter projects">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`filter-chip${filter === id ? ' active' : ''}`}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {label} <span className="count">{counts[id]}</span>
          </button>
        ))}
      </div>

      <div className="proj-list">
        {projects.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={index}
            expanded={expandedId === project.id}
            filtered={filter !== 'all' && project.category !== filter}
            onToggle={() => toggle(project.id)}
          />
        ))}
      </div>

      <p className="proj-foot">
        End of list ·{' '}
        <a href="https://github.com/juliank1m" target="_blank" rel="noopener noreferrer">
          More on GitHub →
        </a>
      </p>
    </section>
  )
}
