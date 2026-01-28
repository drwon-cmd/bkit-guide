// bkit-guide Suggested Questions
// Default questions and dynamic suggestions

import { getTopHelpfulQAs } from './qa-store';

// Default suggested questions by category
export const DEFAULT_QUESTIONS: Record<string, string[]> = {
  ko: [
    'bkit 플러그인은 어떻게 설치하나요?',
    'PDCA 방법론이 뭔가요?',
    '9단계 개발 파이프라인을 설명해주세요',
    'Starter, Dynamic, Enterprise 레벨의 차이점은?',
    '/pdca-plan 명령어는 어떻게 사용하나요?',
    'Zero Script QA가 뭔가요?',
  ],
  en: [
    'How do I install the bkit plugin?',
    'What is the PDCA methodology?',
    'Explain the 9-phase development pipeline',
    'What are the differences between Starter, Dynamic, and Enterprise levels?',
    'How do I use the /pdca-plan command?',
    'What is Zero Script QA?',
  ],
  ja: [
    'bkitプラグインはどうやってインストールしますか？',
    'PDCA方法論とは何ですか？',
    '9段階開発パイプラインを説明してください',
    'Starter、Dynamic、Enterpriseレベルの違いは？',
    '/pdca-planコマンドの使い方は？',
    'Zero Script QAとは何ですか？',
  ],
  zh: [
    '如何安装bkit插件？',
    '什么是PDCA方法论？',
    '请解释9阶段开发流程',
    'Starter、Dynamic、Enterprise级别有什么区别？',
    '如何使用/pdca-plan命令？',
    '什么是Zero Script QA？',
  ],
};

// Category-specific questions
export const CATEGORY_QUESTIONS: Record<string, string[]> = {
  installation: [
    'bkit 최신 버전은 어떻게 확인하나요?',
    'Claude Code에 bkit을 연결하는 방법은?',
    'bkit 업데이트는 어떻게 하나요?',
  ],
  skills: [
    '사용 가능한 skill 목록을 알려주세요',
    '/commit 명령어 사용법은?',
    'custom skill은 어떻게 만드나요?',
  ],
  pdca: [
    'Plan 문서는 어떤 내용을 담아야 하나요?',
    'gap-detector agent는 어떻게 사용하나요?',
    'PDCA 사이클 완료 후 리포트 생성 방법은?',
  ],
  agents: [
    'pdca-iterator agent의 역할은?',
    'code-analyzer agent 사용법은?',
    'qa-monitor agent는 언제 사용하나요?',
  ],
  pipeline: [
    'Phase 1 Schema 단계에서 해야 할 일은?',
    'Phase 4 API 설계 가이드라인이 있나요?',
    '어떤 순서로 개발을 진행하면 좋나요?',
  ],
  troubleshooting: [
    'bkit 명령어가 작동하지 않아요',
    'PDCA 문서 생성이 실패했어요',
    'agent가 응답하지 않는 경우 어떻게 해야 하나요?',
  ],
};

// Get suggested questions with dynamic top Q&As
export async function getSuggestedQuestions(
  locale: string = 'ko',
  includePopular: boolean = true
): Promise<string[]> {
  const defaultQuestions = DEFAULT_QUESTIONS[locale] || DEFAULT_QUESTIONS.ko;

  if (!includePopular) {
    return defaultQuestions;
  }

  try {
    // Get top helpful Q&As
    const topQAs = await getTopHelpfulQAs(3);
    const popularQuestions = topQAs.map((qa) => qa.question);

    // Combine: popular first, then defaults (avoiding duplicates)
    const combined = [...popularQuestions];
    for (const q of defaultQuestions) {
      if (!combined.some((existing) => existing.toLowerCase() === q.toLowerCase())) {
        combined.push(q);
      }
      if (combined.length >= 6) break;
    }

    return combined;
  } catch {
    return defaultQuestions;
  }
}

// Get questions by category
export function getQuestionsByCategory(category: string): string[] {
  return CATEGORY_QUESTIONS[category] || [];
}

// Get random questions for variety
export function getRandomQuestions(
  locale: string = 'ko',
  count: number = 4
): string[] {
  const allQuestions = [
    ...(DEFAULT_QUESTIONS[locale] || DEFAULT_QUESTIONS.ko),
    ...Object.values(CATEGORY_QUESTIONS).flat(),
  ];

  // Shuffle and take first N
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
