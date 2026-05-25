/**
 * sub.js — 서브 페이지 전용 스크립트
 */

/** CMS 게시판: 카테고리 텍스트 → board-cat 뱃지 (퍼블 HTML과 동일 구조) */
function boardCatClass(name) {
  if (name.includes('무등')) return 'cat-o';
  if (name.includes('나주')) return 'cat-r';
  if (name.includes('광주')) return 'cat-b';
  if (name.includes('호남')) return 'cat-g';
  return 'cat-b';
}

function enhanceBoardListCategories() {
  document.querySelectorAll('.siiruBoard-list tbody td.category, .siiruBoard-list tbody td.ctgryNm').forEach((cell) => {
    if (cell.querySelector('.board-cat')) return;

    const label = cell.textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;

    const cat = document.createElement('span');
    cat.className = `board-cat ${boardCatClass(label)}`;
    cat.textContent = label;

    cell.textContent = '';
    cell.appendChild(cat);
  });
}

function parseBoardBracketTitle(text) {
  let rest = text.replace(/\s+/g, ' ').trim();
  const prefixes = [];
  while (rest.startsWith('[')) {
    const end = rest.indexOf(']');
    if (end === -1) break;
    prefixes.push(rest.slice(1, end));
    rest = rest.slice(end + 1).trim();
  }
  if (!prefixes.length || !rest) return null;
  return { catName: prefixes[prefixes.length - 1], title: rest };
}

