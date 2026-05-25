#!/usr/bin/env node
/**
 * sub.css → sub.css + board.css 분리
 * - sub: 레이아웃·사이드바·서브 컴포넌트·반응형(게시판 제외 구간)
 * - board: 퍼블 게시판(b-*, btable) + 일정 달력 + SiiRU CMS(siiru-*)
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE = process.argv[2] || path.join(ROOT, 'src/assets/css/sub.css.git-source');
const OUT_SUB = path.join(ROOT, 'src/assets/css/sub.css');
const OUT_BOARD = path.join(ROOT, 'src/assets/css/board.css');

function extractLines(text, ranges) {
  const lines = text.split('\n');
  const chunks = [];
  for (const [start, end] of ranges) {
    chunks.push(lines.slice(start - 1, end).join('\n'));
  }
  return chunks.join('\n\n').trim() + '\n';
}

let source;
if (process.argv[2]) {
  source = fs.readFileSync(SOURCE, 'utf8');
} else {
  source = execSync('git show HEAD:src/assets/css/sub.css', { cwd: ROOT, encoding: 'utf8' });
}

const total = source.split('\n').length;

const subCss = extractLines(source, [
  [1, 252],
  [684, 6408],
]);

const boardCss = extractLines(source, [
  [253, 683],
  [6409, total],
]);

const subHeader = `/* ============================================================
   sub.css — 서브 페이지 (레이아웃·컴포넌트·반응형)
   게시판 스타일 → board.css
   포맷: npm run format:sub-css
   ============================================================ */

`;

const boardHeader = `/* ============================================================
   board.css — 게시판·일정·SiiRU CMS (b-*, btable, siiru-*)
   포맷: npm run format:sub-css
   ============================================================ */

`;

fs.writeFileSync(OUT_SUB, subHeader + subCss, 'utf8');
fs.writeFileSync(OUT_BOARD, boardHeader + boardCss, 'utf8');

console.log(`✅  sub.css   ← lines 1-252, 684-6408 (${subCss.split('\n').length} lines)`);
console.log(`✅  board.css ← lines 253-683, 6409-${total} (${boardCss.split('\n').length} lines)`);
