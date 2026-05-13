# 게시판·회원 스킨 재작성 구현 가이드

> **호남노회 웹사이트** — `legacy/` JSP 구조 기반으로 `src/board/*` 및 `src/sub/` 회원 페이지 재작성
> 작성일: 2026-05-13

---

## 1. 배경 및 목표

`legacy/` 디렉토리에는 실제 SiiRU CMS 서버에 배포된 JSP 스킨 파일이 있다.
현재 `src/board/`, `src/sub/` 의 HTML은 자체 `hn-*` 클래스 체계로 작성돼 있어,
CMS가 렌더링하는 HTML 구조(siiru-* 클래스)와 일치하지 않는다.

**목표**:
1. `src/board/basic/*.html`, `src/board/multimedia/*.html` — 스킨 파일(fragment)의 HTML 구조를 JSP와 동일하게 재작성한다. JSTL/EL 변수는 정적 플레이스홀더로 대체.
2. `src/sub/login.html`, `join.html`, `finduser.html`, `leave.html` — 페이지 래퍼(header/sidebar/footer)는 유지하고, `<section class="content">` 내부를 JSP skin 구조로 교체.
3. `src/sub/myInfo.html`, `src/sub/passChange.html` — 신규 페이지 생성.
4. `src/assets/css/sub.css` — siiru-* 클래스에 hn-* 디자인 토큰 기반 스타일 추가.

---

## 2. 변경 대상 파일 목록

| 파일 | 종류 | 대응 레거시 JSP | 변경 방식 |
|---|---|---|---|
| `src/board/basic/list.html` | fragment | `legacy/board/basic/list.jsp` | **전면 재작성** |
| `src/board/basic/view.html` | fragment | `legacy/board/basic/view.jsp` | **전면 재작성** |
| `src/board/basic/write.html` | fragment | `legacy/board/basic/write.jsp` | **전면 재작성** |
| `src/board/multimedia/list.html` | fragment | `legacy/board/multimedia/list.jsp` | **전면 재작성** |
| `src/board/multimedia/view.html` | fragment | `legacy/board/multimedia/view.jsp` | **전면 재작성** |
| `src/board/multimedia/write.html` | fragment | `legacy/board/multimedia/write.jsp` | **전면 재작성** |
| `src/sub/login.html` | 전체 페이지 | `legacy/skin/login.jsp` | section.content 내부 교체 |
| `src/sub/join.html` | 전체 페이지 | `legacy/skin/join.jsp` | section.content 내부 교체 |
| `src/sub/finduser.html` | 전체 페이지 | `legacy/skin/findUser.jsp` | section.content 내부 교체 |
| `src/sub/leave.html` | 전체 페이지 | `legacy/skin/leave.jsp` | section.content 내부 교체 |
| `src/sub/myInfo.html` | **신규 생성** | `legacy/skin/myInfo.jsp` | 신규 전체 페이지 작성 |
| `src/sub/passChange.html` | **신규 생성** | `legacy/skin/passChange.jsp` | 신규 전체 페이지 작성 |
| `src/assets/css/sub.css` | CSS | — | siiru-* 스타일 블록 추가 |

---

## 3. 핵심 원칙

### 3.1 Board Fragment 파일
- `src/board/*/` 는 **fragment** 파일 — `<html>`, `<head>`, `<body>` 없음.
- `boardpage/*/list.html` 에서 `data-include`로 불러온다.
- JSP 최상단 래퍼 `<div class="siiru-boardWrap">` 으로 시작한다.
- JSTL `<c:if>`, `<c:forEach>` 등은 **정적 HTML로 치환** (대표 데이터 2~3건).
- CMS 변수(`${boardData.boardSj}`)는 대표 샘플 텍스트로 치환.

### 3.2 Skin 전체 페이지
- `src/sub/*.html` 는 전체 페이지 — `data-include` header/sidebar/footer 유지.
- `<section class="content">` 내부만 교체.
- `h2.ptitle` 행 위에 두고 그 아래에 JSP skin 구조를 삽입.
- 사이드바: `sidebar_extra.html` (부가서비스 섹션).

### 3.3 CSS
- `sub.css` 하단에 `/* === SiiRU Board & Skin Styles === */` 블록을 추가.
- 모든 색상은 `var(--hn-*)` 토큰 사용. 임의 색상값 하드코딩 금지.
- `siiru-btn` 시리즈는 `btn-hn` 시리즈와 시각적으로 동일하게 맞춘다.

---

## 4. CSS 추가 명세 (`sub.css` 하단에 추가)

