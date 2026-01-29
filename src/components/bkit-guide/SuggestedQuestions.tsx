// bkit-guide Suggested Questions Component

'use client';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({
  questions,
  onSelect,
  disabled,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelect(question)}
          disabled={disabled}
          className="group relative bg-neutral-50 border border-neutral-100
            rounded-xl md:rounded-2xl p-4 sm:p-5
            text-left text-sm sm:text-base text-neutral-600 hover:text-black
            transition-all duration-200
            hover:bg-white hover:shadow-lg hover:-translate-y-1 hover:border-neutral-200
            disabled:opacity-50 disabled:cursor-not-allowed"
          title={question}
        >
          <span className="line-clamp-2">{question}</span>
          {/* Arrow icon on hover */}
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300
              opacity-0 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  );
}
