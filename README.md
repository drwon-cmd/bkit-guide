# bkit Guide

> bkit (Claude Code Plugin) 설치/사용 가이드 챗봇

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/popup-studio-ai/bkit-guide)

## 기능

- **RAG 기반 답변**: GitHub 공식 문서 기반 정확한 답변
- **크라우드소싱 지식베이스**: 모든 Q&A 누적 → 시간이 지날수록 성장
- **다국어 지원**: 한국어, 영어, 일본어, 중국어
- **실시간 스트리밍**: Claude API 스트리밍 응답

## 다루는 주제

- bkit 플러그인 설치 및 설정
- PDCA 방법론 (Plan → Do → Check → Act)
- 9단계 개발 파이프라인
- Skill/Agent 사용법
- Zero Script QA
- Starter/Dynamic/Enterprise 레벨

## 빠른 시작

### 1. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
# 필수
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=bkit_guide

# 선택 (기본값: ./lancedb)
LANCEDB_PATH=./lancedb
```

### 2. 의존성 설치

```bash
npm install
```

### 3. GitHub 문서 동기화

```bash
# 개발 서버 실행 후
curl -X POST http://localhost:3000/api/bkit-guide/sync
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

## 배포

### Vercel (권장)

1. GitHub에 푸시
2. Vercel에서 Import
3. 환경 변수 설정
4. 배포

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## API 엔드포인트

| Route | Method | 설명 |
|-------|--------|------|
| `/api/bkit-guide/chat` | POST | 스트리밍 채팅 |
| `/api/bkit-guide/search` | POST | RAG 검색 |
| `/api/bkit-guide/sync` | POST | GitHub 문서 동기화 |
| `/api/bkit-guide/feedback` | POST | 피드백 (👍👎) |
| `/api/bkit-guide/stats` | GET | 통계 |

## 기술 스택

- **Framework**: Next.js 15
- **AI**: Claude API (Anthropic)
- **Vector DB**: LanceDB
- **Embeddings**: Xenova/transformers (로컬, 무료)
- **Database**: MongoDB Atlas
- **Styling**: Tailwind CSS

## 라이선스

MIT License

---

Built with ❤️ by [popup-studio-ai](https://github.com/popup-studio-ai)