```css
/* ================================================
   SiiRU CMS Board & Skin Styles — 호남노회 디자인 토큰 기반
   ================================================ */

/* ── 공통 유틸 ──────────────────────────────────── */
.siiru-fl   { float: left; }
.siiru-fr   { float: right; }
.siiru-tc   { text-align: center; }
.siiru-tr   { text-align: right; }
.siiru-clr::after { content: ''; display: block; clear: both; }
.siiru-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
.siiru-ml5  { margin-left: 5px; }
.siiru-ml10 { margin-left: 10px; }
.siiru-mb20 { margin-bottom: 20px; }
.siiru-mt5  { margin-top: 5px; }
.siiru-mt10 { margin-top: 10px; }
.siiru-pt10 { padding-top: 10px; }
.throughline td, .throughline th { text-decoration: line-through; color: var(--hn-text-3); }

/* ── 버튼 (siiru-btn) ───────────────────────────── */
.siiru-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 16px; border-radius: 4px; font-size: 13px; font-weight: 500;
  border: 1px solid var(--hn-line-strong); background: var(--hn-bg);
  color: var(--hn-text-2); cursor: pointer; text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.siiru-btn:hover { background: var(--hn-bg-alt); }
.siiru-btn-primary { background: var(--hn-green); border-color: var(--hn-green); color: #fff; }
.siiru-btn-primary:hover { background: #0a5530; border-color: #0a5530; color: #fff; }
.siiru-btn-warning { background: #e8a000; border-color: #e8a000; color: #fff; }
.siiru-btn-warning:hover { background: #c48800; border-color: #c48800; color: #fff; }
.siiru-btn-danger { background: var(--hn-red); border-color: var(--hn-red); color: #fff; }
.siiru-btn-danger:hover { background: #8f2228; border-color: #8f2228; color: #fff; }
.siiru-btn-success { background: #2e7d32; border-color: #2e7d32; color: #fff; }
.siiru-btn-small { padding: 4px 10px; font-size: 12px; }
.siiru-btnSet { display: flex; gap: 8px; justify-content: center; margin-top: 20px; }

/* ── 게시판 래퍼 ─────────────────────────────────── */
.siiru-boardWrap { width: 100%; }

/* ── 검색 폼 ──────────────────────────────────── */
.siiruBoard-search {
  padding: 14px 0 18px;
  border-bottom: 1px solid var(--hn-line);
  margin-bottom: 14px;
}
.siiruBoard-search form { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.siiruBoard-search .dateSearch { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; width: 100%; margin-bottom: 8px; }
.siiruBoard-search .dateSearch input[type="radio"] { accent-color: var(--hn-green); }
.siiruBoard-search .dateSearch label { font-size: 13px; color: var(--hn-text-2); cursor: pointer; }
.siiruBoard-search .dateSearch input.maskDate {
  padding: 6px 10px; border: 1px solid var(--hn-line); border-radius: 4px;
  font-size: 13px; width: 120px; outline: 0;
}
.siiruBoard-search select {
  padding: 7px 10px; border: 1px solid var(--hn-line); border-radius: 4px;
  font-size: 13px; background: var(--hn-bg); color: var(--hn-text-2); cursor: pointer; outline: 0;
}
.siiruBoard-search input[type="text"]:not(.maskDate) {
  flex: 1; padding: 7px 12px; border: 1px solid var(--hn-line); border-radius: 4px;
  font-size: 13px; outline: 0; min-width: 180px;
}
.siiruBoard-search button[type="submit"] {
  padding: 7px 18px; background: var(--hn-blue); color: #fff;
  border: none; border-radius: 4px; font-size: 13px; cursor: pointer;
}

/* ── 목록 정보 ────────────────────────────────── */
.siiruBoard-listInfo {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; margin-bottom: 6px; font-size: 13px; color: var(--hn-text-3);
}

/* ── 테이블 목록 ──────────────────────────────── */
.siiruBoard-list table {
  width: 100%; border-collapse: collapse;
  border-top: 2px solid var(--hn-text);
}
.siiruBoard-list thead th {
  background: var(--hn-bg-alt); padding: 12px 10px;
  font-size: 13px; font-weight: 700; color: var(--hn-text-2);
  border-bottom: 1px solid var(--hn-line);
  text-align: center;
}
.siiruBoard-list thead th.boardSj { text-align: left; padding-left: 16px; }
.siiruBoard-list tbody tr { border-bottom: 1px solid var(--hn-line-soft); }
.siiruBoard-list tbody tr:hover { background: var(--hn-bg-alt); }
.siiruBoard-list tbody td,
.siiruBoard-list tbody th[scope="row"] {
  padding: 11px 10px; font-size: 14px; color: var(--hn-text-2);
  text-align: center; vertical-align: middle;
}
.siiruBoard-list tbody th[scope="row"].boardSj {
  text-align: left; padding-left: 16px;
}
.siiruBoard-list tbody th[scope="row"].boardSj a {
  color: var(--hn-text); text-decoration: none; font-weight: 500;
}
.siiruBoard-list tbody th[scope="row"].boardSj a:hover { color: var(--hn-green); }
.siiruBoard-list tbody th[scope="row"].boardSj a.new::after {
  content: 'N'; display: inline-block; margin-left: 6px;
  background: var(--hn-red); color: #fff; font-size: 10px;
  padding: 1px 5px; border-radius: 2px; font-weight: 700; vertical-align: middle;
}
.siiruBoard-list span.notice {
  display: inline-block; background: var(--hn-red); color: #fff;
  font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 3px;
}
.siiruBoard-list .reBlcok { display: inline-block; width: 14px; }
.siiruBoard-list img.reply { width: 12px; vertical-align: middle; margin-right: 4px; }
.siiruBoard-list img.file { width: 14px; }
.siiruBoard-list td.nodata {
  padding: 40px 0; text-align: center; color: var(--hn-text-3); font-size: 14px;
}
.siiruBoard-list tbody tr.notice { background: var(--hn-green-soft); }
.siiruBoard-list small { font-size: 12px; color: var(--hn-text-3); }

/* ── 페이지네이션 (JS 생성) ───────────────────── */
#boardPage .pagination { display: flex; justify-content: center; gap: 4px; padding: 20px 0; list-style: none; margin: 0; }
#boardPage .pagination li a {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border: 1px solid var(--hn-line); border-radius: 4px;
  font-size: 13px; color: var(--hn-text-2); text-decoration: none;
}
#boardPage .pagination li a:hover { background: var(--hn-bg-alt); }
#boardPage .pagination li.active a { background: var(--hn-green); border-color: var(--hn-green); color: #fff; }

/* ── 뷰 페이지 ────────────────────────────────── */
.siiruBoard-view { }
.siiruBoard-view > form > h4 {
  padding: 16px 0 14px; font-size: 18px; font-weight: 700; color: var(--hn-text);
  border-bottom: 1px solid var(--hn-line); line-height: 1.5;
}
.siiruBoard-view > form > h4.text-danger { color: var(--hn-red); }
.siiruBoard-view > form > h4 span.notice {
  display: inline-block; background: var(--hn-red); color: #fff;
  font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 3px; margin-right: 6px;
}

.siiruBoardInfo { border-bottom: 1px solid var(--hn-line); }
.boardInfo-view {
  display: flex; gap: 20px; flex-wrap: wrap;
  padding: 10px 0; font-size: 13px; color: var(--hn-text-3);
}
.siiruBoardInfo dl {
  display: flex; border-top: 1px solid var(--hn-line-soft); padding: 10px 0;
  font-size: 13px;
}
.siiruBoardInfo dl dt { width: 90px; font-weight: 600; color: var(--hn-text-2); flex-shrink: 0; }
.siiruBoardInfo dl dd { flex: 1; color: var(--hn-text-2); }
.siiruBoardInfo dl dd ul { list-style: none; padding: 0; margin: 0; }
.siiruBoardInfo dl dd ul li { margin-bottom: 6px; }
.siiruBoardInfo dl dd ul li a { color: var(--hn-blue); text-decoration: none; }
.siiruBoardInfo dl dd ul li a:hover { text-decoration: underline; }
.siiruBoardInfo dl dd small { font-size: 12px; color: var(--hn-text-3); margin-left: 8px; }

.siiruBoardBody { padding: 24px 0; }
.boardContents { font-size: 15px; line-height: 1.8; color: var(--hn-text-2); }
.boardContents p { margin-bottom: 12px; }
.boardContents h4 { margin: 20px 0 10px; font-size: 16px; font-weight: 700; color: var(--hn-text); }

.imageView { margin-bottom: 20px; }
.imageView img { max-width: 100%; display: block; margin-bottom: 8px; }
.imageView small { font-size: 12px; color: var(--hn-text-3); display: block; margin-bottom: 12px; }
.videoView { margin-bottom: 20px; }
.videoView video { max-width: 100%; }
.audioView { margin-bottom: 20px; }

.siiruBoardBtnInfo {
  padding: 14px 0; border-top: 1px solid var(--hn-line);
  display: flex; justify-content: space-between;
  overflow: hidden;
}
.siiruBoardBtnInfo::after { content: ''; display: block; clear: both; }

.manageInfo { padding: 10px 0; font-size: 12px; color: var(--hn-text-3); }
.manageInfo small { display: block; margin-bottom: 4px; }

.siiruBoardList { border-top: 1px solid var(--hn-line); margin-top: 10px; }
.siiruBoardList ul { list-style: none; padding: 0; margin: 0; }
.siiruBoardList ul li {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 0; border-bottom: 1px solid var(--hn-line-soft);
  font-size: 14px;
}
.siiruBoardList ul li > span:first-child {
  width: 48px; font-weight: 700; color: var(--hn-text-3); flex-shrink: 0;
}
.siiruBoardList ul li a { color: var(--hn-text-2); text-decoration: none; flex: 1; }
.siiruBoardList ul li a:hover { color: var(--hn-green); }
.siiruBoardList ul li small { font-size: 12px; color: var(--hn-text-3); margin-left: auto; }

/* ── 댓글 영역 ────────────────────────────────── */
.siiruBoardComt { border-top: 2px solid var(--hn-text); margin-top: 24px; }
.siiruBoardComt dl { }
.siiruBoardComt dl dt {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0; font-weight: 700; font-size: 15px; color: var(--hn-text);
}
.siiruBoardComt dl dd { padding: 0; }
#boardComtList { list-style: none; padding: 0; margin: 0; }
#boardComtList li { padding: 14px 0; border-bottom: 1px solid var(--hn-line-soft); }
#boardComtList li .well { background: var(--hn-bg-alt); padding: 10px 14px; border-radius: 4px; margin: 8px 0; font-size: 14px; }
#boardComtList li span { font-size: 14px; font-weight: 600; color: var(--hn-text-2); }
#boardComtList small.siiru-fr { font-size: 12px; color: var(--hn-text-3); }
.siiruBoardComt .nodata { text-align: center; padding: 20px; color: var(--hn-text-3); font-size: 14px; }
.comtManage { display: block; font-size: 11px; color: var(--hn-text-3); margin-top: 4px; }

/* ── 작성 폼 ──────────────────────────────────── */
.siiruBoard-write { border-top: 2px solid var(--hn-text); }
.siiruBoard-write dl { display: flex; border-bottom: 1px solid var(--hn-line); }
.siiruBoard-write dl dt {
  width: 130px; padding: 14px 16px; background: var(--hn-bg-alt);
  font-size: 13px; font-weight: 700; color: var(--hn-text-2);
  display: flex; align-items: flex-start; gap: 4px; flex-shrink: 0;
}
.siiruBoard-write dl dt span { color: var(--hn-red); }
.siiruBoard-write dl dd { flex: 1; padding: 12px 16px; }
.siiruBoard-write dl dd input[type="text"],
.siiruBoard-write dl dd input[type="password"],
.siiruBoard-write dl dd input.maskDate,
.siiruBoard-write dl dd input.maskTime {
  padding: 8px 12px; border: 1px solid var(--hn-line); border-radius: 4px;
  font-size: 14px; font-family: inherit; outline: 0; width: 100%; box-sizing: border-box;
}
.siiruBoard-write dl dd input.small2 { width: 240px; }
.siiruBoard-write dl dd input.small { width: 140px; }
.siiruBoard-write dl dd select {
  padding: 8px 12px; border: 1px solid var(--hn-line); border-radius: 4px;
  font-size: 14px; background: var(--hn-bg); color: var(--hn-text-2); outline: 0;
}
.siiruBoard-write dl.fullCont dd,
.siiruBoard-write dl dd.fullCont { padding: 0; }
.siiruBoard-write dl dd textarea {
  width: 100%; padding: 12px 14px; border: 1px solid var(--hn-line);
  font-size: 14px; font-family: inherit; outline: 0; resize: vertical; box-sizing: border-box;
}
.siiruBoard-write .separator { margin: 0 6px; color: var(--hn-text-3); }
.siiruBoard-write .btnLayer { margin-left: 10px; }
.siiruBoard-write small { font-size: 12px; color: var(--hn-text-3); display: block; margin-top: 6px; }

.fileLayer { padding: 10px 0; border-bottom: 1px solid var(--hn-line-soft); }
.fileLayer:last-child { border-bottom: none; }
.fileInfo { margin-bottom: 6px; font-size: 13px; }
.fileInfo .fileView a { color: var(--hn-blue); }
.fileCheckbox { accent-color: var(--hn-green); }

.radioBlock { margin-bottom: 8px; }
.radioBlock label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }

/* ── 갤러리 목록 ──────────────────────────────── */
.siiruBoard-gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 16px;
  padding: 16px 0;
}
@media (max-width: 1024px) { .siiruBoard-gallery { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px)  { .siiruBoard-gallery { grid-template-columns: repeat(2, 1fr); gap: 14px 10px; } }

.siiruBoard-galleryBox { }
.siiruBoard-galleryBox .photoBox {
  aspect-ratio: 4 / 3; overflow: hidden;
  background: var(--hn-bg-alt2); border-radius: 6px;
}
.siiruBoard-galleryBox .photoBox img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 0.2s;
}
.siiruBoard-galleryBox .photoBox a:hover img { transform: scale(1.04); }
.siiruBoard-galleryBox dl { margin: 8px 0 0; }
.siiruBoard-galleryBox dl dt { font-size: 14px; font-weight: 500; color: var(--hn-text); line-height: 1.4; }
.siiruBoard-galleryBox dl dt.new::after {
  content: 'N'; display: inline-block; margin-left: 6px;
  background: var(--hn-red); color: #fff; font-size: 10px;
  padding: 1px 5px; border-radius: 2px; font-weight: 700;
}
.siiruBoard-galleryBox dl dt a { color: inherit; text-decoration: none; }
.siiruBoard-galleryBox dl dt a:hover { color: var(--hn-green); }
.siiruBoard-galleryBox dl dd { font-size: 12px; color: var(--hn-text-3); margin-top: 4px; }
.siiruBoard-galleryBox dl dd span { margin-left: 8px; }
.siiruBoard-galleryBox.throughline dl dt a { text-decoration: line-through; color: var(--hn-text-3); }

/* ── 로그인 스킨 ──────────────────────────────── */
.siiru-loginWrap { padding: 8px 0; }
.loginWrap { max-width: 520px; }
.loginWrap h4 { font-size: 18px; font-weight: 700; color: var(--hn-text); margin-bottom: 16px; }

.loginUser-tab ul { display: flex; list-style: none; padding: 0; margin: 0 0 20px; border-bottom: 2px solid var(--hn-line); }
.loginUser-tab li { flex: 1; text-align: center; }
.loginUser-tab li a {
  display: block; padding: 11px 0; font-size: 14px; font-weight: 600;
  color: var(--hn-text-3); text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -2px;
}
.loginUser-tab li.active a { color: var(--hn-green); border-bottom-color: var(--hn-green); }

.loginLayer { }
.inputWrap { }
.inputWrap h5 { font-size: 15px; font-weight: 700; color: var(--hn-text); margin-bottom: 14px; }

.loginWrap .siiru-loginForm dl,
#siiru-loginForm dl {
  display: flex; flex-direction: column; margin-bottom: 14px;
}
.loginWrap .siiru-loginForm dl dt label,
#siiru-loginForm dl dt label {
  font-size: 13px; font-weight: 600; color: var(--hn-text-2); margin-bottom: 6px;
}
.loginWrap .siiru-loginForm dl dd input[type="text"],
.loginWrap .siiru-loginForm dl dd input[type="password"],
#siiru-loginForm dl dd input[type="text"],
#siiru-loginForm dl dd input[type="password"] {
  width: 100%; padding: 10px 14px; border: 1px solid var(--hn-line); border-radius: 6px;
  font-size: 15px; outline: 0; box-sizing: border-box;
}
#siiru-loginForm dl dd { display: flex; flex-direction: column; gap: 8px; }
#siiru-loginForm dl dd label { font-size: 13px; color: var(--hn-text-3); cursor: pointer; }

.joinLayer { list-style: none; padding: 0; margin: 16px 0 0; display: flex; gap: 10px; }
.joinLayer li a { font-size: 13px; color: var(--hn-text-3); text-decoration: none; }
.joinLayer li a:hover { color: var(--hn-green); }

.certWrap { }
.certSingle { }
.kindBoxWrap { display: flex; gap: 12px; margin-bottom: 12px; }
.kindBox {
  flex: 1; border: 1px solid var(--hn-line); border-radius: 8px; padding: 16px;
  text-align: center;
}
.kindBox.siiru-mr0 { margin-right: 0; }
.stepCate p { font-size: 14px; font-weight: 600; color: var(--hn-text); margin-bottom: 10px; }
.certWrap .info { font-size: 12px; color: var(--hn-text-3); margin-top: 8px; line-height: 1.6; }

/* ── 회원가입 스킨 ────────────────────────────── */
.siiru-joinWrap { padding: 8px 0; }
.siiru-joinWrap .stepTab ul {
  display: flex; list-style: none; padding: 0; margin: 0 0 24px;
  border-bottom: 2px solid var(--hn-line); gap: 0;
}
.siiru-joinWrap .stepTab li { flex: 1; text-align: center; }
.siiru-joinWrap .stepTab li a {
  display: block; padding: 11px 0; font-size: 13px; font-weight: 600;
  color: var(--hn-text-3); text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -2px;
}
.siiru-joinWrap .stepTab li.active a { color: var(--hn-green); border-bottom-color: var(--hn-green); }
.siiru-joinWrap .stepTitle { font-size: 16px; font-weight: 700; color: var(--hn-text); margin-bottom: 16px; }
.siiru-joinWrap .well {
  background: var(--hn-blue-soft); border: 1px solid var(--hn-line); border-radius: 6px;
  padding: 14px 18px; font-size: 14px; color: var(--hn-text-2); margin-bottom: 20px;
}
.kindBoxWrap { display: flex; gap: 12px; margin-bottom: 12px; }
.agreeBoxWrap { margin-bottom: 20px; }
.stepSubTitle { font-size: 14px; font-weight: 700; color: var(--hn-text); margin: 14px 0 8px; }
.agreeBox {
  border: 1px solid var(--hn-line); border-radius: 6px; padding: 14px 16px;
  max-height: 140px; overflow-y: auto; font-size: 13px; color: var(--hn-text-2);
  background: var(--hn-bg-alt); margin-bottom: 8px;
}
.agreeCheck { font-size: 14px; margin-bottom: 14px; }
.agreeCheck label { cursor: pointer; }

.siiru-joinWrap .siiruBoard-write { border-top: none; }
.siiru-joinWrap .siiruBoard-write dl { border-top: 1px solid var(--hn-line); }
.siiru-joinWrap .siiruBoard-write dl:first-child { border-top: 2px solid var(--hn-text); }

.complete { text-align: center; padding: 40px 0; font-size: 16px; color: var(--hn-text-2); }

/* ── 아이디/비밀번호 찾기 스킨 ───────────────── */
.siiru-findUserWrap { padding: 8px 0; }
.findUserWrap { max-width: 560px; }
.findUserWrap h4 { font-size: 18px; font-weight: 700; color: var(--hn-text); margin-bottom: 16px; }
.findUser-tab ul { display: flex; list-style: none; padding: 0; margin: 0 0 20px; border-bottom: 2px solid var(--hn-line); }
.findUser-tab li { flex: 1; text-align: center; }
.findUser-tab li a {
  display: block; padding: 11px 0; font-size: 14px; font-weight: 600;
  color: var(--hn-text-3); text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -2px;
}
.findUser-tab li.active a { color: var(--hn-green); border-bottom-color: var(--hn-green); }
.findLayer { }
.retIdMsg { padding: 12px 0; font-size: 15px; font-weight: 600; color: var(--hn-green); }
.inputWrap h5 { font-size: 15px; font-weight: 700; color: var(--hn-text); margin: 16px 0 12px; }
.inputWrap dl { display: flex; border-bottom: 1px solid var(--hn-line-soft); }
.inputWrap dl:first-of-type { border-top: 2px solid var(--hn-text); }
.inputWrap dl dt { width: 110px; padding: 12px 16px; background: var(--hn-bg-alt); font-size: 13px; font-weight: 700; color: var(--hn-text-2); display: flex; align-items: center; flex-shrink: 0; }
.inputWrap dl dt label { cursor: pointer; }
.inputWrap dl dd { flex: 1; padding: 10px 16px; display: flex; align-items: center; }
.inputWrap dl dd input[type="text"],
.inputWrap dl dd input[type="password"],
.inputWrap dl dd input.maskDate {
  width: 100%; padding: 8px 12px; border: 1px solid var(--hn-line); border-radius: 4px;
  font-size: 14px; outline: 0;
}
.inputWrap dl dd input.small { width: 160px; }
.inputWrap .siiru-btnSet { margin-top: 16px; }

/* ── 회원 탈퇴 스킨 ──────────────────────────── */
.siiru-userWrap { padding: 8px 0; }
.siiru-userWrap .leaveForm h4 { font-size: 18px; font-weight: 700; color: var(--hn-text); margin-bottom: 16px; }
.leaveForm .findLayer { }
.pwCert { margin: 14px 0; }
.pwCert input[type="password"] {
  width: 260px; padding: 9px 14px; border: 1px solid var(--hn-line); border-radius: 6px;
  font-size: 14px; outline: 0;
}

/* ── 비밀번호 변경 스킨 ──────────────────────── */
.siiru-passwdWrap { padding: 8px 0; }
.passwdWrap { max-width: 520px; }
.passwdWrap h4 { font-size: 18px; font-weight: 700; color: var(--hn-text); margin-bottom: 16px; }
.passwdWrap ul { padding: 14px 18px; background: var(--hn-blue-soft); border: 1px solid var(--hn-line); border-radius: 6px; margin-bottom: 20px; }
.passwdWrap ul li { font-size: 13px; color: var(--hn-text-2); line-height: 1.8; }

/* ── 회원 정보 스킨 ──────────────────────────── */
.siiru-userWrap .userWrap h4 { font-size: 18px; font-weight: 700; color: var(--hn-text); margin-bottom: 16px; }
.user-tab ul { display: flex; list-style: none; padding: 0; margin: 0 0 20px; border-bottom: 2px solid var(--hn-line); }
.user-tab li { flex: 1; text-align: center; }
.user-tab li a {
  display: block; padding: 11px 0; font-size: 14px; font-weight: 600;
  color: var(--hn-text-3); text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -2px;
}
.user-tab li.active a { color: var(--hn-green); border-bottom-color: var(--hn-green); }
.siiru-userWrap .siiruBoard-write dl { border-top: 1px solid var(--hn-line); }
.siiru-userWrap .siiruBoard-write dl:first-child { border-top: 2px solid var(--hn-text); }

/* ── 모달 (siiru-modal) ──────────────────────── */
.siiruModal.modal { display: none; }

/* ── 반응형 ──────────────────────────────────── */
@media (max-width: 768px) {
  .siiruBoard-search form { flex-direction: column; align-items: stretch; }
  .siiruBoard-search input[type="text"]:not(.maskDate) { min-width: unset; }
  .siiruBoard-write dl { flex-direction: column; }
  .siiruBoard-write dl dt { width: 100%; border-bottom: 1px solid var(--hn-line-soft); }
  .loginWrap, .passwdWrap, .findUserWrap { max-width: 100%; }
  .kindBoxWrap { flex-direction: column; }
  .siiruBoardBtnInfo { flex-direction: column-reverse; gap: 8px; }
}
```

