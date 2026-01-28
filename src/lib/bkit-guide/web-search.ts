// bkit-guide Web Search using Tavily API
// Provides external search capability for questions beyond local knowledge base

const TAVILY_API_URL = 'https://api.tavily.com/search';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  answer?: string;
}

/**
 * Search the web using Tavily API
 */
export async function searchWeb(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: 'basic' | 'advanced';
    includeAnswer?: boolean;
  } = {}
): Promise<{
  results: Array<{ title: string; url: string; content: string; score: number }>;
  answer?: string;
}> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn('[WebSearch] TAVILY_API_KEY not configured');
    return { results: [] };
  }

  const { maxResults = 5, searchDepth = 'basic', includeAnswer = true } = options;

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} Claude Code bkit plugin`,
        search_depth: searchDepth,
        max_results: maxResults,
        include_answer: includeAnswer,
        include_domains: [
          'github.com',
          'anthropic.com',
          'docs.anthropic.com',
          'claude.ai',
          'stackoverflow.com',
          'dev.to',
          'medium.com',
        ],
      }),
    });

    if (!response.ok) {
      console.error('[WebSearch] Tavily API error:', response.status);
      return { results: [] };
    }

    const data: TavilyResponse = await response.json();

    return {
      results: data.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      answer: data.answer,
    };
  } catch (error) {
    console.error('[WebSearch] Error:', error);
    return { results: [] };
  }
}

/**
 * Determine if external search is needed based on query and RAG results
 */
export function shouldSearchWeb(
  query: string,
  ragResultCount: number,
  ragTopScore: number
): boolean {
  const lowerQuery = query.toLowerCase();

  // Always search for these topics (likely need external info)
  const externalTopics = [
    'latest',
    'newest',
    'update',
    'version',
    '최신',
    '업데이트',
    '버전',
    'error',
    'bug',
    '에러',
    '버그',
    '오류',
    'alternative',
    'compare',
    'vs',
    '비교',
    '대안',
    'install',
    '설치',
    'how to',
    '방법',
  ];

  // Check if query mentions external topics
  const needsExternal = externalTopics.some((topic) => lowerQuery.includes(topic));

  // Search if RAG results are insufficient
  const insufficientRag = ragResultCount < 2 || ragTopScore > 0.5;

  return needsExternal || insufficientRag;
}

/**
 * Format web search results for RAG context
 */
export function formatWebResults(
  results: Array<{ title: string; url: string; content: string }>
): string {
  if (results.length === 0) return '';

  const formatted = results
    .slice(0, 3)
    .map(
      (r, i) =>
        `### 웹 검색 결과 ${i + 1}: ${r.title}\n출처: ${r.url}\n\n${r.content.slice(0, 500)}...`
    )
    .join('\n\n---\n\n');

  return `## 🌐 외부 웹 검색 결과\n\n${formatted}`;
}
