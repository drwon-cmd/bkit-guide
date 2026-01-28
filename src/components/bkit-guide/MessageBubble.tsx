// bkit-guide Message Bubble Component

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { marked } from 'marked';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  // Parse markdown for assistant messages
  const displayContent = isUser ? content : marked(content) as string;

  // Show copy button for longer assistant messages (more than 200 chars)
  const showCopyButton = !isUser && !isStreaming && content.length > 200;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-800 text-gray-100 rounded-bl-md'
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
              B
            </div>
            <span className="text-sm font-semibold text-emerald-400">
              bkit Guide
            </span>
            {isStreaming && (
              <span className="text-xs text-gray-400 animate-pulse">typing...</span>
            )}
          </div>
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        ) : (
          <div
            className="prose prose-invert prose-sm max-w-none
              prose-headings:text-gray-100 prose-headings:font-semibold
              prose-h2:mt-6 prose-h2:mb-3 prose-h3:mt-5 prose-h3:mb-2
              prose-p:text-gray-200 prose-p:leading-relaxed prose-p:my-4
              prose-strong:text-white
              prose-code:text-emerald-300 prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:my-4
              prose-ul:text-gray-200 prose-ul:my-4
              prose-ol:text-gray-200 prose-ol:my-4
              prose-li:marker:text-emerald-400 prose-li:my-2
              prose-table:border prose-table:border-gray-600 prose-table:border-collapse prose-table:my-4
              prose-th:border prose-th:border-gray-600 prose-th:bg-gray-700 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-gray-100
              prose-td:border prose-td:border-gray-600 prose-td:px-3 prose-td:py-2 prose-td:text-gray-200
              prose-hr:border-gray-600 prose-hr:my-6"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        )}

        {/* Copy button and timestamp row */}
        <div className={cn(
          'flex items-center mt-2',
          showCopyButton ? 'justify-between' : 'justify-end'
        )}>
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400 transition-colors"
              title="답변 복사"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>복사됨!</span>
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

          {timestamp && (
            <span
              className={cn(
                'text-xs',
                isUser ? 'text-blue-200' : 'text-gray-500'
              )}
            >
              {new Date(timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
