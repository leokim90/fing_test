# babida

밥이다(Babida)는 React Native(Expo)와 Firebase, Google Maps를 기반으로 한 맛집 지도 리뷰 앱입니다. 사용자는 이메일로 회원가입/로그인을 진행하고, 지도에서 맛집을 탐색하며 사진과 함께 리뷰를 남길 수 있습니다.

## 주요 기능
- **이메일 인증**: Firebase Auth로 로그인/회원가입을 처리합니다.
- **맛집 지도**: Google Maps SDK와 Firestore의 `restaurants` 컬렉션을 연동해 맛집 핀을 표시합니다.
- **맛집 등록**: 이름, 카테고리, 주소, 지도에서 위치를 선택하거나 현재 위치를 불러오고 대표 사진을 업로드할 수 있습니다.
- **리뷰 관리**: 별점과 내용, 사진을 포함한 리뷰를 작성/수정/삭제하며 본인 작성 리뷰만 편집이 허용됩니다.
- **미디어 업로드**: Expo Image Picker와 Firebase Storage를 이용해 이미지를 업로드합니다.

## 시작하기
1. 의존성 설치
   ```bash
   npm install
   ```
2. Firebase 프로젝트를 생성하고 `firebase/config.js`에 구성 값을 입력합니다.
3. Expo 개발 서버 실행
   ```bash
   npx expo start
   ```
4. Expo Go 앱 또는 에뮬레이터를 통해 프로젝트를 실행합니다.

## 환경 구성
- Firestore 컬렉션
  - `restaurants`: 맛집 기본 정보 저장
  - `reviews`: 맛집별 리뷰 저장 (`restaurantId` 참조)
  - `users`: 사용자 프로필 저장
- Storage 경로 예시
  - `restaurants/{timestamp}`
  - `reviews/{restaurantId}/{timestamp}`

## 라이선스
이 프로젝트는 교육 및 데모 목적의 예시 코드입니다.