---

## 5. 파일별 목표 HTML

> 아래 코드는 **구현 시 작성해야 할 정확한 HTML**이다.  
> JSTL 변수(`${...}`)는 정적 샘플 데이터로 치환.  
> JavaScript 블록은 유지하되 EL 변수 부분만 정적값으로 교체.

---

### 5.1 `src/board/basic/list.html`

```html
<div class="siiru-boardWrap">

  <!-- 검색 폼 -->
  <div class="siiruBoard-search">
    <form id="boardSearchForm" name="boardSearchForm" method="post" action="#">
      <input type="hidden" name="pageId" value="">
      <input type="hidden" id="movePage" name="movePage" value="1">
      <input type="hidden" id="boardId" name="boardId" value="">
      <div class="dateSearch">
        <input type="radio" id="dateSet0" name="searchDateSet" value="0">
        <label for="dateSet0"> 오늘 </label>
        <input type="radio" id="dateSet1" name="searchDateSet" value="6">
        <label for="dateSet1"> 일주일 </label>
        <input type="radio" id="dateSet2" name="searchDateSet" value="30">
        <label for="dateSet2"> 1개월 </label>
        <input type="radio" id="dateSet3" name="searchDateSet" value="90">
        <label for="dateSet3"> 3개월 </label>
        <input type="radio" id="dateSet4" name="searchDateSet" value="180">
        <label for="dateSet4"> 6개월 </label>
        <input type="radio" id="dateSet5" name="searchDateSet" value="365">
        <label for="dateSet5"> 1년 </label>
        <input type="text" class="maskDate" id="searchSDe" name="searchSDe" maxlength="10" autocomplete="off" placeholder="검색 시작일">
        ~
        <input type="text" class="maskDate" id="searchEDe" name="searchEDe" maxlength="10" autocomplete="off" placeholder="검색 종료일">
      </div>
      <!-- 분류 선택 -->
      <select id="searchCtgry" name="searchCtgry" title="분류 선택">
        <option value="">전체 분류</option>
        <option value="NOTICE">노회공지</option>
        <option value="URGENT">긴급공지</option>
        <option value="RECRUIT">채용공모</option>
        <option value="TENDER">입찰공고</option>
        <option value="GENERAL">교단공지</option>
      </select>
      <!-- 검색 유형 -->
      <select id="searchTy" name="searchTy" title="검색 조건">
        <option value="T">제목</option>
        <option value="C">내용</option>
        <option value="TC">제목+내용</option>
        <option value="N">작성자</option>
      </select>
      <!-- 검색어 -->
      <input type="text" id="searchQuery" name="searchQuery" placeholder="검색어를 입력하세요" title="검색어">
      <button type="submit">검색</button>
    </form>
  </div>

  <!-- 목록 정보 -->
  <div class="siiruBoard-listInfo">
    <p>전체 : 274 / 페이지 : 28 [today : 3]</p>
  </div>

  <!-- 게시글 테이블 -->
  <div class="siiruBoard-list">
    <table>
      <colgroup>
        <col style="width:88px">
        <col style="width:100px">
        <col>
        <col style="width:100px">
        <col style="width:100px">
        <col style="width:44px">
        <col style="width:70px">
      </colgroup>
      <thead>
        <tr>
          <th scope="col" class="sn">번호</th>
          <th scope="col" class="ctgryNm">분류</th>
          <th scope="col" class="boardSj">제목</th>
          <th scope="col" class="userNm">작성자</th>
          <th scope="col" class="regDt">등록일</th>
          <th scope="col" class="file">첨부</th>
          <th scope="col" class="rdcnt">조회</th>
        </tr>
      </thead>
      <tbody>
        <!-- 공지사항 행 -->
        <tr class="notice">
          <td class="sn"><span class="notice">Notice</span></td>
          <td>[노회공지]</td>
          <th scope="row" class="boardSj">
            <a href="view.html" class="new">제108회 정기노회 소집 공고 및 안건 접수 안내</a>
          </th>
          <td class="userNm">사무처</td>
          <td class="regDt">2026.04.15</td>
          <td class="file"><img src="/assets/images/icon-file.png" alt="첨부파일"></td>
          <td class="rdcnt">1,842</td>
        </tr>
        <tr class="notice">
          <td class="sn"><span class="notice">Notice</span></td>
          <td>[긴급공지]</td>
          <th scope="row" class="boardSj">
            <a href="view.html">사무처 시스템 점검에 따른 일시 서비스 중단 안내(4/25)</a>
          </th>
          <td class="userNm">정보화팀</td>
          <td class="regDt">2026.04.12</td>
          <td class="file"></td>
          <td class="rdcnt">932</td>
        </tr>
        <!-- 일반 행 -->
        <tr>
          <td class="sn">274</td>
          <td>[노회공지]</td>
          <th scope="row" class="boardSj">
            <a href="view.html">2026년도 상반기 목사고시 접수 기간 연장 안내</a>
          </th>
          <td class="userNm">고시부</td>
          <td class="regDt">2026.04.10</td>
          <td class="file"><img src="/assets/images/icon-file.png" alt="첨부파일"></td>
          <td class="rdcnt">782</td>
        </tr>
        <tr>
          <td class="sn">273</td>
          <td>[교단공지]</td>
          <th scope="row" class="boardSj">
            <a href="view.html">총회 헌법개정 공청회 참석 대상자 안내(노회별 2인)</a>
          </th>
          <td class="userNm">사무처</td>
          <td class="regDt">2026.04.08</td>
          <td class="file"><img src="/assets/images/icon-file.png" alt="첨부파일"></td>
          <td class="rdcnt">641</td>
        </tr>
        <tr>
          <td class="sn">272</td>
          <td>[채용공모]</td>
          <th scope="row" class="boardSj">
            <a href="view.html">노회 사무처 행정간사(계약직) 공개채용 공고</a>
          </th>
          <td class="userNm">인사위원회</td>
          <td class="regDt">2026.04.05</td>
          <td class="file"><img src="/assets/images/icon-file.png" alt="첨부파일"></td>
          <td class="rdcnt">2,103</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 페이징 (JS로 렌더링) -->
  <div id="boardPage">
    <div class="pagination"></div>
  </div>

  <!-- 등록 버튼 -->
  <div class="siiru-tr siiru-mb20">
    <a href="write.html" class="siiru-btn siiru-btn-primary">등록</a>
  </div>

</div>
```

