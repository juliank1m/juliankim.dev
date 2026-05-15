import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { MagneticButtonLink } from '../components/MagneticButton'
import { useMagnetic } from '../hooks/useMagnetic'
import TiltCard from '../components/TiltCard'
import { DevpostIcon, EmailIcon, GitHubIcon, LinkedInIcon, RocketIcon } from '../components/Icons'
import GitHubActivity from '../components/GitHubActivity'
import { projects } from '../data/projects'
import './Home.css'

const skills = ['React', 'TypeScript', 'Python', 'SQL', 'C', 'C++']

const strengths = [
  {
    title: 'Product-minded engineering',
    body: 'I build with reliability and user outcomes in mind, from architecture choices to front-end clarity.',
    accent: 'teal' as const,
  },
  {
    title: 'End-to-end execution',
    body: 'I am comfortable moving across frontend, backend, data design, and deployment to keep momentum high.',
    accent: 'coral' as const,
  },
  {
    title: 'Iterative delivery',
    body: 'I prefer small, testable steps and measurable improvements over one large risky release.',
    accent: 'gold' as const,
  },
]

const highlights = [
  { label: 'Projects shipped', value: `${projects.length}` },
  { label: 'Primary stack', value: 'Python + TS' },
  { label: 'Focus area', value: 'Backend + AI' },
]

export default function Home() {
  const {
    ref: projectsRef,
    onMouseMove: projectsOnMouseMove,
    onMouseLeave: projectsOnMouseLeave,
  } = useMagnetic<HTMLAnchorElement>({ strength: 12, lift: 8 })

  return (
    <section className="home-page">
      <Card className="hero-card">
        <CardHeader className="hero-head">
          <Badge tone="accent">Software Engineer in Progress</Badge>
          <h1>Designing software that feels intentional, reliable, and production-ready.</h1>
          <CardDescription>
            I am Julian Kim, a Software Engineering student at the University of Waterloo building full-stack products end-to-end.
          </CardDescription>
        </CardHeader>

        <CardContent className="hero-activity">
          <GitHubActivity />
        </CardContent>

        <CardContent className="hero-actions">
          <MagneticButtonLink href="https://github.com/juliank1m" target="_blank" rel="noopener noreferrer">
            <GitHubIcon /> GitHub
          </MagneticButtonLink>
          <MagneticButtonLink href="https://www.linkedin.com/in/juliank1m/" target="_blank" rel="noopener noreferrer" variant="secondary">
            <LinkedInIcon /> LinkedIn
          </MagneticButtonLink>
          <MagneticButtonLink href="https://devpost.com/juliank1m" target="_blank" rel="noopener noreferrer" variant="secondary" className="ui-button-devpost">
            <DevpostIcon /> Devpost
          </MagneticButtonLink>
          <MagneticButtonLink href="mailto:juliankim4321@gmail.com" variant="outline">
            <EmailIcon /> Email
          </MagneticButtonLink>
          <Link
            to="/projects"
            className="ui-button ui-button-ghost ui-button-md"
            ref={projectsRef}
            onMouseMove={projectsOnMouseMove}
            onMouseLeave={projectsOnMouseLeave}
            style={{ transition: 'transform 180ms ease-out, box-shadow 180ms ease-out' }}
          >
            <RocketIcon /> View projects
          </Link>
        </CardContent>
      </Card>

      <div className="skills-wrap" aria-label="Key skills">
        {skills.map((skill) => (
          <Badge key={skill} tone="muted">
            {skill}
          </Badge>
        ))}
      </div>

      <section className="home-grid">
        {strengths.map((item) => (
          <TiltCard key={item.title} accentTone={item.accent}>
            <CardHeader className="tilt-layer-top">
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="tilt-layer-mid">
              <CardDescription>{item.body}</CardDescription>
            </CardContent>
          </TiltCard>
        ))}
      </section>

      <Card className="focus-card">
        <CardHeader>
          <CardTitle>Current direction</CardTitle>
          <CardDescription>
            I am actively looking for opportunities to contribute to production code, learn from strong engineering teams, and ship dependable software.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="highlights-grid">
          {highlights.map((item) => (
            <div key={item.label} className="highlight-item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
