/**
 * dev.js — 로컬 개발 서버 전용 (호남노회)
 *
 * npm run dev / 퍼블 미리보기에서만 로드한다.
 * CMS·JSP 실서버(footer.html)에는 포함하지 않는다.
 */

function normalizePathname(pathname) {
  let p = pathname.split('?')[0].split('#')[0];
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  if (p.endsWith('.html')) p = p.slice(0, -5);
  return p || '/';
}

/** URL 비교로 사이드바 현재 항목에 .on 부여 (실서버는 JSP 담당) */
function markActiveSidebar() {
  const current = normalizePathname(window.location.pathname);

  document.querySelectorAll('.sidebar-list a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    let linkPath;
    try {
      linkPath = normalizePathname(new URL(href, window.location.origin).pathname);
    } catch {
      return;
    }

    const activePrefixes = (link.dataset.activePrefix || '')
      .split(',')
      .map((prefix) => prefix.trim())
      .filter(Boolean);
    const prefixMatch = activePrefixes.some((prefix) => current.startsWith(normalizePathname(prefix)));
    if (linkPath === current || prefixMatch) {
      link.classList.add('on');
    }
  });
}

/** 신앙표준문서 3뎁스 탭 현재 항목 활성화 */
function markActiveDepth3Nav() {
  const current = normalizePathname(window.location.pathname);

  document.querySelectorAll('.depth3-nav .group-tabs a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    let linkPath;
    try {
      linkPath = normalizePathname(new URL(href, window.location.origin).pathname);
    } catch {
      return;
    }

    link.classList.toggle('on', linkPath === current);
  });
}

document.addEventListener('hn-includes-ready', () => {
  markActiveSidebar();
  markActiveDepth3Nav();
});
