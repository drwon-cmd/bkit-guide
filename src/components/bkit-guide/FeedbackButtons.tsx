// bkit-guide Feedback Buttons Component

'use client';

import { useState } from 'react';

interface FeedbackButtonsProps {
  qaId?: string;
  onFeedback?: (qaId: string, helpful: boolean) => Promise<void>;
}

export function FeedbackButtons({ qaId, onFeedback }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [loading, setLoading] = useState(false);

  if (!qaId) return null;

  const handleFeedback = async (helpful: boolean) => {
    if (loading || feedback) return;

    setLoading(true);
    try {
      if (onFeedback) {
        await onFeedback(qaId, helpful);
      } else {
        // Default API call
        await fetch('/api/bkit-guide/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qaId, helpful }),
        });
      }
      setFeedback(helpful ? 'up' : 'down');
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-gray-500 mr-1">도움이 됐나요?</span>
      <button
        onClick={() => handleFeedback(true)}
        disabled={loading || feedback !== null}
        className={`p-1 rounded transition-colors ${
          feedback === 'up'
            ? 'text-emerald-400'
            : 'text-gray-500 hover:text-emerald-400'
        } disabled:cursor-not-allowed`}
        title="도움이 됐어요"
      >
        <svg
          className="w-4 h-4"
          fill={feedback === 'up' ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      </button>
      <button
        onClick={() => handleFeedback(false)}
        disabled={loading || feedback !== null}
        className={`p-1 rounded transition-colors ${
          feedback === 'down'
            ? 'text-red-400'
            : 'text-gray-500 hover:text-red-400'
        } disabled:cursor-not-allowed`}
        title="아쉬워요"
      >
        <svg
          className="w-4 h-4"
          fill={feedback === 'down' ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
          />
        </svg>
      </button>
    </div>
  );
}
