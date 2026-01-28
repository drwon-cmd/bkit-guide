// bkit-guide GitHub Fetcher
// Fetches official documentation from bkit GitHub repository
// Uses MongoDB Atlas Vector Search for embeddings

import { db } from '@/lib/adapters';

const GITHUB_REPO = 'popup-studio-ai/bkit-claude-code';
const GITHUB_BRANCH = 'main';
const COLLECTION_NAME = 'bkit_github_docs';

// Files to index from the repository
const FILES_TO_INDEX = [
  'README.md',
  'CHANGELOG.md',
  'bkit-system/SYSTEM_PROMPT.md',
  'bkit-system/bkit-rules/SKILL.md',
  'skills/development-pipeline/SKILL.md',
  'skills/pdca-methodology/SKILL.md',
  'skills/phase-1-schema/SKILL.md',
  'skills/phase-2-convention/SKILL.md',
  'skills/phase-3-mockup/SKILL.md',
  'skills/phase-4-api/SKILL.md',
  'skills/phase-5-design-system/SKILL.md',
  'skills/phase-6-ui-integration/SKILL.md',
  'skills/phase-7-seo-security/SKILL.md',
  'skills/phase-8-review/SKILL.md',
  'skills/phase-9-deployment/SKILL.md',
  'skills/zero-script-qa/SKILL.md',
  'skills/starter/SKILL.md',
  'skills/dynamic/SKILL.md',
  'skills/enterprise/SKILL.md',
  'agents/gap-detector.md',
  'agents/code-analyzer.md',
  'agents/pdca-iterator.md',
  'agents/qa-monitor.md',
];

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

// Fetch file content from GitHub
async function fetchGitHubFile(filePath: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch {
    return null;
  }
}

// Split content into chunks
function chunkContent(
  content: string,
  chunkSize: number = 400,
  overlap: number = 100
): string[] {
  const chunks: string[] = [];
  const sentences = content.split(/(?<=[.!?。！？\n])\s*/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      const words = currentChunk.split(/\s+/);
      currentChunk = words.slice(-Math.floor(overlap / 5)).join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 50);
}

// Detect category from file path
function getCategoryFromPath(filePath: string): string {
  if (filePath.includes('skills/')) return 'skills';
  if (filePath.includes('agents/')) return 'agents';
  if (filePath.includes('bkit-system/')) return 'system';
  if (filePath === 'README.md') return 'overview';
  if (filePath === 'CHANGELOG.md') return 'changelog';
  return 'general';
}

// Get collection
async function getCollection() {
  if (!db.isConnected()) {
    await db.connect();
  }
  return db.getCollection(COLLECTION_NAME);
}

// Sync GitHub docs to MongoDB
export async function syncGitHubDocs(): Promise<{
  success: boolean;
  filesProcessed: number;
  chunksIndexed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let chunksIndexed = 0;
  let filesProcessed = 0;

  try {
    const collection = await getCollection();

    // Clear existing documents
    await collection.deleteMany({});

    const records: Array<{
      docId: string;
      text: string;
      source: string;
      category: string;
      chunkIndex: number;
      embedding: number[];
      createdAt: Date;
    }> = [];

    for (const filePath of FILES_TO_INDEX) {
      const content = await fetchGitHubFile(filePath);
      if (!content) {
        errors.push(`Failed to fetch: ${filePath}`);
        continue;
      }

      filesProcessed++;
      const chunks = chunkContent(content);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk.length < 10) continue;

        try {
          const embedding = await getLocalEmbedding(chunk);
          records.push({
            docId: `${filePath}-${i}`,
            text: chunk,
            source: filePath,
            category: getCategoryFromPath(filePath),
            chunkIndex: i,
            embedding,
            createdAt: new Date(),
          });
          chunksIndexed++;
        } catch (error) {
          errors.push(`Embedding error for ${filePath} chunk ${i}: ${error}`);
        }
      }
    }

    if (records.length > 0) {
      await collection.insertMany(records);
    }

    return {
      success: true,
      filesProcessed,
      chunksIndexed,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      filesProcessed,
      chunksIndexed,
      errors: [...errors, `Sync error: ${error}`],
    };
  }
}

// Search GitHub docs using MongoDB Atlas Vector Search
export async function searchGitHubDocs(
  query: string,
  limit: number = 5
): Promise<
  Array<{
    text: string;
    source: string;
    category: string;
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
            text: 1,
            source: 1,
            category: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ]).toArray();

      return results.map((row) => ({
        text: row.text as string,
        source: row.source as string,
        category: row.category as string,
        score: 1 - (row.score as number),
      }));
    } catch {
      // Fallback to text search if vector search not configured
      return fallbackTextSearch(query, limit);
    }
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Fallback text search when vector search is not configured
async function fallbackTextSearch(
  query: string,
  limit: number
): Promise<Array<{ text: string; source: string; category: string; score: number }>> {
  try {
    const collection = await getCollection();

    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    if (keywords.length === 0) return [];

    const regex = new RegExp(keywords.join('|'), 'i');

    const results = await collection
      .find({ text: { $regex: regex } })
      .limit(limit)
      .toArray();

    return results.map((row, index) => ({
      text: row.text as string,
      source: row.source as string,
      category: row.category as string,
      score: index * 0.1,
    }));
  } catch {
    return [];
  }
}

// Get GitHub docs stats
export async function getGitHubDocsStats(): Promise<{
  totalChunks: number;
  byCategory: Record<string, number>;
  lastSync?: Date;
} | null> {
  try {
    const collection = await getCollection();
    const totalChunks = await collection.countDocuments();

    const categoryAgg = await collection
      .aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }])
      .toArray();

    const byCategory: Record<string, number> = {};
    categoryAgg.forEach((item) => {
      byCategory[item._id as string] = item.count;
    });

    const lastDoc = await collection.findOne({}, { sort: { createdAt: -1 } });

    return {
      totalChunks,
      byCategory,
      lastSync: lastDoc?.createdAt as Date | undefined,
    };
  } catch {
    return null;
  }
}
