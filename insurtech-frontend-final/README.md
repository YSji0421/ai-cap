# AI 약관 도우미 - 지능형 화상 상담소

## 팀명: 인슈어테크 | 이예진, 지윤석

## 실행 방법

```bash
npm install
npm start
```

브라우저에서 http://localhost:3000 접속

## Gemini API 연동

1. https://aistudio.google.com 에서 API 키 발급 (무료)
2. `src/pages/ConsultationRoomPage.js` 파일 열기
3. 상단의 `YOUR_GEMINI_API_KEY` 를 실제 키로 교체

## 화면 구성

- `/login` - 로그인
- `/register` - 회원가입  
- `/main` - 메인 홈 (상담 이력)
- `/device-check` - 장치 체크
- `/room/:roomId` - AI 화상 상담실
- `/summary/:roomId` - 상담 종료 요약

## 기술 스택

- React 18
- React Router v6
- Google Gemini 1.5 Flash API
- WebRTC (카메라/마이크)
