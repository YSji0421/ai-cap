# 안전교육 Mockup 계획 (시나리오 체험형)

## Context (왜 만드는가)
손해사정 시스템(`adjuster-system`)은 교통/화재/상해/생명 보험 사고를 다룹니다. 단순한 객관식 퀴즈가 아니라, **하나의 연결된 상황(시나리오)을 단계별로 풀어가며 위기 상황의 의사결정을 직접 체험**하게 하는 학습 화면을 추가합니다. 본 Mockup은 DB·진도 추적 같은 정식 기능 없이 **빠르게 시연 가능한 인터랙티브 데모**가 목표입니다.

- **학습 흐름**: 상황 부여 → 선택 → 오답 시 즉각 피드백 후 같은 단계 재시도 / 정답 시 다음 단계로 → 모든 단계 완료 시 결과 화면
- **시연 시 기대**: 로그인 후 navbar의 "안전교육" 클릭 → 시나리오 카드 선택 → 단계별로 선택지 고르며 진행 → 완주 후 시도 횟수와 단계별 해설 확인
- **비범위 (이번엔 안 함)**: 엔티티/DB 저장, 사용자별 진도 누적, 점수 랭킹, 관리자 시나리오 등록, 인증·권한 변경, 자동 테스트

---

## 학습 인터랙션 명세 (사용자 제공 예시 기반)

### 핵심 패턴
각 시나리오는 **여러 단계(Stage)** 로 구성되며, 각 단계는:
- **상황 텍스트**: 무슨 일이 벌어졌는지 1~3문장
- **선택지 2~3개** (A/B/C, 정답 표시는 사용자에게 숨김)
- **선택지별 피드백 메시지** (오답이면 경고/이유, 정답이면 칭찬/해설)
- **정답 인덱스**: 정답 1개 지정

### 동작 규칙
1. 사용자가 선택지 클릭 → 해당 선택지의 피드백 박스가 표시됨
   - **오답**: 빨간색 박스, "❌ ..." 메시지 + **"다시 시도"** 버튼 → 같은 단계의 선택지를 다시 고를 수 있게 리셋
   - **정답**: 초록색 박스, "✅ ..." 메시지 + **"다음 단계 →"** 버튼
2. 마지막 단계 정답 후 → **결과 화면**: 단계별 시도 횟수, 한 번에 맞춘 단계 수, 모든 단계의 해설 모음, "처음부터 다시" / "시나리오 목록으로" 버튼
3. 페이지 새로고침 없이 vanilla JS로 단계 전환 (전체 시나리오 데이터를 페이지 로드 시 `<script type="application/json">`으로 인라인하여 사용)

---

## 설계 개요

### 1) 라우팅
| URL | 역할 | 템플릿 |
|---|---|---|
| `GET /education` | 시나리오 카드 목록 | `templates/education/index.html` |
| `GET /education/scenario/{id}` | 단일 시나리오 단계별 진행 화면 | `templates/education/scenario.html` |

`{id}` 예: `soldering`, `traffic-accident`, `kitchen-fire`. REST API 엔드포인트는 만들지 않음 (시나리오 데이터를 서버 렌더링 시 페이지에 임베드).

### 2) 데이터 모델 (정적 Java POJO, DB 없음)
하드코딩된 시나리오 카탈로그를 메모리에서 제공.

```java
record Scenario(String id, String title, String emoji, String summary, List<Stage> stages) {}
record Stage(String situation, List<Choice> choices, int correctIndex) {}
record Choice(String label, String text, String feedback) {}  // label = "A"/"B"/"C"
```

`SafetyEducationData.SCENARIOS` 가 `List<Scenario>` 를 반환. 컨트롤러는 `id`로 조회.

### 3) 새로 추가할 파일
- **컨트롤러**: `src/main/java/com/adjuster/system/controller/SafetyEducationController.java`
  - `@Controller @RequestMapping("/education")`
  - `GET /education` → 카드용으로 시나리오 메타(id, title, emoji, summary, stages.size()) 모델에 담아 `education/index` 반환
  - `GET /education/scenario/{id}` → 해당 `Scenario` 객체 통째로 모델에 담아 `education/scenario` 반환. 없는 id는 `/education`으로 redirect + flash 에러
- **데이터 클래스**: `src/main/java/com/adjuster/system/controller/SafetyEducationData.java`
  - 위 record 3종을 nested로 포함
  - 시드 시나리오 2~3개 하드코딩 (아래 §시드 시나리오 참고)
