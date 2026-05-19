/**
 * sub.js — 서브 페이지 전용 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 노회/시찰 소식·앨범: 시찰 탭(CMS: siiru-boardWrap > siiru-clr) → searchCtgry + 폼 제출 ─ */
  document.querySelectorAll('.board-district-filter').forEach(filter => {
    const wrap = filter.closest('.siiru-boardWrap');
    const form = wrap?.querySelector('#boardSearchForm');
    const sel = form?.querySelector('#searchCtgry');
    if (!form || !sel) return;

    const tabs = filter.querySelectorAll('button[data-category]');
    if (!tabs.length) return;

    const tabVals = [...tabs].map(t => (t.dataset.category !== undefined ? t.dataset.category : ''));
    const optVals = new Set([...sel.options].map(o => o.value));
    const everyTabHasOption = tabVals.every(v => optVals.has(v));
    if (!everyTabHasOption) {
      const prevVal = sel.value;
      sel.innerHTML = '';
      tabs.forEach(tab => {
        const val = tab.dataset.category !== undefined ? tab.dataset.category : '';
        const label = tab.textContent.replace(/\s+/g, ' ').trim();
        sel.appendChild(new Option(label, val));
      });
      if ([...sel.options].some(o => o.value === prevVal)) sel.value = prevVal;
      else sel.value = '';
    }

    const syncTabOn = () => {
      const v = sel.value;
      tabs.forEach(t => {
        const tv = t.dataset.category !== undefined ? t.dataset.category : '';
        t.classList.toggle('on', tv === v);
      });
    };
    syncTabOn();

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const val = tab.dataset.category !== undefined ? tab.dataset.category : '';
        if (![...sel.options].some(o => o.value === val)) return;
        sel.value = val;
        tabs.forEach(t => t.classList.remove('on'));
        tab.classList.add('on');
        const mp = form.querySelector('#movePage');
        if (mp) mp.value = '1';
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.submit();
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
        if (window.innerWidth < 769) {
          const detail = item.closest('.officer-split')?.querySelector('.officer-detail');
          if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
    sessItems[0].click();
  }

  /* ── 소속 회원 및 교회: 회원별 / 교회별 보기 전환 ───── */
  const churchesPage = document.querySelector('.churches-page');
  if (churchesPage) {
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
          panel.classList.toggle('on', panel.dataset.churchesView === view);
        });
      });
    });
  }

  /* ── 그룹 탭 전환 (시찰별·회기별 등) ────────────────── */
  document.querySelectorAll('.group-tabs').forEach(tabGroup => {
    if (tabGroup.classList.contains('board-district-filter')) return;
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
