async function insertItem(item) {
  const { id, subreddit, type } = item

  const query = `
    INSERT INTO reddit_items (id, type, subreddit, author, created_utc, title, body, permalink)
    VALUES ($1, $2, $3, $4, to_timestamp($5), $6, $7, $8)
    ON CONFLICT (id) DO NOTHING;
  `

  const values = [
    item.id,
    item.type,
    item.subreddit,
    item.author,
    item.createdUtc,
    item.title,
    item.body,
    item.permalink,
  ]

  try {
    await db.query(query, values)
    console.log(`✔ inserted ${type} from r/${subreddit}`)
  } catch (err) {
    console.error(`✖ failed to insert ${id} from r/${subreddit}:`, err.message)
  }
}
