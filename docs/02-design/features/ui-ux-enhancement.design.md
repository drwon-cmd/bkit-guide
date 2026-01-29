# UI/UX Enhancement Design Document
## bkit Guide 챗봇 - bkit.ai 랜딩 페이지 디자인 통일화 상세 설계서

**Feature**: ui-ux-enhancement
**Created**: 2026-01-29
**Status**: Draft
**Author**: Claude
**Plan Reference**: `docs/01-plan/features/ui-ux-enhancement.plan.md`

---

## 1. 설계 개요 (Design Overview)

### 1.1 목적
bkit-guide 챗봇의 UI/UX를 bkit.ai 랜딩 페이지와 동일한 디자인 언어로 통일하여 브랜드 일관성을 확보한다.

### 1.2 설계 원칙

| 원칙 | 설명 | bkit.ai 참조 |
|------|------|-------------|
| **화이트 미니멀리즘** | 깔끔한 흰색 배경 기반 | `bg-white` |
| **모노톤 컬러** | Black + Neutral 계열 | `text-black`, `text-neutral-*` |
| **볼드 타이포그래피** | 강렬한 헤드라인 | `font-black`, `tracking-tighter` |
| **서브틀 인터랙션** | 부드러운 호버 효과 | `hover:shadow-xl`, `hover:-translate-y-1` |
| **일관된 Radius** | 둥근 모서리 통일 | `rounded-xl`, `rounded-2xl`, `rounded-full` |

---

## 2. 디자인 시스템 정의 (Design System)

### 2.1 컬러 팔레트

#### 2.1.1 CSS 변수 정의
```css
:root {
  /* Primary */
  --color-primary: #000000;
  --color-primary-foreground: #ffffff;

  /* Background */
  --color-background: #ffffff;
  --color-background-subtle: #fafafa;

  /* Neutral Scale */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;

  /* Text */
  --color-text-primary: #000000;
  --color-text-secondary: #737373;
  --color-text-muted: #a3a3a3;

  /* Border */
  --color-border: #f5f5f5;
  --color-border-hover: #e5e5e5;
}
```

#### 2.1.2 컬러 매핑 테이블

| 용도 | 현재 (bkit-guide) | 변경 후 (bkit.ai 스타일) |
|------|-------------------|------------------------|
| 페이지 배경 | `bg-gray-900` | `bg-white` |
| 카드 배경 | `bg-gray-800` | `bg-neutral-50` |
| 카드 호버 | `hover:bg-gray-700` | `hover:bg-white` |
| 주요 텍스트 | `text-white` | `text-black` |
| 보조 텍스트 | `text-gray-400` | `text-neutral-500` |
| 약한 텍스트 | `text-gray-500` | `text-neutral-400` |
| 테두리 | `border-gray-700/800` | `border-neutral-100/200` |
| 액센트 버튼 | `bg-emerald-600` | `bg-black` |
| 사용자 메시지 | `bg-blue-600` | `bg-black` |
| 어시스턴트 메시지 | `bg-gray-800` | `bg-neutral-50 border border-neutral-100` |
| 로고 그라데이션 | `from-emerald-400 to-cyan-500` | `bg-black` |
| 강조색 | `text-emerald-400` | `text-black` |
| 포커스 링 | `focus:ring-emerald-500` | `focus:ring-black/10` |

### 2.2 타이포그래피 시스템

| 용도 | 현재 | 변경 후 |
|------|------|---------|
| 메인 타이틀 | `text-xl font-semibold` | `text-3xl sm:text-4xl font-black tracking-tight` |
| 서브 타이틀 | `font-semibold text-white` | `font-bold text-black` |
| 본문 | `text-sm` | `text-sm sm:text-base` |
| 캡션 | `text-xs text-gray-500` | `text-xs text-neutral-400` |
| 라벨 | `text-sm text-gray-400` | `text-xs font-bold uppercase tracking-widest text-neutral-400` |

### 2.3 Border Radius 시스템

| 용도 | 현재 | 변경 후 |
|------|------|---------|
| 버튼 | `rounded-xl` | `rounded-full` |
| 카드 | `rounded-2xl` | `rounded-xl md:rounded-2xl` |
| 입력 필드 | `rounded-xl` | `rounded-xl md:rounded-2xl` |
| 메시지 버블 | `rounded-2xl rounded-bl-md` | `rounded-2xl md:rounded-3xl` |

### 2.4 호버/트랜지션 효과

```css
/* bkit.ai 표준 호버 효과 */
.hover-card {
  @apply transition-all duration-200
         hover:bg-white hover:shadow-xl hover:-translate-y-1;
}

.hover-button {
  @apply transition-all hover:scale-105;
}

.hover-link {
  @apply transition-colors hover:text-black;
}
```

