# Ondam Monorepo

Svelte 클라이언트와 Express 서버를 포함한 모노레포 프로젝트입니다.

## 프로젝트 구조

```
ondam/
├── client/          # Svelte 클라이언트
├── server/          # Express 서버
├── package.json     # 루트 package.json (워크스페이스 설정)
├── .gitignore       # Git 무시 파일
├── .env             # 환경 변수
└── env.example      # 환경 변수 예시
```

## 설치 및 실행

### 전체 프로젝트 설치
```bash
npm run install:all
```

### 개발 서버 실행
```bash
# 클라이언트와 서버를 동시에 실행
npm run dev

# 또는 개별 실행
npm run dev:client  # Svelte 클라이언트 (포트 5173)
npm run dev:server  # Express 서버 (포트 3001)
```

### 빌드
```bash
npm run build
```

## 환경 변수

`.env` 파일을 생성하고 필요한 환경 변수를 설정하세요. `env.example` 파일을 참고하세요.

### 주요 환경 변수
- `PORT`: 서버 포트 (기본값: 3001)
- `GEMINI_API_KEY`: Google Gemini AI API 키 (필수)
- `OPEN_API_KEY`: 공공데이터포털 API 키 (필수)
- `NODE_ENV`: 실행 환경 (development/production)
- `VITE_API_URL`: 클라이언트에서 사용할 API URL

### API 키 설정 방법

1. **Gemini API 키**:
   - [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 발급
   - `.env` 파일에 `GEMINI_API_KEY=your_api_key_here` 추가

2. **공공데이터포털 API 키**:
   - [공공데이터포털](https://data.go.kr/)에서 회원가입 후 API 키 발급
   - `.env` 파일에 `OPEN_API_KEY=your_api_key_here` 추가

3. **.env 파일 생성**:
   ```bash
   cp env.example .env
   # .env 파일을 열어서 실제 API 키로 교체
   ```

## 기술 스택

### 클라이언트 (Svelte)
- SvelteKit
- TypeScript
- Vite

### 서버 (Express)
- Express.js
- CORS
- Helmet (보안)
- Morgan (로깅)
- dotenv (환경 변수)

## 개발 가이드

1. 클라이언트는 `http://localhost:5173`에서 실행됩니다.
2. 서버는 `http://localhost:3001`에서 실행됩니다.
3. API 엔드포인트는 `/api/` 경로를 사용합니다.
4. CORS가 설정되어 있어 클라이언트에서 서버로 요청할 수 있습니다.

## API 엔드포인트

- `GET /`: 서버 상태 확인
- `GET /api/health`: 서버 헬스 체크
