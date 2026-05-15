import { supabase } from './supabase'

export type ScoreEntry = { initials: string; score: number; ts: number }

const TABLE = 'snake_scores'
const LOCAL_KEY = 'snake-scores'
const TOP_N = 10

export const isRemoteLeaderboard = supabase !== null

function readLocal(): ScoreEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as ScoreEntry[]
  } catch {
    return []
  }
}

function writeLocal(list: ScoreEntry[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export async function fetchTopScores(limit = TOP_N): Promise<ScoreEntry[]> {
  if (!supabase) {
    return readLocal()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }
  const { data, error } = await supabase
    .from(TABLE)
    .select('initials, score, created_at')
    .order('score', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map((row) => ({
    initials: row.initials,
    score: row.score,
    ts: new Date(row.created_at).getTime(),
  }))
}

export async function submitScore(entry: Omit<ScoreEntry, 'ts'>): Promise<ScoreEntry[]> {
  if (!supabase) {
    const next = [...readLocal(), { ...entry, ts: Date.now() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
    writeLocal(next)
    return next
  }
  const { error } = await supabase.from(TABLE).insert({
    initials: entry.initials,
    score: entry.score,
  })
  if (error) {
    // Surface DB rejects (CHECK constraint, RLS, etc.) to the console so
    // they're debuggable — silent fallback used to hide real failures.
    console.error('[leaderboard] submit failed:', error.message, error)
    const fallback = [...readLocal(), { ...entry, ts: Date.now() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
    writeLocal(fallback)
  }
  return fetchTopScores(TOP_N)
}

/** Local-only — meaningless when remote is on. */
export function clearLocalScores() {
  try {
    localStorage.removeItem(LOCAL_KEY)
  } catch {
    /* ignore */
  }
}
