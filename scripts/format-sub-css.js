#!/usr/bin/env node
/**
 * common.css / main.css / sub.css / board.css — 규칙 블록당 한 줄 포맷
 * 사용: node scripts/format-sub-css.js [파일...]
 * 기본: 네 CSS 파일 전부
 */
const fs = require('fs');
const path = require('path');
const csstree = require('css-tree');

const ROOT = path.join(__dirname, '..');
const DEFAULT_FILES = [
  path.join(ROOT, 'src/assets/css/common.css'),
  path.join(ROOT, 'src/assets/css/main.css'),
  path.join(ROOT, 'src/assets/css/sub.css'),
  path.join(ROOT, 'src/assets/css/board.css'),
];

function collapseCssWhitespace(str) {
  let out = '';
  let inStr = false;
  let quote = '';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (!inStr && (c === '"' || c === "'")) {
      inStr = true;
      quote = c;
      out += c;
    } else if (inStr && c === quote && str[i - 1] !== '\\') {
      inStr = false;
      out += c;
    } else if (!inStr && /\s/.test(c)) {
      if (out[out.length - 1] !== ' ') out += ' ';
    } else {
      out += c;
    }
  }
  return out.trim();
}

function generateCompact(node) {
  return collapseCssWhitespace(
    csstree.generate(node, { sourceMap: false, decorator: null })
  );
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

/** 영역 구분(──) 또는 파일 헤더(===) — 이 앞에만 빈 줄 */
function isSectionBreakComment(text) {
  const first = text.split('\n')[0].trim();
  return /^\/\*\s*──/.test(first) || /^\/\*\s*=+/.test(first);
}

/** css-tree는 주석을 AST에 넣지 않으므로, 주석 블록과 코드를 분리한 뒤 코드만 포맷 */
function splitCssByComments(source) {
  const parts = [];
  const re = /\/\*[\s\S]*?\*\//g;
  let last = 0;
  let m;
  while ((m = re.exec(source)) !== null) {
    if (m.index > last) {
      const code = source.slice(last, m.index).trim();
      if (code) parts.push({ type: 'code', text: code });
    }
    parts.push({ type: 'comment', text: m[0].trim() });
    last = m.index + m[0].length;
  }
  if (last < source.length) {
    const code = source.slice(last).trim();
    if (code) parts.push({ type: 'code', text: code });
  }
  return parts;
}

function formatCodeChunk(codeText) {
  const ast = csstree.parse(codeText, {
    parseValue: true,
    parseCustomProperty: true,
    positions: false,
  });
  const lines = [];
  ast.children.forEach((node) => {
    if (node.type === 'Rule') {
      const line = ruleToLine(node);
      if (line) lines.push(line);
    } else if (node.type === 'Atrule') {
      lines.push(atruleToBlock(node, 0));
    } else if (node.type === 'Raw') {
      lines.push(node.value.trim());
    }
  });
  return lines;
}

function formatCss(source) {
  const out = [];

  splitCssByComments(source).forEach((part) => {
    if (part.type === 'comment') {
      if (isSectionBreakComment(part.text) && out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      out.push(part.text);
      return;
    }
    out.push(...formatCodeChunk(part.text));
  });

  return (
    out
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+\n/g, '\n')
      .trim() + '\n'
  );
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`skip (not found): ${filePath}`);
    return;
  }
  const before = fs.readFileSync(filePath, 'utf8');
  const linesBefore = before.split('\n').length;
  const formatted = formatCss(before);
  fs.writeFileSync(filePath, formatted, 'utf8');
  const linesAfter = formatted.split('\n').length;
  console.log(`✅  ${path.relative(ROOT, filePath)}: ${linesBefore} → ${linesAfter} lines`);
}

const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => path.resolve(ROOT, f))
  : DEFAULT_FILES;
files.forEach(processFile);
