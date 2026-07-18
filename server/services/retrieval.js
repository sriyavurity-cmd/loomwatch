/**
 * Lightweight term-overlap retrieval. This deliberately avoids requiring an
 * external embeddings API (Gemini, OpenAI, etc.) so the knowledge base works
 * out of the box with zero extra setup. It's a simple TF-based cosine
 * similarity over word frequency vectors - not as strong as real embeddings,
 * but transparent, fast, and dependency-free, which fits a scoped 2-day build.
 */

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be",
  "been", "being", "to", "of", "in", "on", "for", "with", "at", "by", "from",
  "as", "that", "this", "it", "we", "our", "us", "what", "did", "do", "does",
  "how", "who", "which", "i", "you", "your"
]);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9']+/g) || []).filter((t) => !STOPWORDS.has(t));
}

function termFrequency(tokens) {
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  return freq;
}

function cosineSimilarity(freqA, freqB) {
  const keys = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const k of keys) {
    const a = freqA[k] || 0;
    const b = freqB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Ranks documents by relevance to a query. Returns each doc with a 0-1 score,
 * sorted descending, so the caller can take the top K.
 */
function rankDocuments(query, documents) {
  const queryFreq = termFrequency(tokenize(query));

  return documents
    .map((doc) => {
      const docFreq = termFrequency(tokenize(`${doc.title} ${doc.content}`));
      const score = cosineSimilarity(queryFreq, docFreq);
      return { doc, score };
    })
    .sort((a, b) => b.score - a.score);
}

module.exports = { rankDocuments };