---

### 5.2 `src/board/basic/view.html`

```html
<div class="siiru-boardWrap">

  <!-- 검색 상태 유지용 hidden form -->
  <form id="boardSearchForm" name="boardSearchForm" method="post" action="#">
    <input type="hidden" name="pageId" value="">
    <input type="hidden" id="movePage" name="movePage" value="1">
    <input type="hidden" id="boardId" name="boardId" value="">
    <input type="hidden" id="searchCtgry" name="searchCtgry" value="">
    <input type="hidden" id="searchTy" name="searchTy" value="">
    <input type="hidden" id="searchQuery" name="searchQuery" value="">
  </form>

  <div class="siiruBoard-view">
    <form id="boardForm" name="boardForm" method="post">
      <input type="hidden" id="seq" name="seq" value="42">

      <!-- 제목 -->
      <h4>
        <span class="notice">Notice</span>
        제108회 정기노회 소집 공고 및 안건 접수 안내
      </h4>

      <!-- 메타 정보 -->
      <div class="siiruBoardInfo">
        <div class="boardInfo-view">
          <span>작성자 : 사무처</span>
          <span>등록일 : 2026.04.15</span>
          <span>조회 1,842</span>
        </div>
        <!-- 첨부파일 -->
        <dl>
          <dt>첨부파일</dt>
          <dd>
            <ul>
              <li>
                <a href="#">제108회_정기노회_소집공고(최종).pdf</a>
                <small>[size: 482 KB, Download: 12]</small>
                <a href="#" class="filePreview siiru-btn siiru-btn-small" target="_blank">미리보기</a>
              </li>
              <li>
                <a href="#">정기노회_안건제출서(표준서식).hwp</a>
                <small>[size: 128 KB, Download: 7]</small>
              </li>
            </ul>
            <a href="#" class="siiru-btn siiru-btn-small">전체 다운로드</a>
          </dd>
        </dl>
      </div>

      <!-- 본문 -->
      <div class="siiruBoardBody">
        <div class="boardContents siiru-clr">
          <p>대한예수교장로회 호남노회 회원 교회 및 소속 목사님께,<br>
          교단 헌법 및 본 노회 규칙 제14조에 의거하여 제108회 정기노회를 아래와 같이 소집하오니
          각 교회 대표 및 총대께서는 반드시 참석하여 주시기 바랍니다.</p>
          <h4>소집 개요</h4>
          <ul>
            <li>일시: 2026년 4월 28일(화) 오전 10시</li>
            <li>장소: 광주제일교회 본당</li>
            <li>대상: 각 교회 담임목사 및 총대 장로</li>
          </ul>
          <p style="margin-top:24px;color:var(--hn-text-3);font-size:13px;">
            ※ 문의: 사무처 062-234-5678 내선 201
          </p>
        </div>
      </div>
    </form>

    <!-- 하단 버튼 -->
    <div class="siiruBoardBtnInfo">
      <div class="siiru-fl">
        <!-- 관리자 버튼 (조건부 표출) -->
      </div>
      <div class="siiru-fr">
        <a href="write.html?seq=42" class="siiru-btn siiru-btn-warning siiru-ml5">수정</a>
        <button class="delBtn siiru-btn siiru-btn-danger siiru-ml5" data-action="D" type="button">삭제</button>
        <a href="list.html" class="siiru-btn siiru-ml5">목록</a>
      </div>
    </div>

    <!-- 이전/다음글 -->
    <div class="siiruBoardList">
      <ul>
        <li>
          <span>다음글</span>
          <a href="view.html">사무처 시스템 점검에 따른 일시 서비스 중단 안내</a>
          <small>2026.04.12</small>
        </li>
        <li>
          <span>이전글</span>
          <a href="view.html">2026년도 노회 행정문서 표준서식 개정안 시행</a>
          <small>2026.04.09</small>
        </li>
      </ul>
    </div>

  </div>
</div>
```

