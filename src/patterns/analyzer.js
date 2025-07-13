// /src/patterns/analyzer.js
import { embedItem } from './semantic.js'
import { getRecentItems } from '../database/queries.js'
import cosineSimilarity from './cosine.js'

// Minimum similarity to consider as a "connection"
const SIMILARITY_THRESHOLD = 0.4

/**
 * Filters out items with null/blank title+body or suspected reposts
 */
function filterItems(items) {
  const seenHashes = new Set()

  return items.filter((item) => {
    const title = (item.title || '').trim()
    const body = (item.body || '').trim()
    const combined = `${title}\n\n${body}`.trim()

    if (!combined || combined.length < 20) return false

    const hash = combined.toLowerCase().replace(/\s+/g, '')
    if (seenHashes.has(hash)) return false

    seenHashes.add(hash)
    return true
  })
}

export async function compareRecentItems() {
  const allItems = await getRecentItems()
  if (!Array.isArray(allItems) || allItems.length === 0) {
    console.warn('[Analyzer] No items retrieved.')
    return
  }

  const filtered = filterItems(allItems)
  if (filtered.length === 0) {
    console.warn('[Analyzer] All items were filtered out.')
    return
  }

  console.log(`[Analyzer] Embedding ${filtered.length} items...`)
  const embedded = await Promise.all(
    filtered.map(async (item) => ({
      ...item,
      vector: await embedItem(item),
    }))
  )

  const valid = embedded.filter((i) => Array.isArray(i.vector))
  const pairs = []

  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const a = valid[i]
      const b = valid[j]

      if (a.subreddit === b.subreddit) continue
      if (a.title === b.title && a.body === b.body) continue

      const sim = cosineSimilarity(a.vector, b.vector)
      if (sim >= SIMILARITY_THRESHOLD) {
        pairs.push({ a, b, similarity: sim })
      }
    }
  }

  const top = pairs.sort((x, y) => y.similarity - x.similarity).slice(0, 5)

  console.log('\n🔗 Top 5 cross-subreddit connections:\n')

  for (const { a, b, similarity } of top) {
    console.log(`[${a.subreddit}] ${a.title || '(no title)'}`)
    console.log(`[${b.subreddit}] ${b.title || '(no title)'}\n`)
    console.log(`  ↳ Cosine similarity: ${similarity.toFixed(4)}`)
    console.log('—'.repeat(120))
  }
}
