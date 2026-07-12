import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projects, type Project } from '../data/projects'
import './Projects.css'

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
  onToggle,
}: {
  project: Project
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  const panelId = `proj-panel-${project.id}`

  return (
    <article
      className={`proj-row theme-${project.theme}${expanded ? ' expanded' : ''}`}
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

  const toggle = (id: string) => setExpandedId((current) => (current === id ? null : id))

  const mainProjects = projects.filter((project) => project.category !== 'game')
  const gameProjects = projects.filter((project) => project.category === 'game')

  return (
    <section className="projects-page">
      <header className="proj-head">
        <div className="eyebrow">Available for Winter '27 internships</div>
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
            <b>5</b> shipped
          </span>
          <span className="meta-pill">
            <b>Stacks</b> Python · TS · C#
          </span>
        </div>
      </header>

      <div className="proj-list">
        {mainProjects.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={index}
            expanded={expandedId === project.id}
            onToggle={() => toggle(project.id)}
          />
        ))}

        {gameProjects.length ? (
          <>
            <div
              className="proj-section-head"
              style={{ animationDelay: `${200 + mainProjects.length * 80}ms` }}
            >
              <span className="proj-section-label">Fun highschool projects</span>
              <span className="proj-section-rule" aria-hidden="true" />
            </div>
            {gameProjects.map((project, gameIndex) => (
              <ProjectRow
                key={project.id}
                project={project}
                index={mainProjects.length + gameIndex}
                expanded={expandedId === project.id}
                onToggle={() => toggle(project.id)}
              />
            ))}
          </>
        ) : null}
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
