/**
 * 회원별 테이블 → 교회별 정적 HTML 생성 (데스크탑 표 + 모바일 카드 분리)
 * 사용: node scripts/rebuild-church-view-html.js
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../src/sub/churches.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const CATEGORY_ORDER = [
  '시무목사',
  '기관목사',
  '전도목사',
  '선교사',
  '원로,은퇴목사',
  '무임목사',
  '강도사',
  '장로총대',
];

const SECTION_CATEGORY = {
  '시무 목사회원': '시무목사',
  '기관목사': '기관목사',
  '전도목사': '전도목사',
  '노회 파송선교사': '선교사',
  '노회 회원선교사': '선교사',
  '원로, 은퇴목사': '원로,은퇴목사',
  '무임목사': '무임목사',
  '강도사': '강도사',
  '장로총대': '장로총대',
};

const CHURCH_HEADER_PRIORITY = ['시무교회', '출석교회', '교회', '시무기관'];

const DISTRICT_MISC_HTML = '<span class="cat misc">기타</span>';
const PERSONAL_CHURCH = '개인회원';

function churchSortKey(name) {
  if (!name || name === '—' || name === PERSONAL_CHURCH) return '\uFFFF';
  return name;
}

function districtOrder(districtHtml) {
  const t = stripTags(districtHtml);
  if (t === '광주') return 0;
  if (t === '나주') return 1;
  if (t === '무등') return 2;
  return 9;
}

/** 0: 일반 교회, 1: 개인회원, 2: 기타(시찰 미표기) */
function groupSortTier(group) {
  if (group.church === PERSONAL_CHURCH) return 1;
  if (group.districtHtml === DISTRICT_MISC_HTML) return 2;
  return 0;
}

