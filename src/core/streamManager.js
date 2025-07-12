const snoowrap = require('snoowrap')
const dotenv = require('dotenv')
dotenv.config()

const seen = new Set()
const POLL_INTERVAL_MS = 15 * 1000 // 15s
const SUBREDDITS = [
  'technology',
  'psychology',
  'history',
  'biology',
  'economics',
  'climate',
]

const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
})

/**
 * Polls posts and comments from specified subreddits and calls handler with unified content objects.
 * @param {Function} handler - async function that receives each new item { id, type, subreddit, author, createdUtc, title?, body }
 */
function startStream(handler) {
  setInterval(async () => {
    for (const sub of SUBREDDITS) {
      try {
        const [posts, comments] = await Promise.all([
          reddit.getSubreddit(sub).getNew({ limit: 10 }),
          reddit.getSubreddit(sub).getNewComments({ limit: 10 }),
        ])

        const newItems = [...posts, ...comments].filter(
          (item) => !seen.has(item.id)
        )
        newItems.forEach((item) => seen.add(item.id))

        for (const item of newItems) {
          const out = normalizeItem(item, sub)
          if (out) await handler(out)
        }
      } catch (err) {
        console.error(
          `[StreamManager] Failed fetching from r/${sub}:`,
          err.message
        )
      }
    }
  }, POLL_INTERVAL_MS)
}

function normalizeItem(item, subreddit) {
  if (!item || !item.id) return null

  const isPost = !!item.title
  return {
    id: item.id,
    type: isPost ? 'post' : 'comment',
    subreddit,
    author: item.author?.name || '[deleted]',
    createdUtc: item.created_utc,
    title: isPost ? item.title : null,
    body: isPost ? item.selftext : item.body,
    permalink: item.permalink,
  }
}

module.exports = { startStream }
