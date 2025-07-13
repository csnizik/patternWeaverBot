// src/database/queries.js
import { pool } from '../../config/database.js'

export async function getRecentItems(limitMinutes = 60) {
  const result = await pool.query(
    `SELECT * FROM items
     WHERE created_utc >= NOW() - INTERVAL '${limitMinutes} minutes'
     ORDER BY created_utc DESC`
  )
  return result.rows
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
