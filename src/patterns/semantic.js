// /src/database/queries.js
const db = require('../../config/database')

export async function insertItem(item) {
  const { id, type, subreddit, author, createdUtc, title, body, permalink } =
    item

  const query = `
    INSERT INTO reddit_items (
      id, type, subreddit, author, created_utc,
      title, body, permalink, ingested_at
    )
    VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8, NOW())
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

export async function fetchRecentItems({ subreddit, secondsAgo = 300 }) {
  const intervalSeconds = Number(secondsAgo)

  const query = `
    SELECT *
    FROM reddit_items
    WHERE subreddit = $1
      AND ingested_at > NOW() - INTERVAL '${intervalSeconds} seconds'
    ORDER BY ingested_at DESC;
  `

  const values = [subreddit]
  const { rows } = await db.query(query, values)
  return rows
}

export async function fetchItemsFromLastHour() {
  const query = `
    SELECT *
    FROM reddit_items
    WHERE ingested_at > NOW() - INTERVAL '60 minutes'
    ORDER BY ingested_at DESC;
  `
  const { rows } = await db.query(query)
  return rows
}

export async function fetchItemById(id) {
  const query = `
    SELECT *
    FROM reddit_items
    WHERE id = $1;
  `
  const values = [id]
  const { rows } = await db.query(query, values)
  return rows[0]
}
