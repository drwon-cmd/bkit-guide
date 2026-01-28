# bkit Guide

> bkit (Claude Code Plugin) 설치/사용 가이드 챗봇

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/drwon-cmd/bkit-guide)

## 기능

- **RAG 기반 답변**: GitHub 공식 문서 기반 정확한 답변
- **크라우드소싱 지식베이스**: 모든 Q&A 누적 → 시간이 지날수록 성장
- **다국어 지원**: 한국어, 영어, 일본어, 중국어
- **실시간 스트리밍**: Claude API 스트리밍 응답
- **서버리스 지원**: Vercel 배포 가능 (MongoDB Atlas Vector Search 사용)

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
```

### 2. MongoDB Atlas Vector Search 인덱스 생성

MongoDB Atlas에서 다음 컬렉션에 Vector Search 인덱스를 생성하세요:

**컬렉션: `bkit_github_docs`**
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

**컬렉션: `bkit_qa_embeddings`**
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

인덱스 이름: `vector_index`

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

### 5. GitHub 문서 동기화

```bash
curl -X POST http://localhost:3000/api/bkit-guide/sync
```

## 배포

### Vercel (권장)

1. GitHub에 푸시
2. Vercel에서 Import
3. 환경 변수 설정 (ANTHROPIC_API_KEY, MONGODB_URI)
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
- **Vector Search**: MongoDB Atlas Vector Search
- **Embeddings**: Xenova/transformers (로컬, 무료, 384-dim)
- **Database**: MongoDB Atlas
- **Styling**: Tailwind CSS

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  MongoDB Atlas                                              │
├─────────────────────────────────────────────────────────────┤
│  bkit_qa          - Q&A 원본 저장                           │
│  bkit_github_docs - GitHub 문서 + 벡터 임베딩               │
│  bkit_qa_embeddings - Q&A 벡터 임베딩                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  RAG Pipeline                                               │
├─────────────────────────────────────────────────────────────┤
│  질문 → 로컬 임베딩 → MongoDB Vector Search → Claude 답변   │
└─────────────────────────────────────────────────────────────┘
```

## 라이선스

MIT License

---

Built with Claude Code by [drwon-cmd](https://github.com/drwon-cmd)
