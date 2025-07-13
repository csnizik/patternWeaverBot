import { fetchItemsFromLastHour } from '../database/queries.js'
import { embedItem } from './semantic.js'
import cosineSimilarity from 'compute-cosine-similarity'

/**
 * Compares recent items across subreddits and prints the top semantic similarities.
 */
export async function compareRecentItems(allItems) {
  console.log('[Analyzer] Embedding', allItems.length, 'items...')

  const filteredItems = allItems
    .map((item) => {
      const combined = `${item.title ?? ''}\n${item.body ?? ''}`.trim()
      return { ...item, combined }
    })
    .filter((item) => item.combined.length > 0)
    .filter(
      (item, index, self) =>
        self.findIndex((other) => other.combined === item.combined) === index
    )

  console.log(
    `[Analyzer] Reduced to ${filteredItems.length} unique non-empty items.`
  )

  const embedded = []
  for (const item of filteredItems) {
    const vector = await embedItem(item)
    if (vector) embedded.push({ ...item, vector })
  }

  // then continue with similarity comparison logic...
}
