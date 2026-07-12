import { useEffect, useRef, useState } from 'react'
import './Terminal.css'

type LineKind = 'sys' | 'user' | 'err'
type Line = { kind: LineKind; text: string }

const TERM_BANNER: Line[] = [
  { kind: 'sys', text: 'juliank1m.dev shell v1.0.4' },
  { kind: 'sys', text: 'type `help` for commands' },
]

const TERM_JOKES = [
  'why do programmers prefer dark mode? light attracts bugs.',
  "!false — funny because it's true.",
  "there are 10 types of people: those who get binary & those who don't.",
  'a SQL query walks into a bar, sees two tables, asks "may I join you?"',
]

const TERM_PROJECTS = [
  '· devpost-clone   — full-stack hackathon archive',
  '· dish-tracker    — meal planning ML side-quest',
  '· compiler-class  — toy lang, lexer→parser→codegen',
  '· this site       — react + vite, deployed on vercel',
]

/**
 * Toy shell. Recognized commands: help, whoami, skills, projects,
 * contact, joke, date, coffee, clear, sudo, ls.
 */
export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(TERM_BANNER)
  const [input, setInput] = useState('')
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const append = (...newLines: Line[]) => setLines((ls) => [...ls, ...newLines])

  const run = (raw: string) => {
    const cmd = raw.trim()
    append({ kind: 'user', text: '> ' + cmd })
    if (!cmd) return
    const [head] = cmd.split(/\s+/)
    switch (head.toLowerCase()) {
      case 'help':
        append(
          { kind: 'sys', text: 'commands:' },
          { kind: 'sys', text: '  whoami  skills  projects' },
          { kind: 'sys', text: '  contact  date  coffee' },
          { kind: 'sys', text: '  joke    ls      clear' },
        )
        break
      case 'whoami':
        append(
          { kind: 'sys', text: 'julian kim — se @ uwaterloo' },
          { kind: 'sys', text: 'building things end-to-end' },
        )
        break
      case 'skills':
        append(
          { kind: 'sys', text: 'react · typescript · python' },
          { kind: 'sys', text: 'sql · c · c++ · postgres' },
        )
        break
      case 'projects':
        TERM_PROJECTS.forEach((p) => append({ kind: 'sys', text: p }))
        break
      case 'contact':
        append(
          { kind: 'sys', text: 'mailto:julian.kim@uwaterloo.ca' },
          { kind: 'sys', text: 'github.com/juliank1m' },
        )
        break
      case 'date':
        append({ kind: 'sys', text: new Date().toString() })
        break
      case 'coffee':
        append({ kind: 'sys', text: '☕ refilled. +1 productivity.' })
        break
      case 'joke':
        append({ kind: 'sys', text: TERM_JOKES[Math.floor(Math.random() * TERM_JOKES.length)] })
        break
      case 'ls':
        append({ kind: 'sys', text: 'home  projects  about  resume.pdf' })
        break
      case 'sudo':
        append({ kind: 'err', text: 'nice try.' })
        break
      case 'clear':
        setLines([])
        return
      default:
        append({ kind: 'err', text: `${head}: command not found. try \`help\`` })
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
    }
  }

  return (
    <div className="fw-term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
      {lines.map((l, i) => (
        <div key={i} className={`fw-term-line ${l.kind}`}>
          {l.text}
        </div>
      ))}
      <div className="fw-term-input-row">
        <span className="fw-term-prompt">{'>'}</span>
        <input
          ref={inputRef}
          className="fw-term-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          spellCheck="false"
          autoComplete="off"
          aria-label="terminal input"
        />
      </div>
    </div>
  )
}
