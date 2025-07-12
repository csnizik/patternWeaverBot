const { fetchRecentItems } = require('./src/database/queries')
const { embedItem } = require('./src/patterns/semantic')
require('dotenv').config()

;(async () => {
  try {
    const items = await fetchRecentItems({
      subreddit: 'psychology',
      secondsAgo: 300,
    })

    console.log(`Embedding ${items.length} items from r/psychology...`)

    for (const item of items.slice(0, 5)) {
      // limit for quick test
      const vector = await embedItem(item)
      console.log('ID:', item.id)
      console.log('First 5 dims:', vector.slice(0, 5))
      console.log('Vector length:', vector.length)
      console.log('—'.repeat(40))
    }
  } catch (err) {
    console.error('Test failed:', err.message)
  }
})()
