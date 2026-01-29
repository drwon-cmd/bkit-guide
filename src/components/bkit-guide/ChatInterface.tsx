// bkit-guide Chat Interface Component
// Main chat UI with streaming support

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { SuggestedQuestions } from './SuggestedQuestions';

interface WebSource {
  url: string;
  title?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  qaId?: string;
  webSources?: WebSource[];
}

interface ChatInterfaceProps {
  locale?: string;
  suggestedQuestions?: string[];
}

export function ChatInterface({
  locale = 'ko',
  suggestedQuestions = [],
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSend = async (content?: string) => {
    const messageContent = content || input.trim();
    if (!messageContent || loading) return;

    setInput('');
    setLoading(true);
    setStreamingContent('');

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/bkit-guide/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          sessionId,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';
      let lastQaId: string | undefined;
      let webSources: WebSource[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.text) {
                fullContent += data.text;
                setStreamingContent(fullContent);
              }

              if (data.done) {
                lastQaId = data.qaId;
                // Extract web sources (those starting with 🌐)
                if (data.sourcesUsed && Array.isArray(data.sourcesUsed)) {
                  webSources = data.sourcesUsed
                    .filter((s: string) => s.startsWith('🌐'))
                    .map((s: string) => ({
                      url: s.replace('🌐 ', ''),
                      title: new URL(s.replace('🌐 ', '')).hostname,
                    }));
                }
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
        qaId: lastQaId,
        webSources: webSources.length > 0 ? webSources : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');
    } catch {
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingContent('');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-100 bg-white">
        <button
          onClick={() => {
            setMessages([]);
            setInput('');
            setStreamingContent('');
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          title="새 대화 시작"
        >
          <img
            src="/favicon.svg"
            alt="bkit"
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <div className="text-left">
            <h2 className="font-black text-black tracking-tight">Guide Bot</h2>
            <p className="text-sm text-neutral-500">Claude Code Plugin Expert</p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                setInput('');
                setStreamingContent('');
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-all"
              title="대화 초기화"
            >
              새 대화
            </button>
          )}
          <a
            href="https://github.com/popup-studio-ai/bkit-claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-all"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-16 md:py-24 px-4">
            <img
              src="/favicon.svg"
              alt="bkit"
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8"
            />
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight mb-4">
              bkit Guide에 오신 것을 환영합니다
            </h3>
            <p className="text-neutral-500 max-w-lg mx-auto mb-10 text-sm sm:text-base leading-relaxed">
              bkit (Claude Code Plugin) 설치, 설정, 사용법에 대해 무엇이든 물어보세요.
              PDCA 방법론, 개발 파이프라인, Skill/Agent 사용법을 안내해드립니다.
            </p>

            <div className="w-16 h-px bg-neutral-200 mx-auto mb-10" />

            {suggestedQuestions.length > 0 && (
              <div className="max-w-3xl mx-auto">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                  자주 묻는 질문
                </p>
                <SuggestedQuestions
                  questions={suggestedQuestions}
                  onSelect={handleSend}
                  disabled={loading}
                />
              </div>
            )}
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
            qaId={message.qaId}
            webSources={message.webSources}
          />
        ))}

        {streamingContent && (
          <MessageBubble
            role="assistant"
            content={streamingContent}
            isStreaming={true}
          />
        )}

        {loading && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl md:rounded-3xl px-5 py-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-neutral-100 bg-white">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="bkit에 대해 무엇이든 물어보세요..."
              disabled={loading}
              rows={1}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-neutral-50 border border-neutral-200 rounded-xl md:rounded-2xl
                text-black placeholder-neutral-400 resize-none
                focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-neutral-300
                disabled:opacity-50 disabled:cursor-not-allowed
                min-h-[52px] max-h-[200px] text-sm sm:text-base
                transition-all hover:border-neutral-300"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 sm:px-5 py-3 sm:py-4 bg-black hover:bg-neutral-800 text-white rounded-full
              transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-neutral-400 mt-3">
          Shift+Enter로 줄바꿈, Enter로 전송
        </p>
      </div>
    </div>
  );
}
