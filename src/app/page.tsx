import { ChatInterface } from '@/components/bkit-guide';
import { DEFAULT_QUESTIONS } from '@/lib/bkit-guide/suggested-questions';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="h-screen">
      <ChatInterface locale="ko" suggestedQuestions={DEFAULT_QUESTIONS.ko} />
    </main>
  );
}
