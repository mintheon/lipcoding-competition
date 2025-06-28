# Frontend Web Interface

멘토-멘티 매칭 플랫폼의 프론트엔드 웹 인터페이스입니다.

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 서버 백그라운드 실행
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

## 🌐 서버 정보

- **포트**: 3000
- **웹 인터페이스**: http://localhost:3000
- **API 프록시**: http://localhost:3000/api → http://localhost:8080/api
- **Swagger UI**: http://localhost:3000/swagger-ui

## 💡 주의사항

프론트엔드 서버 실행 전에 **백엔드 서버가 먼저 실행**되어 있어야 합니다.

```bash
# 1. 백엔드 실행 (다른 터미널)
cd ../backend && npm start

# 2. 프론트엔드 실행
npm start
```

## 📁 구조

```
frontend/
├── server.js         # 프록시 서버
├── views/           # EJS 템플릿
├── public/          # 정적 파일
├── routes/          # 웹 라우트
└── uploads/         # 업로드 파일
```

## 🎯 기능

- 🔐 로그인/회원가입
- 👤 프로필 관리
- 🔍 멘토 검색
- 💌 매칭 요청
- 📊 요청 상태 관리
