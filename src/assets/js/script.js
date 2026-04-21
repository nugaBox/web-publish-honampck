/**
 * script.js — 전역 공통 스크립트 (호남노회)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── data-include 로더 (로컬 개발용) ──────────────────── */
  const includes = document.querySelectorAll('[data-include]');
  if (includes.length > 0) {
    Promise.all(
      [...includes].map(el =>
        fetch(el.dataset.include)
          .then(res => {
            if (!res.ok) throw new Error(`${el.dataset.include} 로드 실패`);
            return res.text();
          })
          .then(html => {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            el.replaceWith(...temp.childNodes);
          })
          .catch(err => console.warn(err))
      )
    ).then(() => {
      initGnb();
      markActiveNav();
      initMobileMenu();
    });
  } else {
    initGnb();
    markActiveNav();
    initMobileMenu();
  }

  /* ── GNB 현재 경로 활성화 ─────────────────────────────── */
  function markActiveNav() {
    const path = location.pathname;
    document.querySelectorAll('.hn-gnb .item[data-path]').forEach(item => {
      if (path.includes(item.dataset.path)) {
        item.classList.add('on');
      }
    });
  }

  /* ── GNB 드롭다운 (hover open/close) ─────────────────── */
  function initGnb() {
    const headerGnb = document.querySelector('.hn-header-gnb');
    const gnb = headerGnb?.querySelector('.hn-gnb');
    const drop = headerGnb?.querySelector('.hn-drop');
    if (!gnb || !drop) return;

    let closeTimer;
    const openDrop  = () => { clearTimeout(closeTimer); headerGnb.setAttribute('data-drop', ''); };
    const closeDrop = () => { closeTimer = setTimeout(() => headerGnb.removeAttribute('data-drop'), 120); };

    gnb.addEventListener('mouseenter', openDrop);
    gnb.addEventListener('mouseleave', closeDrop);
    drop.addEventListener('mouseenter', openDrop);
    drop.addEventListener('mouseleave', closeDrop);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') headerGnb.removeAttribute('data-drop');
    });
  }

  /* ── 스크롤 시 frosted glass ──────────────────────────── */
  function initScrollHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 10);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }
  initScrollHeader();

  /* ── 모바일 드로어 메뉴 ───────────────────────────────── */
  function initMobileMenu() {
    const btn = document.getElementById('mobMenuBtn');
    const drawer = document.getElementById('hnDrawer');
    const overlay = document.getElementById('hnOverlay');
    const closeBtn = document.getElementById('hnDrawerClose');
    if (!btn || !drawer) return;

    const openMenu = () => {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    btn.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);

    /* 드로어 아코디언 (한 번에 하나만 열림) */
    drawer.querySelectorAll('.hn-drawer-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const group = toggle.closest('.hn-drawer-group');
        const isOpen = group.classList.contains('open');
        drawer.querySelectorAll('.hn-drawer-group.open').forEach(g => g.classList.remove('open'));
        if (!isOpen) group.classList.add('open');
      });
    });
  }

});
