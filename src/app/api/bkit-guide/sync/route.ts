// bkit-guide Sync API
// Sync GitHub documentation to LanceDB

import { NextResponse } from 'next/server';
import { syncGitHubDocs, getGitHubDocsStats } from '@/lib/bkit-guide/github-fetcher';

// POST: Sync GitHub docs
export async function POST() {
  try {
    const result = await syncGitHubDocs();

    return NextResponse.json({
      success: result.success,
      filesProcessed: result.filesProcessed,
      chunksIndexed: result.chunksIndexed,
      errors: result.errors.length > 0 ? result.errors : undefined,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

// GET: Get sync status
export async function GET() {
  try {
    const stats = await getGitHubDocsStats();

    if (!stats) {
      return NextResponse.json({
        synced: false,
        message: 'GitHub docs not yet synced. Call POST to sync.',
      });
    }

    return NextResponse.json({
      synced: true,
      totalChunks: stats.totalChunks,
      byCategory: stats.byCategory,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    );
  }
}