---

### 5.3 `src/board/basic/write.html`

```html
<div class="siiru-boardWrap">

  <!-- 검색 상태 유지용 hidden form -->
  <form id="boardSearchForm" name="boardSearchForm" method="post">
    <input type="hidden" name="pageId" value="">
    <input type="hidden" id="movePage" name="movePage" value="">
    <input type="hidden" id="boardId" name="boardId" value="">
    <input type="hidden" id="searchTy" name="searchTy" value="">
    <input type="hidden" id="searchQuery" name="searchQuery" value="">
  </form>

  <form id="boardForm" name="boardForm" method="post" enctype="multipart/form-data">
    <input type="hidden" id="action" name="action" value="insert">
    <input type="hidden" id="seq" name="seq" value="">
    <input type="hidden" id="levelSn" name="levelSn" value="0">

    <div class="siiruBoard-write">
      <!-- 분류 -->
      <dl>
        <dt><span>*</span> <label for="ctgrySn">분류</label></dt>
        <dd>
          <select id="ctgrySn" name="ctgrySn">
            <option value="">선택</option>
            <option value="NOTICE">노회공지</option>
            <option value="URGENT">긴급공지</option>
            <option value="RECRUIT">채용공모</option>
            <option value="TENDER">입찰공고</option>
            <option value="GENERAL">교단공지</option>
          </select>
        </dd>
      </dl>
      <!-- 제목 -->
      <dl>
        <dt><span>*</span> <label for="boardSj">제목</label></dt>
        <dd><input type="text" id="boardSj" name="boardSj" maxlength="200" value=""></dd>
      </dl>
      <!-- 작성자 -->
      <dl>
        <dt><span>*</span> <label for="userNm">작성자</label></dt>
        <dd><input type="text" class="small2" id="userNm" name="userNm" maxlength="50" value=""></dd>
      </dl>
      <!-- 공지사항 설정 (관리자) -->
      <dl>
        <dt><label for="noticeAt">공지사항</label></dt>
        <dd>
          <input type="checkbox" id="noticeAt" name="noticeAt" value="Y">
          <label for="noticeAt"> 공지로 등록 </label>
        </dd>
      </dl>
      <!-- 첨부파일 -->
      <dl>
        <dt class="siiru-pt10">첨부파일 <span class="btnLayer"><button class="fileAdd siiru-btn siiru-btn-small" type="button">추가</button></span></dt>
        <dd class="fileChk">
          <div class="fileLayer">
            <div class="fileInfo" style="display:none;">
              <input type="hidden" name="fileSn[]" value="0">
              <input type="hidden" name="rlFileOldNm[]" value="">
              <input type="hidden" name="fileOldNm[]" value="">
              <input type="hidden" name="insrtAt[]" value="N">
              <input type="hidden" name="fileDelAt[]" value="N">
            </div>
            <input type="file" name="fileNm0" class="file" title="파일 선택">
            <input type="checkbox" id="insrtFile0" name="insrtChk[]" data-input="insrt" class="fileCheckbox" value="Y">
            <label for="insrtFile0"> 본문에삽입</label>
            <textarea name="fileAlt[]" rows="3" class="siiru-mt10" title="파일 설명"></textarea>
            <small>최대 20MB · PDF, HWP, Word, Excel, 이미지 등</small>
          </div>
          <div id="fileForm"></div>
        </dd>
      </dl>
      <!-- 본문 -->
      <dl>
        <dt class="siiru-hidden">내용</dt>
        <dd class="fullCont">
          <textarea id="boardCn" name="boardCn" rows="20" style="width:100%;height:400px;" title="내용"></textarea>
        </dd>
      </dl>
    </div>

    <!-- 버튼 -->
    <div class="siiru-tc siiru-mb20">
      <input type="submit" class="siiru-btn siiru-btn-primary" value="저장">
      <a href="list.html" class="siiru-btn siiru-ml10">목록</a>
    </div>
  </form>

</div>
```

---

### 5.4 `src/board/multimedia/list.html`

```html
<div class="siiru-boardWrap">

  <!-- 검색 폼 (basic/list와 동일 구조) -->
  <div class="siiruBoard-search">
    <form id="boardSearchForm" name="boardSearchForm" method="post" action="#">
      <input type="hidden" name="pageId" value="">
      <input type="hidden" id="movePage" name="movePage" value="1">
      <input type="hidden" id="boardId" name="boardId" value="">
      <div class="dateSearch">
        <input type="radio" id="dateSet0" name="searchDateSet" value="0">
        <label for="dateSet0"> 오늘 </label>
        <input type="radio" id="dateSet1" name="searchDateSet" value="6">
        <label for="dateSet1"> 일주일 </label>
        <input type="radio" id="dateSet2" name="searchDateSet" value="30">
        <label for="dateSet2"> 1개월 </label>
        <input type="radio" id="dateSet3" name="searchDateSet" value="90">
        <label for="dateSet3"> 3개월 </label>
        <input type="radio" id="dateSet4" name="searchDateSet" value="180">
        <label for="dateSet4"> 6개월 </label>
        <input type="radio" id="dateSet5" name="searchDateSet" value="365">
        <label for="dateSet5"> 1년 </label>
        <input type="text" class="maskDate" id="searchSDe" name="searchSDe" maxlength="10" placeholder="검색 시작일">
        ~
        <input type="text" class="maskDate" id="searchEDe" name="searchEDe" maxlength="10" placeholder="검색 종료일">
      </div>
      <select id="searchCtgry" name="searchCtgry" title="분류 선택">
        <option value="">전체 분류</option>
        <option value="EVENT">행사</option>
        <option value="WORSHIP">예배</option>
        <option value="SERVICE">봉사</option>
        <option value="EDUCATION">교육</option>
      </select>
      <select id="searchTy" name="searchTy" title="검색 조건">
        <option value="T">제목</option>
        <option value="TC">제목+내용</option>
        <option value="N">작성자</option>
      </select>
      <input type="text" id="searchQuery" name="searchQuery" placeholder="검색어를 입력하세요" title="검색어">
      <button type="submit">검색</button>
    </form>
  </div>

  <!-- 목록 정보 -->
  <div class="siiruBoard-listInfo">
    <p>전체 : 42 / 페이지 : 5 [today : 1]</p>
  </div>

  <!-- 갤러리 그리드 -->
  <div class="siiruBoard-gallery">

    <div class="siiruBoard-galleryBox">
      <div class="photoBox">
        <a href="view.html">
          <img src="/assets/images/board/album_01.png" alt="제34회 호남노회 청년연합회 정기 수련회">
        </a>
      </div>
      <dl>
        <dt class="new">
          <a href="view.html" data-view="G" data-seq="42">제34회 호남노회 청년연합회 정기 수련회</a>
        </dt>
        <dd class="siiru-tr">청년부 <span>2026.04.09</span></dd>
      </dl>
    </div>

    <div class="siiruBoard-galleryBox">
      <div class="photoBox">
        <a href="view.html">
          <img src="/assets/images/board/album_02.png" alt="제107회 정기노회 개회예배">
        </a>
      </div>
      <dl>
        <dt>
          <a href="view.html" data-view="G" data-seq="41">제107회 정기노회 개회예배</a>
        </dt>
        <dd class="siiru-tr">사무처 <span>2026.03.18</span></dd>
      </dl>
    </div>

    <div class="siiruBoard-galleryBox">
      <div class="photoBox">
        <a href="view.html">
          <img src="/assets/images/board/album_03.png" alt="광주 동구 독거어르신 반찬나눔 봉사">
        </a>
      </div>
      <dl>
        <dt>
          <a href="view.html" data-view="G" data-seq="40">광주 동구 독거어르신 반찬나눔 봉사</a>
        </dt>
        <dd class="siiru-tr">사회봉사부 <span>2026.03.14</span></dd>
      </dl>
    </div>

    <div class="siiruBoard-galleryBox">
      <div class="photoBox">
        <a href="view.html">
          <img src="/assets/images/board/album_04.png" alt="목회자·사모 영성 수련회">
        </a>
      </div>
      <dl>
        <dt>
          <a href="view.html" data-view="G" data-seq="39">목회자·사모 영성 수련회</a>
        </dt>
        <dd class="siiru-tr">교육부 <span>2026.03.05</span></dd>
      </dl>
    </div>

    <div class="siiruBoard-galleryBox">
      <div class="photoBox">
        <a href="view.html">
          <img src="/assets/images/board/album_05.png" alt="여전도회 연합회 정기총회">
        </a>
      </div>
      <dl>
        <dt>
          <a href="view.html" data-view="G" data-seq="38">여전도회 연합회 정기총회</a>
        </dt>
        <dd class="siiru-tr">여전도회 <span>2026.02.26</span></dd>
      </dl>
    </div>

    <div class="siiruBoard-galleryBox">
      <div class="photoBox">
        <a href="view.html">
          <img src="/assets/images/board/album_01.png" alt="신년감사예배 및 임직식">
        </a>
      </div>
      <dl>
        <dt>
          <a href="view.html" data-view="G" data-seq="37">신년감사예배 및 임직식</a>
        </dt>
        <dd class="siiru-tr">사무처 <span>2026.01.08</span></dd>
      </dl>
    </div>

    <div class="siiruBoard-galleryBox">
      <div class="photoBox">
        <a href="view.html">
          <img src="/assets/images/board/album_02.png" alt="성탄 연합 자선 바자회">
        </a>
      </div>
      <dl>
        <dt>
          <a href="view.html" data-view="G" data-seq="36">성탄 연합 자선 바자회</a>
        </dt>
        <dd class="siiru-tr">사회봉사부 <span>2025.12.21</span></dd>
      </dl>
    </div>

    <div class="siiruBoard-galleryBox">
      <div class="photoBox">
        <a href="view.html">
          <img src="/assets/images/board/album_03.png" alt="창립 70주년 기념 감사예배">
        </a>
      </div>
      <dl>
        <dt>
          <a href="view.html" data-view="G" data-seq="35">창립 70주년 기념 감사예배</a>
        </dt>
        <dd class="siiru-tr">사무처 <span>2025.11.15</span></dd>
      </dl>
    </div>

  </div>

  <!-- 페이징 -->
  <div id="boardPage">
    <div class="pagination"></div>
  </div>

  <!-- 등록 버튼 -->
  <div class="siiru-tr siiru-mb20">
    <a href="write.html" class="siiru-btn siiru-btn-primary">등록</a>
  </div>

</div>
```

