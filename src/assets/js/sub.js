/**
 * sub.js — 서브 페이지 전용 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 게시판 카테고리 필터 탭 ──────────────────────────── */
  const subtabs = document.querySelectorAll('.m-subtabs button');
  subtabs.forEach(btn => {
    btn.addEventListener('click', () => {
      subtabs.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
    });
  });

  /* ── TOC 스무스 스크롤 (컨텐츠 페이지) ───────────────── */
  document.querySelectorAll('.show-toc a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── 역대 노회임원 아코디언 ──────────────────────────── */
  document.querySelectorAll('.hist-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.hist-acc-item');
      item.classList.toggle('open');
    });
  });

  /* ── 그룹 탭 전환 (시찰별·회기별 등) ────────────────── */
  document.querySelectorAll('.group-tabs').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('button');
    const panels = tabGroup.nextElementSibling
      ? tabGroup.closest('.content, section, .tab-wrap')?.querySelectorAll('.tab-panel') ?? []
      : [];

    /* 같은 .tab-wrap 컨테이너 안에 .group-tabs + .tab-panel 패턴 지원 */
    const wrap = tabGroup.closest('.tab-wrap');
    const wrapPanels = wrap ? wrap.querySelectorAll('.tab-panel') : null;

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const target = btn.dataset.tab;
        if (wrapPanels) {
          wrapPanels.forEach(p => p.classList.remove('on'));
          const active = wrap.querySelector(`.tab-panel[data-panel="${target}"]`);
          if (active) active.classList.add('on');
        }
      });
    });
  });

});
