// src/database/queries.js
import { pool } from '../../config/database.js'

export async function getRecentItems({ minutesAgo = 60 } = {}) {
  const interval = Number(minutesAgo) // ← coerce properly

  const query = `
    SELECT *
    FROM items
    WHERE created_utc > NOW() - INTERVAL '${interval} minutes'
    ORDER BY created_utc DESC
  `
  const { rows } = await db.query(query)
  return rows
}


export async function saveEmbeddings(itemId, embedding) {
  await pool.query(`UPDATE items SET embedding = $1 WHERE id = $2`, [
    embedding,
    itemId,
  ])
}

export async function getItemsWithEmbeddings() {
  const result = await pool.query(
    `SELECT * FROM items WHERE embedding IS NOT NULL`
  )
  return result.rows
}