---

## 3. 컴포넌트 상세 설계 (Component Design)

### 3.1 globals.css

**파일 경로**: `src/app/globals.css`

**현재 → 변경 후:**

| 속성 | 현재 | 변경 후 |
|------|------|---------|
| `--background` | `#0a0a0a` | `#ffffff` |
| `--foreground` | `#ededed` | `#000000` |
| scrollbar track | `#1f2937` | `#f5f5f5` |
| scrollbar thumb | `#4b5563` | `#d4d4d4` |

---

### 3.2 layout.tsx

**파일 경로**: `src/app/layout.tsx`

**변경 사항:**
```tsx
// 현재
<body className="min-h-screen bg-gray-900">

// 변경 후
<body className="min-h-screen bg-white">
```

---

### 3.3 ChatInterface.tsx 상세 설계

**파일 경로**: `src/components/bkit-guide/ChatInterface.tsx`

#### 3.3.1 Container

| 위치 | 현재 | 변경 후 |
|------|------|---------|
| Line 164 | `bg-gray-900` | `bg-white` |

#### 3.3.2 Header 섹션

**현재 클래스:**
```
border-b border-gray-800 bg-gray-900
```

**변경 후 클래스:**
```
border-b border-neutral-100 bg-white p-4 sm:p-6
```

**로고 변경:**
| 요소 | 현재 | 변경 후 |
|------|------|---------|
| 로고 배경 | `bg-gradient-to-br from-emerald-400 to-cyan-500` | `bg-black` |
| 로고 크기 | `w-10 h-10` | `w-10 h-10 sm:w-12 sm:h-12` |
| 로고 텍스트 | `font-bold` | `font-black text-lg sm:text-xl` |
| 제목 | `font-semibold text-white` | `font-black text-black tracking-tight` |
| 부제목 | `text-sm text-gray-400` | `text-sm text-neutral-500` |

**버튼 스타일:**
| 요소 | 현재 | 변경 후 |
|------|------|---------|
| 버튼 | `text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg` | `text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full font-medium` |

#### 3.3.3 Welcome Screen 섹션

**현재 → 변경 후:**

| 요소 | 현재 | 변경 후 |
|------|------|---------|
| 컨테이너 | `py-12` | `py-16 md:py-24 px-4` |
| 로고 크기 | `w-20 h-20` | `w-20 h-20 sm:w-24 sm:h-24` |
| 로고 배경 | gradient | `bg-black` |
| 로고 텍스트 | `text-3xl font-bold` | `text-4xl sm:text-5xl font-black` |
| 제목 | `text-xl font-semibold text-white` | `text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight` |
| 설명 | `text-gray-400` | `text-neutral-500 text-sm sm:text-base leading-relaxed` |
| 구분선 | 없음 | `w-16 h-px bg-neutral-200 mx-auto mb-10` |
| 라벨 | `text-sm text-gray-500` | `text-xs font-bold uppercase tracking-widest text-neutral-400` |

#### 3.3.4 Loading Indicator

| 요소 | 현재 | 변경 후 |
|------|------|---------|
| 컨테이너 | `bg-gray-800 rounded-2xl rounded-bl-md` | `bg-neutral-50 border border-neutral-100 rounded-2xl md:rounded-3xl` |
| 점 색상 | `bg-emerald-400` | `bg-neutral-400` |
| 점 간격 | `gap-1` | `gap-1.5` |

#### 3.3.5 Input Area 섹션

**입력 필드:**
| 속성 | 현재 | 변경 후 |
|------|------|---------|
| 배경 | `bg-gray-800` | `bg-neutral-50` |
| 테두리 | `border-gray-700` | `border-neutral-200` |
| 텍스트 | `text-white` | `text-black` |
| placeholder | `placeholder-gray-500` | `placeholder-neutral-400` |
| 포커스 | `focus:ring-emerald-500` | `focus:ring-black/10 focus:border-neutral-300` |
| 호버 | 없음 | `hover:border-neutral-300` |

**전송 버튼:**
| 속성 | 현재 | 변경 후 |
|------|------|---------|
| 배경 | `bg-emerald-600 hover:bg-emerald-700` | `bg-black hover:bg-neutral-800` |
| 모양 | `rounded-xl` | `rounded-full` |
| 호버 | 색상 변경 | `hover:scale-105` |
| 그림자 | 없음 | `shadow-lg` |

**힌트 텍스트:**
| 현재 | 변경 후 |
|------|---------|
| `text-gray-600` | `text-neutral-400` |

