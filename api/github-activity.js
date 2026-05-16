import { fetchGitHubActivity } from './github-activity-core.js'

const USERNAME = process.env.GH_ACTIVITY_USER || 'juliank1m'
const TOKEN =
  process.env.GH_PAT ||
  process.env.GITHUB_ACTIVITY_TOKEN ||
  process.env.GITHUB_TOKEN

export default async function handler(_req, res) {
  if (!TOKEN) {
    res.status(503).json({ error: 'GitHub activity token is not configured' })
    return
  }

  try {
    const activity = await fetchGitHubActivity({
      username: USERNAME,
      token: TOKEN,
      userAgent: 'juliankim-profile-api',
    })

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    res.status(200).json(activity)
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : 'Failed to fetch GitHub activity',
    })
  }
}
