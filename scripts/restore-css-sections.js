#!/usr/bin/env node
/**
 * git HEAD(또는 지정 참조) CSS의 영역 주석(──)을 기준으로
 * 한 줄 포맷된 common/main/sub/board.css 에 섹션 헤더를 다시 삽입한다.
 *
 * 사용: node scripts/restore-css-sections.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const csstree = require('css-tree');

const ROOT = path.join(__dirname, '..');

const FILE_MAP = [
  { target: 'src/assets/css/common.css', ref: 'HEAD:src/assets/css/style.css' },
  { target: 'src/assets/css/main.css', ref: 'HEAD:src/assets/css/main.css' },
  { target: 'src/assets/css/sub.css', ref: 'HEAD:src/assets/css/sub.css' },
  { target: 'src/assets/css/board.css', ref: 'HEAD:src/assets/css/sub.css' },
];

const FILE_HEADERS = {
  'src/assets/css/common.css': `/* ============================================================
   common.css — 전역 공통 (변수·GNB·푸터·버튼·유틸)
   포맷: npm run format:sub-css
   ============================================================`,
  'src/assets/css/main.css': `/* ============================================================
   main.css — 메인(index) 전용
   포맷: npm run format:sub-css
   ============================================================`,
  'src/assets/css/sub.css': `/* ============================================================
   sub.css — 서브 페이지 (레이아웃·컴포넌트·반응형)
   게시판 스타일 → board.css
   포맷: npm run format:sub-css
   ============================================================`,
  'src/assets/css/board.css': `/* ============================================================
   board.css — 게시판·일정·SiiRU CMS (b-*, btable, siiru-*)
   포맷: npm run format:sub-css
   ============================================================`,
};

const DEFAULT_SECTION = '/* ── 기타·추가 ─────────────────────────────────────────── */';

const SECTION_COMMENT_RE = /\/\*\s*(──[^*]+)\*\//g;

function generateCompact(node) {
  return csstree
    .generate(node, { sourceMap: false, decorator: null })
    .replace(/\s+/g, ' ')
    .trim();
}

function isSectionHeaderLine(line) {
  return /^\/\*\s*──/.test(line);
}

function nodeKey(node) {
  if (node.type === 'Rule') {
    return generateCompact(node.prelude);
  }
  if (node.type === 'Atrule') {
    const prelude = generateCompact(node.prelude || { type: 'AtrulePrelude', children: [] });
    return prelude ? `@${node.name} ${prelude}` : `@${node.name}`;
  }
  return null;
}

/** 참조 소스에서 섹션 주석 위치 목록 (오프셋 오름차순) */
function extractSectionMarkers(refSource) {
  const markers = [];
  let m;
  SECTION_COMMENT_RE.lastIndex = 0;
  while ((m = SECTION_COMMENT_RE.exec(refSource)) !== null) {
    markers.push({
      offset: m.index,
      line: `/* ${m[1].trim()} */`,
    });
  }
  return markers;
}

function sectionAtOffset(markers, offset) {
  let section = DEFAULT_SECTION;
  for (const mark of markers) {
    if (mark.offset <= offset) {
      section = mark.line;
    } else {
      break;
    }
  }
  return section;
}

/** 참조 파일: 선택자/아트룰 키 → 섹션 */
function buildSectionMap(refSource) {
  const markers = extractSectionMarkers(refSource);
  const ast = csstree.parse(refSource, {
    parseValue: true,
    parseCustomProperty: true,
    positions: true,
  });

  const map = new Map();

  ast.children.forEach((node) => {
    const key = nodeKey(node);
    if (!key || !node.loc || !node.loc.start) return;
    const section = sectionAtOffset(markers, node.loc.start.offset);
    map.set(key, section);
  });

  return map;
}