function enhanceBoardGalleryTitles() {
  document.querySelectorAll('.siiruBoard-galleryBox').forEach((box) => {
    const dt = box.querySelector('dl dt');
    const link = dt?.querySelector('a[href]');
    if (!link) return;

    const photoCat = box.querySelector('.photoBox .board-cat');
    if (photoCat && !link.querySelector('.board-cat')) {
      link.insertBefore(photoCat, link.firstChild);
    }

    const isNew = dt.classList.contains('new') || link.classList.contains('new');

    if (!link.querySelector('.board-sj')) {
      const parsed = parseBoardBracketTitle(link.textContent);
      if (!parsed) return;

      link.textContent = '';

      const cat = document.createElement('span');
      cat.className = `board-cat ${boardCatClass(parsed.catName)}`;
      cat.textContent = parsed.catName;

      const sj = document.createElement('span');
      sj.className = 'board-sj';
      sj.textContent = parsed.title;

      link.appendChild(cat);
      link.appendChild(sj);

      if (isNew) {
        const mark = document.createElement('span');
        mark.className = 'new-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = 'N';
        link.appendChild(mark);
        link.classList.add('new');
      }

      dt.classList.remove('new');
    } else if (isNew && !link.querySelector('.new-mark')) {
      const mark = document.createElement('span');
      mark.className = 'new-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = 'N';
      link.appendChild(mark);
      link.classList.add('new');
      dt.classList.remove('new');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {

  enhanceBoardListCategories();
  enhanceBoardGalleryTitles();

  /* ── 게시판 시찰 탭 (hderCn / board-district-filter) → searchCtgry ─ */
  const isStaticBoardSearchForm = (form) => {
    const action = (form.getAttribute('action') || '').trim();
    if (!action || action === '#') return true;
    try {
      return /\.html$/i.test(new URL(action, window.location.href).pathname);
    } catch {
      return /\.html/i.test(action);
    }
  };

  /* ── 정적 게시판 목업: SiiRU 댓글 모달 미리보기 ───────── */
  const previewModalState = new WeakMap();

  const closeSiiruPreviewModal = (event) => {
    if (event) event.preventDefault();
    const blocker = document.querySelector('.blocker.jquery-modal.current');
    const modal = blocker?.querySelector('.siiruModal.modal');
    if (!blocker || !modal) return;

    modal.style.display = 'none';
    const state = previewModalState.get(modal);
    if (state?.parent) {
      state.parent.insertBefore(modal, state.nextSibling && state.nextSibling.parentNode === state.parent ? state.nextSibling : null);
    }
    blocker.remove();
    document.body.style.overflow = '';
  };

  const openSiiruPreviewModal = (target) => {
    const modal = typeof target === 'string' ? document.querySelector(target) : target;
    if (!modal) return;

    if (window.jQuery && typeof window.jQuery.modal === 'function' && window.jQuery.modal.close) {
      new window.jQuery.modal(window.jQuery(modal), { showClose: false, clickClose: false });
      return;
    }

    closeSiiruPreviewModal();
    previewModalState.set(modal, {
      parent: modal.parentNode,
      nextSibling: modal.nextSibling,
    });

    modal.hidden = false;
    modal.style.display = 'inline-block';

    const blocker = document.createElement('div');
    blocker.className = 'jquery-modal blocker current';
    blocker.addEventListener('click', (event) => {
      if (event.target === blocker || event.target.closest('a[rel~="modal:close"]')) closeSiiruPreviewModal(event);
    });
    blocker.appendChild(modal);
    document.body.appendChild(blocker);
    document.body.style.overflow = 'hidden';
  };

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSiiruPreviewModal(event);
  });

  document.addEventListener('click', (event) => {
    const closeBtn = event.target.closest('a[rel~="modal:close"]');
    if (closeBtn) {
      closeSiiruPreviewModal(event);
      return;
    }

    const modalBtn = event.target.closest('.comtBtn,[data-modal="#comtMModal"]');
    if (!modalBtn) return;

    const wrap = modalBtn.closest('.siiru-boardWrap');
    const form = wrap?.querySelector('#boardSearchForm');
    if (!wrap || !form || !isStaticBoardSearchForm(form)) return;

    const target = modalBtn.getAttribute('data-modal');
    if (!target) return;
    event.preventDefault();

    const modal = wrap.querySelector(target);
    const title = modal?.querySelector('#comtMTitle');
    const action = modal?.querySelector('#comtMAction');
    const saveBtn = modal?.querySelector('.comtMBtn');
    const actionValue = modalBtn.getAttribute('data-action') || 'MI';

    if (title) title.textContent = actionValue === 'MU' ? '댓글 수정' : actionValue === 'MMD' ? '댓글 삭제' : '댓글 등록';
    if (action) action.value = actionValue === 'MMD' ? 'MD' : actionValue;
    if (saveBtn) {
      saveBtn.textContent = actionValue === 'MMD' ? '삭제' : '저장';
      saveBtn.classList.toggle('siiru-btn-danger', actionValue === 'MMD');
      saveBtn.classList.toggle('siiru-btn-primary', actionValue !== 'MMD');
    }

    openSiiruPreviewModal(modal || target);
  });

  document.querySelectorAll('.board-district-filter').forEach(filter => {
    const wrap = filter.closest('.siiru-boardWrap');
    const form = wrap?.querySelector('#boardSearchForm');
    const sel = form?.querySelector('#searchCtgry, [name="searchCtgry"]');
    if (!form || !sel) return;

    const tabs = filter.querySelectorAll('button[data-category]');
    if (!tabs.length) return;

    const tabValue = (tab) => (tab.dataset.category !== undefined ? tab.dataset.category : '');
    const staticPreview = isStaticBoardSearchForm(form);

    if (sel.tagName === 'SELECT') {
      const tabVals = [...tabs].map(tabValue);
      const optVals = new Set([...sel.options].map(o => o.value));
      if (!tabVals.every(v => optVals.has(v))) {
        const prevVal = sel.value;
        sel.innerHTML = '';
        tabs.forEach(tab => {
          const val = tabValue(tab);
          const label = tab.textContent.replace(/\s+/g, ' ').trim();
          sel.appendChild(new Option(label, val));
        });
        if ([...sel.options].some(o => o.value === prevVal)) sel.value = prevVal;
        else sel.value = '';
      }
    }

    const syncTabOn = () => {
      const v = sel.value;
      tabs.forEach(t => t.classList.toggle('on', tabValue(t) === v));
    };
    syncTabOn();

    if (staticPreview) {
      form.addEventListener('submit', (e) => e.preventDefault());
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const val = tabValue(tab);
        if (sel.tagName === 'SELECT' && ![...sel.options].some(o => o.value === val)) return;
        sel.value = val;
        syncTabOn();
        const mp = form.querySelector('#movePage');
        if (mp) mp.value = '1';
        if (!staticPreview) {
          if (typeof form.requestSubmit === 'function') form.requestSubmit();
          else form.submit();
        }
      });
    });
  });

  /* ── 게시판 카테고리 필터 탭 ──────────────────────────── */
  const subtabs = document.querySelectorAll('.m-subtabs button');
  subtabs.forEach(btn => {
    btn.addEventListener('click', () => {
      subtabs.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
    });
  });

  /* ── TOC 스무스 스크롤 (컨텐츠·규칙 목차) ───────────── */
  const getStickyHeaderOffset = (extra = 24) => {
    const header = document.getElementById('site-header');
    return (header ? header.getBoundingClientRect().height : 0) + extra;
  };

  document.querySelectorAll('.show-toc a[href^="#"], .rules-toc a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - getStickyHeaderOffset();
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });

  /* ── 노회 연혁 시대 아코디언 ─────────────────────────── */
  document.querySelectorAll('.hist-era-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.hist-era-acc-item');
      if (!item) return;
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  /* ── 역대 노회임원 아코디언 ──────────────────────────── */
  document.querySelectorAll('.hist-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.hist-acc-item');
      item.classList.toggle('open');
    });
  });

  /* ── 노회 규칙 개정 이력 아코디언 ─────────────────────── */
  document.querySelectorAll('.rules-rev-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const acc = btn.closest('.rules-rev-acc');
      if (!acc) return;
      const isOpen = acc.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  /* ── 전신/호남노회 섹션 배너 아코디언 (officers-past) ─── */
  document.querySelectorAll('.presec-acc-toggle').forEach(banner => {
    const body = document.getElementById(banner.dataset.target);
    if (!body) return;
    banner.addEventListener('click', () => {
      const isOpen = banner.classList.toggle('open');
      body.style.display = isOpen ? '' : 'none';
    });
  });

  /* ── 역대 노회장·임원 행 아코디언 (officers-past) ──── */
  document.querySelectorAll('.pres-acc-row').forEach(row => {
    row.addEventListener('click', () => {
      const panel = row.nextElementSibling;
      row.classList.toggle('open');
      if (panel && panel.classList.contains('pres-acc-panel')) {
        panel.classList.toggle('open');
      }
    });
  });

  /* ── 역대 노회임원 좌우 분할 패널 (officers-past) ──── */
  const sessItems = document.querySelectorAll('.officer-sess-item');
  if (sessItems.length) {
    sessItems.forEach(item => {
      item.addEventListener('click', () => {
        sessItems.forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.officer-detail-panel').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        const panel = document.getElementById(item.dataset.target);
        if (panel) panel.classList.add('active');
      });
    });
    sessItems[0].click();
  }

  /* ── 소속 회원 및 교회: 회원별 / 교회별 보기 전환 ───── */
  const churchesPage = document.querySelector('.churches-page');
  if (churchesPage) {
    const churchMobileMq = window.matchMedia('(max-width: 768px)');

    function restoreChurchTableRows(table) {
      table.querySelectorAll('tbody tr').forEach((tr) => {
        if (tr.dataset.churchRowOriginal == null) return;
        tr.innerHTML = tr.dataset.churchRowOriginal;
        tr.classList.remove('church-m-card', 'church-m-open');
        tr.removeAttribute('role');
        tr.removeAttribute('tabindex');
        tr.removeAttribute('aria-expanded');
        tr.removeAttribute('aria-label');
      });
    }

    function setChurchMobileCardOpen(tr, open) {
      tr.classList.toggle('church-m-open', open);
      tr.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function isEmptyChurchCellValue(val) {
      const v = val.trim();
      if (!v) return true;
      return /^[\u2010-\u2015\u2212\uFF0D\-ㅡ\s]+$/.test(v);
    }

    function applySichalMiscBadge(td) {
      if (!td || td.querySelector('.cat')) return;
      if (!isEmptyChurchCellValue(td.textContent)) return;
      td.innerHTML = '<span class="cat misc">기타</span>';
    }

    function applyChurchTableDistrictBadges(table) {
      table.querySelectorAll('tbody tr').forEach((tr) => {
        applySichalMiscBadge(tr.querySelector('td:first-child'));
      });
    }

    function normalizeChurchMobilePrimaryCells(tr, primaryCount) {
      [...tr.querySelectorAll('td')]
        .filter((td) => !td.classList.contains('church-m-toggle-cell') && !td.classList.contains('church-m-acc-cell'))
        .slice(0, primaryCount)
        .forEach((td) => {
          if (td.querySelector('.cat')) {
            td.classList.remove('church-m-empty');
            return;
          }
          if (isEmptyChurchCellValue(td.textContent)) {
            td.textContent = '';
            td.classList.add('church-m-empty');
          } else {
            td.classList.remove('church-m-empty');
          }
        });
    }

    function buildChurchMobileCards(table) {
      const isChurchView = table.classList.contains('church-member-table');
      const primaryCount = isChurchView ? 4 : 3;
      const headers = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());

      table.querySelectorAll('tbody tr').forEach((tr) => {
        if (tr.dataset.churchRowOriginal == null) {
          tr.dataset.churchRowOriginal = tr.innerHTML;
        } else {
          tr.innerHTML = tr.dataset.churchRowOriginal;
          tr.classList.remove('church-m-card', 'church-m-open');
        }

        applySichalMiscBadge(tr.querySelector('td:first-child'));

        tr.querySelectorAll('td').forEach((td, i) => {
          if (headers[i]) td.dataset.label = headers[i];
        });

        const cells = [...tr.querySelectorAll('td')];
        const details = cells.slice(primaryCount);
        if (!details.length) return;

        const panel = document.createElement('div');
        panel.className = 'church-m-acc-panel';

        details.forEach((td) => {
          if (isEmptyChurchCellValue(td.textContent)) {
            td.remove();
            return;
          }
          const line = document.createElement('div');
          line.className = 'church-m-acc-line';
          line.innerHTML = `<span class="k">${td.dataset.label || ''}</span><span class="v">${td.innerHTML}</span>`;
          panel.appendChild(line);
          td.remove();
        });

        normalizeChurchMobilePrimaryCells(tr, primaryCount);

        if (!panel.children.length) return;

        const toggleCell = document.createElement('td');
        toggleCell.className = 'church-m-toggle-cell';
        toggleCell.innerHTML = '<span class="church-m-acc-ico-wrap" aria-hidden="true"><i class="fa-regular fa-chevron-down church-m-acc-ico"></i></span>';

        const panelCell = document.createElement('td');
        panelCell.className = 'church-m-acc-cell';
        panelCell.appendChild(panel);

        tr.appendChild(toggleCell);
        tr.appendChild(panelCell);
        tr.classList.add('church-m-card');
        tr.setAttribute('role', 'button');
        tr.setAttribute('tabindex', '0');
        tr.setAttribute('aria-expanded', 'false');
        tr.setAttribute('aria-label', '상세 정보 펼치기');

        tr.addEventListener('click', (e) => {
          if (e.target.closest('.church-m-acc-cell')) return;
          setChurchMobileCardOpen(tr, !tr.classList.contains('church-m-open'));
        });

        panelCell.addEventListener('click', (e) => e.stopPropagation());

        tr.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          setChurchMobileCardOpen(tr, !tr.classList.contains('church-m-open'));
        });
      });
    }

    function setChurchMobCardOpen(card, open) {
      card.classList.toggle('is-open', open);
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function initChurchMobList() {
      churchesPage.querySelectorAll('.church-mob-card').forEach((card) => {
        if (card.dataset.churchMobBound) return;
        card.dataset.churchMobBound = '1';
        const toggle = () => setChurchMobCardOpen(card, !card.classList.contains('is-open'));
        card.addEventListener('click', toggle);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      });
    }

    function syncChurchesMobileLayout() {
      churchesPage.querySelectorAll('.member-table').forEach((table) => {
        if (churchMobileMq.matches) {
          buildChurchMobileCards(table);
        } else {
          restoreChurchTableRows(table);
          applyChurchTableDistrictBadges(table);
        }
      });
    }

    churchesPage.querySelectorAll('.member-table').forEach(applyChurchTableDistrictBadges);
    initChurchMobList();
    syncChurchesMobileLayout();
    churchMobileMq.addEventListener('change', syncChurchesMobileLayout);

    function getActiveDistrictPanel() {
      return churchesPage.querySelector('.churches-tab-wrap .tab-panel.on');
    }

    const viewBtns = churchesPage.querySelectorAll('.churches-view-toggle button[data-churches-view]');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.churchesView;
        viewBtns.forEach(b => {
          const on = b === btn;
          b.classList.toggle('on', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        churchesPage.querySelectorAll('.churches-view').forEach(panel => {
          panel.classList.remove('on');
        });
        const districtPanel = getActiveDistrictPanel();
        if (!districtPanel) return;
        districtPanel.querySelectorAll('.churches-view').forEach(panel => {
          panel.classList.toggle('on', panel.dataset.churchesView === view);
        });
      });
    });

    const districtTabGroup = churchesPage.querySelector('.churches-district-tabs');
    if (districtTabGroup) {
      const wrap = districtTabGroup.closest('.tab-wrap');
      const wrapPanels = wrap ? wrap.querySelectorAll('.tab-panel') : null;
      const districtBtns = districtTabGroup.querySelectorAll('button');

      districtBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          districtBtns.forEach(b => b.classList.remove('on'));
          btn.classList.add('on');
          const target = btn.dataset.tab;
          if (!wrapPanels) return;
          wrapPanels.forEach(p => p.classList.remove('on'));
          const active = wrap.querySelector(`.tab-panel[data-panel="${target}"]`);
          if (!active) return;
          active.classList.add('on');
          const currentView =
            churchesPage.querySelector('.churches-view-toggle button.on')?.dataset.churchesView || 'member';
          churchesPage.querySelectorAll('.churches-view').forEach(panel => {
            panel.classList.remove('on');
          });
          active.querySelectorAll('.churches-view').forEach(panel => {
            panel.classList.toggle('on', panel.dataset.churchesView === currentView);
          });
          syncChurchesMobileLayout();
        });
      });
    }
  }

  /* ── 그룹 탭 전환 (시찰별·회기별 등) ────────────────── */
  document.querySelectorAll('.group-tabs').forEach(tabGroup => {
    if (tabGroup.classList.contains('board-district-filter')) return;
    if (tabGroup.classList.contains('churches-district-tabs')) return;
    const buttons = tabGroup.querySelectorAll('button');

    /* 같은 .tab-wrap 컨테이너 안에 .group-tabs + .tab-panel 패턴 지원 */
    const wrap = tabGroup.closest('.tab-wrap');
    const wrapPanels = wrap ? wrap.querySelectorAll('.tab-panel') : null;

    buttons.forEach(btn => {
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

  /* ── URL 해시로 탭 초기 활성화 (#gwangju 등) ──────── */
  const hash = location.hash.replace('#', '');
  if (hash) {
    const hashBtn = document.querySelector(`.group-tabs button[data-tab="${hash}"]`);
    if (hashBtn) hashBtn.click();
  }

  /* ── 회원 정보: 비밀번호 확인 → 정보 수정 화면 ─────── */
  const myinfoGate = document.getElementById('myinfo-gate');
  const myinfoEdit = document.getElementById('myinfo-edit');
  const acceptBtn = document.getElementById('acceptBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  const showMyinfoEdit = () => {
    if (!myinfoGate || !myinfoEdit) return;
    myinfoGate.classList.add('is-hidden');
    myinfoEdit.classList.add('is-open');
  };

  const showMyinfoGate = () => {
    if (!myinfoGate || !myinfoEdit) return;
    myinfoGate.classList.remove('is-hidden');
    myinfoEdit.classList.remove('is-open');
    const gatePasswd = document.getElementById('gate-passwd');
    if (gatePasswd) gatePasswd.value = '';
  };

  if (acceptBtn) {
    acceptBtn.addEventListener('click', showMyinfoEdit);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', showMyinfoGate);
  }

  /* 프로필 이미지: 파일 업로드 / URL 링크 전환 */
  document.querySelectorAll('input[name="proflSe"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isLink = radio.value === 'L' && radio.checked;
      const proflUrl = document.getElementById('proflUrl');
      const proflImage = document.getElementById('proflImage');
      if (proflUrl) proflUrl.disabled = !isLink;
      if (proflImage) proflImage.disabled = isLink;
    });
  });

});
