require('dotenv').config()
const snoowrap = require('snoowrap')

const r = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
})

r.getMe()
  .then((user) => {
    console.log(`✅ Authenticated as ${user.name}`)
  })
  .catch((err) => {
    console.error('❌ Reddit auth failed:', err.message)
  })
