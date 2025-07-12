const { HfInference } = require('@huggingface/inference')
require('dotenv').config()

const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN)

/**
 * Converts Reddit content into a sentence embedding using E5-small.
 * Automatically prepends the model's required input format for inference.
 * @param {string} text - The text content to embed.
 * @returns {Promise<number[]>} embedding vector as an array of floats
 */
async function embedText(text) {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot embed empty text')
  }

  const formattedInput = `passage: ${text}`

  try {
    const embedding = await hf.featureExtraction({
      model: 'intfloat/e5-small',
      inputs: formattedInput,
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
 * Wrapper for embedding a Reddit item (post or comment)
 * @param {object} item - A normalized item from streamManager
 * @returns {Promise<number[]>}
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
