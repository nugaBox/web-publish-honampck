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

});
