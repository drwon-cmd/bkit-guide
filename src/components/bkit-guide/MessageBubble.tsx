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
      <div
        className={cn(
          'max-w-[85%] rounded-2xl md:rounded-3xl px-4 sm:px-5 py-3 sm:py-4',
          isUser
            ? 'bg-black text-white rounded-br-md'
            : 'bg-neutral-50 border border-neutral-100 text-neutral-800 rounded-bl-md'
        )}
      >
        {/* Assistant Avatar & Name */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden">
              <img
                src="/favicon.svg"
                alt="bkit"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-bold text-black">Guide Bot</span>
            {isStreaming && (
              <span className="text-xs text-neutral-400 animate-pulse">typing...</span>
            )}
          </div>
        )}

        {/* Message Content */}
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        ) : (
          <div
            className="prose prose-sm max-w-none
              prose-headings:text-black prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-lg
              prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-base
              prose-p:text-neutral-700 prose-p:leading-relaxed prose-p:my-4
              prose-strong:text-black prose-strong:font-bold
              prose-code:text-neutral-800 prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-pre:border prose-pre:border-neutral-200 prose-pre:my-6 prose-pre:rounded-xl
              prose-ul:text-neutral-700 prose-ul:my-4
              prose-ol:text-neutral-700 prose-ol:my-4
              prose-li:marker:text-black prose-li:my-2
              prose-a:text-black prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-neutral-600
              prose-table:border prose-table:border-neutral-200 prose-table:border-collapse prose-table:my-6
              prose-th:border prose-th:border-neutral-200 prose-th:bg-neutral-50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-black prose-th:font-bold
              prose-td:border prose-td:border-neutral-200 prose-td:px-3 prose-td:py-2 prose-td:text-neutral-700
              prose-hr:border-neutral-200 prose-hr:my-8
              prose-blockquote:border-l-black prose-blockquote:text-neutral-600"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        )}

        {/* Web Sources */}
        {webSources && webSources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
              외부 출처
            </p>
            <div className="flex flex-wrap gap-2">
              {webSources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black
                    rounded-full transition-all hover:-translate-y-0.5"
                  title={source.url}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {source.title || 'Link'}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={cn('flex items-center mt-3 pt-3', !isUser && 'border-t border-neutral-200')}>
          <div className="flex items-center gap-4 flex-1">
            {showCopyButton && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-black transition-colors"
                title="답변 복사"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>복사됨</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>복사</span>
                  </>
                )}
              </button>
            )}

            {showFeedback && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">도움이 됐나요?</span>
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={feedbackLoading || feedback !== null}
                  className={cn(
                    'p-1.5 rounded-full transition-all',
                    feedback === 'up'
                      ? 'text-black bg-neutral-100'
                      : 'text-neutral-400 hover:text-black hover:bg-neutral-100',
                    'disabled:cursor-not-allowed'
                  )}
                  title="도움이 됐어요"
                >
                  <svg className="w-4 h-4" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={feedbackLoading || feedback !== null}
                  className={cn(
                    'p-1.5 rounded-full transition-all',
                    feedback === 'down'
                      ? 'text-red-500 bg-red-50'
                      : 'text-neutral-400 hover:text-red-500 hover:bg-red-50',
                    'disabled:cursor-not-allowed'
                  )}
                  title="아쉬워요"
                >
                  <svg className="w-4 h-4" fill={feedback === 'down' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {timestamp && (
            <span className={cn('text-xs', isUser ? 'text-white/70' : 'text-neutral-400')}>
              {new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
