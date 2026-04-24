# 호남노회 웹사이트 — 에이전트 가이드

## 프로젝트 개요

대한예수교장로회(합동) 호남노회 공식 웹사이트 퍼블리싱 작업물.
CMS 연동을 전제로 한 정적 HTML 퍼블리싱 구조이며, 빌드 시 `data-include` 인라인 처리 후 출력된다.

### 빌드 명령어

| 명령어 | 모드 | 출력 | 설명 |
|---|---|---|---|
| `npm run dev` | 개발 | `dist/` | Full Build 후 browser-sync 서빙 + src/ 변경 감지 자동 재빌드 |
| `npm run build` | Full Build | `dist/` | 모든 include 인라인화. CMS 변수 치환 없음. 시놀로지 서버 직접 배포용. |
| `npm run build:siiru` | SiiRU CMS Export | `dist-siiru/` | 레이아웃(header/footer) 제외하고 본문만 추출. CMS 변수 치환 적용. |
| `npm run preview` | 미리보기 | `dist/` | `npm run build` 결과를 browser-sync로 확인 |

---

## 디렉토리 구조

```
src/
├── assets/
│   ├── css/
│   │   ├── style.css      # 공통 전역 스타일 (헤더·푸터·공통컴포넌트)
│   │   ├── main.css       # 메인(index.html) 전용
│   │   └── sub.css        # 서브·게시판 페이지 전용
│   ├── js/
│   │   ├── script.js      # 공통 전역 스크립트 (GNB·드로어·스크롤)
│   │   ├── main.js        # 메인 전용 (탭·Swiper)
│   │   └── sub.js         # 서브·게시판 전용
│   └── images/
├── include/
│   ├── header.html              # [sub 셸] DOCTYPE + head(CSS) + body 여는 태그 + headerSub include
│   ├── footer.html              # [sub 닫힘] footerSub include + JS 스크립트 + body/html 닫는 태그
│   ├── headerSub.html           # GNB 컴포넌트 (탑바·GNB·메가드롭다운·모바일드로어)
│   ├── footerSub.html           # 푸터 컴포넌트
│   ├── sidebar_introduce.html   # 사이드바 — 노회 소개
│   ├── sidebar_history.html     # 사이드바 — 노회 역사
│   ├── sidebar_organization.html# 사이드바 — 노회 조직
│   ├── sidebar_admin.html       # 사이드바 — 행정 자료
│   ├── sidebar_news.html        # 사이드바 — 노회 소식
│   └── sidebar_extra.html       # 사이드바 — 부가서비스
├── board/
│   ├── basic/list.html    # 일반 게시판 스킨 (테이블형)
│   └── multimedia/list.html  # 썸네일 게시판 스킨 (앨범 그리드형)
├── boardpage/             # 게시판 페이지 (data-include로 스킨 로드)
│   ├── notice/            # 공지사항 (basic)
│   ├── album/             # 노회 앨범 (multimedia)
│   ├── press/             # 교회 소식 (basic)
│   ├── media/             # 언론 보도 (multimedia)
│   ├── representatives/   # 총대 명부 (basic)
│   ├── official-docs/     # 노회 공문 (basic)
│   ├── forms/             # 행정 서식 (basic)
│   └── other-resources/   # 기타 자료실 (basic)
├── sub/                   # 컨텐츠 서브 페이지
│   ├── intro.html         # 노회 소개 (소개말·노회장 인사말)
│   ├── officers.html      # 임원 구성 (인물카드 그리드)
│   ├── rules.html         # 노회 규칙 (조항 텍스트)
│   ├── directions.html    # 오시는 길 (지도 플레이스홀더)
│   ├── history.html       # 노회 연혁 (타임라인)
│   ├── officers-past.html # 역대 노회 임원 (역대 노회장+임원 통합)
│   ├── churches.html      # 소속 교회 (시찰별 탭·테이블)
│   ├── district.html      # 시찰 소개 (3개 시찰 카드)
│   └── departments.html   # 부서 소개 (상비부 표)
└── index.html
```

---

## GNB 메뉴 구조

헤더(`include/headerSub.html`)의 메뉴는 5개 섹션으로 구성된다.

