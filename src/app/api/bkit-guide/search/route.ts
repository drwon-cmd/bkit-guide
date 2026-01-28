// bkit-guide Search API - RAG search across GitHub docs and Q&A

import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledgeBase } from '@/lib/bkit-guide/knowledge-base';

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, language } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const results = await searchKnowledgeBase(query, {
      githubLimit: Math.ceil(limit * 0.6),
      qaLimit: Math.floor(limit * 0.4),
      language,
    });

    return NextResponse.json({
      success: true,
      query,
      results: results.results.slice(0, limit),
      sources: results.sources,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