function stripTags(s) {
  return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function isDistrictMissing(districtHtml) {
  const t = stripTags(districtHtml);
  return !t || t === '—' || !/class="cat/.test(districtHtml);
}

function isChurchMissing(church) {
  return !church || church === '—';
}

function normalizeDistrictHtml(districtHtml) {
  return isDistrictMissing(districtHtml) ? DISTRICT_MISC_HTML : districtHtml;
}

/** 비고에 출석·소속 교회명이 있으면 추출 */
function extractNoteChurch(noteHtml) {
  const t = stripTags(noteHtml);
  if (!t || t === '—') return null;
  if (/^\d{4}\.\d{2}\.\d{2}/.test(t)) return null;
  if (/^(증경|은퇴|전입|안수|가입|원로)/.test(t) && !/교회/.test(t)) return null;
  const m = t.match(/([가-힣A-Za-z0-9·\s]+교회)/);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function parsePanelMemberData(panelHtml) {
  const members = [];
  const sectionOpenRe = /<div class="member-section(?:\s+member-section--lead)?">/g;
  const starts = [...panelHtml.matchAll(sectionOpenRe)].map((m) => m.index);
  const blocks = starts.map((start, i) => {
    const end =
      i + 1 < starts.length
        ? starts[i + 1]
        : panelHtml.search(/<div class="churches-view/);
    return panelHtml.slice(start, end >= 0 ? end : undefined);
  });

  for (const block of blocks) {
    const titleM = block.match(/<h3 class="member-section-title">([^<]+)/);
    if (!titleM) continue;
    const sectionTitle = titleM[1].trim();
    const category = SECTION_CATEGORY[sectionTitle];
    if (!category || !block.includes('member-table')) continue;

    const tableM = block.match(
      /<table class="church-table member-table">[\s\S]*?<thead><tr>([\s\S]*?)<\/tr>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/
    );
    if (!tableM) continue;

    const headers = [...tableM[1].matchAll(/<th>([^<]*)<\/th>/g)].map((x) => x[1].trim());
    const churchHeader = CHURCH_HEADER_PRIORITY.find((h) => headers.includes(h)) || '시무교회';
    const phoneIdx = headers.findIndex((h) => h === '연락처' || h === '전화');
    const noteIdx = headers.length - 1;

    let sectionOrder = 0;
    const rowRe = /<tr>([\s\S]*?)<\/tr>/g;
    let rm;
    while ((rm = rowRe.exec(tableM[2])) !== null) {
      const cells = [...rm[1].matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)].map((x) => ({
        attrs: x[1],
        html: x[2].trim(),
      }));
      if (!cells.length) continue;

      const byHeader = Object.fromEntries(headers.map((h, i) => [h, cells[i] || { html: '—', attrs: '' }]));
      const districtCell = byHeader['시찰'] || cells[0];
      const nameCell = byHeader['성명'] || cells[1];
      const churchCell = byHeader[churchHeader] || cells[2];
      const phoneCell = phoneIdx >= 0 ? cells[phoneIdx] : cells[3];
      const noteCell = cells[noteIdx] || cells[cells.length - 1];

      let church = stripTags(churchCell.html);
      if (!church) church = '—';

      members.push({
        category,
        categoryOrder: CATEGORY_ORDER.indexOf(category),
        sectionOrder: sectionOrder++,
        districtHtml: districtCell.html || '—',
        church,
        nameHtml: nameCell.html,
        nameText: stripTags(nameCell.html),
        phoneHtml: phoneCell.html,
        noteHtml: noteCell.html,
      });
    }
  }

  return members;
}

function resolveMembers(members) {
  const churchToDistrict = new Map();
  for (const mem of members) {
    if (isChurchMissing(mem.church) || isDistrictMissing(mem.districtHtml)) continue;
    if (!churchToDistrict.has(mem.church)) {
      churchToDistrict.set(mem.church, mem.districtHtml);
    }
  }

  return members.map((mem) => {
    const noteChurch = extractNoteChurch(mem.noteHtml);
    let church = mem.church;
    let districtHtml = mem.districtHtml;

    if (noteChurch && (isChurchMissing(church) || isDistrictMissing(districtHtml) || church !== noteChurch)) {
      church = noteChurch;
      if (churchToDistrict.has(noteChurch)) {
        districtHtml = churchToDistrict.get(noteChurch);
      }
    }

    return { ...mem, church, districtHtml };
  });
}

function groupByChurch(members) {
  const resolved = resolveMembers(members);
  const map = new Map();

  for (const mem of resolved) {
    const church = isChurchMissing(mem.church) ? PERSONAL_CHURCH : mem.church;
    const districtHtml = normalizeDistrictHtml(mem.districtHtml);
    const key = `${districtHtml}\u0000${church}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ ...mem, church, districtHtml });
  }

  const groups = [...map.values()].map((list) => {
    const sorted = [...list].sort((a, b) => {
      if (a.categoryOrder !== b.categoryOrder) return a.categoryOrder - b.categoryOrder;
      return a.sectionOrder - b.sectionOrder;
    });
    const firstSimuIdx = sorted.findIndex((x) => x.category === '시무목사');
    const church = sorted[0].church;
    const districtHtml = sorted[0].districtHtml;
    return {
      districtHtml,
      church,
      sortChurch: churchSortKey(church),
      members: sorted,
      firstSimuIdx: firstSimuIdx >= 0 ? firstSimuIdx : 0,
    };
  });

  groups.sort((a, b) => {
    const ta = groupSortTier(a);
    const tb = groupSortTier(b);
    if (ta !== tb) return ta - tb;
    if (ta === 1) return districtOrder(a.districtHtml) - districtOrder(b.districtHtml);
    return a.sortChurch.localeCompare(b.sortChurch, 'ko');
  });
  return groups;
}

function mobSummary(group) {
  const lead = group.members[group.firstSimuIdx] || group.members[0];
  const extra = group.members.length - 1;
  // 모바일 카드 닫힘 요약: 분류 없이 이름+직분만 (분류는 표·펼침 패널에 유지)
  const leadLabel = lead.nameText;
  if (extra <= 0) return leadLabel;
  return `${leadLabel} 외 ${extra}명`;
}

function clergyHtml(mem, isSimuLead) {
  if (isSimuLead) return mem.nameHtml;
  return mem.nameHtml.replace(
    /<span class="oname-n">([^<]*)<\/span>\s*<span class="oname-t">([^<]*)<\/span>/,
    '<span class="oname-plain">$1</span> <span class="oname-t">$2</span>'
  );
}

function renderMobCard(group) {
  const summary = mobSummary(group);
  const membersHtml = group.members
    .map(
      (mem) => `                  <div class="church-mob-member">
                    <div class="church-mob-member__line"><span class="k">분류</span><span class="v">${mem.category}</span></div>
                    <div class="church-mob-member__line"><span class="k">교역자명</span><span class="v">${clergyHtml(mem, false)}</span></div>
                    <div class="church-mob-member__line"><span class="k">연락처</span><span class="v col-phone">${mem.phoneHtml}</span></div>
                    <div class="church-mob-member__line"><span class="k">비고</span><span class="v">${mem.noteHtml}</span></div>
                  </div>`
    )
    .join('\n');

  return `                <div class="church-mob-card" role="button" tabindex="0" aria-expanded="false" aria-label="${summary} 상세 보기">
                  <div class="church-mob-card__top">
                    <span class="church-mob-card__district">${group.districtHtml}</span>
                    <strong class="church-mob-card__name">${group.church}</strong>
                    <span class="church-mob-card__summary">${summary}</span>
                    <span class="church-mob-card__toggle" aria-hidden="true"><i class="fa-regular fa-chevron-down church-mob-card__ico"></i></span>
                  </div>
                  <div class="church-mob-card__panel">
${membersHtml}
                  </div>
                </div>`;
}

function renderDeskRows(group) {
  const n = group.members.length;
  return group.members
    .map((mem, idx) => {
      const isSimuLead = mem.category === '시무목사' && idx === group.firstSimuIdx;
      const leadCls = isSimuLead ? ' col-clergy-lead' : '';
      const district = idx === 0 ? `<td rowspan="${n}" class="church-group-lead">${group.districtHtml}</td>` : '';
      const church = idx === 0 ? `<td rowspan="${n}" class="church-group-lead church-group-church">${group.church}</td>` : '';
      return `                <tr>${district}${church}<td class="col-category">${mem.category}</td><td class="col-clergy${leadCls}">${clergyHtml(mem, isSimuLead)}</td><td class="col-phone">${mem.phoneHtml}</td><td>${mem.noteHtml}</td></tr>`;
    })
    .join('\n');
}

function renderChurchView(panelMemberHtml) {
  const groups = groupByChurch(parsePanelMemberData(panelMemberHtml));

  if (!groups.length) {
    return `              <div class="church-list-section">
                <div class="church-list-section-head">
                  <h3 class="member-section-title">소속 교회 <span class="member-section-cnt"></span></h3>
                  <div class="church-list-section-meta">
                    <p class="churches-list-meta-line">제34회기 (2026년 4월 14일 기준) / 교회명(가나다) 순서입니다</p>
                  </div>
                </div>
                <p class="member-empty">해당 회원이 없습니다.</p>
              </div>`;
  }

  const mobCards = groups.map(renderMobCard).join('\n');
  const deskRows = groups.map(renderDeskRows).join('\n');

  return `              <div class="church-list-section">
                <div class="church-list-section-head">
                  <h3 class="member-section-title">소속 교회 <span class="member-section-cnt"></span></h3>
                  <div class="church-list-section-meta">
                    <p class="churches-list-meta-line">제34회기 (2026년 4월 14일 기준) / 교회명(가나다) 순서입니다</p>
                  </div>
                </div>
                <div class="church-mob-list">
${mobCards}
                </div>
                <div class="table-scroll">
                  <table class="church-table church-member-table">
                    <colgroup><col style="width:72px"><col style="width:140px"><col style="width:112px"><col style="width:100px"><col style="width:132px"><col></colgroup>
                    <thead>
                      <tr><th>시찰</th><th>교회</th><th>분류</th><th>교역자명</th><th>연락처</th><th>비고</th></tr>
                    </thead>
                    <tbody>
${deskRows}
                    </tbody>
                  </table>
                </div>
              </div>`;
}

function patchChurchViewsInTabWrap(sourceHtml) {
  const wrapStart = sourceHtml.indexOf('<div class="tab-wrap churches-tab-wrap">');
  const wrapEnd = sourceHtml.indexOf('</div><!-- /.tab-wrap -->');
  if (wrapStart < 0 || wrapEnd < 0) {
    throw new Error('tab-wrap not found in churches.html');
  }

  const panelOpenRe = /<div class="tab-panel[^"]*" data-panel="([^"]+)">/g;
  const wrapSlice = sourceHtml.slice(wrapStart, wrapEnd);
  const panels = [];
  let m;
  while ((m = panelOpenRe.exec(wrapSlice)) !== null) {
    panels.push({ id: m[1], start: wrapStart + m.index });
  }

  let out = sourceHtml;
  for (let i = panels.length - 1; i >= 0; i--) {
    const start = panels[i].start;
    const end = i + 1 < panels.length ? panels[i + 1].start : wrapEnd;
    const panelHtml = out.slice(start, end);

    const memberViewMatch = panelHtml.match(
      /<div class="churches-view[^"]*" data-churches-view="member">([\s\S]*)<\/div>\s*<div class="churches-view" data-churches-view="church">/
    );
    if (!memberViewMatch) continue;

    const churchOpen = '<div class="churches-view" data-churches-view="church">';
    const churchIdx = panelHtml.indexOf(churchOpen);
    if (churchIdx < 0) continue;

    const newChurchBlock = renderChurchView(memberViewMatch[1]);
    const newPanelHtml =
      panelHtml.slice(0, churchIdx + churchOpen.length) +
      `\n${newChurchBlock}\n            </div>\n          </div>\n`;

    out = out.slice(0, start) + newPanelHtml + out.slice(end);
  }

  return { html: out, count: panels.length };
}

const patched = patchChurchViewsInTabWrap(html);
html = patched.html;

/* 회원별 표 헤더·인원 표기 정리 */
html = html.replace(/<span class="member-section-cnt">[^<]*<\/span>/g, '<span class="member-section-cnt"></span>');
html = html.replace(/<th>전화<\/th>/g, '<th>연락처</th>');
html = html.replace(/<th>임직일 \/ 전입일<\/th>/g, '<th>비고</th>');
html = html.replace(/<th>전입일<\/th>/g, '<th>비고</th>');
html = html.replace(/<th>안수일<\/th>/g, '<th>비고</th>');
html = html.replace(/<th>임직일<\/th>/g, '<th>비고</th>');

/* 툴바·안내 문구 (이전 UI 유지) */
html = html.replace(
  /<div class="churches-toolbar">[\s\S]*?<\/div>\s*\n\s*<div class="tab-wrap churches-tab-wrap">/,
  `<div class="churches-toolbar">
          <div class="churches-view-toggle" role="tablist" aria-label="목록 보기 방식">
            <button type="button" class="on" data-churches-view="member" role="tab" aria-selected="true">회원별</button>
            <button type="button" data-churches-view="church" role="tab" aria-selected="false">교회별</button>
          </div>
        </div>

        <div class="tab-wrap churches-tab-wrap">`
);

html = html.replace(
  /<p class="churches-sort-hint">교회명\(가나다\) 순서입니다<\/p>\s*<p class="churches-mobile-detail-hint">[^<]*<\/p>/,
  `<p class="churches-mobile-detail-hint"><i class="fa-regular fa-circle-info" aria-hidden="true"></i><span class="churches-mobile-detail-hint__text"><span class="churches-mobile-detail-hint__detail">각 항목을 눌러 상세 정보를 확인할 수 있습니다.</span><span class="churches-mobile-detail-hint__term">제34회기 (2026년 4월 14일 기준)</span><span class="churches-mobile-detail-hint__sort churches-mobile-detail-hint__sort--member">교역자 임직/전입일 순서입니다</span><span class="churches-mobile-detail-hint__sort churches-mobile-detail-hint__sort--church">교회명(가나다) 순서입니다</span></span></p>`
);

if (!html.includes('churches-mobile-detail-hint__term')) {
  html = html.replace(
    /<p class="churches-sort-hint">교회명\(가나다\) 순서입니다<\/p>/,
    `<p class="churches-mobile-detail-hint"><i class="fa-regular fa-circle-info" aria-hidden="true"></i><span class="churches-mobile-detail-hint__text"><span class="churches-mobile-detail-hint__detail">각 항목을 눌러 상세 정보를 확인할 수 있습니다.</span><span class="churches-mobile-detail-hint__term">제34회기 (2026년 4월 14일 기준)</span><span class="churches-mobile-detail-hint__sort churches-mobile-detail-hint__sort--member">교역자 임직/전입일 순서입니다</span><span class="churches-mobile-detail-hint__sort churches-mobile-detail-hint__sort--church">교회명(가나다) 순서입니다</span></span></p>`
  );
}

fs.writeFileSync(htmlPath, html);
console.log(`✅ churches.html 교회별 정적 HTML 재생성 (${patched.count}개 탭)`);
