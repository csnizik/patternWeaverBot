// /src/patterns/semantic.js
require('dotenv').config()
const fetch = require('node-fetch')

const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'
const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN
const HF_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`

/**
 * Embeds plain text using Hugging Face inference API (no SDK).
 * Returns a 384-dimensional vector.
 */
async function embedText(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot embed empty text')
  }

  const formattedInput = `passage: ${text.trim()}`

  const res = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: formattedInput }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HF API error: ${res.status} ${res.statusText} — ${body}`)
  }

  const embedding = await res.json()

  if (!Array.isArray(embedding)) {
    throw new Error('Unexpected embedding response format')
  }

  return embedding
}

/**
 * Combines title and body (if present) to form input for semantic embedding.
 */
async function embedItem(item) {
  const text = item.title
    ? `${item.title}\n\n${item.body || ''}`.trim()
    : item.body

  return await embedText(text)
}

module.exports = {
  embedText,
  embedItem,
}
