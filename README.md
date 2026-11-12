# Anatomy Quest — 해부학 학습 앱

학생 로그인·회원가입, 교수자 진도 관리, 편집 가능한 챕터·문제은행과 3D 근육 실습실을 제공하는 웹앱입니다.

현재 운영 중인 앱: https://anatomy-step-yoodong.ekfhddlrhtn1.chatgpt.site

이 저장소에는 프로그램 소스와 재배포 가능한 3D 모델만 포함됩니다. 실제 학생 계정, 학습 기록, 교수자가 등록한 문제은행과 비밀값은 포함되지 않습니다. 운영 데이터는 기존 클라우드 DB에 별도로 보관됩니다. GitHub에 코드를 올리는 것만으로 운영 사이트가 자동 배포되지는 않습니다.

## 로컬 실행

Node.js 24 이상에서:

```sh
npm ci
npm run build
npm run dev
```

미리보기는 `http://127.0.0.1:4174`에서 열립니다. 첫 실행 시 로컬 SQLite DB가 생성됩니다. 교수자 화면 로컬 확인은 `LOCAL_PROFESSOR=1 npm run dev`를 사용합니다. 이 인증 모의 기능은 배포 Worker에 포함되지 않습니다.

---

# Anatomy Quest

인체해부학 학습 앱. 학생 회원가입·로그인, 서버 채점, 오답 복습, 계정별 진도 저장과 교수자 대시보드를 제공합니다.

## 구성

- `public/`: 반응형 로그인·학습·교수자 UI. 이미지 로고는 참고 화면의 실제 대학 교표가 아닌 자체 제작 상징입니다.
- `worker/api.js`: Cloudflare Worker API. 세션은 HttpOnly 쿠키, 비밀번호는 독립 salt를 사용한 PBKDF2-SHA256 해시로 저장합니다.
- `db/schema.ts`, `drizzle/`: D1 스키마와 생성된 마이그레이션.
- `scripts/build.mjs`: UI를 포함한 자체 완결형 Worker와 배포 산출물 생성.
- `scripts/dev.mjs`: Node 24 SQLite 기반 로컬 미리보기. `.local/`은 Git에서 제외됩니다.

`npm install`, `npm run db:generate` (스키마 변경 시), `npm run build`, `npm run dev`.
로컬 교수자 QA는 `LOCAL_PROFESSOR=1 npm run dev`. 이 환경변수와 로컬 인증 모의 기능은 배포 Worker에 포함되지 않습니다.

## 배포

`npm run build`는 `.openai/hosting.json`이 없으면 `hosting.example.json`을 사용해 검토용 산출물을 생성합니다. 실제 배포 시에는 대상 Sites 프로젝트 ID를 설정한 `.openai/hosting.json`이 필요합니다. 이 계정별 파일은 Git에서 제외됩니다. 서버에 D1 `DB`와 `PROFESSOR_EMAIL` 런타임 비밀값이 필요합니다. 교수자 로그인은 플랫폼이 검증한 ChatGPT 사용자 ID·이메일과 허용된 이메일을 대조합니다. 클라이언트의 역할 선택으로 권한을 부여하지 않습니다. Sites의 접근 정책과 앱 로그인은 별개입니다. 현재 Site 비공개 정책을 보존하며, 학생 외부 배포 전 접근 정책을 명시적으로 변경해야 합니다.

회원은 이름과 학번을 제공하며 교수자가 학습 기록을 볼 수 있다는 안내 후 가입합니다. 동명이인은 학번으로 로그인합니다. 비밀번호를 잊으면 교수자가 학생 신원을 확인한 뒤 초기화하고 안전하게 전달합니다. 이메일 재설정 링크 발송은 제공하지 않습니다.

예시 25문항은 PPT 자료에서 생성한 문제가 아닙니다. 교수자가 문제은행에서 문항을 추가하거나 JSON을 가져올 수 있으며, PPT 자동 변환은 미구현입니다. 로그인 전 체험 모드는 기록을 계정에 저장하지 않습니다. 기존 브라우저 전용 버전의 기록은 다른 학생 계정으로 자동 이전하지 않습니다.

## 챕터·단원과 문제은행 편집

교수자 로그인 → 하단 문제은행에서 챕터, 단원, 학습목표를 만들고 순서를 바꿀 수 있습니다. 단원별 아이콘, 설명, 레슨당 문항 수(1~10), 잠금 해제 XP를 편집할 수 있습니다. 문항은 단원·학습목표에 연결하고, 이미지·용어 매칭·면과 축 훈련을 선택적으로 지정할 수 있습니다. 변경사항은 초안이며 ‘저장하고 학생 화면에 반영’을 눌러야 게시됩니다.

