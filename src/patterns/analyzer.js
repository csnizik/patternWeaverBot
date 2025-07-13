// /src/patterns/analyzer.js
const { fetchRecentItems } = require('../database/queries')
const { embedItem } = require('./semantic')
const cosine = require('compute-cosine-similarity') // install via npm

const SUBREDDITS = [
  'technology',
  'psychology',
  'history',
  'biology',
  'economics',
  'climate',
]
const WINDOW_SECONDS = 3600 // 1 hour window

function pairwiseCrossSubreddit(items) {
  const pairs = []

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]
      if (a.subreddit !== b.subreddit) {
        pairs.push([a, b])
      }
    }
  }

  return pairs
}

async function compareRecentItems() {
  console.log(
    `[Analyzer] Fetching items from last ${WINDOW_SECONDS / 60} min...`
  )

  const allItems = []
  for (const subreddit of SUBREDDITS) {
    const items = await fetchRecentItems({
      subreddit,
      secondsAgo: WINDOW_SECONDS,
    })
    allItems.push(...items)
  }

  if (allItems.length < 2) {
    console.warn('[Analyzer] Not enough items to compare.')
    return
  }

  console.log(`[Analyzer] Embedding ${allItems.length} items...`)

  const embeddings = {}
  for (const item of allItems) {
    embeddings[item.id] = await embedItem(item)
  }

  console.log('[Analyzer] Comparing cross-subreddit pairs...')
  const pairs = pairwiseCrossSubreddit(allItems)
  const scored = []

  for (const [a, b] of pairs) {
    const sim = cosine(embeddings[a.id], embeddings[b.id])
    scored.push({ a, b, sim })
  }

  scored.sort((x, y) => y.sim - x.sim)
  const top = scored.slice(0, 5)

  console.log(`\n🔗 Top ${top.length} cross-subreddit connections:\n`)

  for (const { a, b, sim } of top) {
    console.log(`[${a.subreddit}] ${a.title?.slice(0, 80)}`)
    console.log(`[${b.subreddit}] ${b.title?.slice(0, 80)}`)
    console.log(`  ↳ Cosine similarity: ${sim.toFixed(4)}`)
    console.log('—'.repeat(80))
  }
}

module.exports = {
  compareRecentItems,
}
