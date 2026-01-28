// bkit-guide Message Bubble Component

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { marked } from 'marked';

interface WebSource {
  url: string;
  title?: string;
}

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  qaId?: string;
  webSources?: WebSource[];
}

export function MessageBubble({
  role,
  content,
  timestamp,
  isStreaming,
  qaId,
  webSources,
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const displayContent = isUser ? content : marked(content) as string;
  const showCopyButton = !isUser && !isStreaming && content.length > 200;
  const showFeedback = !isUser && !isStreaming && qaId;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleFeedback = async (helpful: boolean) => {
    if (feedbackLoading || feedback || !qaId) return;
    setFeedbackLoading(true);
    try {
      await fetch('/api/bkit-guide/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaId, helpful }),
      });
      setFeedback(helpful ? 'up' : 'down');
    } catch {} finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] rounded-2xl px-4 py-3', isUser ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-800 text-gray-100 rounded-bl-md')}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">B</div>
            <span className="text-sm font-semibold text-emerald-400">bkit Guide</span>
            {isStreaming && <span className="text-xs text-gray-400 animate-pulse">typing...</span>}
          </div>
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-gray-100 prose-headings:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-200 prose-p:leading-loose prose-p:my-6 prose-strong:text-white prose-code:text-emerald-300 prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:my-6 prose-ul:text-gray-200 prose-ul:my-6 prose-ol:text-gray-200 prose-ol:my-6 prose-li:marker:text-emerald-400 prose-li:my-4 prose-table:border prose-table:border-gray-600 prose-table:border-collapse prose-table:my-6 prose-th:border prose-th:border-gray-600 prose-th:bg-gray-700 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-gray-100 prose-td:border prose-td:border-gray-600 prose-td:px-3 prose-td:py-2 prose-td:text-gray-200 prose-hr:border-gray-600 prose-hr:my-8" dangerouslySetInnerHTML={{ __html: displayContent }} />
        )}

        {webSources && webSources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-2">🌐 외부 출처</p>
            <div className="flex flex-wrap gap-2">
              {webSources.map((source, idx) => (
                <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded transition-colors" title={source.url}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  {source.title || 'Link'}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className={cn('flex items-center mt-3 pt-2', !isUser && 'border-t border-gray-700/50')}>
          <div className="flex items-center gap-3 flex-1">
            {showCopyButton && (
              <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400 transition-colors" title="답변 복사">
                {copied ? (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span>복사됨!</span></>) : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg><span>복사</span></>)}
              </button>
            )}
            {showFeedback && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 mr-1">도움이 됐나요?</span>
                <button onClick={() => handleFeedback(true)} disabled={feedbackLoading || feedback !== null} className={cn('p-1 rounded transition-colors', feedback === 'up' ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400', 'disabled:cursor-not-allowed')} title="도움이 됐어요">
                  <svg className="w-4 h-4" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                </button>
                <button onClick={() => handleFeedback(false)} disabled={feedbackLoading || feedback !== null} className={cn('p-1 rounded transition-colors', feedback === 'down' ? 'text-red-400' : 'text-gray-500 hover:text-red-400', 'disabled:cursor-not-allowed')} title="아쉬워요">
                  <svg className="w-4 h-4" fill={feedback === 'down' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                </button>
              </div>
            )}
          </div>
          {timestamp && <span className={cn('text-xs', isUser ? 'text-blue-200' : 'text-gray-500')}>{new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
      </div>
    </div>
  );
}
