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
    <div className="flex flex-wrap gap-2 justify-center">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelect(question)}
          disabled={disabled}
          className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700
            text-gray-300 hover:text-white rounded-lg border border-gray-700
            hover:border-emerald-500/50 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            max-w-xs truncate"
          title={question}
        >
          {question}
        </button>
      ))}
    </div>
  );
}
