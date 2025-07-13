// src/database/queries.js
import { pool } from '../../config/database.js'

/**
 * Fetch items created within the last `minutesAgo`.
 */
export async function getRecentItems({ minutesAgo = 60 } = {}) {
  const interval = Number(minutesAgo)
  if (isNaN(interval) || interval <= 0) {
    throw new Error(`Invalid minutesAgo value: ${minutesAgo}`)
  }

  const query = `
    SELECT *
    FROM items
    WHERE created_utc > NOW() - ($1 * INTERVAL '1 minute')
    ORDER BY created_utc DESC
  `
  const { rows } = await pool.query(query, [interval])
  return rows
}


/**
 * Persist a 384-dimensional embedding vector (as JSON) for a given item.
 */
export async function saveEmbeddings(itemId, embedding) {
  if (!itemId || !Array.isArray(embedding)) {
    throw new Error('Invalid arguments to saveEmbeddings')
  }

  await pool.query(`UPDATE items SET embedding = $1 WHERE id = $2`, [
    JSON.stringify(embedding),
    itemId,
  ])
}

/**
 * Get all items that already have an embedding stored.
 */
export async function getItemsWithEmbeddings() {
  const result = await pool.query(
    `SELECT * FROM items WHERE embedding IS NOT NULL`
  )
  return result.rows
}
