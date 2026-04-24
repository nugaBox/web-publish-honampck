/**
 * build.js — 빌드 스크립트 (호남노회)
 *
 * 모드는 환경변수 BUILD_MODE로 지정합니다.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 모드        │ 명령어             │ 출력폴더   │ 특징         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ full        │ npm run build      │ dist/      │ 모든 include │
 * │             │                    │            │ 인라인화.    │
 * │             │                    │            │ CMS 변수     │
 * │             │                    │            │ 치환 없음.   │
 * │             │                    │            │ 시놀로지 서버│
 * │             │                    │            │ 직접 배포용. │
 * ├─────────────────────────────────────────────────────────────┤
 * │ siiru       │ npm run build:siiru│ dist-siiru/│ 레이아웃     │
 * │             │                    │            │ (header/     │
 * │             │                    │            │  footer)     │
 * │             │                    │            │ 제외, 본문만.│
 * │             │                    │            │ CMS 변수     │
 * │             │                    │            │ 치환 적용.   │
 * └─────────────────────────────────────────────────────────────┘
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'src');

// ── 모드 설정 ─────────────────────────────────────────────────
const MODE = (process.env.BUILD_MODE || 'full').toLowerCase();

const MODES = {
  full: {
    label:       'Full Build',
    outDir:      path.join(ROOT, 'dist'),
    skipLayout:  false,
    applyCms:    false,
  },
  siiru: {
    label:       'SiiRU CMS Export',
    outDir:      path.join(ROOT, 'dist-siiru'),
    skipLayout:  true,
    applyCms:    true,
  },
};

if (!MODES[MODE]) {
  console.error(`❌  알 수 없는 BUILD_MODE: "${MODE}" (full | siiru)`);
  process.exit(1);
}

const { label, outDir: DIST, skipLayout, applyCms } = MODES[MODE];

// ── CMS 경로 변수 (siiru 모드에서만 사용) ────────────────────
const CMS = {
  root:    '${rootDirectory}',
  img:     '${imgDirectory}',
  imgHtml: '${path.images}',
  font:    '${fontDirectory}',
};

// ── 레이아웃 include 파일명 (skipLayout 대상) ─────────────────
const LAYOUT_FILES = new Set(['header.html', 'footer.html']);

// ── 유틸 ─────────────────────────────────────────────────────

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyRecursive(s, d) : fs.copyFileSync(s, d);
  }
}

function walkFiles(dir, predicate, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walkFiles(full, predicate, results); continue; }
    if (predicate(full)) results.push(full);
  }
  return results;
}

/** url() 안의 로컬 웹폰트 경로를 CMS 변수로 치환 */
function replaceWebfontPaths(css) {
  return css.replace(/url\((['"]?)\.\.\/fonts\//g, `url($1${CMS.font}`);
}

/** CSS 내 이미지 경로를 CMS 변수로 치환 */
function replaceImgPathsCss(css) {
  return css
    .replace(/assets\/images\//g, CMS.img)
    .replace(/url\((['"]?)\.\.\/images\//g, `url($1${CMS.img}`);
}

/** HTML 내 이미지 경로를 CMS 변수로 치환 */
function replaceImgPathsHtml(html) {
  return html.replace(/(?:(?:\.\.\/)+|\/)?assets\/images\//g, CMS.imgHtml);
}

/**
 * HTML 파일의 data-include 태그를 실제 파일 내용으로 인라인.
 * skipLayout=true 일 때 header.html / footer.html 은 빈 문자열로 대체
 * (레이아웃 제거 → 본문만 추출).
 */
function inlineIncludes(html, baseDir) {
  return html.replace(
    /<div[^>]*data-include=["']([^"']+)["'][^>]*><\/div>/g,
    (match, includePath) => {
      const full = includePath.startsWith('/')
        ? path.join(DIST, includePath.slice(1))
        : path.resolve(baseDir, includePath);

      // 레이아웃 파일 건너뜀 (siiru 모드)
      if (skipLayout && LAYOUT_FILES.has(path.basename(full))) return '';

      if (!fs.existsSync(full)) {
        console.warn(`  ⚠️  include 없음: ${includePath}`);
        return match;
      }

      const content = fs.readFileSync(full, 'utf-8').trim();
      return inlineIncludes(content, path.dirname(full));
    }
  );
}

// ── 빌드 실행 ─────────────────────────────────────────────────

console.log(`\n🏗️  [${label}] 빌드 시작...\n`);

// 1. 출력 디렉터리 초기화 + 소스 복사
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
copyRecursive(SRC, DIST);
console.log(`✅  src/ → ${path.relative(ROOT, DIST)}/ 복사 완료`);

// 2. HTML 처리
const htmlFiles = walkFiles(
  DIST,
  p => p.endsWith('.html') && !p.includes(`${path.sep}include${path.sep}`)
);

for (const filePath of htmlFiles) {
  const label = path.relative(DIST, filePath);
  let html = fs.readFileSync(filePath, 'utf-8');

  html = inlineIncludes(html, path.dirname(filePath));
  if (applyCms) html = replaceImgPathsHtml(html);

  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`✅  ${label}`);
}

// 3. CSS 처리 (siiru 모드에서만 경로 치환)
if (applyCms) {
  const cssFiles = walkFiles(
    path.join(DIST, 'assets', 'css'),
    p => p.endsWith('.css')
  );
  for (const filePath of cssFiles) {
    let css = fs.readFileSync(filePath, 'utf-8');
    const before = css;
    css = replaceWebfontPaths(css);
    css = replaceImgPathsCss(css);
    if (css !== before) {
      fs.writeFileSync(filePath, css, 'utf-8');
      console.log(`✅  ${path.relative(DIST, filePath)} — CSS 경로 치환`);
    }
  }
}

console.log(`\n✨  빌드 완료 → ${path.relative(ROOT, DIST)}/\n`);