---

### 5.5 `src/board/multimedia/view.html`

basic/view.html과 구조가 동일하다. 다음 차이점만 적용:
- `<h4>` 에서 `<span class="notice">` 제거 (앨범은 공지사항 없음)
- `siiruBoardBody` 안에 **이미지 그리드** 추가

```html
<div class="siiru-boardWrap">

  <form id="boardSearchForm" name="boardSearchForm" method="post" action="#">
    <input type="hidden" name="pageId" value="">
    <input type="hidden" id="movePage" name="movePage" value="">
    <input type="hidden" id="boardId" name="boardId" value="">
    <input type="hidden" id="searchTy" name="searchTy" value="">
    <input type="hidden" id="searchQuery" name="searchQuery" value="">
  </form>

  <div class="siiruBoard-view">
    <form id="boardForm" name="boardForm" method="post">
      <input type="hidden" id="seq" name="seq" value="42">

      <h4>제34회 호남노회 청년연합회 정기 수련회</h4>

      <div class="siiruBoardInfo">
        <div class="boardInfo-view">
          <span>작성자 : 청년부</span>
          <span>등록일 : 2026.04.09</span>
          <span>조회 842</span>
        </div>
        <!-- 첨부파일 (사진 원본 다운로드 등) -->
        <dl>
          <dt>첨부파일</dt>
          <dd>
            <ul>
              <li>
                <a href="#">수련회_사진모음.zip</a>
                <small>[size: 48 MB, Download: 3]</small>
              </li>
            </ul>
          </dd>
        </dl>
      </div>

      <div class="siiruBoardBody">
        <!-- 설명글 -->
        <div class="boardContents siiru-clr">
          <p>제34회 호남노회 청년연합회 정기 수련회가 전남 구례 지리산 수양관에서 진행되었습니다.
          이번 수련회는 '함께 세워가는 교회'를 주제로 3박 4일간 다양한 프로그램과 예배로 구성되었습니다.</p>
        </div>
        <!-- 이미지 뷰 -->
        <div class="imageView">
          <img src="/assets/images/board/album_01.png" alt="수련회 사진 1">
          <img src="/assets/images/board/album_02.png" alt="수련회 사진 2">
          <img src="/assets/images/board/album_03.png" alt="수련회 사진 3">
          <img src="/assets/images/board/album_04.png" alt="수련회 사진 4">
          <img src="/assets/images/board/album_05.png" alt="수련회 사진 5">
        </div>
      </div>
    </form>

    <div class="siiruBoardBtnInfo">
      <div class="siiru-fl"></div>
      <div class="siiru-fr">
        <a href="write.html?seq=42" class="siiru-btn siiru-btn-warning siiru-ml5">수정</a>
        <button class="delBtn siiru-btn siiru-btn-danger siiru-ml5" data-action="D" type="button">삭제</button>
        <a href="list.html" class="siiru-btn siiru-ml5">목록</a>
      </div>
    </div>

    <div class="siiruBoardList">
      <ul>
        <li>
          <span>다음글</span>
          <a href="view.html">제107회 정기노회 개회예배</a>
          <small>2026.03.18</small>
        </li>
        <li>
          <span>이전글</span>
          <a href="view.html">광주 동구 독거어르신 반찬나눔 봉사</a>
          <small>2026.03.14</small>
        </li>
      </ul>
    </div>
  </div>
</div>
```

---

### 5.6 `src/board/multimedia/write.html`

basic/write.html과 동일 구조. **차이점**: 첨부파일 `dd` 안에 `썸네일로사용` 체크박스 추가.

```html
<!-- basic/write.html과 동일, 아래 부분만 fileLayer 내에 추가 -->

<!-- 기존 insrtFile 체크박스 다음에 추가: -->
<input type="checkbox" id="thumbFile0" name="thumbChk[]" data-input="thumb" class="fileCheckbox" value="Y">
<label for="thumbFile0"> 썸네일로사용</label>
```

전체 파일은 `basic/write.html`을 복사 후 위 체크박스 추가, 파일 추가(`fileAdd`) 버튼 JS 블록에도 `thumbFile` 항목 추가.

---

## 6. 회원 스킨 페이지 명세

> 모든 skin 페이지는 아래 전체 페이지 구조를 유지하며, `<section class="content">` 내부에 JSP skin 구조를 삽입한다.

### 공통 페이지 래퍼 (변경 없이 유지)

```html
<div data-include="../include/header.html"></div>

<main id="main-content">
  <div class="hn-page-head">
    <div class="inner">
      <div class="breadcrumb-hn">
        <span class="home"><i class="fa-regular fa-house"></i> HOME</span>
        <i class="fa-regular fa-chevron-right"></i>
        <span>부가서비스</span>
        <i class="fa-regular fa-chevron-right"></i>
        <span class="cur">[페이지명]</span>
      </div>
      <h1>[페이지명]</h1>
      <p class="desc">[설명]</p>
    </div>
  </div>

  <div class="sub-layout">
    <div data-include="../include/sidebar_extra.html"></div>
    <section class="content">
      <!-- ↓↓↓ 아래에 skin JSP 구조 삽입 ↓↓↓ -->
    </section>
  </div>
</main>

<div data-include="../include/footer.html"></div>
```

---

### 6.1 `src/sub/login.html` — section.content 내부

```html
<h2 class="ptitle"><span>로그인</span></h2>

<div class="siiru-loginWrap">
  <div class="loginWrap">
    <!-- 로그인 처리용 hidden form -->
    <form id="login" name="login" method="post">
      <input type="hidden" name="pageSe" value="L">
      <input type="hidden" name="siteId" value="">
      <input type="hidden" name="pageId" value="">
      <input type="hidden" name="boardId" value="">
      <input type="hidden" name="actionPage" value="">
      <input type="hidden" name="redirect" value="">
      <input type="hidden" name="userId" value="">
      <input type="hidden" name="passwd" value="">
    </form>

    <h4>로그인</h4>

    <!-- 탭 -->
    <div class="loginUser-tab">
      <ul>
        <li data-tp="M"><a href="#" data-pagetp="M">회원 로그인</a></li>
        <li data-tp="N"><a href="#" data-pagetp="N">비회원 로그인</a></li>
      </ul>
    </div>

    <!-- 회원 로그인 섹션 -->
    <section id="M">
      <div class="loginLayer">
        <div class="inputWrap inputSingle">
          <form name="siiru-loginForm" id="siiru-loginForm" method="post">
            <dl>
              <dt><label for="userId">아이디</label></dt>
              <dd>
                <input type="text" id="userId" name="userId" class="alphanumId" value="" placeholder="아이디">
                <input type="checkbox" id="idSave" name="idSave" value="Y">
                <label for="idSave">아이디 저장</label>
              </dd>
            </dl>
            <dl>
              <dt><label for="passwd">비밀번호</label></dt>
              <dd>
                <input type="password" id="passwd" name="passwd" value="" placeholder="비밀번호" autocomplete="off">
              </dd>
            </dl>
            <div class="siiru-btnSet siiru-tc">
              <button type="submit" id="loginSubmit" class="siiru-btn siiru-btn-primary" style="min-width:120px;">로그인</button>
            </div>
          </form>
          <ul class="joinLayer">
            <li><a href="join.html" class="siiru-btn">회원가입</a></li>
            <li><a href="finduser.html" class="siiru-btn">아이디/비밀번호 찾기</a></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 비회원 로그인 섹션 -->
    <section id="N" style="display:none;">
      <div class="loginLayer">
        <p style="padding:20px 0; font-size:14px; color:var(--hn-text-3);">비회원은 게시판 비밀번호 인증을 통해 이용하실 수 있습니다.</p>
      </div>
    </section>

  </div>
</div>
```

---

### 6.2 `src/sub/join.html` — section.content 내부

