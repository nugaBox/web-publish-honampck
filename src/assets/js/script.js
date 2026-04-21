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
    });
  } else {
    initGnb();
    markActiveNav();
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

  /* ── GNB 드롭다운 키보드/마우스 ──────────────────────── */
  function initGnb() {
    const gnb = document.querySelector('.hn-gnb');
    if (!gnb) return;

    gnb.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        gnb.querySelector('.drop').style.display = 'none';
      }
    });
  }

});
