#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const boardPath = path.join(ROOT, 'src/assets/css/board.css');
const subPath = path.join(ROOT, 'src/assets/css/sub.css');
const fragmentPath = path.join(__dirname, 'board-recovered.css.fragment');

let board = fs.readFileSync(boardPath, 'utf8');
const fragment = fs.readFileSync(fragmentPath, 'utf8').trim();

const anchor = '.siiru-btnSet { display:flex; gap:8px; justify-content:center; margin-top:20px }';
if (!board.includes(anchor)) {
  console.error('anchor not found in board.css');
  process.exit(1);
}
if (!board.includes('board-search-bar')) {
  board = board.replace(anchor, `${anchor}\n\n${fragment}`);
  console.log('✅  inserted recovered board styles');
} else {
  console.log('skip insert (board-search-bar already present)');
}

/* 덮어쓸 pagination active — fragment 이후에도 구규칙 남을 수 있음 */
board = board.replace(
  /\.siiru-boardWrap #boardPage \.pagination li\.active a,\.siiru-boardWrap #boardPage \.pagination li a\.active \{ background:var\(--hn-blue\); border-color:var\(--hn-blue\); color:#fff \}/,
  '.siiru-boardWrap #boardPage .pagination li.active a,.siiru-boardWrap #boardPage .pagination li a.active { background:var(--hn-text); border-color:var(--hn-text); color:#fff }'
);

fs.writeFileSync(boardPath, board, 'utf8');

/* sub.css — 퍼블 게시판 @media만 board로 */
let sub = fs.readFileSync(subPath, 'utf8');
const moveRules = [
  '  .b-toolbar { flex-direction:column; align-items:stretch }',
  '  .b-toolbar .left { flex-wrap:wrap }',
  '  .btable { font-size:15px }',
  '  .btable colgroup { display:none }',
  '  .album-grid { grid-template-columns:1fr 1fr; gap:14px }',
  '  .bnav .row { grid-template-columns:96px 28px 1fr }',
  '  .bnav .d { display:none }',
];
let moved = 0;
for (const rule of moveRules) {
  if (sub.includes(rule)) {
    sub = sub.replace(rule + '\n', '');
    moved++;
  }
}
fs.writeFileSync(subPath, sub, 'utf8');
console.log(`✅  removed ${moved} board @media rules from sub.css`);

/* board.css 첫 번째 @media (max-width:768px) 달력 블록 뒤에 퍼블 b-toolbar 규칙 추가 */
const pubMedia = moveRules.join('\n');
const calMediaAnchor = '@media (max-width:768px) {\n  #calendarTable tbody td';
if (board.includes(pubMedia.trim())) {
  console.log('skip pub media (already in board.css)');
} else if (board.includes(calMediaAnchor)) {
  board = fs.readFileSync(boardPath, 'utf8');
  board = board.replace(
    calMediaAnchor,
    `@media (max-width:768px) {\n${pubMedia}\n  #calendarTable tbody td`
  );
  fs.writeFileSync(boardPath, board, 'utf8');
  console.log('✅  added pub board @media to board.css (calendar block)');
}

/* mobile search — board-search-bar 모바일 */
const mobileSearch = `
  .siiru-boardWrap .siiruBoard-search form { flex-direction:row; flex-wrap:nowrap; align-items:stretch; justify-content:flex-start; gap:0; width:100% }
  .siiru-boardWrap .siiruBoard-search .board-search-bar { flex:1 1 auto; width:100%; min-width:0 }
  .siiru-boardWrap .siiruBoard-search .board-search-bar select { flex:1 1 0; min-width:0; max-width:none; padding:9px 28px 9px 10px; font-size:13px }
  .siiru-boardWrap .siiruBoard-search .board-search-bar .board-search-query { flex:1.4 1 0; min-width:0 }
  .siiru-boardWrap .siiruBoard-search .board-search-bar .board-search-query input[type="text"] { flex:1 1 0; width:auto; min-width:0; padding:9px 12px; font-size:13px }
  .siiru-boardWrap .siiruBoard-search .board-search-bar .board-search-query button[type="submit"] { width:38px; min-width:38px; font-size:15px }
  .siiru-boardWrap #boardPage .pagination { padding:14px 0 }
  .siiru-boardWrap #boardPage .pagination ul { gap:4px }
  .siiru-boardWrap #boardPage .pagination li a { min-width:32px; height:32px; padding:0 4px; font-size:13px }
  .siiru-boardWrap .pagination li a.first:empty::before,.siiru-boardWrap .pagination li a.prev:empty::before,.siiru-boardWrap .pagination li a.next:empty::before,.siiru-boardWrap .pagination li a.last:empty::before { font-size:12px }
  .siiru-boardWrap .siiruBoardBtnInfo { display:flex; flex-direction:row; justify-content:center; align-items:center; flex-wrap:wrap; gap:6px; padding:12px 14px }
  .siiru-boardWrap .siiruBoardBtnInfo .siiru-fr { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:6px; width:100%; flex:1 1 100% }
  .siiru-boardWrap .siiruBoardBtnInfo .siiru-btn,.siiru-boardWrap .siiruBoardBtnInfo a.siiru-btn,.siiru-boardWrap .siiruBoardBtnInfo button.siiru-btn { box-sizing:border-box; width:auto; min-height:36px; margin:0!important; padding:8px 14px; justify-content:center; font-size:14px; border-radius:0 }`;

board = fs.readFileSync(boardPath, 'utf8');
const bigMedia = '@media (max-width:768px) {\n  .siiru-boardWrap:has(>.siiruBoard-list)';
if (board.includes('board-search-bar select { flex:1 1 0') && board.includes(bigMedia)) {
  if (!board.includes('.siiru-boardWrap .siiruBoard-search .board-search-bar { flex:1 1 auto')) {
    board = board.replace(
      '  .siiru-boardWrap .siiruBoard-search form { flex-direction:row; flex-wrap:nowrap; align-items:stretch; justify-content:flex-start; gap:8px; width:100% }',
      mobileSearch.trim()
    );
    fs.writeFileSync(boardPath, board, 'utf8');
    console.log('✅  patched siiru mobile search + btnInfo in board.css');
  }
}
