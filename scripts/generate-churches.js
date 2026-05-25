/**
 * 노회원 명부 마크다운 → src/sub/churches.html 생성
 * 사용: node scripts/generate-churches.js [명부.md 경로]
 */
const fs = require('fs');
const path = require('path');

const mdPath = process.argv[2] || path.join(process.env.HOME, 'Downloads/노회원_명부.md');
const outPath = path.join(__dirname, '../src/sub/churches.html');
const md = fs.readFileSync(mdPath, 'utf8');

const DISTRICTS = ['all', 'gwangju', 'naju', 'mudeung'];
const DIST_MAP = { '광주': 'gwangju', '나주': 'naju', '무등': 'mudeung' };
const DISTRICT_CAT = { '광주': 'b', '나주': 'r', '무등': 'o' };
const QUOTE = new Set(['"', '“', '”']);

const CATEGORY_ORDER = [
  '시무목사', '기관목사', '전도목사', '파송선교사', '회원선교사',
  '원로,은퇴목사', '무임목사', '강도사', '장로총대',
];

const CATEGORY_LABEL = {
  pastor: '시무목사',
  institution: '기관목사',
  evangelist: '전도목사',
  'mission-sent': '파송선교사',
  'mission-member': '회원선교사',
  retired: '원로,은퇴목사',
  'non-stipend': '무임목사',
  candidate: '강도사',
  elder: '장로총대',
};

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function districtBadgeHtml(district) {
  const d = (district ?? '').trim();
  if (!d || d === '—' || !DISTRICT_CAT[d]) return '—';
  return `<span class="cat ${DISTRICT_CAT[d]}">${esc(d)}</span>`;
}

function uniqueChurchCount(rows) {
  const set = new Set();
  for (const r of rows) {
    if (r.church && r.church !== '—') set.add(r.church);
  }
  return set.size;
}

function churchDisplay(name) {
  if (!name || name === '—') return '—';
  const n = name.trim();
  if (!n) return '—';
  if (n.endsWith('교회')) return n;
  return n + '교회';
}

function churchSortKey(church) {
  if (!church || church === '—') return '힣힣힣';
  return church;
}

function slug(title) {
  const map = {
    '시무 목사회원': 'pastor',
    '기관목사': 'institution',
    '전도목사': 'evangelist',
    '노회 파송선교사': 'mission-sent',
    '노회 회원선교사': 'mission-member',
    '원로, 은퇴목사': 'retired',
    '무임목사': 'non-stipend',
    '강도사': 'candidate',
    '장로총대': 'elder',
  };
  return map[title] || title;
}

function parseSections(md) {
  const sections = [];
  for (const part of md.split(/^## /m).slice(1)) {
    const lines = part.split('\n');
    const m = lines[0].trim().match(/^\d+\)\s*(.+?)(?:\s*\((\d+)명\))?$/);
    if (!m) continue;
    const title = m[1].trim();
    const tableStart = lines.findIndex(l => l.startsWith('| 번호'));
    if (tableStart === -1) {
      sections.push({ title, headers: [], rows: [], id: slug(title) });
      continue;
    }
    const headers = lines[tableStart].split('|').slice(1, -1).map(h => h.trim());
    const rows = [];
    let lastDistrict = '';
    for (let i = tableStart + 2; i < lines.length; i++) {
      const line = lines[i];
      if (!line.startsWith('|')) break;
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      let district = cells[2] ?? '';
      if (QUOTE.has(district)) district = lastDistrict;
      else if (district && DIST_MAP[district]) lastDistrict = district;
      rows.push({ cells, district: district || lastDistrict });
    }
    sections.push({ title, headers, rows, id: slug(title) });
  }
  return sections;
}

const sections = parseSections(md);

function filterRows(rows, panel) {
  if (panel === 'all') return rows;
  return rows.filter(r => DIST_MAP[r.district] === panel);
}

function displayCells(row) {
  const cells = [...row.cells];
  if (QUOTE.has(cells[2]) || cells[2] === '') cells[2] = row.district || '—';
  return cells;
}

function memberHeaders(headers) {
  return headers[0] === '번호' ? headers.slice(1) : headers;
}

