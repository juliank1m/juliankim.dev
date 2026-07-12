export type ProjectCategory = 'web' | 'data' | 'game' | 'tool'

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
    id: 'val-predict-project',
    title: 'Val Predict',
    kind: 'ML prediction app',
    category: 'data',
    year: '2026',
    summary:
      'Pre-match win-probability predictions for pro Valorant, powered by an XGBoost model over historical VLR.gg data.',
    description:
      'A full-stack Valorant match-prediction app. An XGBoost model trained on 87 engineered features (Elo ratings, rolling form, map- and agent-specific stats, head-to-head, roster stability) produces pre-match win probabilities, served through a FastAPI backend and a Next.js dashboard with team pages, head-to-head comparison, and model diagnostics.',
    tags: ['Python', 'FastAPI', 'XGBoost', 'PostgreSQL', 'Next.js'],
    github: 'https://github.com/juliank1m/val-predict',
    liveDemo: 'https://valpredict.juliankim.dev',
    previewSrc: 'https://valpredict.juliankim.dev',
    previewBlocked: true,
    featureHighlights: [
      'XGBoost win-probability model over 87 engineered features — Elo, rolling stats, map-specific, H2H, roster stability, and player/agent composition.',
      'VLR.gg odds scraped from 5 bookmakers for market-implied probability and expected-value display.',
      'FastAPI + SQLAlchemy + PostgreSQL backend with a typed REST API and Swagger/ReDoc docs.',
      'Team pages with Elo history, map-pool win rates, rosters, and head-to-head comparison.',
      'Model page with calibration curve, rolling accuracy/log-loss, and feature-importance rankings.',
    ],
    theme: 'indigo',
  },
  {
    id: 'mddlmn-project',
    title: 'mddlmn',
    kind: 'Agent proxy + VS Code extension',
    category: 'tool',
    year: '2026',
    summary:
      'Local observability and control layer for AI coding agents — proxy, inspect, gate, and rewrite Anthropic API traffic.',
    description:
      'A local pass-through proxy for Anthropic API traffic from coding agents like Claude Code. It captures, classifies, and persists every request to SQLite, and can hold requests for human review, redact secrets before they reach the model, and inject standing instructions — all surfaced through a REST API, live websocket feed, React inspector, and VS Code extension.',
    tags: ['TypeScript', 'Fastify', 'SQLite', 'React', 'VS Code'],
    github: 'https://github.com/juliank1m/mddlmn',
    liveDemo: 'https://mddlmn.juliankim.dev/',
    previewSrc: 'https://mddlmn.juliankim.dev/',
    featureHighlights: [
      'Pass-through proxy that captures and classifies every Anthropic request into system, user, injected-context, tool, thinking, and assistant sections.',
      'Request gating: hold each request for review, then approve, edit, or abort — with an in-UI editor for text, tool JSON, model swaps, and block reordering.',
      'Secret redaction (Anthropic/OpenAI/AWS keys, PEM blocks, plus custom rules) that runs before traffic is shown or forwarded.',
      'Prompt- and memory-injection pipelines with configurable targets and scopes.',
      'React traffic inspector plus a VS Code extension that wires up ANTHROPIC_BASE_URL and opens the inspector in a webview.',
    ],
    theme: 'mint',
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
