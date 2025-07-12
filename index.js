const { startStream } = require('./src/core/streamManager')
const { insertItem } = require('./src/database/queries')

startStream(async (item) => {
  await insertItem(item)
  console.log(`Stored: [${item.subreddit}] ${item.type} ${item.id}`)
})