| GNB | 서브메뉴 | 링크 |
|---|---|---|
| 노회 소개 | 노회 소개 | `/sub/intro.html` |
| | 임원 구성 | `/sub/officers.html` |
| | 노회 규칙 | `/sub/rules.html` |
| | 오시는 길 | `/sub/directions.html` |
| 노회 역사 | 노회 연혁 | `/sub/history.html` |
| | 역대 노회 임원 | `/sub/officers-past.html` |
| 노회 조직 | 소속 교회 | `/sub/churches.html` |
| | 시찰 소개 | `/sub/district.html` |
| | 부서 소개 | `/sub/departments.html` |
| | 총대 명부 | `/boardpage/representatives/list.html` |
| 행정 자료 | 노회 공문 | `/boardpage/official-docs/list.html` |
| | 행정 서식 | `/boardpage/forms/list.html` |
| | 기타 자료실 | `/boardpage/other-resources/list.html` |
| 노회 소식 | 공지사항 | `/boardpage/notice/list.html` |
| | 노회 앨범 | `/boardpage/album/list.html` |
| | 교회 소식 | `/boardpage/press/list.html` |
| | 언론 보도 | `/boardpage/media/list.html` |

---

## 디자인 시스템 (CSS 변수)

`style.css` 최상단에 정의된 변수를 모든 CSS에서 사용한다. 임의 색상값 직접 작성 금지.

```css
/* 주요 브랜드 컬러 */
--hn-green:      #0F6B3E   /* 주색: CTA·호버·활성화·강조 */
--hn-blue:       #14417A   /* 부색: 사이드바헤더·정보·링크 */
--hn-red:        #B4303A   /* 경고·공지 핀·오류 */

/* 배경 */
--hn-bg:         #FFFFFF
--hn-bg-alt:     #F5F6F8   /* 테이블 헤더·사이드바 항목 배경 */
--hn-bg-alt2:    #ECEEF2   /* 사진 플레이스홀더 배경 */
--hn-bg-dark:    #1F242B   /* 푸터 배경 */

/* 텍스트 */
--hn-text:       #15181D   /* 기본 (제목·강조) */
--hn-text-2:     #3A424C   /* 보조 (본문) */
--hn-text-3:     #6B7380   /* 뮤티드 (설명·레이블) */
--hn-text-4:     #9098A4   /* 약한 강조 (플레이스홀더·아이콘) */

/* 선·보더 */
--hn-line:       #DFE2E8
--hn-line-strong:#C8CCD4
--hn-line-soft:  #EBEDF1

/* 소프트 배경 */
--hn-green-soft: #E8F2EC
--hn-blue-soft:  #E7EDF5

/* 폰트 */
--font-base: 'Pretendard', -apple-system, '맑은 고딕', sans-serif
```

### 반응형 브레이크포인트

| 구간 | max-width |
|---|---|
| 태블릿 | 1024px |
| 모바일 | 768px |

---

## 서브 페이지 공통 레이아웃

`sub.css` 기준. 모든 서브 페이지는 **fragment** 방식으로 작성한다.
`header.html`/`footer.html` include가 DOCTYPE·CSS·스크립트를 자동 제공하므로
페이지 파일에는 그 선언들을 쓰지 않는다.

### 페이지 파일 기본 구조

```html
<div data-include="../include/header.html"></div>

<main id="main-content">

  <!-- 페이지 헤더 -->
  <div class="hn-page-head">
    <div class="inner">
      <div class="breadcrumb-hn">
        <span class="home"><i class="fa-regular fa-house"></i> HOME</span>
        <i class="fa-regular fa-chevron-right"></i>
        <span>섹션명</span>
        <i class="fa-regular fa-chevron-right"></i>
        <span class="cur">현재 페이지</span>
      </div>
      <h1>페이지 제목</h1>
      <p class="desc">페이지 설명</p>
    </div>
  </div>

  <!-- 2열 레이아웃: sidebar(300px) + content(1fr) -->
  <div class="sub-layout">
    <div data-include="../include/sidebar_XXX.html"></div>

    <section class="content">
      <h2 class="ptitle">
        <span>페이지 제목</span>
        <span class="cnt">부가 정보 <b>강조</b></span>
      </h2>
      <!-- 컨텐츠 -->
    </section>
  </div>

</main>

<div data-include="../include/footer.html"></div>
```

### 사이드바 include 매핑

