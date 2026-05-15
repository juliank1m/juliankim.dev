import { useEffect, useRef, useState } from 'react'
import {
  clearLocalScores,
  fetchTopScores,
  isRemoteLeaderboard,
  submitScore,
  type ScoreEntry,
} from '../lib/leaderboard'
import './SnakeGame.css'

type Point = { x: number; y: number }
type SnakeState = {
  snake: Point[]
  dir: Point
  /** Buffered direction changes. One is consumed per tick, so rapid
   *  presses (up→left around a corner) aren't lost between ticks. */
  pendingDirs: Point[]
  food: Point
}
type Status = 'idle' | 'playing' | 'over'
type Tab = 'play' | 'scores'

const GRID = 16
const CELL = 16

/**
 * Mini 16×16 snake. WASD or arrow keys when the window is hovered.
 * Best score + a top-10 leaderboard persist in localStorage.
 */
export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef<SnakeState | null>(null)
  const focusedRef = useRef(false)
  // Mirror of `score` for use inside the tick interval without making the
  // effect re-subscribe on every point (which used to cause a stutter).
  const scoreRef = useRef(0)

  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => {
    try {
      return parseInt(localStorage.getItem('snake-best') || '0', 10) || 0
    } catch {
      return 0
    }
  })
  const [status, setStatus] = useState<Status>('idle')
  const [tab, setTab] = useState<Tab>('play')
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [initials, setInitials] = useState('AAA')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Pull the leaderboard on mount, and whenever we flip to the scores tab
  // (so a freshly-submitted run on another device shows up).
  useEffect(() => {
    let cancelled = false
    fetchTopScores().then((list) => {
      if (!cancelled) setScores(list)
    })
    return () => {
      cancelled = true
    }
  }, [tab])

  const reset = () => {
    stateRef.current = {
      snake: [
        { x: 8, y: 8 },
        { x: 7, y: 8 },
        { x: 6, y: 8 },
      ],
      dir: { x: 1, y: 0 },
      pendingDirs: [],
      food: { x: 12, y: 8 },
    }
    scoreRef.current = 0
    setScore(0)
  }

  const start = () => {
    setTab('play')
    reset()
    setStatus('playing')
    setSaved(false)
    setInitials('')
    // Keys should respond immediately after clicking NEW, even if the
    // mouse hasn't crossed back into the snake body since the prior run.
    focusedRef.current = true
  }


  const saveScore = async () => {
    if (saved || saving || score === 0) return
    const filtered = (initials || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)
    const clean = filtered || 'AAA'
    setSaving(true)
    const updated = await submitScore({ initials: clean, score })
    setScores(updated)
    setSaved(true)
    setSaving(false)
  }

  const clearScores = () => {
    setScores([])
    clearLocalScores()
  }

  const placeFood = (snake: Point[]): Point => {
    let f: Point
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
    } while (snake.some((s) => s.x === f.x && s.y === f.y))
    return f
  }

  const draw = () => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#1a1830'
    ctx.fillRect(0, 0, c.width, c.height)
    const s = stateRef.current
    if (!s) return
    ctx.fillStyle = '#ffc1ba'
    ctx.fillRect(s.food.x * CELL + 2, s.food.y * CELL + 2, CELL - 4, CELL - 4)
    s.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#cdf4be' : '#8adfce'
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2)
    })
  }

  useEffect(() => {
    if (status !== 'playing') {
      draw()
      return
    }
    const id = window.setInterval(() => {
      const s = stateRef.current
      if (!s) return
      const queued = s.pendingDirs.shift()
      if (queued) s.dir = queued
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y }
      if (
        head.x < 0 ||
        head.x >= GRID ||
        head.y < 0 ||
        head.y >= GRID ||
        s.snake.some((seg) => seg.x === head.x && seg.y === head.y)
      ) {
        setStatus('over')
        setInitials('')
        setBest((b) => {
          const nb = Math.max(b, scoreRef.current)
          try {
            localStorage.setItem('snake-best', String(nb))
          } catch {
            /* ignore */
          }
          return nb
        })
        return
      }
      s.snake.unshift(head)
      if (head.x === s.food.x && head.y === s.food.y) {
        s.food = placeFood(s.snake)
        scoreRef.current += 1
        setScore(scoreRef.current)
      } else {
        s.snake.pop()
      }
      draw()
    }, 140)
    return () => window.clearInterval(id)
  }, [status])

  useEffect(() => {
    draw()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!focusedRef.current) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const s = stateRef.current
      if (!s) return
      let nd: Point | null = null
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') nd = { x: 0, y: -1 }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') nd = { x: 0, y: 1 }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') nd = { x: -1, y: 0 }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nd = { x: 1, y: 0 }
      if (!nd) return
      // Compare against the most recently *queued* direction (or current
      // direction if the queue is empty) — that's what the snake will be
      // facing when this input lands, so 180° checks have to use it.
      const ref = s.pendingDirs[s.pendingDirs.length - 1] ?? s.dir
      if (nd.x === -ref.x && nd.y === -ref.y) return
      if (nd.x === ref.x && nd.y === ref.y) return
      if (s.pendingDirs.length < 2) s.pendingDirs.push(nd)
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const renderBoard = () => (
    <>
      <div className="fw-snake-board">
        <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} />
        {status !== 'playing' ? (
          <div
            className="fw-snake-overlay"
            onClick={(e) => {
              if (
                e.target === e.currentTarget ||
                (e.target as HTMLElement).classList.contains('fw-snake-retry')
              )
                start()
            }}
          >
            {status === 'idle' ? (
              <div onClick={start}>
                <b>SNAKE</b>
                click to start
                <br />
                arrows / wasd
              </div>
            ) : (
              <div>
                <b>GAME OVER</b>
                score {score} · best {best}
                {score > 0 && !saved ? (
                  <div className="fw-snake-save">
                    <input
                      className="fw-initials"
                      maxLength={3}
                      value={initials}
                      autoFocus
                      placeholder="AAA"
                      onChange={(e) =>
                        setInitials(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                      }
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === 'Enter') saveScore()
                      }}
                      aria-label="Initials"
                    />
                    <button
                      disabled={saving}
                      onClick={(e) => {
                        e.stopPropagation()
                        saveScore()
                      }}
                    >
                      {saving ? '...' : 'save'}
                    </button>
                  </div>
                ) : saved ? (
                  <div className="fw-snake-saved">★ saved to scores</div>
                ) : null}
                <div className="fw-snake-retry">click to retry</div>
              </div>
            )}
          </div>
        ) : null}
      </div>
      <div className="fw-snake-meta">
        <span>SCORE {String(score).padStart(2, '0')}</span>
        <button onClick={start}>{status === 'playing' ? 'RESTART' : 'NEW'}</button>
        <span>BEST {String(best).padStart(2, '0')}</span>
      </div>
    </>
  )

  const renderLeaderboard = () => (
    <div className="fw-leaderboard">
      {scores.length === 0 ? (
        <div className="fw-leader-empty">
          <b>★ NO SCORES YET</b>
          play a round &amp;
          <br />
          save your initials
        </div>
      ) : (
        <>
          {scores.map((s, i) => (
            <div key={i} className={`fw-leader-row ${i === 0 ? 'top1' : ''}`}>
              <span className="fw-leader-rank">{String(i + 1).padStart(2, '0')}</span>
              <span className="fw-leader-name">{s.initials}</span>
              <span className="fw-leader-score">{String(s.score).padStart(3, '0')}</span>
            </div>
          ))}
          {isRemoteLeaderboard ? null : (
            <button className="fw-leader-clear" onClick={clearScores}>
              × clear scores
            </button>
          )}
        </>
      )}
    </div>
  )

  return (
    <div
      className="fw-snake-body"
      onMouseEnter={() => {
        focusedRef.current = true
      }}
      onMouseLeave={() => {
        focusedRef.current = false
      }}
    >
      <div className="fw-snake-tabs">
        <button
          className={`fw-snake-tab ${tab === 'play' ? 'active' : ''}`}
          onClick={() => setTab('play')}
        >
          ▸ play
        </button>
        <button
          className={`fw-snake-tab ${tab === 'scores' ? 'active' : ''}`}
          onClick={() => setTab('scores')}
        >
          ★ scores
        </button>
      </div>
      {tab === 'play' ? renderBoard() : renderLeaderboard()}
    </div>
  )
}
