const { HfInference } = require('@huggingface/inference')
require('dotenv').config()

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN)

/**
 * Embeds plain text using E5-small via Hugging Face API.
 * Returns a 384-dimensional vector.
 */
async function embedText(text, attempt = 1) {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot embed empty text')
  }

  const formattedInput = `passage: ${text.trim()}`

  try {
    const embedding = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: formattedInput,
    })

    if (!Array.isArray(embedding)) {
      throw new Error('Unexpected embedding response format')
    }

    return embedding
  } catch (err) {
    if (attempt >= 3) {
      console.error(
        `[semantic.js] Failed to embed text after 3 tries: ${err.message}`
      )
      throw err
    }

    const delay = 1000 * Math.pow(2, attempt) // 1s, 2s, 4s
    console.warn(
      `[semantic.js] Retry ${attempt} in ${delay}ms due to error: ${err.message}`
    )
    await new Promise((r) => setTimeout(r, delay))
    return embedText(text, attempt + 1)
  }
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
