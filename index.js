// index.js
import dotenv from 'dotenv'
import { fetchRecentItems } from './src/database/queries.js'
import { embedItem } from './src/patterns/semantic.js'
import { compareRecentItems } from './src/patterns/analyzer.js'

dotenv.config()

const run = async () => {
  try {
    const secondsAgo = 300 // 5 minutes
    const items = await fetchRecentItems({
      subreddit: 'psychology',
      secondsAgo,
    })

    console.log(`Embedding ${items.length} items from r/psychology...`)

    for (const item of items.slice(0, 5)) {
      const vector = await embedItem(item)

      console.log('ID:', item.id)
      console.log('Title:', item.title?.slice(0, 100))
      console.log('Body:', item.body?.slice(0, 100))
      console.log('First 5 dims:', vector?.slice(0, 5))
      console.log('Vector length:', vector?.length)
      console.log('—'.repeat(60))
    }

    await compareRecentItems()
  } catch (err) {
    console.error('❌ Failed:', err.message)
  }
}

run()
