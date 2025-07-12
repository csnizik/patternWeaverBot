const { fetchRecentItems } = require('./src/database/queries')

setInterval(async () => {
  const items = await fetchRecentItems({
    subreddit: 'climate',
    secondsAgo: 120,
  })
  console.log(`[Analyzer] Found ${items.length} recent items from r/climate`)
}, 30000)