- **템플릿**:
  - `src/main/resources/templates/education/index.html`
    - 기존 dashboard와 동일한 인라인 navbar
    - 본문: `.card` 또는 `.stat-card` 그리드, 시나리오마다 카드 1개 (이모지 + 제목 + 한줄 설명 + "단계 N개" + "체험 시작 →" 버튼)
  - `src/main/resources/templates/education/scenario.html`
    - 인라인 navbar
    - 헤더: 시나리오 제목 + 진행 표시 (`단계 1/3` + 진행 바)
    - 본문 카드 1: 상황 설명 텍스트
    - 본문 카드 2: 선택지 버튼 영역 (A/B/C)
    - 본문 카드 3: 피드백 박스 (초기엔 숨김, 선택 후 표시. 오답=`alert-error`, 정답=`alert-success` 클래스 재사용)
    - 컨트롤 버튼: "다시 시도" (오답 시) 또는 "다음 단계 →" (정답 시)
    - 결과 화면: 같은 페이지 내 별도 영역, 마지막 단계 정답 후 표시
    - 시나리오 데이터는 `<script id="scenario-data" type="application/json" th:utext="${scenarioJson}"></script>` 로 임베드, JS가 파싱해 사용
    - JSON 직렬화는 컨트롤러에서 `ObjectMapper`로 미리 처리해 모델에 `scenarioJson` String으로 주입 (Thymeleaf inline JS 이스케이프 문제 회피)

### 4) 기존 파일 수정 (각 1줄 추가)
- `src/main/resources/templates/layout/base.html` line 20 근처
  `<a th:href="@{/education}" th:classappend="${currentPage == 'education'} ? 'active'">안전교육</a>`
- `src/main/resources/templates/dashboard/index.html` line 12~15 인라인 navbar에도 동일 링크 추가
- (선택) `cases/list.html`, `cases/detail.html` 등 다른 인라인 navbar 가진 페이지에도 동일 링크 — Mockup 시연 동선만 보장하면 되므로 dashboard 한 곳만 추가해도 됨

`SecurityConfig`는 손대지 않음. 기존 인증 정책(로그인 필요) 그대로 적용.

---

## 시드 시나리오 (Mockup 동봉 데이터)

### 시나리오 1: `soldering` — 새벽 납땜 작업의 위기 ⚙️
사용자 제공 예시를 그대로 사용.

**Stage 1: 상황 부여**
> 내일이 캡스톤 프로젝트 마감일입니다. 새벽 2시, 피곤한 상태로 라즈베리파이 센서 연결을 위해 인두기를 켰습니다. 환기를 하려는데 창문이 닫혀 있네요.

- A. "잠깐만 할 건데 뭐..." 그냥 밀폐된 상태로 납땜을 시작한다. → ❌ 삐-! 납땜 시 발생하는 흄(연기)은 호흡기 질환을 유발합니다. 아무리 급해도 환기는 필수입니다.
- **B. 귀찮아도 환풍기를 켜고 창문을 조금 열어둔다.** → ✅ 정답! 납 흄과 플럭스 연기는 반드시 배출해야 합니다.

**Stage 2: 위기 발생**
> 피곤해서 꾸벅 졸다가 그만 뜨겁게 달궈진 인두기를 책상 밑으로 떨어뜨렸습니다! 당신의 반사 신경은?

- A. 본능적으로 떨어지는 인두기 손잡이를 잡아챈다. → ❌ 앗, 뜨거워! 떨어지는 인두기는 절대 손으로 잡으려 하면 안 됩니다. 화상 위험이 매우 큽니다. 기물이 파손되더라도 몸을 먼저 피하세요.
- **B. 즉시 뒤로 물러나며 인두기가 바닥에 떨어지도록 내버려 둔다.** → ✅ 정답! 인체가 우선입니다.

**Stage 3: 사후 대처**
> 다행히 바닥에 떨어졌지만, 피하려다 손가락이 인두기 팁에 살짝 스쳐 가벼운 화상을 입었습니다.

- A. 얼음을 급히 가져와 상처 부위에 직접 문지른다. → ❌ 얼음 직접 접촉은 동상·조직 손상을 유발할 수 있습니다.
- B. 구급상자에서 화상 연고를 꺼내 바로 바른다. → ❌ 열을 식히기 전에 연고부터 바르면 열이 갇혀 화상이 더 깊어질 수 있습니다.
- **C. 흐르는 시원한 물에 10~15분간 손을 대고 열을 식힌다.** → ✅ 정답! 화상 응급처치의 1순위는 충분한 흐르는 물 냉각입니다.

### 시나리오 2: `traffic-accident` — 가벼운 접촉사고 직후 🚗 (보험 도메인 연결, 3단계 요약)
- Stage 1: 신호 대기 중 후방 추돌. → 정답: 비상등 켜고 안전한 곳으로 이동·하차 (오답: 격분해 즉시 차에서 내려 따짐 / 그냥 가던 길 계속 감)
- Stage 2: 부상 신고와 사진 촬영. → 정답: 인적사항·면허 교환 + 차량 손상부와 도로 위치 사진 촬영 + 보험사 접수 (오답: 가해자 말만 듣고 명함만 받음 / 현장에서 합의금 현금 요구)
- Stage 3: 며칠 후 목 통증. → 정답: 즉시 병원 진료 + 보험사에 추가 신고 (오답: 참고 넘김 / SNS에 글부터 올림)