---

### 3.4 MessageBubble.tsx 상세 설계

**파일 경로**: `src/components/bkit-guide/MessageBubble.tsx`

#### 3.4.1 메시지 버블 기본 스타일

**사용자 메시지:**
| 속성 | 현재 | 변경 후 |
|------|------|---------|
| 배경 | `bg-blue-600` | `bg-black` |
| 텍스트 | `text-white` | `text-white` (유지) |
| 모서리 | `rounded-2xl rounded-br-md` | `rounded-2xl md:rounded-3xl rounded-br-md` |

**어시스턴트 메시지:**
| 속성 | 현재 | 변경 후 |
|------|------|---------|
| 배경 | `bg-gray-800` | `bg-neutral-50` |
| 테두리 | 없음 | `border border-neutral-100` |
| 텍스트 | `text-gray-100` | `text-neutral-800` |
| 모서리 | `rounded-2xl rounded-bl-md` | `rounded-2xl md:rounded-3xl rounded-bl-md` |

#### 3.4.2 아바타 & 이름

| 요소 | 현재 | 변경 후 |
|------|------|---------|
| 아바타 배경 | gradient | `bg-black` |
| 아바타 크기 | `w-6 h-6` | `w-6 h-6 sm:w-7 sm:h-7` |
| 이름 색상 | `text-emerald-400` | `text-black` |
| 이름 스타일 | `font-semibold` | `font-bold` |
| typing 표시 | `text-gray-400` | `text-neutral-400` |

#### 3.4.3 Prose (마크다운) 스타일 변경

**전체 구조:**
| 현재 | 변경 후 |
|------|---------|
| `prose prose-invert prose-sm` | `prose prose-sm` |

**상세 매핑:**

| 요소 | 현재 | 변경 후 |
|------|------|---------|
| headings | `text-gray-100` | `text-black font-bold tracking-tight` |
| p | `text-gray-200 leading-loose my-6` | `text-neutral-700 leading-relaxed my-4` |
| strong | `text-white` | `text-black font-bold` |
| code (inline) | `text-emerald-300 bg-gray-700` | `text-neutral-800 bg-neutral-100` |
| pre | `bg-gray-900 border-gray-700` | `bg-neutral-900 text-neutral-100 border-neutral-200 rounded-xl` |
| ul/ol | `text-gray-200` | `text-neutral-700` |
| li marker | `text-emerald-400` | `text-black` |
| table border | `border-gray-600` | `border-neutral-200` |
| th | `bg-gray-700 text-gray-100` | `bg-neutral-50 text-black font-bold` |
| td | `text-gray-200` | `text-neutral-700` |
| hr | `border-gray-600` | `border-neutral-200` |
| a | 없음 | `text-black underline underline-offset-2` |
| blockquote | 없음 | `border-l-black text-neutral-600` |

#### 3.4.4 Web Sources 섹션

| 요소 | 현재 | 변경 후 |
|------|------|---------|
| 구분선 | `border-gray-700` | `border-neutral-200` |
| 라벨 | `text-xs text-gray-500` | `text-xs font-bold uppercase tracking-widest text-neutral-400` |
| 링크 배경 | `bg-gray-700 hover:bg-gray-600` | `bg-neutral-100 hover:bg-neutral-200` |
| 링크 텍스트 | `text-gray-300 hover:text-white` | `text-neutral-600 hover:text-black` |
| 링크 모양 | `rounded` | `rounded-full` |
| 호버 효과 | 없음 | `hover:-translate-y-0.5` |

#### 3.4.5 액션 버튼

**복사 버튼:**
| 현재 | 변경 후 |
|------|---------|
| `text-gray-400 hover:text-emerald-400` | `text-neutral-400 hover:text-black font-medium` |

**피드백 버튼:**
| 상태 | 현재 | 변경 후 |
|------|------|---------|
| 기본 | `text-gray-500` | `text-neutral-400` |
| 좋아요 활성 | `text-emerald-400` | `text-black bg-neutral-100 rounded-full` |
| 싫어요 활성 | `text-red-400` | `text-red-500 bg-red-50 rounded-full` |
| 호버 (좋아요) | `hover:text-emerald-400` | `hover:text-black hover:bg-neutral-100` |
| 호버 (싫어요) | `hover:text-red-400` | `hover:text-red-500 hover:bg-red-50` |

**타임스탬프:**
| 메시지 타입 | 현재 | 변경 후 |
|-------------|------|---------|
| 사용자 | `text-blue-200` | `text-white/70` |
| 어시스턴트 | `text-gray-500` | `text-neutral-400` |

---

### 3.5 SuggestedQuestions.tsx 상세 설계

