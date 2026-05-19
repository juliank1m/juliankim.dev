export type ProjectCategory = 'web' | 'data' | 'game'

export type Project = {
  id: string
  title: string
  kind: string
  category: ProjectCategory
  year: string
  summary: string
  description: string
  tags: string[]
  github: string
  liveDemo?: string
  previewSrc?: string
  previewBlocked?: boolean
  featureHighlights?: string[]
  githubExtra?: { label: string; url: string }
  theme: 'mint' | 'rose' | 'indigo' | 'lime' | 'amber'
}

export const projects: Project[] = [
  {
    id: 'pyclimb-project',
    title: 'PyClimb',
    kind: 'Learning platform',
    category: 'web',
    year: '2026',
    summary: 'Learning-first coding platform with judge workflow, lessons, and leaderboard.',
    description:
      'A learning-first, end-to-end web application built intentionally step-by-step to understand real production-style architecture with clarity, correctness, and backend fundamentals.',
    tags: ['Django', 'PostgreSQL', 'Docker', 'Judge System', 'Learning Platform'],
    github: 'https://github.com/juliank1m/pyclimb',
    liveDemo: 'https://pyclimb.juliankim.dev/',
    previewSrc: 'https://pyclimb.juliankim.dev/',
    featureHighlights: [
      'Problem management with rich models, filters, solved/unsolved views, and admin tooling.',
      'Submission verdict pipeline (AC/WA/RE/TLE/CE) with detailed per-test feedback.',
      'Lessons/courses flow with markdown editor, draft/publish states, and linking to problems.',
      'Auth and profile system with email verification, reset, and weighted leaderboard.',
      'Infrastructure with PostgreSQL, slug URLs, request limits, and media storage support.',
    ],
    theme: 'mint',
  },
  {
    id: 'vlr-data-pipeline-project',
    title: 'VLR Data Pipeline',
    kind: 'End-to-end ML pipeline',
    category: 'data',
    year: '2024',
    summary:
      'End-to-end data science pipeline analyzing ~47,000+ pro Valorant maps with ML models reaching ~95.9% accuracy.',
    description:
      'An end-to-end data science project that analyzes professional Valorant esports match data scraped from vlr.gg (~47,000+ competitive maps). Cleans and processes raw match, map, and player-level CSVs, engineers team-level differential features, and trains ML models to predict map outcomes.',
    tags: ['Python', 'pandas', 'scikit-learn', 'Power BI', 'Matplotlib', 'Jupyter'],
    github: 'https://github.com/juliank1m/vlr-data-pipeline',
    featureHighlights: [
      'Structured cleaning pipeline processing raw match, map, and player-level CSVs.',
      'Feature engineering aggregating player stats to team-level metrics with 9 differential features (rating_diff, acs_diff, fk_diff, etc.).',
      'Logistic Regression and Random Forest models achieving ~95.9% map outcome prediction accuracy.',
      'Power BI dashboard for visualizing findings and key insights.',
      'First Kill advantage boosts win probability from 33% to 79%; rating difference is the strongest overall predictor.',
    ],
    githubExtra: { label: 'View scraper', url: 'https://github.com/juliank1m/vlr-scraper' },
    theme: 'indigo',
  },
  {
    id: 'wannacram-project',
    title: 'WannaCram',
    kind: 'AI study assistant',
    category: 'web',
    year: '2026',
    summary:
      'AI-powered study assistant that turns your lecture notes, slides, and exams into summaries, flashcards, and quizzes.',
    description:
      'A web app that helps students study smarter. Upload your lecture notes, slides, or past exams (PDF, DOCX, PPTX), and an AI study assistant will generate summaries, flashcards, and practice quizzes from your own course material — plus let you chat with your documents to get answers and explanations on demand.',
    tags: ['Next.js', 'Supabase', 'PostgreSQL', 'OpenAI API'],
    github: 'https://github.com/juliank1m/wannacram',
    liveDemo: 'https://wannacram.juliankim.dev/',
    previewSrc: 'https://wannacram.juliankim.dev/',
    featureHighlights: [
      'Upload lecture notes, slides, or past exams in PDF, DOCX, or PPTX format.',
      'AI-generated summaries, flashcards, and practice quizzes from your own course material.',
      'Chat with your documents to get answers and explanations on demand.',
    ],
    theme: 'rose',
  },
  {
    id: 'course-tools-project',
    title: 'Course Tools',
    kind: 'Calculator suite',
    category: 'web',
    year: '2025',
    summary: 'Calculators and utilities for linear algebra, calculus, chemistry, vectors, and CS.',
    description: 'A suite of calculators and utilities for linear algebra, calculus, chemistry, vectors, and CS workflows.',
    tags: ['React', 'TypeScript', 'Math Utilities'],
    github: 'https://github.com/juliank1m/course-tools',
    liveDemo: 'https://coursetools.juliankim.dev',
    previewSrc: 'https://coursetools.juliankim.dev',
    featureHighlights: [
      'Linear algebra, calculus, vector, and chemistry helpers.',
      'Keyboard-first UX for quick repeated calculations.',
      'Shared component system across tools.',
    ],
    theme: 'indigo',
  },
  {
    id: 'willowbrook-project',
    title: 'Willowbrook',
    kind: 'MonoGame title',
    category: 'game',
    year: '2024',
    summary: 'MonoGame DesktopGL title focused on gameplay-first loops and mechanics iteration.',
    description: 'A MonoGame DesktopGL project developed with C# and gameplay-first iteration loops.',
    tags: ['C#', 'MonoGame', 'Game Dev'],
    github: 'https://github.com/juliank1m/willowbrook-game',
    featureHighlights: [
      'Custom input + scene management for fast iteration.',
      'Gameplay-first prototyping loop — feel before content.',
      'Pixel-art sprite pipeline with content build automation.',
    ],
    theme: 'lime',
  },
  {
    id: 'meow-meow-misses-home-project',
    title: 'Meow Meow Misses Home',
    kind: 'MonoGame title',
    category: 'game',
    year: '2023',
    summary: 'MonoGame project tuned for game feel, pacing, and progression clarity.',
    description: 'A second MonoGame title focused on game feel, mechanics tuning, and level pacing.',
    tags: ['C#', 'MonoGame', 'Game Dev'],
    github: 'https://github.com/juliank1m/Meow-Meow-Misses-Home',
    featureHighlights: [
      'Tightly tuned single-mechanic gameplay loop.',
      'Pacing experiments across progression milestones.',
      'Authored pixel art and animation cycles.',
    ],
    theme: 'amber',
  },
]

export function getProjectById(projectId: string) {
  return projects.find((project) => project.id === projectId)
}
