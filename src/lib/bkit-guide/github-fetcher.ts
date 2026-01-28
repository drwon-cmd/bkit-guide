// bkit-guide GitHub Fetcher
// Fetches official documentation from bkit GitHub repository
// Uses local embeddings (Xenova/all-MiniLM-L6-v2)

import * as lancedb from '@lancedb/lancedb';
import path from 'path';

const GITHUB_REPO = 'popup-studio-ai/bkit-claude-code';
const GITHUB_BRANCH = 'main';
const LANCEDB_PATH = process.env.LANCEDB_PATH || path.join(process.cwd(), 'data', 'lancedb');
const TABLE_NAME = 'bkit_github_docs';

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
async function fetchGitHubFile(path: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

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
function getCategoryFromPath(path: string): string {
  if (path.includes('skills/')) return 'skills';
  if (path.includes('agents/')) return 'agents';
  if (path.includes('bkit-system/')) return 'system';
  if (path === 'README.md') return 'overview';
  if (path === 'CHANGELOG.md') return 'changelog';
  return 'general';
}

// Ensure table exists with correct schema (384-dim)
async function ensureTable(db: lancedb.Connection): Promise<lancedb.Table> {
  try {
    return await db.openTable(TABLE_NAME);
  } catch {
    await db.createTable(TABLE_NAME, [
      {
        id: 'init',
        text: 'init',
        source: 'init',
        category: 'init',
        chunkIndex: 0,
        vector: new Array(384).fill(0),
      }
    ]);
    const table = await db.openTable(TABLE_NAME);
    await table.delete("id = 'init'");
    return table;
  }
}

// Sync GitHub docs to LanceDB
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
    const db = await lancedb.connect(LANCEDB_PATH);

    // Drop existing table and recreate
    try {
      await db.dropTable(TABLE_NAME);
    } catch {
      // Table might not exist
    }

    const table = await ensureTable(db);
    const records: Array<{
      id: string;
      text: string;
      source: string;
      category: string;
      chunkIndex: number;
      vector: number[];
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
            id: `${filePath}-${i}`,
            text: chunk,
            source: filePath,
            category: getCategoryFromPath(filePath),
            chunkIndex: i,
            vector: embedding,
          });
          chunksIndexed++;
        } catch (error) {
          errors.push(`Embedding error for ${filePath} chunk ${i}: ${error}`);
        }
      }
    }

    if (records.length > 0) {
      await table.add(records);
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

// Search GitHub docs
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
    const db = await lancedb.connect(LANCEDB_PATH);
    const table = await db.openTable(TABLE_NAME);
    const queryEmbedding = await getLocalEmbedding(query);

    const results = await table
      .vectorSearch(queryEmbedding)
      .limit(limit)
      .toArray();

    return results.map((row: Record<string, unknown>) => ({
      text: row.text as string,
      source: row.source as string,
      category: row.category as string,
      score: row._distance as number,
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
    const db = await lancedb.connect(LANCEDB_PATH);
    const table = await db.openTable(TABLE_NAME);
    const allRecords = await table.query().limit(10000).toArray();

    const byCategory: Record<string, number> = {};
    allRecords.forEach((row: Record<string, unknown>) => {
      const category = row.category as string;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      totalChunks: allRecords.length,
      byCategory,
    };
  } catch {
    return null;
  }
}
