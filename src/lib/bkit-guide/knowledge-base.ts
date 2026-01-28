// bkit-guide Knowledge Base
// Integrated RAG: GitHub Docs + Accumulated Q&A + Web Search

import { searchGitHubDocs } from './github-fetcher';
import { searchSimilarQAs } from './qa-indexer';
import { searchWeb, shouldSearchWeb, formatWebResults } from './web-search';

// Priority weights
const GITHUB_DOCS_PRIORITY = 1.0;
const QA_PRIORITY = 0.7;

// Maximum context tokens (rough estimate: 1 token ≈ 4 chars)
const MAX_GITHUB_CONTEXT_CHARS = 16000; // ~4K tokens
const MAX_QA_CONTEXT_CHARS = 12000; // ~3K tokens

interface SearchResult {
  source: 'github' | 'qa';
  text: string;
  reference: string;
  category: string;
  score: number;
  adjustedScore: number;
}

// Search both GitHub docs and Q&A
export async function searchKnowledgeBase(
  query: string,
  options: {
    githubLimit?: number;
    qaLimit?: number;
    language?: string;
  } = {}
): Promise<{
  results: SearchResult[];
  context: string;
  sources: { github: number; qa: number };
}> {
  const { githubLimit = 5, qaLimit = 3 } = options;

  // Search both sources in parallel
  const [githubResults, qaResults] = await Promise.all([
    searchGitHubDocs(query, githubLimit),
    searchSimilarQAs(query, qaLimit),
  ]);

  // Combine and normalize results
  const allResults: SearchResult[] = [];

  // Add GitHub results
  githubResults.forEach((result) => {
    allResults.push({
      source: 'github',
      text: result.text,
      reference: result.source,
      category: result.category,
      score: result.score,
      adjustedScore: result.score * GITHUB_DOCS_PRIORITY,
    });
  });

  // Add Q&A results
  qaResults.forEach((result) => {
    allResults.push({
      source: 'qa',
      text: `Q: ${result.question}\n\nA: ${result.answer}`,
      reference: `Q&A #${result.qaId}`,
      category: result.category,
      score: result.score,
      adjustedScore: result.score * QA_PRIORITY,
    });
  });

  // Sort by adjusted score (lower is better for distance)
  allResults.sort((a, b) => a.adjustedScore - b.adjustedScore);

  // Build context string with length limits
  let context = '';
  let githubChars = 0;
  let qaChars = 0;

  // GitHub docs first (higher priority)
  const githubContext: string[] = [];
  for (const result of allResults.filter((r) => r.source === 'github')) {
    if (githubChars + result.text.length > MAX_GITHUB_CONTEXT_CHARS) break;
    githubContext.push(`### ${result.reference}\n${result.text}`);
    githubChars += result.text.length;
  }

  if (githubContext.length > 0) {
    context += '## 공식 문서 (GitHub)\n\n' + githubContext.join('\n\n---\n\n');
  }

  // Q&A results second
  const qaContext: string[] = [];
  for (const result of allResults.filter((r) => r.source === 'qa')) {
    if (qaChars + result.text.length > MAX_QA_CONTEXT_CHARS) break;
    qaContext.push(result.text);
    qaChars += result.text.length;
  }

  if (qaContext.length > 0) {
    if (context) context += '\n\n';
    context += '## 관련 Q&A\n\n' + qaContext.join('\n\n---\n\n');
  }

  return {
    results: allResults,
    context,
    sources: {
      github: githubResults.length,
      qa: qaResults.length,
    },
  };
}

// Build RAG context for chat
export async function buildChatContext(
  question: string,
  options: {
    language?: string;
    maxResults?: number;
    enableWebSearch?: boolean;
  } = {}
): Promise<{
  context: string;
  sourcesUsed: string[];
  webSearchUsed: boolean;
}> {
  const { maxResults = 8, enableWebSearch = true } = options;

  const searchResult = await searchKnowledgeBase(question, {
    githubLimit: Math.ceil(maxResults * 0.6),
    qaLimit: Math.floor(maxResults * 0.4),
    language: options.language,
  });

  const sourcesUsed = searchResult.results
    .slice(0, maxResults)
    .map((r) => r.reference);

  let context = searchResult.context;
  let webSearchUsed = false;

  // Check if web search is needed
  if (enableWebSearch) {
    const topScore = searchResult.results[0]?.score ?? 1;
    const resultCount = searchResult.results.length;

    if (shouldSearchWeb(question, resultCount, topScore)) {
      const webResults = await searchWeb(question, {
        maxResults: 3,
        searchDepth: 'basic',
        includeAnswer: true,
      });

      if (webResults.results.length > 0) {
        const webContext = formatWebResults(webResults.results);
        context = context ? `${context}\n\n${webContext}` : webContext;
        sourcesUsed.push(...webResults.results.map((r) => `🌐 ${r.url}`));
        webSearchUsed = true;
      }
    }
  }

  return {
    context,
    sourcesUsed,
    webSearchUsed,
  };
}

// Check if knowledge base is initialized
export async function isKnowledgeBaseReady(): Promise<{
  github: boolean;
  qa: boolean;
}> {
  try {
    const [githubResults, qaResults] = await Promise.all([
      searchGitHubDocs('bkit', 1),
      searchSimilarQAs('bkit', 1),
    ]);

    return {
      github: githubResults.length > 0,
      qa: qaResults.length > 0,
    };
  } catch {
    return { github: false, qa: false };
  }
}
