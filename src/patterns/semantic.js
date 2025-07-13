// /src/patterns/semantic.js
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const HF_MODEL_URL =
  'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2'
const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN

if (!HF_API_TOKEN) {
  throw new Error('HUGGINGFACE_API_TOKEN is not set in .env')
}

/**
 * Embeds plain text using sentence-transformers/all-MiniLM-L6-v2 via Hugging Face Inference API.
 * Returns a 384-dimensional vector.
 */
export async function embedText(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot embed empty text')
  }

  const response = await fetch(HF_MODEL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: [text.trim()] }), // ✅ This is the fix
  })

  if (!response.ok) {
    const msg = await response.text()
    throw new Error(
      `HF API error: ${response.status} ${response.statusText} — ${msg}`
    )
  }

  const result = await response.json()

  if (!Array.isArray(result) || !Array.isArray(result[0])) {
    throw new Error('Unexpected HF API response format (expected 2D array)')
  }

  return result[0] // Return the vector itself
}

/**
 * Combines title and body (if present) to form input for semantic embedding.
 */
export async function embedItem(item) {
  const text = item.title
    ? `${item.title}\n\n${item.body || ''}`.trim()
    : item.body

  try {
    return await embedText(text)
  } catch (err) {
    console.error(`[Analyzer] Failed to embed item ${item.id}:`, err.message)
    return null
  }
}
