// /src/patterns/analyzer.js
import { fetchItemsFromLastHour, fetchItemById } from '../database/queries.js'
import { embedItem } from './semantic.js'
import cosineSimilarity from 'compute-cosine-similarity'

export async function compareRecentItems() {
  console.log('[Analyzer] Fetching items from last 60 min...')
  const items = await fetchItemsFromLastHour()

  if (items.length < 2) {
    console.log('Not enough items to compare.')
    return
  }

  console.log(`[Analyzer] Embedding ${items.length} items...`)
  const vectors = []

  for (const item of items) {
    const vector = await embedItem(item)
    if (vector) {
      vectors.push({ id: item.id, vector, item })
    }
  }

  console.log('[Analyzer] Comparing cross-subreddit pairs...\n')

  const results = []

  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const a = vectors[i]
      const b = vectors[j]

      if (a.item.subreddit === b.item.subreddit) continue

      const score = cosineSimilarity(a.vector, b.vector)
      results.push({ a: a.item, b: b.item, score })
    }
  }

  const topMatches = results.sort((a, b) => b.score - a.score).slice(0, 5)

  console.log('🔗 Top 5 cross-subreddit connections:\n')

  for (const match of topMatches) {
    const titleA = match.a.title || '(no title)'
    const titleB = match.b.title || '(no title)'

    console.log(`[${match.a.subreddit}] ${titleA.slice(0, 80)}`)
    console.log(`[${match.b.subreddit}] ${titleB.slice(0, 80)}\n`)
    console.log(`  ↳ Cosine similarity: ${match.score.toFixed(4)}`)
    console.log('—'.repeat(112))
  }
}