```html
<h2 class="ptitle"><span>회원가입</span></h2>

<div class="siiru-joinWrap">
  <!-- 단계 탭 -->
  <div class="stepTab">
    <ul>
      <li data-step="S1"><a href="#">STEP1&nbsp;&nbsp;<strong>회원 구분</strong></a></li>
      <li data-step="S2" class="active"><a href="#">STEP2&nbsp;&nbsp;<strong>약관 동의</strong></a></li>
      <li data-step="S3"><a href="#">STEP3&nbsp;&nbsp;<strong>본인 인증</strong></a></li>
      <li data-step="S4"><a href="#">STEP4&nbsp;&nbsp;<strong>정보 입력</strong></a></li>
      <li data-step="S5"><a href="#">STEP5&nbsp;&nbsp;<strong>가입 완료</strong></a></li>
    </ul>
  </div>

  <section>
    <form id="siiru-joinForm" name="siiru-joinForm" method="post" enctype="multipart/form-data" action="#">
      <input type="hidden" id="stepLevel" name="stepLevel" value="S2">
      <input type="hidden" id="userKind" name="userKind" value="A">

      <!-- STEP1 회원구분 (디자인 확인용) -->
      <p class="well">홈페이지 회원으로 가입하시면 유익한 정보 습득과 다양한 회원서비스를 편리하게 이용하실 수 있습니다.</p>
      <h5 class="stepTitle">STEP1 회원 구분 <small>해당하는 회원가입 방식을 선택해 주세요.</small></h5>
      <div class="kindBoxWrap">
        <div class="kindBox">
          <div class="stepCate">
            <p>일반회원가입</p>
            <small>(14세 이상 내국인)</small>
            <button type="button" class="siiru-btn" data-userkind="A">가입하기</button>
          </div>
        </div>
        <div class="kindBox">
          <div class="stepCate">
            <p>외국인회원가입</p>
            <small>(국내거주 외국인)</small>
            <button type="button" class="siiru-btn" data-userkind="F">가입하기</button>
          </div>
        </div>
        <div class="kindBox siiru-mr0">
          <div class="stepCate">
            <p>기업회원가입</p>
            <small>(본인인증 제외)</small>
            <button type="button" class="siiru-btn" data-userkind="E">가입하기</button>
          </div>
        </div>
      </div>

      <!-- STEP2 약관 동의 (현재 활성) -->
      <h5 class="stepTitle">STEP2 약관 동의</h5>
      <div class="agreeBoxWrap">
        <p class="stepSubTitle">회원가입약관에 동의 확인</p>
        <div class="agreeBox">
          본 약관은 호남노회(이하 "노회")가 운영하는 홈페이지(이하 "서비스")를 이용함에 있어 노회와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다. 서비스를 이용하시기 전에 본 약관을 주의 깊게 읽어주시기 바랍니다.
        </div>
        <p class="agreeCheck">
          <input type="checkbox" id="agree1" name="agree1" value="Y">
          <label for="agree1"> 회원약관에 동의합니다.</label>
        </p>
        <p class="stepSubTitle">개인정보보호방침에 동의 확인</p>
        <div class="agreeBox">
          노회는 「개인정보 보호법」에 따라 이용자의 개인정보를 안전하게 관리하기 위한 개인정보처리방침을 수립·공개합니다.
        </div>
        <p class="agreeCheck">
          <input type="checkbox" id="agree2" name="agree2" value="Y">
          <label for="agree2"> 개인정보보호방침에 동의합니다.</label>
        </p>
      </div>
      <div class="siiru-btnSet siiru-tc">
        <button type="button" id="joinSubmit" class="siiru-btn siiru-btn-primary">다음 단계</button>
        <button type="button" id="cancelBtn" class="siiru-btn siiru-ml10">취소</button>
      </div>

    </form>
  </section>
</div>
```

---

### 6.3 `src/sub/finduser.html` — section.content 내부

```html
<h2 class="ptitle"><span>아이디/비밀번호 찾기</span></h2>

<div class="siiru-findUserWrap">
  <div class="findUserWrap">
    <h4>아이디/비밀번호 찾기</h4>

    <div class="findUser-tab">
      <ul>
        <li data-tp="I" class="active"><a href="#" data-pagetp="I">아이디 찾기</a></li>
        <li data-tp="P"><a href="#" data-pagetp="P">비밀번호 찾기</a></li>
        <li data-tp="R"><a href="#" data-pagetp="R">로그인 잠금 초기화</a></li>
      </ul>
    </div>

    <!-- 아이디 찾기 -->
    <section id="I">
      <div class="retIdMsg"></div>
      <div class="findLayer">
        <div class="inputWrap">
          <h5>가입정보로 찾기</h5>
          <form name="siiru-findIdForm" id="siiru-findIdForm" method="post">
            <input type="hidden" name="action" value="I">
            <dl>
              <dt><label for="userNm_I">이름</label></dt>
              <dd><input type="text" class="small" id="userNm_I" name="userNm" value="" placeholder="이름 입력"></dd>
            </dl>
            <dl>
              <dt><label for="brthdy_I">생년월일</label></dt>
              <dd><input type="text" id="brthdy_I" name="brthdy" class="maskDate small" maxlength="10" value="" placeholder="YYYY-MM-DD"></dd>
            </dl>
            <dl>
              <dt><label for="mbtlnum_I">모바일번호</label></dt>
              <dd><input type="text" class="small" id="mbtlnum_I" name="mbtlnum" value="" placeholder="010-0000-0000"></dd>
            </dl>
          </form>
          <div class="siiru-btnSet siiru-tc">
            <button type="button" id="findIdBtn" class="siiru-btn siiru-btn-primary">아이디 찾기</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 비밀번호 찾기 -->
    <section id="P" style="display:none;">
      <div class="findLayer">
        <div class="inputWrap">
          <h5>가입정보로 찾기</h5>
          <form name="siiru-findPwForm" id="siiru-findPwForm" method="post">
            <input type="hidden" name="action" value="P">
            <dl>
              <dt><label for="userId_P">아이디</label></dt>
              <dd><input type="text" class="small" id="userId_P" name="userId" value="" placeholder="아이디 입력"></dd>
            </dl>
            <dl>
              <dt><label for="userNm_P">이름</label></dt>
              <dd><input type="text" class="small" id="userNm_P" name="userNm" value="" placeholder="이름 입력"></dd>
            </dl>
            <dl>
              <dt><label for="mbtlnum_P">모바일번호</label></dt>
              <dd><input type="text" class="small" id="mbtlnum_P" name="mbtlnum" value="" placeholder="010-0000-0000"></dd>
            </dl>
          </form>
          <div class="siiru-btnSet siiru-tc">
            <button type="button" id="findPwBtn" class="siiru-btn siiru-btn-primary">임시 비밀번호 발송</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 로그인 잠금 초기화 -->
    <section id="R" style="display:none;">
      <div class="findLayer">
        <div class="inputWrap">
          <h5>잠금 해제</h5>
          <p style="font-size:14px;color:var(--hn-text-3);margin:10px 0 16px;">로그인 5회 이상 실패 시 계정이 잠깁니다. 가입정보로 잠금을 해제하세요.</p>
          <form name="siiru-findLkForm" id="siiru-findLkForm" method="post">
            <input type="hidden" name="action" value="R">
            <dl>
              <dt><label for="userId_R">아이디</label></dt>
              <dd><input type="text" class="small" id="userId_R" name="userId" value="" placeholder="아이디 입력"></dd>
            </dl>
            <dl>
              <dt><label for="mbtlnum_R">모바일번호</label></dt>
              <dd><input type="text" class="small" id="mbtlnum_R" name="mbtlnum" value="" placeholder="010-0000-0000"></dd>
            </dl>
          </form>
          <div class="siiru-btnSet siiru-tc">
            <button type="button" class="siiru-btn siiru-btn-primary">잠금 해제</button>
          </div>
        </div>
      </div>
    </section>

  </div>
</div>
```

---

### 6.4 `src/sub/leave.html` — section.content 내부

```html
<h2 class="ptitle"><span>회원 탈퇴</span></h2>

<div class="siiru-userWrap">
  <section class="leaveForm">
    <h4>회원 탈퇴</h4>
    <div class="findLayer">
      <div class="inputWrap">
        <h5>비밀번호를 통한 탈퇴</h5>
        <p style="font-size:14px;color:var(--hn-text-3);margin-bottom:16px;">
          탈퇴 시 모든 회원 정보와 작성 데이터가 삭제되며 복구할 수 없습니다.<br>
          아래에 비밀번호를 입력하고 탈퇴 버튼을 클릭하세요.
        </p>
        <form name="siiru-leaveForm" id="siiru-leaveForm" method="post">
          <input type="hidden" name="action" value="L">
          <div class="pwCert">
            <input type="password" id="passwd" name="passwd" value="" title="비밀번호" autocomplete="off" placeholder="현재 비밀번호">
          </div>
        </form>
        <div class="siiru-btnSet siiru-tc">
          <button type="button" id="acceptBtn" class="siiru-btn siiru-btn-danger">회원 탈퇴</button>
          <a href="myInfo.html" class="siiru-btn siiru-ml10">취소</a>
        </div>
      </div>
    </div>
  </section>
</div>
```

---

### 6.5 `src/sub/myInfo.html` — **신규 생성**

페이지 래퍼: breadcrumb `부가서비스 > 회원 정보`, h1 `회원 정보`

section.content 내부:

