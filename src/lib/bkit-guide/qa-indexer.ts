// bkit-guide Q&A Indexer
// Indexes Q&A pairs to LanceDB for vector search
// Uses local embeddings (Xenova/all-MiniLM-L6-v2)

import * as lancedb from '@lancedb/lancedb';
import path from 'path';
import type { BkitQA } from './qa-store';

const LANCEDB_PATH = process.env.LANCEDB_PATH || path.join(process.cwd(), 'data', 'lancedb');
const TABLE_NAME = 'bkit_qa_embeddings';

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

// Ensure table exists with correct schema (384-dim)
async function ensureTable(db: lancedb.Connection): Promise<lancedb.Table> {
  try {
    return await db.openTable(TABLE_NAME);
  } catch {
    await db.createTable(TABLE_NAME, [
      {
        id: 'init',
        question: 'init',
        answer: 'init',
        combined: 'init',
        category: 'init',
        language: 'init',
        qaId: 'init',
        createdAt: new Date().toISOString(),
        vector: new Array(384).fill(0),
      }
    ]);
    const table = await db.openTable(TABLE_NAME);
    await table.delete("id = 'init'");
    return table;
  }
}

// Index a single Q&A pair
export async function indexQA(qa: BkitQA): Promise<boolean> {
  try {
    const db = await lancedb.connect(LANCEDB_PATH);
    const table = await ensureTable(db);

    // Combine question and answer for embedding
    const combined = `질문: ${qa.question}\n\n답변: ${qa.answer}`;
    const embedding = await getLocalEmbedding(combined);

    const record = {
      id: qa._id.toString(),
      question: qa.question,
      answer: qa.answer,
      combined,
      category: qa.category,
      language: qa.language,
      qaId: qa._id.toString(),
      createdAt: qa.createdAt.toISOString(),
      vector: embedding,
    };

    await table.add([record]);
    return true;
  } catch {
    return false;
  }
}

// Search similar Q&As
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
    const db = await lancedb.connect(LANCEDB_PATH);
    const table = await db.openTable(TABLE_NAME);
    const queryEmbedding = await getLocalEmbedding(query);

    const results = await table
      .vectorSearch(queryEmbedding)
      .limit(limit)
      .toArray();

    return results.map((row: Record<string, unknown>) => ({
      question: row.question as string,
      answer: row.answer as string,
      category: row.category as string,
      language: row.language as string,
      qaId: row.qaId as string,
      score: row._distance as number,
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
    const db = await lancedb.connect(LANCEDB_PATH);
    const table = await db.openTable(TABLE_NAME);
    const allRecords = await table.query().limit(10000).toArray();

    const byCategory: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};

    allRecords.forEach((row: Record<string, unknown>) => {
      const category = row.category as string;
      const language = row.language as string;
      byCategory[category] = (byCategory[category] || 0) + 1;
      byLanguage[language] = (byLanguage[language] || 0) + 1;
    });

    return {
      totalIndexed: allRecords.length,
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
    const db = await lancedb.connect(LANCEDB_PATH);
    const table = await db.openTable(TABLE_NAME);
    await table.delete(`qaId = '${qaId.replace(/'/g, "''")}'`);
    return true;
  } catch {
    return false;
  }
}
