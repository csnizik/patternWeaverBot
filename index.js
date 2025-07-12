const { startStream } = require('./src/core/streamManager')

startStream(async (item) => {
  console.log(
    `[${item.subreddit}] ${item.type}: ${
      item.title || item.body?.slice(0, 100)
    }...`
  )
})
