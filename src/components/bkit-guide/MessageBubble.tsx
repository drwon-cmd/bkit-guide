// bkit-guide Message Bubble Component

'use client';

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

  // Parse markdown for assistant messages
  const displayContent = isUser ? content : marked(content) as string;

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
              prose-p:text-gray-200 prose-p:leading-relaxed
              prose-strong:text-white
              prose-code:text-emerald-300 prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
              prose-ul:text-gray-200 prose-ol:text-gray-200
              prose-li:marker:text-emerald-400"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        )}

        {timestamp && (
          <span
            className={cn(
              'text-xs mt-2 block',
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
  );
}
