import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { ButtonLink } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { DevpostIcon, EmailIcon, GitHubIcon, LinkedInIcon, RocketIcon } from '../components/Icons'
import './Home.css'

const skills = ['React', 'TypeScript', 'Java', 'Python', 'SQL', 'C#', 'Flask', 'AWS (learning)']

const strengths = [
  {
    title: 'Product-minded engineering',
    body: 'I build with reliability and user outcomes in mind, from architecture choices to front-end clarity.',
  },
  {
    title: 'End-to-end execution',
    body: 'I am comfortable moving across frontend, backend, data design, and deployment to keep momentum high.',
  },
  {
    title: 'Iterative delivery',
    body: 'I prefer small, testable steps and measurable improvements over one large risky release.',
  },
]

const highlights = [
  { label: 'Projects shipped', value: '5+' },
  { label: 'Primary stack', value: 'React + TS' },
  { label: 'Focus area', value: 'Full-stack apps' },
]

export default function Home() {
  return (
    <section className="home-page">
      <Card className="hero-card">
        <CardHeader className="hero-head">
          <Badge tone="accent">Software Engineer in Progress</Badge>
          <h1>Designing software that feels intentional, reliable, and production-ready.</h1>
          <CardDescription>
            I am Julian Kim, a Software Engineering student at the University of Waterloo building full-stack products with practical architecture and clear user value.
          </CardDescription>
        </CardHeader>

        <CardContent className="hero-actions">
          <ButtonLink href="https://github.com/juliank1m" target="_blank" rel="noopener noreferrer">
            <GitHubIcon /> GitHub
          </ButtonLink>
          <ButtonLink href="https://www.linkedin.com/in/juliank1m/" target="_blank" rel="noopener noreferrer" variant="secondary">
            <LinkedInIcon /> LinkedIn
          </ButtonLink>
          <ButtonLink href="https://devpost.com/juliank1m" target="_blank" rel="noopener noreferrer" variant="secondary" className="ui-button-devpost">
            <DevpostIcon /> Devpost
          </ButtonLink>
          <ButtonLink href="mailto:juliankim4321@gmail.com" variant="outline">
            <EmailIcon /> Email
          </ButtonLink>
          <Link to="/projects" className="ui-button ui-button-ghost ui-button-md">
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
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.body}</CardDescription>
            </CardContent>
          </Card>
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