function ruleToLine(rule) {
  const prelude = generateCompact(rule.prelude);
  const decls = [];
  const nested = [];

  rule.block.children.forEach((child) => {
    if (child.type === 'Declaration') {
      decls.push(generateCompact(child));
    } else if (child.type === 'Rule') {
      nested.push(ruleToLine(child));
    } else if (child.type === 'Atrule') {
      nested.push(atruleToBlock(child, 1));
    }
  });

  if (nested.length > 0) {
    const inner = [...(decls.length ? [`${prelude} { ${decls.join('; ')} }`] : []), ...nested].join('\n');
    return decls.length === 0 && nested.length ? inner : `${prelude} {\n${inner.split('\n').map((l) => '  ' + l).join('\n')}\n}`;
  }

  if (decls.length === 0) return '';
  return `${prelude} { ${decls.join('; ')} }`;
}

function atruleToBlock(atrule, indent = 0) {
  const pad = '  '.repeat(indent);
  const prelude = generateCompact(atrule.prelude || { type: 'AtrulePrelude', children: [] });
  const name = atrule.name;
  const header = prelude && prelude.length ? `${pad}@${name} ${prelude} {` : `${pad}@${name} {`;

  if (!atrule.block) {
    return `${pad}@${name} ${prelude};`.trim();
  }

  const lines = [header];
  atrule.block.children.forEach((child) => {
    if (child.type === 'Rule') {
      const line = ruleToLine(child);
      if (line) lines.push(line.split('\n').map((l) => pad + '  ' + l.trim()).join('\n'));
    } else if (child.type === 'Atrule') {
      lines.push(atruleToBlock(child, indent + 1));
    } else if (child.type === 'Declaration') {
      lines.push(`${pad}  ${generateCompact(child)}`);
    } else if (child.type === 'Raw') {
      lines.push(pad + '  ' + child.value.trim());
    }
  });
  lines.push(`${pad}}`);
  return lines.join('\n');
}

function nodeToLines(node) {
  if (node.type === 'Rule') {
    const line = ruleToLine(node);
    return line ? [line] : [];
  }
  if (node.type === 'Atrule') {
    return [atruleToBlock(node, 0)];
  }
  return [];
}

function loadRef(refSpec) {
  if (refSpec.startsWith('HEAD:')) {
    const gitPath = refSpec.slice(5);
    try {
      return execSync(`git show HEAD:${gitPath}`, { cwd: ROOT, encoding: 'utf8' });
    } catch {
      return null;
    }
  }
  const p = path.resolve(ROOT, refSpec);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function restoreFile({ target, ref }) {
  const targetPath = path.join(ROOT, target);
  if (!fs.existsSync(targetPath)) {
    console.warn(`skip (not found): ${target}`);
    return;
  }

  const refSource = loadRef(ref);
  if (!refSource) {
    console.warn(`skip (no ref): ${target} ← ${ref}`);
    return;
  }

  const sectionMap = buildSectionMap(refSource);
  const source = fs.readFileSync(targetPath, 'utf8');
  const ast = csstree.parse(source, {
    parseValue: true,
    parseCustomProperty: true,
    positions: false,
  });

  const out = [];
  const header = FILE_HEADERS[target];
  if (header) {
    out.push(header);
  }

  let lastSection = null;
  let rollingSection = null;
  let matched = 0;
  let total = 0;

  const emitSection = (section) => {
    if (section === lastSection) return;
    if (out.length > 0) out.push('');
    out.push(section);
    lastSection = section;
  };

  ast.children.forEach((node) => {
    if (node.type === 'Comment') {
      const raw = node.value.trim();
      if (raw.startsWith('──')) {
        const line = `/* ${raw} */`;
        rollingSection = line;
        emitSection(line);
      }
      return;
    }

    const key = nodeKey(node);
    if (!key) return;

    total += 1;
    if (sectionMap.has(key)) {
      rollingSection = sectionMap.get(key);
      matched += 1;
    }
    const section = rollingSection || DEFAULT_SECTION;
    emitSection(section);
    out.push(...nodeToLines(node));
  });

  const result = out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  fs.writeFileSync(targetPath, result, 'utf8');
  const sectionCount = out.filter(isSectionHeaderLine).length;
  console.log(
    `✅  ${target}: ${sectionCount} sections, ${matched}/${total} rules matched, ${result.split('\n').length} lines`
  );
}

FILE_MAP.forEach(restoreFile);
