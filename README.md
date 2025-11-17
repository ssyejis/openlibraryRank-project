# openlib-rank

Local project to search and list GitHub repositories by stars with tag-based filtering.

## 개발 실행

Run backend:

```
cd backend
npm install
npm run dev
```

Run frontend:

```
cd frontend
npm install
npm start
```

## 배포(간단 안내)

1. 환경 변수 준비
 - `GITHUB_TOKEN` (백엔드에서 GitHub API 호출 시 rate limit 회피용). Render나 다른 호스팅 서비스의 환경 변수 설정 화면에서 추가하세요.
 - `REACT_APP_API_URL` (프론트엔드에서 호출할 백엔드 URL). 예: `https://your-backend.onrender.com`.

2. 프론트엔드 코드가 환경변수를 사용하도록 수정되어 있습니다. 로컬에서는 `.env` 파일에 `REACT_APP_API_URL=http://localhost:5001`을 넣어 개발하세요. 예시 파일은 `.env.example`에 있습니다.

3. 권장 배포 조합
 - 백엔드: Render (Web Service) — `backend` 폴더를 지정하고 `npm start`로 실행
 - 프론트엔드: Vercel (Create React App 지원) — `frontend` 폴더를 지정

4. 배포 후 확인
 - 프론트엔드를 열어 기능(태그 추가, 검색, 페이지네이션)이 정상 동작하는지 확인하세요.

필요하시면 이 저장소를 GitHub에 커밋/푸시하고 배포 설정 작업(설명서 기반)을 제가 진행하도록 하겠습니다.