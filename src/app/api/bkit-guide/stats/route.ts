// bkit-guide Stats API
// Q&A and knowledge base statistics

import { NextResponse } from 'next/server';
import { getQAStats } from '@/lib/bkit-guide/qa-store';
import { getGitHubDocsStats } from '@/lib/bkit-guide/github-fetcher';
import { getQAEmbeddingsStats } from '@/lib/bkit-guide/qa-indexer';
import { isKnowledgeBaseReady } from '@/lib/bkit-guide/knowledge-base';

export async function GET() {
  try {
    // Gather all stats in parallel
    const [qaStats, githubStats, embeddingsStats, kbStatus] = await Promise.all([
      getQAStats().catch(() => null),
      getGitHubDocsStats().catch(() => null),
      getQAEmbeddingsStats().catch(() => null),
      isKnowledgeBaseReady().catch(() => ({ github: false, qa: false })),
    ]);

    return NextResponse.json({
      success: true,
      qa: qaStats
        ? {
            totalQuestions: qaStats.totalQuestions,
            byCategory: qaStats.byCategory,
            byLanguage: qaStats.byLanguage,
            recentCount: qaStats.recentCount,
          }
        : null,
      github: githubStats
        ? {
            totalChunks: githubStats.totalChunks,
            byCategory: githubStats.byCategory,
          }
        : null,
      embeddings: embeddingsStats
        ? {
            totalIndexed: embeddingsStats.totalIndexed,
            byCategory: embeddingsStats.byCategory,
            byLanguage: embeddingsStats.byLanguage,
          }
        : null,
      status: {
        githubReady: kbStatus.github,
        qaReady: kbStatus.qa,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Stats failed' },
      { status: 500 }
    );
  }
}
