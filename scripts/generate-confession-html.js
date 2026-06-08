/**
 * 웨스트민스터 신앙고백서 → rules.html 스타일 partial HTML 생성
 * - 본문: 총회 전자자료실 버전
 * - 목차·하위 번호(art): 기존 구조 유지
 */
const fs = require('fs');
const path = require('path');

const GAPCK_SOURCE = process.argv[2] || path.join(
  process.env.HOME,
  'Library/Mobile Documents/com~apple~CloudDocs/공유/웨스트민스터 신앙고백_총회버전.txt'
);
const OLD_SOURCE = process.argv[3] || path.join(
  process.env.HOME,
  'Library/Mobile Documents/com~apple~CloudDocs/공유/웨스트민스터 신앙고백.txt'
);
const OUT = path.join(__dirname, '../src/sub/_partials/confession-body.html');

const SOURCE_URL = 'https://gapck.org/library/general-assembly-constitution?cat=20230831193440VXN3Y3&menu=20230831193440VXN301';

function stripHtml(html) {
  return html
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')
    .replace(/<div[^>]*text-align:\s*center[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/** 제1장~제9장: '제'와 숫자 사이 공백 없음 */
function formatChapterPrefix(num) {
  return `제${num}장`;
}

function formatChapterTitle(num, rest) {
  const tail = normalizeText(rest || '');
  return tail ? `${formatChapterPrefix(num)} ${tail}` : formatChapterPrefix(num);
}

function normalizeChapterHeading(title, num) {
  const match = title.match(/^제\s*\d+장\s*(.*)$/);
  if (!match) return title;
  return formatChapterTitle(num, match[1]);
}

function formatSectionArt(rawArt, chapterNum, itemNum) {
  const art = normalizeText(rawArt);
  const sectionMatch = art.match(/^(\d+)-(\d+)\s*(.*)$/);
  if (sectionMatch) {
    const title = sectionMatch[3].trim();
    return title
      ? `${sectionMatch[1]}-${sectionMatch[2]}. ${title}`
      : `${sectionMatch[1]}-${sectionMatch[2]}.`;
  }
  const simpleMatch = art.match(/^(\d+)\.$/);
  if (simpleMatch) {
    return `${chapterNum}-${simpleMatch[1]}.`;
  }
  if (itemNum > 0 && chapterNum > 0) {
    return `${chapterNum}-${itemNum}.`;
  }
  return art;
}

function blockLooksComplete(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/아멘\.?\s*$/.test(trimmed)) return true;
  const tail = trimmed.slice(-150);
  if (!/\(\d+\)/.test(tail)) return false;
  // 문장 종료: 마침표, 또는 성경 인용 나열·한글 설명으로 끝남
  return /\.\s*$/.test(trimmed) || /[\d∼,\s)]\s*$/.test(trimmed) || /[가-힣)]\s*$/.test(trimmed);
}

function isScriptureOnlyLine(line) {
  return /^\(\d+\)/.test(line);
}

function hasTrailingSectionRef(text) {
  return /\(\d+\)/.test(text);
}

/** 한 단락 안에 (5). (5) refs (6). 형태로 이어진 조항 분리 */
function splitMultiSectionBlock(block) {
  const parts = block.split(/(?<=\))\s+(?=\(\d+\)\.\s*\()/);
  if (parts.length <= 1) return [block];
  return parts.map((part) => part.trim()).filter(Boolean);
}

function expandGapckBlocks(blocks) {
  const expanded = [];
  for (const block of blocks) {
    expanded.push(...splitMultiSectionBlock(block));
  }
  return expanded;
}

/** 총회 버전: 장 제목 + 본문 블록 */
function parseGapck(raw) {
  const lines = raw.split(/\r?\n/).map((line) => line.trim());
  const chapters = [];
  let current = null;
  let buffer = [];

  const flush = () => {
    if (!current || buffer.length === 0) return;
    const body = normalizeText(buffer.join(' '));
    if (body) current.blocks.push(body);
    buffer = [];
  };

  for (const line of lines) {
    if (!line) continue;

    const chapterMatch = line.match(/^제\s*(\d+)장\s*(.+)$/);
    if (chapterMatch) {
      flush();
      if (current) {
        current.blocks = expandGapckBlocks(current.blocks);
      }
      current = {
        num: parseInt(chapterMatch[1], 10),
        title: formatChapterTitle(parseInt(chapterMatch[1], 10), chapterMatch[2]),
        blocks: [],
      };
      chapters.push(current);
      continue;
    }

    if (!current) continue;

    if (isScriptureOnlyLine(line) && buffer.length) {
      buffer.push(line);
      continue;
    }

    if (buffer.length) {
      const joined = buffer.join(' ');
      if (blockLooksComplete(joined)) {
        flush();
      } else if (!hasTrailingSectionRef(line)) {
        buffer.push(line);
        continue;
      } else if (!hasTrailingSectionRef(joined)) {
        buffer.push(line);
        if (blockLooksComplete(buffer.join(' '))) {
          flush();
        }
        continue;
      } else {
        flush();
      }
    }

    buffer.push(line);
  }

  flush();
  if (current) {
    current.blocks = expandGapckBlocks(current.blocks);
  }
  return chapters;
}

