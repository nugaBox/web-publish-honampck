#!/usr/bin/env node
/**
 * board.css — siiruBoard-write / joinForm-write 스타일 복구 (미커밋 sub.css 반영)
 * 모바일 규칙은 board-write-mobile.css.fragment → 맨 아래 @media (max-width:768px) 삽입
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const boardPath = path.join(ROOT, 'src/assets/css/board.css');
const fragmentPath = path.join(__dirname, 'board-write-form.css.fragment');
const mobilePath = path.join(__dirname, 'board-write-mobile.css.fragment');

function stripMobileFromFragment(raw) {
  const lines = raw.split('\n');
  const base = [];
  let inMobile = false;

  for (const line of lines) {
    if (line.includes('write form patches')) continue;
    if (/^  \.siiru-boardWrap \.siiruBoard-write/.test(line) || /^  \.joinForm-write/.test(line)) {
      inMobile = true;
      continue;
    }
    if (inMobile) continue;
    if (!line.trim()) {
      if (base.length && base[base.length - 1] !== '') base.push('');
      continue;
    }
    /* 깨진 단일 규칙(중괄호 불일치) 스킵 */
    if (line.includes('{') && !line.includes('}') && !line.includes(';')) continue;
    base.push(line);
  }

  return base.join('\n').trim();
}

function replaceWriteBlock(board, baseCss) {
  const startMark = '.siiru-boardWrap .siiruBoard-write,.joinForm-write';
  const endMark = '.siiru-boardWrap .siiruBoard-gallery';
  const start = board.indexOf(startMark);
  const end = board.indexOf(endMark);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('write block markers not found in board.css');
  }
  return board.slice(0, start) + baseCss + '\n\n' + board.slice(end);
}

function removeOldWriteMobile(board) {
  const start =
    board.indexOf('  .siiru-boardWrap .siiruBoard-write dl,.joinForm-write dl { flex-direction:column') >= 0
      ? board.indexOf('  .siiru-boardWrap .siiruBoard-write dl,.joinForm-write dl { flex-direction:column')
      : -1;
  if (start < 0) return board;

  const endMarkers = [
    '\n  .siiru-boardWrap .siiru-tc { margin-top:16px }',
    '\n  .siiru-userWrap',
    '\n  .siiru-passwdWrap',
  ];
  let end = -1;
  for (const m of endMarkers) {
    const i = board.indexOf(m, start);
    if (i > start && (end < 0 || i < end)) end = i;
  }
  if (end < 0) return board;
  return board.slice(0, start) + board.slice(end);
}

function insertWriteMobile(board, mobileRaw) {
  const lines = mobileRaw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return board;

  board = removeOldWriteMobile(board);
  const block = '\n' + lines.join('\n');
  const bigMedia = board.lastIndexOf('@media (max-width:768px)');
  if (bigMedia < 0) {
    return board + `\n\n@media (max-width:768px) {\n${lines.join('\n')}\n}\n`;
  }
  const close = board.lastIndexOf('\n}', board.length);
  return board.slice(0, close) + block + board.slice(close);
}

let baseCss = stripMobileFromFragment(fs.readFileSync(fragmentPath, 'utf8'));
const mobileRaw = fs.existsSync(mobilePath) ? fs.readFileSync(mobilePath, 'utf8') : '';

let board = fs.readFileSync(boardPath, 'utf8');
board = replaceWriteBlock(board, baseCss);
board = insertWriteMobile(board, mobileRaw);

fs.writeFileSync(boardPath, board, 'utf8');
console.log('✅  board.css write form styles restored');
console.log('   base ~', baseCss.split('\n').length, 'lines');