function memberCells(row) {
  const cells = displayCells(row);
  return /^\d+$/.test(cells[0]) ? cells.slice(1) : cells;
}

function roleSuffix(catId) {
  if (catId === 'elder') return '장로';
  if (catId === 'mission-sent' || catId === 'mission-member') return '선교사';
  return '목사';
}

const CHURCH_COLS = new Set(['시무교회', '출석교회', '교회']);

function memberHeadersOrdered(headers) {
  const h = memberHeaders(headers);
  const rest = h.filter(x => x !== '시찰' && x !== '성명');
  return ['시찰', '성명', ...rest];
}

function formatMemberCell(header, value, sec) {
  const v = (value ?? '').trim();
  if (!v) return '—';
  if (header === '성명') {
    if (v.endsWith('목사') || v.endsWith('장로') || v.endsWith('선교사')) return v;
    return `${v} ${roleSuffix(sec.id)}`;
  }
  if (CHURCH_COLS.has(header)) return churchDisplay(v);
  if (header === '국내연락처') return churchDisplay(v);
  return v;
}

function memberRowOrdered(sec, row) {
  const headers = memberHeaders(sec.headers);
  const cells = memberCells(row);
  const map = Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
  const ordered = memberHeadersOrdered(sec.headers);
  return ordered.map(h => {
    const raw = h === '시찰' ? (map['시찰'] ?? '') : map[h];
    return formatMemberCell(h, raw, sec);
  });
}

function memberTableHtml(sec, rows) {
  if (!rows.length) return '<p class="member-empty">해당 회원이 없습니다.</p>';
  const orderedHeaders = memberHeadersOrdered(sec.headers);
  const ths = orderedHeaders.map(x => `<th>${esc(x)}</th>`).join('');
  const trs = rows.map(r => {
    const vals = memberRowOrdered(sec, r);
    const tds = vals.map((c, i) => {
      const h = orderedHeaders[i];
      let cls = '';
      if (h === '전화') cls = ' class="col-phone"';
      const content = h === '시찰' ? districtBadgeHtml(c) : (esc(c) || '—');
      return `<td${cls}>${content}</td>`;
    }).join('');
    return `<tr>${tds}</tr>`;
  }).join('\n');
  return `<div class="table-scroll"><table class="church-table member-table"><thead><tr>${ths}</tr></thead><tbody>\n${trs}\n</tbody></table></div>`;
}

function categoryLabel(sec) {
  return CATEGORY_LABEL[sec.id] || sec.title;
}

function churchField(sec, cells) {
  const join = sec.headers.join(' ');
  if (join.includes('시무교회') || join.includes('출석교회')) return cells[3];
  if (join.includes('시무기관')) return cells[3];
  if (join.includes('선교지')) return cells[3] || cells[5] || cells[2] || '';
  return cells[3] || '';
}

function phoneField(sec, cells) {
  const idx = sec.headers.findIndex(x => x === '전화');
  return idx >= 0 ? (cells[idx] || '—') : (cells[4] || '—');
}

function churchViewRows(sections, panel) {
  const out = [];
  for (const sec of sections) {
    const category = categoryLabel(sec);
    for (const r of filterRows(sec.rows, panel)) {
      const name = r.cells[1];
      const district = r.district && DIST_MAP[r.district] ? r.district : '—';
      const churchRaw = churchField(sec, r.cells);
      out.push({
        district,
        church: churchDisplay(churchRaw),
        category,
        categoryOrder: CATEGORY_ORDER.indexOf(category),
        name: `${name} ${roleSuffix(sec.id)}`,
        phone: phoneField(sec, r.cells),
        note: r.cells[r.cells.length - 1] || '—',
        sortChurch: churchRaw || '힣힣힣',
        sortName: name,
      });
    }
  }
  return out.sort((a, b) => {
    const dc = churchSortKey(a.church).localeCompare(churchSortKey(b.church), 'ko');
    if (dc !== 0) return dc;
    const ca = a.categoryOrder === -1 ? 99 : a.categoryOrder;
    const cb = b.categoryOrder === -1 ? 99 : b.categoryOrder;
    if (ca !== cb) return ca - cb;
    return a.sortName.localeCompare(b.sortName, 'ko');
  });
}

