const { startStream } = require('./src/core/streamManager')
const { insertItem } = require('./src/database/queries') // ← ✅ missing line added

startStream(async (item) => {
  try {
    await insertItem(item)
    console.log(`Stored: [${item.subreddit}] ${item.type} ${item.id}`)
  } catch (err) {
    console.error('Insert failed:', err.message)
  }
})
