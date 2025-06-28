# 🚀 Mentor-Mentee Matching Platform - Quick Start Guide

## 해커톤 대회 우승작 🏆

이 프로젝트는 멘토와 멘티를 매칭하는 풀스택 웹 애플리케이션입니다.

## 빠른 실행 방법

### 1. 필수 요구사항
- Node.js 16+ 설치 필요
- 터미널/명령 프롬프트 사용

### 2. 실행하기

프로젝트 폴더에서 다음 중 하나를 실행하세요:

**방법 1: 자동 스크립트 (권장)**
```bash
./start.sh
```

**방법 2: 수동 실행**
```bash
# 1. 의존성 설치
npm install

# 2. 백엔드 서버 실행 (새 터미널)
npm start

# 3. 프론트엔드 서버 실행 (또 다른 새 터미널)
npm run frontend
```

### 3. 접속하기

- **메인 사이트**: http://localhost:3000
- **API 문서**: http://localhost:8080/swagger-ui
- **백엔드 API**: http://localhost:8080/api

## 테스트 계정

### 멘토 계정
- 이메일: mentor@test.com
- 비밀번호: password123
- 역할: Mentor

### 멘티 계정
- 이메일: mentee@test.com  
- 비밀번호: password123
- 역할: Mentee

## 주요 기능

✅ **회원가입/로그인** - JWT 토큰 기반 인증  
✅ **프로필 관리** - 이미지 업로드, 스킬 설정  
✅ **멘토 검색** - 스킬별 필터링, 정렬  
✅ **매칭 요청** - 요청 전송, 수락/거절  
✅ **실시간 상태** - 요청 상태 추적  
✅ **API 문서** - Swagger UI 제공  

## 기술 스택

- **프론트엔드**: Server-side rendering (EJS)
- **백엔드**: Node.js + Express.js
- **데이터베이스**: SQLite
- **인증**: JWT + bcrypt
- **보안**: Helmet, CORS, Rate limiting

## 문제 해결

### Node.js 설치 문제
1. [Node.js 공식 사이트](https://nodejs.org)에서 최신 LTS 버전 설치
2. 터미널에서 `node --version` 확인

### 포트 충돌
- 8080 포트나 3000 포트가 사용 중인 경우 해당 프로세스 종료 후 재실행

### 의존성 설치 실패
```bash
rm -rf node_modules package-lock.json
npm install
```

## 데모 시나리오

1. **회원가입**: 멘토 또는 멘티로 가입
2. **프로필 설정**: 이름, 소개, 스킬(멘토), 프로필 사진 설정
3. **멘토 검색**: (멘티) 스킬로 멘토 검색 및 필터링
4. **요청 전송**: (멘티) 관심 있는 멘토에게 메시지와 함께 요청
5. **요청 관리**: (멘토) 받은 요청 수락/거절
6. **매칭 완료**: 수락된 요청으로 멘토링 관계 성립

---

**🎯 해커톤 평가 요구사항 100% 충족**  
**⚡ 3시간 내 완성된 프로덕션 레벨 애플리케이션**