function churchTable(rows) {
  if (!rows.length) {
    return `<div class="church-list-section">
      <h3 class="member-section-title">소속 교회 <span class="member-section-cnt">0개</span></h3>
      <p class="member-empty">해당 회원이 없습니다.</p>
    </div>`;
  }
  const count = uniqueChurchCount(rows);
  const trs = rows.map(r =>
    `<tr><td>${districtBadgeHtml(r.district)}</td><td>${esc(r.church)}</td><td class="col-category">${esc(r.category)}</td><td>${esc(r.name)}</td><td class="col-phone">${esc(r.phone)}</td><td>${esc(r.note)}</td></tr>`
  ).join('\n');
  return `<div class="church-list-section">
      <h3 class="member-section-title">소속 교회 <span class="member-section-cnt">${count}개</span></h3>
      <div class="table-scroll"><table class="church-table church-member-table"><colgroup><col style="width:72px"><col style="width:140px"><col style="width:112px"><col style="width:128px"><col style="width:132px"><col></colgroup><thead><tr><th>시찰</th><th>교회</th><th>분류</th><th>교역자명</th><th>전화</th><th>비고</th></tr></thead><tbody>\n${trs}\n</tbody></table></div>
    </div>`;
}

let panels = '';
for (const panel of DISTRICTS) {
  let memberSections = '';
  for (const sec of sections) {
    const filtered = filterRows(sec.rows, panel);
    memberSections += `
            <div class="member-section">
              <h3 class="member-section-title">${esc(sec.title)} <span class="member-section-cnt">${filtered.length}명</span></h3>
              ${memberTableHtml(sec, filtered)}
            </div>`;
  }

  panels += `
          <div class="tab-panel${panel === 'all' ? ' on' : ''}" data-panel="${panel}">
            <div class="churches-view on" data-churches-view="member">${memberSections}
            </div>
            <div class="churches-view" data-churches-view="church">
              ${churchTable(churchViewRows(sections, panel))}
            </div>
          </div>`;
}


const html = `  <div data-include="../include/header.html"></div>

  <main id="main-content">

    <div class="hn-page-head">
      <div class="inner">
        <div class="breadcrumb-hn">
          <span class="home"><i class="fa-regular fa-house"></i> HOME</span>
          <i class="fa-regular fa-chevron-right"></i>
          <span>노회 조직</span>
          <i class="fa-regular fa-chevron-right"></i>
          <span class="cur">소속 회원 및 교회</span>
        </div>
        <h1>소속 회원 및 교회</h1>
        <p class="desc">호남노회 소속 회원 및 교회 현황입니다. (제34회기)</p>
      </div>
    </div>

    <div class="sub-layout">

      <div data-include="../include/sidebar_organization.html"></div>
      <section class="content">
        <div class="churches-page">
        <!-- 제34회기 (2026년 4월 14일 기준) -->

        <div class="churches-toolbar">
          <div class="churches-view-toggle" role="tablist" aria-label="목록 보기 방식">
            <button type="button" class="on" data-churches-view="member" role="tab" aria-selected="true">회원별</button>
            <button type="button" data-churches-view="church" role="tab" aria-selected="false">교회별</button>
          </div>
          <p class="churches-term-label">제34회기 (2026년 4월 14일 기준)</p>
        </div>

        <div class="tab-wrap churches-tab-wrap">
          <div class="group-tabs churches-district-tabs">
            <button class="on" data-tab="all">전체</button>
            <button data-tab="gwangju">광주시찰</button>
            <button data-tab="naju">나주시찰</button>
            <button data-tab="mudeung">무등시찰</button>
          </div>
          <p class="churches-sort-hint">교회명(가나다) 순서입니다</p>
${panels}
        </div><!-- /.tab-wrap -->

        </div><!-- /.churches-page -->
      </section>

    </div>
  </main>

  <div data-include="../include/footer.html"></div>
`;

fs.writeFileSync(outPath, html);
console.log('✅', outPath);