/** 기존 HTML 원문: 목차 + 하위 번호(art) 구조 */
function parseOldStructure(raw) {
  const paragraphs = [...raw.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

  const toc = [];
  const chapters = [];
  let currentChapter = null;
  let pendingSection = null;
  let inBody = false;

  for (const text of paragraphs) {
    if (/웨스트민스터\s*신앙고백서/.test(text)) continue;
    if (text === '목 차' || text === '목차') continue;

    if (!inBody && /^제\s*\d+장/.test(text) && !/에\s*관하여/.test(text)) {
      const num = parseInt(text.match(/제\s*(\d+)장/)[1], 10);
      toc.push({ num, title: normalizeChapterHeading(normalizeText(text), num) });
      continue;
    }

    if (/^제\s*\d+장/.test(text) && /에\s*관하여/.test(text)) {
      inBody = true;
      const num = parseInt(text.match(/제\s*(\d+)장/)[1], 10);
      currentChapter = { num, title: normalizeText(text), items: [] };
      chapters.push(currentChapter);
      pendingSection = null;
      continue;
    }

    if (!inBody) continue;

    if (/^\d+-\d+\s/.test(text)) {
      pendingSection = normalizeText(text);
      continue;
    }

    if (/^\d+\.\s/.test(text) && currentChapter) {
      const itemNum = parseInt(text.match(/^(\d+)\./)[1], 10);
      const rawArt = pendingSection || text.match(/^(\d+\.)/)?.[1] || '';
      currentChapter.items.push({
        art: formatSectionArt(rawArt, currentChapter.num, itemNum),
      });
      pendingSection = null;
    }
  }

  return { toc, chapters };
}

function mergeChapters(toc, oldChapters, gapckChapters) {
  const mismatches = [];

  const chapters = oldChapters.map((oldChapter) => {
    const gapckChapter = gapckChapters.find((chapter) => chapter.num === oldChapter.num);
    if (!gapckChapter) {
      mismatches.push(`제${oldChapter.num}장: 총회 본문 없음`);
      return { ...oldChapter, items: oldChapter.items.map((item) => ({ ...item, body: '' })) };
    }

    if (oldChapter.items.length !== gapckChapter.blocks.length) {
      mismatches.push(
        `제${oldChapter.num}장: 하위 ${oldChapter.items.length}개 / 총회 본문 ${gapckChapter.blocks.length}개`
      );
    }

    const items = oldChapter.items.map((item, index) => ({
      art: item.art,
      body: gapckChapter.blocks[index] || '',
    }));

    return {
      num: oldChapter.num,
      title: gapckChapter.title,
      items,
    };
  });

  return { toc, chapters, mismatches };
}

function renderHtml({ toc, chapters }) {
  const tocItems = toc.map((chapter) => {
    const id = `ch${String(chapter.num).padStart(2, '0')}`;
    return `              <li><a href="#${id}">${escapeHtml(chapter.title)}</a></li>`;
  }).join('\n');

  const bodyParts = chapters.map((chapter) => {
    const id = `ch${String(chapter.num).padStart(2, '0')}`;
    const items = chapter.items.map((item) => `            <li>
              <span class="art">${escapeHtml(item.art)}</span>
              <span>${escapeHtml(item.body)}</span>
            </li>`).join('\n');

    return `          <h2 class="rules-chapter" id="${id}">${escapeHtml(chapter.title)}</h2>
          <ul class="rules-list">
${items}
          </ul>`;
  }).join('\n');

  return `<nav class="rules-toc" aria-label="웨스트민스터 신앙고백서 목차">
          <div class="rules-toc-inner">
            <p class="rules-toc-label">목  차</p>
            <ol class="rules-toc-list">
${tocItems}
            </ol>
          </div>
        </nav>

        <div class="rules-doc">
          <div class="faith-doc-icon" aria-hidden="true">
            <img src="/assets/images/sub/westminster/westminster.png" alt="" width="72" height="72" decoding="async">
          </div>
          <p class="rules-doc-title">웨스트민스터 신앙고백서</p>
          <p class="rules-doc-subtitle">Westminster Confession of Faith · 1647</p>
${bodyParts}
        </div>

        <p class="rules-source">
          출처 :
          <a href="${SOURCE_URL}" target="_blank" rel="noopener noreferrer">대한예수교장로회 총회전자자료실</a>
        </p>`;
}

const gapckRaw = fs.readFileSync(GAPCK_SOURCE, 'utf8');
const oldRaw = fs.readFileSync(OLD_SOURCE, 'utf8');
const oldStructure = parseOldStructure(oldRaw);
const gapckChapters = parseGapck(gapckRaw);
const merged = mergeChapters(oldStructure.toc, oldStructure.chapters, gapckChapters);

if (merged.toc.length !== 33 || merged.chapters.length !== 33) {
  console.warn(`경고: 목차 ${merged.toc.length}장, 본문 ${merged.chapters.length}장 (기대 33장)`);
}

if (merged.mismatches.length) {
  console.warn('경고: 장별 블록 수 불일치:\n  ' + merged.mismatches.join('\n  '));
}

const invalidArts = [];
merged.chapters.forEach((chapter) => {
  chapter.items.forEach((item, index) => {
    if (!/^\d+-\d+\./.test(item.art)) {
      invalidArts.push({ chapter: chapter.num, index: index + 1, art: item.art });
    }
    if (!item.body) {
      invalidArts.push({ chapter: chapter.num, index: index + 1, art: item.art, empty: true });
    }
  });
});

if (invalidArts.length) {
  console.warn('경고: art/본문 문제:', invalidArts);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, renderHtml(merged), 'utf8');

const itemCount = merged.chapters.reduce((count, chapter) => count + chapter.items.length, 0);
console.log(`생성 완료: ${OUT}`);
console.log(`목차 ${merged.toc.length}장, 본문 ${merged.chapters.length}장, 조항 ${itemCount}개`);