### (선택) 시나리오 3: `kitchen-fire` — 주방 기름 화재 🔥 (3단계, 시간 남으면 추가)
- Stage 1: 식용유 과열 발화. → 정답: 가스 차단 + 뚜껑·젖은 천으로 산소 차단 (오답: 물 끼얹기 / 그릇째 들고 싱크대로)
- Stage 2: 불길이 커짐. → 정답: 119 신고 + 대피 (오답: 직접 K급 소화기 없는데 끄려고 함)
- Stage 3: 대피 후. → 정답: 안전한 곳에서 대기, 보험사 접수 (오답: 짐 챙기러 재진입)

> **Mockup 최소 범위**: 시나리오 1 (사용자 제공) 필수 + 시나리오 2 권장. 시나리오 3은 시간 여유 시 추가.

---

## UI/UX 디테일
- 카드 그리드, 버튼, alert 박스 모두 기존 `static/css/style.css` 재사용 (`.card`, `.btn`, `.btn-primary`, `.alert`, `.alert-success`, `.alert-error`)
- 진행 바: 단순 div + width %; 최소한의 인라인 스타일이면 충분
- 선택지 버튼: 좌측에 `A`/`B`/`C` 라벨 배지 + 본문, 호버 시 강조
- 피드백 박스: `<strong>❌ 오답!</strong>` 또는 `<strong>✅ 정답!</strong>` 헤더 + 메시지
- 결과 화면: "총 N단계 / 한 번에 맞춘 단계: M개 / 총 시도 횟수: K회" + 단계별 정답·해설 리스트

---

## 재사용할 기존 자산
- `templates/layout/base.html` (line 13–28): navbar 패턴 복사
- `templates/dashboard/index.html` (line 35–56): 카드 그리드 레이아웃 복사 — 시나리오 카드에 활용
- `static/css/style.css`: 디자인 시스템 (재사용, 새 CSS 거의 불필요)
- Spring Boot가 이미 가진 `ObjectMapper` (jackson) 으로 시나리오 → JSON 직렬화

새 엔티티/리포지토리/서비스/DTO/REST 컨트롤러는 **만들지 않습니다**.

---

## 변경 파일 요약

**추가 (4개)**
- `src/main/java/com/adjuster/system/controller/SafetyEducationController.java`
- `src/main/java/com/adjuster/system/controller/SafetyEducationData.java` (Scenario/Stage/Choice record nested)
- `src/main/resources/templates/education/index.html`
- `src/main/resources/templates/education/scenario.html`

**수정 (2개, 각 1줄)**
- `src/main/resources/templates/layout/base.html`
- `src/main/resources/templates/dashboard/index.html`

---

## 검증 (수동 시연 시나리오)
1. `./gradlew bootRun` (포트 8080), 로그인
2. 대시보드 navbar에 **"안전교육"** 링크 노출 확인 → 클릭 → `/education` 카드 목록 표시
3. **"새벽 납땜 작업의 위기"** 카드 → "체험 시작" 클릭 → `/education/scenario/soldering` 진입
4. Stage 1 — A 클릭 → 빨간 피드백 + "다시 시도" 노출, 다시 시도 → 선택지 재표시 → B 클릭 → 초록 피드백 + "다음 단계 →"
5. Stage 2 — 동일 패턴, A 오답 / B 정답 흐름 확인
6. Stage 3 — A·B 모두 오답 피드백 노출 후 다시 시도 가능, C 정답 시 결과 화면 표시
7. 결과 화면: 단계별 정답·해설 리스트, 총 시도 횟수 표시 확인 → "처음부터 다시" 클릭 시 Stage 1로 리셋, "시나리오 목록으로" 클릭 시 `/education` 복귀
8. 시나리오 2 (traffic-accident) 도 동일 동작 확인
9. 잘못된 id로 직접 접근 (`/education/scenario/nope`) → `/education`으로 리다이렉트 + 에러 메시지 표시
10. 브라우저 콘솔 에러 없음

> 자동 테스트는 Mockup 범위 외. 정식 기능 승격 시 통합 테스트 + DB 도입 별도 단계.

---

## 추후 확장 시 (메모, 이번엔 안 함)
- `SafetyScenario`, `SafetyStage`, `UserAttempt` 엔티티 도입 → 사용자별 시도 이력 저장
- 단계별 시도 횟수 기반 점수/뱃지
- 관리자 페이지에서 시나리오 CRUD
- `AiApiController` 활용해 사용자 프로필·`Case.accidentType` 기반 맞춤 시나리오 생성
- 비디오/이미지 첨부, 음성 효과 ("삐-!" 같은 오답 사운드)
- 다국어 지원 (현재 한국어만)