```html
<h2 class="ptitle"><span>회원 정보</span></h2>

<div class="siiru-userWrap">
  <div class="userWrap">
    <h4>회원 정보</h4>

    <div class="user-tab">
      <ul>
        <li data-tp="M" class="active"><a href="#" data-pagetp="M">회원 정보</a></li>
        <li data-tp="U"><a href="#" data-pagetp="U">회원 인증 확인</a></li>
      </ul>
    </div>

    <!-- 회원 정보 섹션 -->
    <section id="M">
      <form id="siiru-userForm" name="siiru-userForm" method="post" enctype="multipart/form-data">
        <div class="siiruBoard-write">
          <dl>
            <dt>아이디</dt>
            <dd>honampck_user</dd>
          </dl>
          <dl>
            <dt>이름</dt>
            <dd>홍길동 (남)</dd>
          </dl>
          <dl>
            <dt><label for="ncnm">닉네임</label></dt>
            <dd><input type="text" class="small2" id="ncnm" name="ncnm" maxlength="50" value="호남성도"></dd>
          </dl>
          <dl>
            <dt><span>*</span> <label for="email">이메일</label></dt>
            <dd><input type="text" id="email" name="email" maxlength="50" value="example@church.or.kr"></dd>
          </dl>
          <dl>
            <dt><label for="telno">전화번호</label></dt>
            <dd><input type="text" id="telno" name="telno" class="small" maxlength="30" value="062-234-5678"></dd>
          </dl>
          <dl>
            <dt><span>*</span> <label for="mbtlnum">모바일번호</label></dt>
            <dd><input type="text" id="mbtlnum" name="mbtlnum" class="small" maxlength="14" value="010-1234-5678"></dd>
          </dl>
          <dl>
            <dt><label for="zip">주소</label></dt>
            <dd>
              <input type="text" id="zip" name="zip" placeholder="우편번호" class="small" maxlength="7" value="61000">
              <button class="zipFind siiru-btn siiru-btn-small siiru-ml10" type="button">우편번호 찾기</button>
              <input type="text" id="addr" name="addr" placeholder="주소" class="siiru-mt5" maxlength="50" value="광주광역시 동구 금남로 123">
              <input type="text" id="detailAddr" name="detailAddr" placeholder="상세주소" class="siiru-mt5" maxlength="50" value="(충장동)">
            </dd>
          </dl>
        </div>

        <div class="siiru-btnSet siiru-tc" style="margin-top:16px;">
          <button type="button" id="userSubmit" class="siiru-btn siiru-btn-primary">정보 수정</button>
          <a href="passChange.html" class="siiru-btn siiru-ml10">비밀번호 변경</a>
          <a href="leave.html" class="siiru-btn siiru-btn-danger siiru-ml10">회원 탈퇴</a>
        </div>
      </form>
    </section>

    <!-- 회원 인증 확인 섹션 -->
    <section id="U" style="display:none;">
      <div style="padding:30px 0; text-align:center; color:var(--hn-text-3); font-size:14px;">
        <p>본인인증 정보 확인 기능입니다.</p>
      </div>
    </section>

  </div>
</div>
```

---

### 6.6 `src/sub/passChange.html` — **신규 생성**

페이지 래퍼: breadcrumb `부가서비스 > 비밀번호 변경`, h1 `비밀번호 변경`

section.content 내부:

```html
<h2 class="ptitle"><span>비밀번호 변경</span></h2>

<div class="siiru-passwdWrap">
  <div class="passwdWrap">
    <h4>비밀번호 변경</h4>
    <ul>
      <li>1. 이름, 생년월일 등 쉽게 유추 가능한 정보로 비밀번호를 사용하지 마십시오.</li>
      <li>2. 현재 사용 중인 비밀번호가 아닌 다른 비밀번호로 변경하시기 바랍니다.</li>
      <li>3. 1234, qwer 같은 단순 문자열이나 연속 문자열은 위험합니다.</li>
      <li>4. 비밀번호는 3개월에 한 번씩 변경하는 것이 권장됩니다.</li>
      <li>5. 비밀번호는 절대 타인에게 알려주지 마십시오.</li>
      <li>6. 영문·숫자·특수문자(!@#$%^?*+=_~-)를 혼합하여 8~20자 이내로 설정하세요.</li>
      <li>7. 공백(Space)은 입력할 수 없습니다.</li>
    </ul>
    <form name="siiru-passwdForm" id="siiru-passwdForm" method="post">
      <input type="hidden" name="siteId" value="">
      <input type="hidden" name="pageId" value="">
      <div class="siiruBoard-write" style="margin-top:20px;">
        <dl>
          <dt><label for="passwd">현재 비밀번호</label></dt>
          <dd><input type="password" id="passwd" name="passwd" class="small2 alphanumPass" maxlength="20" autocomplete="off" value=""></dd>
        </dl>
        <dl>
          <dt><label for="newPasswd">새 비밀번호</label></dt>
          <dd><input type="password" id="newPasswd" name="newPasswd" class="small2 alphanumPass" maxlength="20" autocomplete="off" value=""></dd>
        </dl>
        <dl>
          <dt><label for="newPasswdConfirm">새 비밀번호 확인</label></dt>
          <dd><input type="password" id="newPasswdConfirm" name="newPasswdConfirm" class="small2 alphanumPass" maxlength="20" autocomplete="off" value=""></dd>
        </dl>
      </div>
    </form>
    <div class="siiru-btnSet siiru-tc" style="margin-top:16px;">
      <button type="button" id="passwdSubmit" class="siiru-btn siiru-btn-primary">비밀번호 변경</button>
      <a href="myInfo.html" class="siiru-btn siiru-ml10">취소</a>
    </div>
  </div>
</div>
```

---

## 7. 사이드바 링크 추가 (sidebar_extra.html)

`src/include/sidebar_extra.html` 에 `myInfo`, `passChange` 메뉴 항목이 없다면 추가:

```html
<li><a href="/sub/myInfo.html">회원 정보</a></li>
<li><a href="/sub/passChange.html">비밀번호 변경</a></li>
```

`headerSub.html` 의 부가서비스 드롭다운에도 같은 항목 추가 필요.

---

## 8. 빌드 확인

모든 변경 완료 후:

```bash
npm run build
```

`dist/` 에서 아래 파일들 HTML 렌더링 확인:
- `dist/boardpage/notice/list.html` — basic 스킨이 정상 인라인됨
- `dist/boardpage/album/list.html` — multimedia 스킨이 정상 인라인됨
- `dist/sub/login.html`, `myInfo.html`, `passChange.html`

---

## 9. 구현 체크리스트

### board/basic
- [ ] `list.html` — siiru-boardWrap, siiruBoard-search, siiruBoard-list 구조로 재작성
- [ ] `view.html` — siiruBoard-view, siiruBoardInfo, siiruBoardBody, siiruBoardBtnInfo, siiruBoardList 구조로 재작성
- [ ] `write.html` — siiruBoard-write, dl/dt/dd 폼 구조로 재작성

### board/multimedia
- [ ] `list.html` — siiruBoard-gallery, siiruBoard-galleryBox 구조로 재작성
- [ ] `view.html` — basic view와 동일 + imageView 블록 추가
- [ ] `write.html` — basic write와 동일 + thumbFile 체크박스 추가

### sub (skin)
- [ ] `login.html` — siiru-loginWrap + loginWrap 구조로 section.content 교체
- [ ] `join.html` — siiru-joinWrap + stepTab 구조로 section.content 교체
- [ ] `finduser.html` — siiru-findUserWrap + findUser-tab 구조로 section.content 교체
- [ ] `leave.html` — siiru-userWrap + leaveForm 구조로 section.content 교체
- [ ] `myInfo.html` — **신규 생성**
- [ ] `passChange.html` — **신규 생성**

### CSS
- [ ] `sub.css` 하단에 Section 4 CSS 전체 추가

### 헤더/사이드바
- [ ] `sidebar_extra.html` — myInfo, passChange 링크 추가 확인
- [ ] `headerSub.html` — 부가서비스 드롭다운에 같은 메뉴 추가 확인

---

## 10. 다른 AI를 위한 구현 프롬프트

아래 프롬프트를 사용할 때는 이 문서(`BOARD_SKIN_IMPLEMENTATION.md`)를 함께 첨부하거나 내용을 붙여넣는다.

---

```
당신은 호남노회 웹사이트(web-publish-honampck) 작업을 맡은 개발자입니다.

## 작업 개요

이 프로젝트는 SiiRU CMS 기반 정적 HTML 퍼블리싱 작업물입니다.
`legacy/` 디렉토리에 CMS에 배포된 JSP 스킨 파일이 있고,
`src/` 에 그것의 정적 HTML 버전이 있습니다.

지금 해야 할 작업:
1. `src/board/basic/` 및 `src/board/multimedia/` 의 list/view/write HTML을
   `legacy/board/basic/` 및 `legacy/board/multimedia/` JSP의 HTML 구조(siiru-* 클래스)와 동일하게 재작성하세요.
   - JSTL/EL 변수는 정적 플레이스홀더 데이터(샘플 2~3건)로 대체합니다.
   - JavaScript 블록은 EL 표현식을 정적값으로 교체하여 유지합니다.
   - 이 파일들은 fragment입니다. html/head/body 태그 없음.

2. `src/sub/login.html`, `join.html`, `finduser.html`, `leave.html` 의
   `<section class="content">` 내부를 각 대응 JSP skin 구조로 교체하세요.
   (페이지 래퍼 header/sidebar/footer include는 유지)

3. `src/sub/myInfo.html` 과 `src/sub/passChange.html` 을 신규 생성하세요.
   (`legacy/skin/myInfo.jsp`, `passChange.jsp` 기반)

4. `src/assets/css/sub.css` 하단에 siiru-* 클래스들의 스타일을 추가하세요.
   반드시 `var(--hn-*)` 디자인 토큰을 사용합니다.

## 파일 구조 규칙 (AGENTS.md 참고)

- 서브 페이지: `data-include="../include/header.html"`, `data-include="../include/sidebar_extra.html"`, `data-include="../include/footer.html"` 패턴 사용
- CSS/JS 경로: `/assets/...` 루트 절대경로
- 사이드바 링크: 루트 절대경로 (`/sub/...`)

## 상세 명세

아래 첨부된 `BOARD_SKIN_IMPLEMENTATION.md` 문서의 **Section 4(CSS)**, **Section 5(board HTML)**, **Section 6(skin HTML)** 을 정확히 구현하세요.

각 파일을 완성한 후 `npm run build` 를 실행하여 빌드 오류가 없는지 확인하세요.
```

---

*문서 끝*
