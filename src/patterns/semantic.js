// /src/patterns/semantic.js
const { HfInference } = require('@huggingface/inference')
require('dotenv').config()

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN)

/**
 * Embeds plain text using all-MiniLM-L6-v2 via Hugging Face API.
 * Returns a 384-dimensional vector.
 */
async function embedText(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot embed empty text')
  }

  const formattedInput = `passage: ${text.trim()}`

  try {
    const embedding = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: formattedInput,
      options: {
        useCache: true,
        inference: { provider: 'hf-inference' }, // suppress "auto" spam
      },
    })

    if (!Array.isArray(embedding)) {
      throw new Error('Unexpected embedding response format')
    }

    return embedding
  } catch (err) {
    console.error('[semantic.js] Failed to embed text:', err.message)
    throw err
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
