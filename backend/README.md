# Backend API Server

멘토-멘티 매칭 플랫폼의 백엔드 API 서버입니다.

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 서버 백그라운드 실행 (데이터베이스 자동 초기화 포함)
npm start

# 서버 포그라운드 실행
npm run start:fg

# 개발 모드 (자동 재시작)
npm run dev

# 서버 중지
npm stop

# 서버 상태 확인
npm run status

# 로그 확인
npm run logs
```

## 📋 주요 명령어

- `npm start` - 백그라운드 모드로 서버 실행
- `npm run start:fg` - 포그라운드 모드로 서버 실행
- `npm run dev` - 개발 모드로 서버 실행 (nodemon)
- `npm stop` - 서버 중지
- `npm run status` - 서버 상태 확인
- `npm run logs` - 실시간 로그 확인
- `npm run test-data` - 테스트 데이터 생성
- `npm run setup` - 데이터베이스 초기화

## 🌐 서버 정보

- **포트**: 8080
- **API 경로**: http://localhost:8080/api
- **API 문서**: http://localhost:8080/swagger-ui
- **OpenAPI JSON**: http://localhost:8080/openapi.json

## 🧪 테스트 계정

### 멘토
- `mentor@test.com` / `password123`
- `alice@mentor.com` / `password123`

### 멘티
- `mentee@test.com` / `password123`
- `student1@mentee.com` / `password123`

## 📁 구조

```
backend/
├── server.js          # 메인 서버 파일
├── openapi.yaml       # API 문서
├── middleware/        # 미들웨어
├── routes/           # API 라우트
├── scripts/          # 데이터베이스 스크립트
└── uploads/          # 파일 업로드
```
