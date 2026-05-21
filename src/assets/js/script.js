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
      mountMobileSidebar();
      initMobileSidebarSelect();
      initGnb();
      markActiveNav();
      initMobileMenu();
      initFooterSites();
      initImageViewer();
    });
  } else {
    mountMobileSidebar();
    initMobileSidebarSelect();
    initGnb();
    markActiveNav();
    initMobileMenu();
    initFooterSites();
    initImageViewer();
  }

  /* ── 모바일 섹션 네비 (개발: include 로드 후 히어로 아래 복제) ── */
  function mountMobileSidebar() {
    if (document.querySelector('.sidebar-mob')) return;

    const hero = document.querySelector('.hn-page-head');
    const aside = document.querySelector('.sub-layout aside');
    if (!hero || !aside) return;

    const wrap = document.createElement('div');
    wrap.className = 'sidebar-mob';
    wrap.setAttribute('aria-label', '섹션 메뉴');
    wrap.appendChild(aside.cloneNode(true));
    hero.insertAdjacentElement('afterend', wrap);
  }

  /* ── 모바일 사이드바 → 스타일 커스텀 셀렉트 (활성 항목은 CMS/JSP에서 .on 처리) ── */
  function initMobileSidebarSelect() {
    document.querySelectorAll('.sidebar-mob').forEach(wrap => {
      if (wrap.querySelector('.sidebar-mob-select')) return;

      const nav = wrap.querySelector('.sidebar-list');
      if (!nav) return;

      const links = [...nav.querySelectorAll('a[href]')];
      if (!links.length) return;

      const root = document.createElement('div');
      root.className = 'sidebar-mob-select';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'sidebar-mob-select__trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', '섹션 메뉴');

      const labelEl = document.createElement('span');
      labelEl.className = 'sidebar-mob-select__label';

      const icon = document.createElement('i');
      icon.className = 'fa-regular fa-chevron-down sidebar-mob-select__icon';
      icon.setAttribute('aria-hidden', 'true');

      trigger.append(labelEl, icon);

      const menu = document.createElement('ul');
      menu.className = 'sidebar-mob-select__menu';
      menu.setAttribute('role', 'listbox');
      menu.hidden = true;

      let currentLabel = '';

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const label =
          link.querySelector('span')?.textContent.trim() ||
          link.textContent.replace(/\s+/g, ' ').trim();

        const item = document.createElement('li');
        item.className = 'sidebar-mob-select__item';
        item.setAttribute('role', 'presentation');

        const option = document.createElement('a');
        option.className = 'sidebar-mob-select__option';
        option.href = href;
        option.setAttribute('role', 'option');
        option.textContent = label;

        if (link.classList.contains('on')) {
          item.classList.add('is-active');
          option.setAttribute('aria-selected', 'true');
          option.setAttribute('aria-current', 'page');
          currentLabel = label;
        }

        item.appendChild(option);
        menu.appendChild(item);
      });

      if (!menu.children.length) return;

      if (!currentLabel) {
        currentLabel =
          menu.querySelector('.sidebar-mob-select__option')?.textContent.trim() || '';
      }
      labelEl.textContent = currentLabel;

      const closeMenu = () => {
        root.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      };

      const openMenu = () => {
        root.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
      };

      trigger.addEventListener('click', e => {
        e.stopPropagation();
        root.classList.contains('is-open') ? closeMenu() : openMenu();
      });

      menu.addEventListener('click', () => closeMenu());

      document.addEventListener('click', e => {
        if (!root.contains(e.target)) closeMenu();
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
      });

      root.append(trigger, menu);

      const host = wrap.querySelector('aside') || wrap;
      host.appendChild(root);
    });
  }

  /* ── GNB 현재 섹션 활성화 ────────────────────────────── */
  function markActiveNav() {
    const k = document.querySelector('.sidebar-head .k');
    const section = k ? k.textContent.trim().toLowerCase() : '';
    document.querySelectorAll('.hn-gnb .item[data-path]').forEach(item => {
      if (section && item.dataset.path === section) {
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

    /* header 내부에 남아 있으면 frosted glass(backdrop-filter)가 깨짐 */
    if (drawer.closest('#site-header')) {
      document.body.appendChild(drawer);
    }
    if (overlay?.closest('#site-header')) {
      document.body.appendChild(overlay);
    }

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

  /* ── 이미지 원본 뷰어 (공통) ───────────────────────────── */
  function initImageViewer() {
    const ZOOM_EXCLUDE = '#site-header, #site-footer, .hn-drawer, .hn-logo, .siiruBoard-gallery, .recent-photo, [data-no-zoom]';
    const ZOOM_SRC_SKIP = /(?:logo|favicon|banner-short|banner-long|banner-full|honam-banner)/i;
    const MIN_NATURAL = 64;

    let viewer = document.getElementById('hnImgViewer');
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.id = 'hnImgViewer';
      viewer.className = 'hn-img-viewer';
      viewer.setAttribute('role', 'dialog');
      viewer.setAttribute('aria-modal', 'true');
      viewer.setAttribute('aria-hidden', 'true');
      viewer.innerHTML = `
        <div class="hn-img-viewer__backdrop" data-viewer-close></div>
        <div class="hn-img-viewer__bar">
          <p class="hn-img-viewer__caption" id="hnImgViewerCaption"></p>
          <div class="hn-img-viewer__tools">
            <button type="button" class="hn-img-viewer__btn" data-viewer-zoom="out" aria-label="축소"><i class="fa-regular fa-minus"></i></button>
            <button type="button" class="hn-img-viewer__btn" data-viewer-zoom="reset" aria-label="화면에 맞춤"><i class="fa-regular fa-compress"></i></button>
            <button type="button" class="hn-img-viewer__btn" data-viewer-zoom="in" aria-label="확대"><i class="fa-regular fa-plus"></i></button>
            <button type="button" class="hn-img-viewer__btn hn-img-viewer__btn--close" data-viewer-close aria-label="닫기">닫기</button>
          </div>
        </div>
        <div class="hn-img-viewer__stage" id="hnImgViewerStage">
          <div class="hn-img-viewer__canvas" id="hnImgViewerCanvas">
            <img class="hn-img-viewer__img" id="hnImgViewerImg" alt="">
          </div>
        </div>
      `
      document.body.appendChild(viewer);
    }

    viewer.querySelector('#hnImgViewerHint')?.remove();

    if (viewer.dataset.viewerReady === '1') return;
    viewer.dataset.viewerReady = '1';

    const captionEl = viewer.querySelector('#hnImgViewerCaption');
    const stage = viewer.querySelector('#hnImgViewerStage');
    const canvas = viewer.querySelector('#hnImgViewerCanvas');
    const imgEl = viewer.querySelector('#hnImgViewerImg');

    let scale = 1;
    let tx = 0;
    let ty = 0;
    let baseW = 0;
    let baseH = 0;
    let dragging = false;
    let dragStart = null;
    let pinchStart = null;

    const applyTransform = () => {
      canvas.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    };

    const fitToStage = () => {
      if (!baseW || !baseH) return;
      const pad = 32;
      const sw = stage.clientWidth - pad;
      const sh = stage.clientHeight - pad;
      scale = Math.min(sw / baseW, sh / baseH, 1);
      tx = 0;
      ty = 0;
      applyTransform();
    };

    const clampPan = () => {
      const w = baseW * scale;
      const h = baseH * scale;
      const margin = 40;
      if (w <= stage.clientWidth) tx = 0;
      else tx = Math.min(margin, Math.max(stage.clientWidth - w - margin, tx));
      if (h <= stage.clientHeight) ty = 0;
      else ty = Math.min(margin, Math.max(stage.clientHeight - h - margin, ty));
      applyTransform();
    };

    const setZoom = delta => {
      scale = Math.min(6, Math.max(0.2, scale * delta));
      clampPan();
    };

    const open = sourceImg => {
      if (!sourceImg?.src) return;
      const src = sourceImg.currentSrc || sourceImg.src;
      imgEl.src = src;
      imgEl.alt = sourceImg.alt || '';
      captionEl.textContent = sourceImg.alt || '이미지 원본';

      const onLoad = () => {
        baseW = imgEl.naturalWidth;
        baseH = imgEl.naturalHeight;
        fitToStage();
        imgEl.removeEventListener('load', onLoad);
      };
      imgEl.addEventListener('load', onLoad);
      if (imgEl.complete) onLoad();

      viewer.classList.add('is-open');
      viewer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      viewer.classList.remove('is-open');
      viewer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      scale = 1;
      tx = 0;
      ty = 0;
      imgEl.removeAttribute('src');
    };

    const isZoomable = img => {
      if (!img || img.dataset.hnZoomBound) return false;
      if (img.closest(ZOOM_EXCLUDE)) return false;
      const root = img.closest('#main-content, main, .siiru-boardWrap');
      if (!root) return false;
      const src = img.getAttribute('src') || '';
      if (!src || src.startsWith('data:')) return false;
      if (ZOOM_SRC_SKIP.test(src)) return false;
      if (img.naturalWidth > 0 && img.naturalWidth < MIN_NATURAL) return false;
      return true;
    };

    const bindImage = img => {
      if (!isZoomable(img)) return;
      img.dataset.hnZoomBound = '1';
      img.classList.add('hn-zoomable');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', (img.alt || '이미지') + ' 원본 보기');

      const onActivate = e => {
        e.preventDefault();
        e.stopPropagation();
        open(img);
      };

      img.addEventListener('click', onActivate);
      img.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(img);
        }
      });
    };

    const scan = () => {
      document.querySelectorAll('#main-content img, main img, .siiru-boardWrap img').forEach(img => {
        if (img.naturalWidth) bindImage(img);
        else img.addEventListener('load', () => bindImage(img), { once: true });
      });
    };

    viewer.querySelectorAll('[data-viewer-close]').forEach(el => {
      el.addEventListener('click', close);
    });

    viewer.querySelector('[data-viewer-zoom="in"]')?.addEventListener('click', () => setZoom(1.2));
    viewer.querySelector('[data-viewer-zoom="out"]')?.addEventListener('click', () => setZoom(1 / 1.2));
    viewer.querySelector('[data-viewer-zoom="reset"]')?.addEventListener('click', fitToStage);

    document.addEventListener('keydown', e => {
      if (!viewer.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === '+' || e.key === '=') setZoom(1.15);
      if (e.key === '-') setZoom(1 / 1.15);
    });

    stage.addEventListener('wheel', e => {
      if (!viewer.classList.contains('is-open')) return;
      e.preventDefault();
      setZoom(e.deltaY < 0 ? 1.1 : 1 / 1.1);
    }, { passive: false });

    stage.addEventListener('pointerdown', e => {
      if (!viewer.classList.contains('is-open')) return;
      if (pinchStart) return;
      stage.setPointerCapture(e.pointerId);
      dragging = true;
      stage.classList.add('is-dragging');
      dragStart = { x: e.clientX - tx, y: e.clientY - ty, id: e.pointerId };
    });

    stage.addEventListener('pointermove', e => {
      if (!dragging || !dragStart || dragStart.id !== e.pointerId) return;
      if (e.pointerType === 'touch' && e.isPrimary === false) return;

      tx = e.clientX - dragStart.x;
      ty = e.clientY - dragStart.y;
      clampPan();
    });

    stage.addEventListener('pointerup', e => {
      if (dragStart?.id === e.pointerId) {
        dragging = false;
        dragStart = null;
        stage.classList.remove('is-dragging');
        try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    });

    stage.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        pinchStart = { dist: d, cx, cy };
        dragging = false;
      }
    }, { passive: false });

    stage.addEventListener('touchmove', e => {
      if (e.touches.length === 2 && pinchStart) {
        e.preventDefault();
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (pinchStart.dist > 0) setZoom(d / pinchStart.dist);
        pinchStart.dist = d;
      }
    }, { passive: false });

    stage.addEventListener('touchend', () => {
      if (pinchStart) pinchStart = null;
    });

    window.addEventListener('resize', () => {
      if (viewer.classList.contains('is-open')) fitToStage();
    });

    scan();
  }

  /* ── 푸터 관련사이트 토글 ─────────────────────────────── */
  function initFooterSites() {
    const wrap = document.getElementById('footerSites');
    const btn = wrap?.querySelector('.site-link-btn');
    if (!wrap || !btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('open');
      }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') wrap.classList.remove('open');
    });
  }

});