전체 내보내기는 `{version:2,curriculum,questions}` 형식입니다. 이 파일은 챕터·단원·문제를 함께 초안으로 가져옵니다. 기존 문제 배열 또는 `{questions:[...]}` 파일도 선택한 단원에 병합할 수 있습니다. 문제 ID가 같은 항목은 병합에서 건너뜁니다. 파일 및 저장 요청은 2MB 이하이며, 문제는 최대 1,000개입니다. 이미지 파일은 PNG/JPEG/WebP 500KB 이하 또는 HTTPS 주소를 사용합니다.

저장은 기존 settings 테이블의 단일 library 레코드에 원자적으로 이루어지며, 리비전으로 동시 편집 충돌을 감지합니다. 기존 questions 설정과 고정 단원 ID는 하위 호환으로 읽습니다. 단원의 표시 이름과 순서를 바꾸어도 문항 ID와 학생 학습 기록은 유지됩니다. 문제가 연결된 단원은 해당 문제를 먼저 옮기거나 삭제해야 제거할 수 있습니다. 예시 문제 표시는 교수자가 끌 수 있습니다.

학생 홈은 환영 배너, 챕터·학습목표별 숙련도, 7개 학습 모드, 챕터 선택과 단원별 레슨으로 구성됩니다. 현재 문제의 마지막 정답 상태로 숙련도를 계산합니다. 레슨은 설정한 크기만큼 나뉘며, 문제 풀이와 XP 잠금 검사는 서버에서 수행합니다. Boss Quiz는 현재 열려 있는 챕터 문항 중 최대 20개를 출제하고 80% 이상이면 배지를 기록합니다. 용어 매칭은 용어·정의가 등록된 문항이 2개 이상 있어야 합니다. 이미지와 면·축 훈련은 해당 유형의 문항이 등록된 후 이용할 수 있습니다. 교수자 미리보기와 로그인 전 체험은 학생 진도에 기록되지 않습니다.

## 3D 근육 실습실

홈의 ‘3D 근육 실습실’ 또는 하단 ‘3D 근육’ 메뉴에서 실제 BodyParts3D 기반 전신 근육 표면 모형을 탐색합니다. 별도 외부 임베드나 CDN 요청 없이 Three.js와 GLB를 같은 Site에서 제공합니다. 3D 코드는 메뉴를 열 때만 로딩합니다.

- 177개 근육·힘줄 등 구조: 클릭 선택, 이름/부위/신경 검색, 회전·확대·이동, 정면/후면/측면, 선택 확대·분리 보기, 주변 불투명도.
- 주요 근육 20종: 형태·기시·정지·신경지배·작용 요약과 개별 출처. 뼈·신경 3D 레이어 및 부착면의 3D 표시는 포함하지 않습니다. 상세 카드가 없는 구조는 형태만 제공하며 미등록 상태를 표시합니다.
- 대표 관절 동작을 보여주는 별도의 개념 SVG 애니메이션. 실제 근육 변형·힘 계산·관절 가동범위를 재현하는 생체역학 시뮬레이션은 아닙니다. 모델 좌우 및 일부 갈래는 그룹으로 선택됩니다.
- 교수자는 선택한 구조의 학습카드를 편집·추가할 수 있습니다. 기존 D1 `settings`의 `muscle_cards` 키를 사용하고 리비전 비교로 동시 편집 충돌을 막습니다. 학생은 쓰기 권한이 없습니다. 3D 탐색은 퀴즈 XP·학습 기록을 임의로 올리지 않습니다.
- WebGL 실패 시에도 근육 목록과 텍스트 학습카드는 사용할 수 있습니다. 키보드로 목록을 선택하고, 캔버스 포커스 후 화살표/+/−/Home 키로 조작할 수 있습니다.

### Model provenance and license

Asset: OrganUI Muscles, pinned commit `1c746c36d12a78c5f3fd452dbe5d29ae869cad04`, derived from BodyParts3D 3.0 / DBCLS and distributed under CC BY-SA 2.1 Japan. SHA-256 `615ed2cf0d5ca9aa63f30bb806a65c740ed2ab057463a19505e19eff2bf207ce`. Geometry is unmodified; only display colors, selection, and camera behavior change. Attribution, modification notice, source manifest, and original GLB are accessible in the app and under `public/models/`. Derived model screenshots retain the asset license. Three.js is MIT, with its license in `public/licenses/three.txt`.

`shared/muscle-data.js` contains the structure registry and original Korean teaching summaries with links to University of Washington Muscle Atlas and NCBI Bookshelf. Their copyrighted anatomical illustrations are not reproduced. `public/anatomy-viewer.js` is bundled with esbuild into a locally served module; `scripts/build.mjs` packages the GLB as a binary route in the self-contained Worker.