| 섹션 | 파일 |
|---|---|
| 노회 소개 | `sidebar_introduce.html` |
| 노회 역사 | `sidebar_history.html` |
| 노회 조직 | `sidebar_organization.html` |
| 행정 자료 | `sidebar_admin.html` |
| 노회 소식 | `sidebar_news.html` |
| 부가서비스 | `sidebar_extra.html` |

활성 메뉴(`.on` 클래스 + 빈 `<span>` 교체)는 `script.js`의
`markActiveSidebar()` 함수가 URL 비교로 자동 처리한다.
sidebar include 파일 내부의 링크는 반드시 루트 절대경로(`/sub/...`)로 작성할 것.

**경로 규칙**
- `src/sub/*.html` → `../include/header.html`, `../include/sidebar_XXX.html`, `../include/footer.html`
- `src/boardpage/{name}/*.html` → `../../include/header.html`, `../../include/sidebar_XXX.html`, `../../include/footer.html`, `../../board/basic/list.html`

### index.html (메인 페이지)

메인 페이지는 fragment 방식을 사용하지 않는다.
자체 `<head>` + `main.css` + `main.js`를 가지며,
`headerSub.html` / `footerSub.html`을 직접 include 한다.

---

## sub.css 컴포넌트 목록

### 인물 카드 (`.person-grid` / `.person-card`)

4열 그리드. 사진 플레이스홀더(3:4 비율) + 직위·이름·소속교회.
역대 노회장에는 3열 `.president-grid` / `.president-past-card` 사용 (기간 추가).

```html
<div class="person-grid">
  <div class="person-card">
    <div class="photo"><div class="placeholder">PHOTO<br>PLACEHOLDER</div></div>
    <div class="info">
      <div class="role">노회장</div>
      <div class="name">홍길동 목사</div>
      <div class="church">광주중앙교회</div>
    </div>
  </div>
</div>
```

역대 노회장 카드:
```html
<div class="president-grid">
  <div class="president-past-card">
    <div class="photo"><div class="placeholder">PHOTO<br>PLACEHOLDER</div></div>
    <div class="pcard-body">
      <div class="pcard-term">제108회기</div>
      <div class="pcard-name">홍길동 목사</div>
      <div class="pcard-church">광주중앙교회</div>
      <div class="pcard-period">2026 – 2027</div>
    </div>
  </div>
</div>
```

### 그룹 탭 (`.tab-wrap` / `.group-tabs`)

회기별·시찰별 탭 전환. `.tab-wrap` 래퍼 안에 `.group-tabs`(버튼)과 `.tab-panel`(패널)을 함께 넣는다.
`data-tab` ↔ `data-panel` 값이 일치해야 JS가 연결한다.

```html
<div class="tab-wrap">
  <div class="group-tabs">
    <button class="on" data-tab="gwangju">광주시찰</button>
    <button data-tab="naju">나주시찰</button>
  </div>
  <div class="tab-panel on" data-panel="gwangju">...</div>
  <div class="tab-panel" data-panel="naju">...</div>
</div>
```

**sub.js 동작**: `.tab-wrap` 내부에서 버튼 클릭 시 `data-tab` 값과 일치하는 `data-panel` 패널을 활성화.

### 소속 교회 테이블 (`.church-table`)

시찰별 탭 안에 교회 목록 테이블. 5열: 교회명·담임목사·주소·연락처·홈페이지.

```html
<p class="church-count">광주시찰 소속 <b>15</b>개 교회</p>
<table class="church-table">
  <thead><tr><th>교회명</th><th>담임목사</th><th>주소</th><th>연락처</th><th>홈페이지</th></tr></thead>
  <tbody>
    <tr>
      <td>광주중앙교회</td>
      <td>홍길동 목사</td>
      <td>광주 동구 금남로 ...</td>
      <td>062-221-0000</td>
      <td><a href="#">홈페이지</a></td>
    </tr>
  </tbody>
</table>
```

### 시찰 소개 카드 (`.district-grid` / `.district-card`)

3열 그리드. 단체사진(4:3) + 시찰장·서기 + 소속 교회 수.