**파일 경로**: `src/components/bkit-guide/SuggestedQuestions.tsx`

**레이아웃 변경:**
| 현재 | 변경 후 |
|------|---------|
| `flex flex-wrap gap-2 justify-center` | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4` |

**버튼 스타일:**
| 속성 | 현재 | 변경 후 |
|------|------|---------|
| 배경 | `bg-gray-800 hover:bg-gray-700` | `bg-neutral-50 hover:bg-white` |
| 테두리 | `border-gray-700 hover:border-emerald-500/50` | `border-neutral-100 hover:border-neutral-200` |
| 텍스트 | `text-gray-300 hover:text-white` | `text-neutral-600 hover:text-black` |
| 모양 | `rounded-lg` | `rounded-xl md:rounded-2xl` |
| 패딩 | `px-3 py-2` | `p-4 sm:p-5` |
| 정렬 | center | `text-left` |
| 호버 효과 | 색상 변경만 | `hover:shadow-lg hover:-translate-y-1` |
| 텍스트 처리 | `truncate max-w-xs` | `line-clamp-2` |
| 추가 요소 | 없음 | 호버 시 화살표 아이콘 |

---

## 4. 구현 순서 (Implementation Order)

```
Phase 1: Foundation (기초)
├── 1. globals.css - CSS 변수 변경
└── 2. layout.tsx - body 클래스 변경

Phase 2: Main Layout (메인 레이아웃)
├── 3. ChatInterface.tsx - Container
├── 4. ChatInterface.tsx - Header
├── 5. ChatInterface.tsx - Welcome Screen
├── 6. ChatInterface.tsx - Loading Indicator
└── 7. ChatInterface.tsx - Input Area

Phase 3: Message Components (메시지)
├── 8. MessageBubble.tsx - 버블 기본 스타일
├── 9. MessageBubble.tsx - 아바타 & 이름
├── 10. MessageBubble.tsx - Prose 스타일
├── 11. MessageBubble.tsx - Web Sources
└── 12. MessageBubble.tsx - 액션 버튼

Phase 4: Supporting (보조)
└── 13. SuggestedQuestions.tsx - 카드 스타일

Phase 5: Verification (검증)
├── 14. 시각적 테스트
├── 15. 반응형 테스트
└── 16. 기능 테스트
```

---

## 5. 파일별 변경 요약

| 파일 | 변경 범위 | 핵심 변경 |
|------|----------|----------|
| `globals.css` | 소규모 | 컬러 변수 (dark→light) |
| `layout.tsx` | 최소 | body 클래스 1개 |
| `ChatInterface.tsx` | 대규모 | 전체 색상/스타일 |
| `MessageBubble.tsx` | 대규모 | 버블, prose, 액션 |
| `SuggestedQuestions.tsx` | 중규모 | 카드 레이아웃 |

---

## 6. 테스트 체크리스트

### 6.1 시각적 테스트
- [ ] 페이지 배경 = 흰색
- [ ] 헤더 스타일 = bkit.ai 일치
- [ ] 로고 = 검정 배경 + 흰색 "B"
- [ ] 메시지 버블 색상 정확
- [ ] 호버 효과 동작 (shadow, translate)
- [ ] 마크다운 렌더링 라이트 테마 적합

### 6.2 기능 테스트
- [ ] 메시지 전송
- [ ] 스트리밍 응답
- [ ] 복사 버튼
- [ ] 피드백 버튼
- [ ] 새 대화 버튼
- [ ] 추천 질문 클릭

### 6.3 반응형 테스트
- [ ] 모바일 (< 640px)
- [ ] 태블릿 (640px - 1024px)
- [ ] 데스크톱 (> 1024px)

---

## 7. 참고 자료

### 7.1 bkit.ai 참조 파일
| 파일 | 용도 |
|------|------|
| `HeroSection.tsx` | 타이포그래피, 카드 스타일 |
| `CTASection.tsx` | 버튼 스타일 |
| `Footer.tsx` | 컬러 시스템, 라벨 |
| `FearAnswerSection.tsx` | 카드 호버 효과 |

### 7.2 디자인 토큰 요약
```
배경: white
주요 텍스트: black
보조 텍스트: neutral-500
약한 텍스트: neutral-400
테두리: neutral-100/200
카드 배경: neutral-50
액센트: black
버튼: bg-black rounded-full
호버: shadow-xl, -translate-y-1
타이포: font-black, tracking-tight
```

---

## 8. 변경 이력

| 날짜 | 버전 | 내용 | 작성자 |
|------|------|------|--------|
| 2026-01-29 | 1.0 | 초안 | Claude |
