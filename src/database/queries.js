const db = require('../../config/database')

async function insertItem(item) {
  const { id, type, subreddit, author, createdUtc, title, body, permalink } =
    item

  const query = `
    INSERT INTO reddit_items (id, type, subreddit, author, created_utc, title, body, permalink)
    VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8)
    ON CONFLICT (id) DO NOTHING;
  `

  const values = [
    id,
    type,
    subreddit,
    author,
    createdUtc,
    title,
    body,
    permalink,
  ]
  await db.query(query, values)
}

async function fetchRecentItems({ subreddit, secondsAgo = 300 }) {
  const query = `
    SELECT *
    FROM reddit_items
    WHERE subreddit = $1
      AND created_utc > NOW() - INTERVAL '${secondsAgo} seconds'
    ORDER BY created_utc DESC;
  `

  const { rows } = await db.query(query, [subreddit])
  return rows
}

module.exports = {
  insertItem,
  fetchRecentItems,
}