```html
<div class="district-grid">
  <div class="district-card">
    <div class="d-thumb">
      <div class="placeholder">단체사진<br>PLACEHOLDER</div>
      <div class="d-badge">광주시찰</div>
    </div>
    <div class="d-body">
      <div class="d-title">광주시찰</div>
      <div class="d-info">
        <div class="r"><span class="k">시찰장</span><span>홍길동 목사 (광주중앙교회)</span></div>
        <div class="r"><span class="k">시찰서기</span><span>김길동 목사 (동구소망교회)</span></div>
      </div>
      <div class="d-count">
        <i class="fa-regular fa-church" style="color:var(--hn-green);"></i>
        소속 교회 <b>15</b>개
      </div>
    </div>
  </div>
</div>
```

### 오시는 길 (`.map-wrap` / `.directions-addr` / `.directions-info`)

지도 플레이스홀더(16:7) + 주소 배너 + 교통 안내 2열 그리드.
나중에 `div.map-placeholder` 자리에 지도 API iframe을 삽입한다.

```html
<div class="directions-addr">
  <i class="fa-regular fa-location-dot"></i>
  <div>
    <div class="addr-text">주소</div>
    <div class="addr-sub">부가 설명</div>
  </div>
</div>
<div class="map-wrap">
  <div class="map-placeholder">
    <i class="fa-regular fa-map-location-dot"></i>
    <p>지도 API 연동 예정</p>
  </div>
</div>
<div class="directions-info">
  <div class="di-card">
    <h4><i class="fa-regular fa-bus"></i> 버스 이용 시</h4>
    <ul><li>...</li></ul>
  </div>
</div>
```

### 부서 소개 표 (`.dept-table`)

상비부 목록 표. 4열: 부서명·부장·부원·역할.
`td.dept-name` = 부서명(배경색), `td.dept-chief` = 부장(파란색).

```html
<table class="dept-table">
  <thead>
    <tr><th>부서명</th><th>부장</th><th>부 원</th><th>담당 역할</th></tr>
  </thead>
  <tbody>
    <tr>
      <td class="dept-name">재정부</td>
      <td class="dept-chief">홍길동 목사<br><small>광주중앙교회</small></td>
      <td class="title">김길동 목사, ...</td>
      <td>예산 편성, 결산 보고</td>
    </tr>
  </tbody>
</table>
```

### 노회장 인사말 카드 (`.president-card`)

2열 레이아웃: 사진(220px) + 본문(인사말).

```html
<div class="president-card">
  <div class="pres-photo"><div class="placeholder">PHOTO<br>PLACEHOLDER</div></div>
  <div class="pres-body">
    <div class="pres-role">제108회기 노회장</div>
    <div class="pres-name">홍길동 목사</div>
    <div class="pres-church">광주중앙교회</div>
    <div class="pres-message"><p>...</p></div>
    <div class="pres-sign">2026년 4월<br><b>노회장 홍길동 목사</b></div>
  </div>
</div>
```

### 노회 소개 리드 (`.intro-lead`)

녹색 좌측 보더 + 소프트 배경. 소개 단락 텍스트 강조용.

```html
<div class="intro-lead">
  <p>첫 번째 단락</p>
  <p>두 번째 단락</p>
</div>
```

### 노회 규칙 (`.rules-doc` / `.chapter-head` / `.rules-list`)

장(章) 단위로 `.chapter-head` 구분, 조항은 `.rules-list > li`에 `.art`(조항번호) + 본문으로 구성.
하위 항목은 `.rules-sub` 중첩 ul 사용.

```html
<div class="rules-doc">
  <div class="chapter-head">제1장 총칙</div>
  <ul class="rules-list">
    <li>
      <span class="art">제1조</span>
      <span>본 노회는 ...
        <ul class="rules-sub">
          <li><span class="art">①</span><span>...</span></li>
        </ul>
      </span>
    </li>
  </ul>
</div>
```

---

## style.css 공통 컴포넌트

### 버튼 (`.btn-hn`)

```html
<button class="btn-hn primary">확인</button>
<button class="btn-hn secondary">취소</button>
<button class="btn-hn ghost">목록</button>
```

### 알림박스 (`.alert-hn`)

```html
<div class="alert-hn info">
  <i class="fa-regular fa-circle-info"></i>
  <div><b>안내</b> — 메시지</div>
</div>
```
타입: `info` (파란색), `success` (녹색), `warn` (노란색), `danger` (빨간색)

### 정의 테이블 (`.dt-table`)

