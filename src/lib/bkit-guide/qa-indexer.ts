// bkit-guide Q&A Indexer
// Indexes Q&A pairs to MongoDB Atlas Vector Search
// Uses local embeddings (Xenova/all-MiniLM-L6-v2)

import { db } from '@/lib/adapters';
import type { BkitQA } from './qa-store';

const COLLECTION_NAME = 'bkit_qa_embeddings';

// Singleton for local embeddings pipeline
let localEmbeddingsPipeline: unknown = null;

// Get local embedding using transformers.js (384-dim)
async function getLocalEmbedding(text: string): Promise<number[]> {
  if (!localEmbeddingsPipeline) {
    const { pipeline } = await import('@xenova/transformers');
    localEmbeddingsPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }

  const output = await (localEmbeddingsPipeline as (text: string, options: { pooling: string; normalize: boolean }) => Promise<{ data: Float32Array }>)(
    text.slice(0, 512),
    { pooling: 'mean', normalize: true }
  );

  return Array.from(output.data);
}

// Get collection
async function getCollection() {
  if (!db.isConnected()) {
    await db.connect();
  }
  return db.getCollection(COLLECTION_NAME);
}

// Index a single Q&A pair
export async function indexQA(qa: BkitQA): Promise<boolean> {
  try {
    const collection = await getCollection();

    // Combine question and answer for embedding
    const combined = `질문: ${qa.question}\n\n답변: ${qa.answer}`;
    const embedding = await getLocalEmbedding(combined);

    const record = {
      qaId: qa._id.toString(),
      question: qa.question,
      answer: qa.answer,
      combined,
      category: qa.category,
      language: qa.language,
      embedding,
      createdAt: qa.createdAt,
    };

    // Upsert to avoid duplicates
    await collection.updateOne(
      { qaId: qa._id.toString() },
      { $set: record },
      { upsert: true }
    );

    return true;
  } catch (error) {
    console.error('Index Q&A error:', error);
    return false;
  }
}

// Search similar Q&As using MongoDB Atlas Vector Search
export async function searchSimilarQAs(
  query: string,
  limit: number = 5
): Promise<
  Array<{
    question: string;
    answer: string;
    category: string;
    language: string;
    qaId: string;
    score: number;
  }>
> {
  try {
    const collection = await getCollection();
    const queryEmbedding = await getLocalEmbedding(query);

    // Try MongoDB Atlas Vector Search first
    try {
      const results = await collection.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: limit * 10,
            limit: limit,
          },
        },
        {
          $project: {
            question: 1,
            answer: 1,
            category: 1,
            language: 1,
            qaId: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ]).toArray();

      return results.map((row) => ({
        question: row.question as string,
        answer: row.answer as string,
        category: row.category as string,
        language: row.language as string,
        qaId: row.qaId as string,
        score: 1 - (row.score as number),
      }));
    } catch {
      // Fallback to text search if vector search not configured
      return fallbackTextSearch(query, limit);
    }
  } catch (error) {
    console.error('Search Q&A error:', error);
    return [];
  }
}

// Fallback text search when vector search is not configured
async function fallbackTextSearch(
  query: string,
  limit: number
): Promise<Array<{ question: string; answer: string; category: string; language: string; qaId: string; score: number }>> {
  try {
    const collection = await getCollection();

    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    if (keywords.length === 0) return [];

    const regex = new RegExp(keywords.join('|'), 'i');

    const results = await collection
      .find({ $or: [{ question: { $regex: regex } }, { answer: { $regex: regex } }] })
      .limit(limit)
      .toArray();

    return results.map((row, index) => ({
      question: row.question as string,
      answer: row.answer as string,
      category: row.category as string,
      language: row.language as string,
      qaId: row.qaId as string,
      score: index * 0.1,
    }));
  } catch {
    return [];
  }
}

// Get Q&A embeddings stats
export async function getQAEmbeddingsStats(): Promise<{
  totalIndexed: number;
  byCategory: Record<string, number>;
  byLanguage: Record<string, number>;
} | null> {
  try {
    const collection = await getCollection();
    const totalIndexed = await collection.countDocuments();

    const categoryAgg = await collection
      .aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
      .toArray();

    const byCategory: Record<string, number> = {};
    categoryAgg.forEach((item) => {
      byCategory[item._id as string] = item.count;
    });

    const languageAgg = await collection
      .aggregate([{ $group: { _id: '$language', count: { $sum: 1 } } }])
      .toArray();

    const byLanguage: Record<string, number> = {};
    languageAgg.forEach((item) => {
      byLanguage[item._id as string] = item.count;
    });

    return {
      totalIndexed,
      byCategory,
      byLanguage,
    };
  } catch {
    return null;
  }
}

// Delete Q&A from index
export async function deleteQAFromIndex(qaId: string): Promise<boolean> {
  try {
    const collection = await getCollection();
    await collection.deleteOne({ qaId });
    return true;
  } catch {
    return false;
  }
}
