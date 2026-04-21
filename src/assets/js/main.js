/**
 * main.js — index.html 메인 페이지 전용 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 메인 게시판 탭 전환 ──────────────────────────────── */
  const tabs = document.querySelectorAll('.btabs button[data-tab]');
  const panels = document.querySelectorAll('.blist-panel');

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabs.forEach(b => b.classList.remove('on'));
      panels.forEach(p => p.hidden = true);
      btn.classList.add('on');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.hidden = false;
    });
  });

});
