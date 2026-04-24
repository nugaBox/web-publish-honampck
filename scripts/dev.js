/**
 * dev.js — 개발 서버 (호남노회)
 *
 * 1. 최초 Full Build 실행 (dist/ 생성)
 * 2. browser-sync로 dist/ 서빙
 * 3. src/ 변경 감지 → 자동 재빌드 → 브라우저 리로드
 *
 * 실행: npm run dev
 */

const { execSync, spawn } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const SRC     = path.join(ROOT, 'src');
const BUILD   = () => execSync('node scripts/build.js', { cwd: ROOT, stdio: 'inherit' });
const BS_PORT = 3000;

// ── 최초 빌드 ─────────────────────────────────────────────────
console.log('\n🔨  초기 빌드...\n');
try { BUILD(); } catch (e) { process.exit(1); }

// ── browser-sync 시작 ─────────────────────────────────────────
const bs = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  [
    'browser-sync', 'start',
    '--server', 'dist',
    '--port', String(BS_PORT),
    '--no-notify',
    '--no-open',
  ],
  { cwd: ROOT, stdio: 'inherit' }
);

bs.on('error', err => console.error('browser-sync 오류:', err));

// ── src/ 감시 + 재빌드 + reload ───────────────────────────────
let rebuildTimer = null;

fs.watch(SRC, { recursive: true }, (_event, filename) => {
  if (!filename) return;
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    console.log(`\n📁  변경 감지: ${filename} — 재빌드 중...`);
    try {
      BUILD();
      // browser-sync는 dist/ 변경을 감지하여 자동 리로드
      // (--watch 없이 파일 교체만으로 리로드가 필요하면 bs reload 호출)
      triggerBsReload();
    } catch (_) {}
  }, 150);
});

// browser-sync REST API로 리로드 트리거
function triggerBsReload() {
  const http = require('http');
  http.get(`http://localhost:${BS_PORT}/__browser_sync__?method=reload`, () => {}).on('error', () => {
    // API 미지원 버전이면 무시 — bs가 dist/ 파일 변경으로 자체 감지
  });
}

process.on('SIGINT', () => { bs.kill(); process.exit(0); });
process.on('SIGTERM', () => { bs.kill(); process.exit(0); });
