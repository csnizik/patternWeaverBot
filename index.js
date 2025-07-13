require('dotenv').config()

const { fetchRecentItems } = require('./src/database/queries')
const { embedItem } = require('./src/patterns/semantic')

;(async () => {
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
      console.log('First 5 dims:', vector.slice(0, 5))
      console.log('Vector length:', vector.length)
      console.log('—'.repeat(60))
    }
  } catch (err) {
    console.error('❌ Failed:', err.message)
  }
})()