2열(항목명·값) 기관정보 테이블.

```html
<table class="dt-table">
  <tbody>
    <tr><th>명 칭</th><td>호남노회</td></tr>
  </tbody>
</table>
```

### 타임라인 (`.timeline`)

연혁·순서 표시. 왼쪽 연도 + 중앙 점선 + 오른쪽 내용.

```html
<div class="timeline">
  <div class="timeline-item">
    <div class="year">2026</div>
    <div class="t">제목</div>
    <div class="d">설명</div>
  </div>
</div>
```

### 페이지네이션 (`.pagination-hn`)

```html
<nav class="pagination-hn">
  <a aria-label="이전"><i class="fa-regular fa-chevron-left"></i></a>
  <a class="on" aria-current="page">1</a>
  <a>2</a>
  <a aria-label="다음"><i class="fa-regular fa-chevron-right"></i></a>
</nav>
```

### 배지·칩

```html
<span class="pin">공지</span>         <!-- 빨간 핀 배지 -->
<span class="cat g">노회공지</span>    <!-- 녹색 카테고리 -->
<span class="cat b">교단공지</span>    <!-- 파란 카테고리 -->
<span class="chip g dot">완료</span>  <!-- 녹색 칩 -->
```

---

## 게시판 패턴

### boardpage 파일 구조

`boardpage/{name}/list.html`은 직접 게시판 HTML을 작성하지 않고 `data-include`로 스킨을 로드한다.

```html
<!-- 일반 게시판 -->
<section class="content">
  <h2 class="ptitle"><span>게시판명</span><span class="cnt">전체 <b>N</b>건</span></h2>
  <div data-include="../../board/basic/list.html"></div>
</section>

<!-- 썸네일 게시판 -->
<section class="content">
  <h2 class="ptitle"><span>게시판명</span><span class="cnt">전체 <b>N</b>건</span></h2>
  <div data-include="../../board/multimedia/list.html"></div>
</section>
```

### 게시판 섹션별 사이드바

사이드바는 `include/sidebar_XXX.html`을 data-include로 삽입한다.
활성 항목은 `script.js`의 `markActiveSidebar()`가 자동 처리.

| 섹션 | include 파일 | 포함 메뉴 |
|---|---|---|
| 노회 소식 | `sidebar_news.html` | 공지사항·노회 앨범·교회 소식·언론 보도 |
| 노회 조직 | `sidebar_organization.html` | 소속 교회·시찰 소개·부서 소개·총대 명부 |
| 행정 자료 | `sidebar_admin.html` | 노회 공문·행정 서식·기타 자료실 |

---

## 파일 작성 시 체크리스트

새 서브 페이지 또는 게시판 페이지를 작성할 때 반드시 확인:

**구조**
- [ ] 페이지 파일은 fragment (DOCTYPE/head/body 선언 없음)
- [ ] 첫 줄: `<div data-include="../include/header.html"></div>` (boardpage: `../../include/`)
- [ ] 끝 줄: `<div data-include="../include/footer.html"></div>` (boardpage: `../../include/`)
- [ ] 사이드바: `<div data-include="../include/sidebar_XXX.html"></div>` 로 삽입

**사이드바**
- [ ] sidebar include 파일 내 링크는 루트 절대경로(`/sub/...`)만 사용
- [ ] 현재 페이지 활성화는 `markActiveSidebar()`가 자동 처리 → 파일에 `class="on"` 직접 쓰지 않음
- [ ] 새 메뉴가 생기면 `include/headerSub.html` (드롭다운 + 모바일 드로어) + 해당 `sidebar_XXX.html` 양쪽 업데이트

**CSS / 에셋**
- [ ] CSS·JS·이미지 경로는 전부 루트 절대경로(`/assets/...`) 또는 header.html이 자동 제공 — 별도 `<link>` 불필요
- [ ] 디자인 토큰(CSS 변수) 사용, 임의 색상 하드코딩 금지
- [ ] 사진·단체사진 자리에는 `<div class="placeholder">PHOTO<br>PLACEHOLDER</div>` 삽입

**기타**
- [ ] 탭 전환: `.tab-wrap > .group-tabs[data-tab] + .tab-panel[data-panel]` 패턴
- [ ] 빌드 확인: `npm run build` → `dist/`에서 최종 HTML 검증
