/**
 * main.js — index.html 메인 페이지 전용 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {

  /** CMS/JSP 속성의 &amp; → 실제 URL용 & */
  const normalizeBoardHref = href => {
    if (!href || href === '#') return href || '#';
    return String(href).replace(/&amp;/gi, '&').replace(/&#0*38;/gi, '&');
  };

  /* ── 메인 게시판 탭 전환 ──────────────────────────────── */
  const tabs = document.querySelectorAll('.btabs button[data-tab]');
  const panels = document.querySelectorAll('.blist-panel');
  const moreLink = document.querySelector('.btabs .more');
  if (moreLink) {
    const initialMore = moreLink.getAttribute('href');
    if (initialMore) moreLink.href = normalizeBoardHref(initialMore);
  }

  const updateMoreLink = btn => {
    if (moreLink && btn.dataset.href) {
      moreLink.href = normalizeBoardHref(btn.dataset.href);
    }
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabs.forEach(b => b.classList.remove('on'));
      panels.forEach(p => p.hidden = true);
      btn.classList.add('on');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.hidden = false;
      updateMoreLink(btn);
    });
  });

  const firstTab = document.querySelector('.btabs button[data-tab].on');
  if (firstTab) updateMoreLink(firstTab);

  /* ── 모바일 아코디언 ──────────────────────────────────── */
  const bcard = document.querySelector('.bcard');

  const initAccordion = () => {
    if (!bcard) return;
    const isMobile = window.innerWidth <= 768;
    const existing = bcard.querySelectorAll('.bacc-btn');

    if (!isMobile) {
      existing.forEach(b => b.remove());
      bcard.querySelectorAll('.bacc-more-li').forEach(m => m.remove());
      bcard.querySelectorAll('.blist-panel').forEach(p => p.hidden = true);
      const activeTab = bcard.querySelector('.btabs button.on');
      if (activeTab) {
        const p = document.getElementById('tab-' + activeTab.dataset.tab);
        if (p) p.hidden = false;
      }
      return;
    }

    if (existing.length > 0) return;

    bcard.querySelectorAll('.btabs button[data-tab]').forEach(btn => {
      const panel = document.getElementById('tab-' + btn.dataset.tab);
      if (!panel) return;

      const accBtn = document.createElement('button');
      accBtn.className = 'bacc-btn';
      accBtn.dataset.target = btn.dataset.tab;
      accBtn.innerHTML = `<span>${btn.textContent.trim()}</span><i class="fa-regular fa-chevron-down bacc-icon"></i>`;
      bcard.insertBefore(accBtn, panel);

      const moreLi = document.createElement('li');
      moreLi.className = 'bacc-more-li';
      moreLi.innerHTML = `<a href="${normalizeBoardHref(btn.dataset.href)}"><i class="fa-regular fa-plus"></i> 전체보기</a>`;
      panel.appendChild(moreLi);

      const isFirst = btn.classList.contains('on');
      panel.hidden = !isFirst;
      if (isFirst) accBtn.classList.add('open');

      accBtn.addEventListener('click', () => {
        const willOpen = panel.hidden;
        bcard.querySelectorAll('.blist-panel').forEach(p => p.hidden = true);
        bcard.querySelectorAll('.bacc-btn').forEach(b => b.classList.remove('open'));
        if (willOpen) {
          panel.hidden = false;
          accBtn.classList.add('open');
        }
      });
    });
  };

  initAccordion();
  window.addEventListener('resize', initAccordion);

  /* ── 최근 사진 Swiper ─────────────────────────────────── */
  const photoSwiperEl = document.querySelector('.photo-thumb-swiper');
  const photoPrevEl = document.querySelector('.photo-meta .swiper-button-prev');
  const photoNextEl = document.querySelector('.photo-meta .swiper-button-next');
  const photoTitleEl = document.querySelector('.photo-title');
  const photoDateEl = document.querySelector('.photo-date');
  const photoCatEl = document.querySelector('.photo-cat');
  const photoBadgeEl = document.querySelector('.photo-slide-badge');

  const readPhotoSlideMeta = slide => ({
    title: slide.dataset.title || slide.querySelector('.photo-thumb img')?.alt || '',
    date: slide.dataset.date || '',
    cat: slide.dataset.cat || '',
    catType: slide.dataset.catType || '',
    href: normalizeBoardHref(
      slide.querySelector('.photo-thumb')?.getAttribute('href') || '#'
    )
  });

  const applyPhotoMeta = (item, index, total) => {
    if (!item) return;
    if (photoTitleEl) {
      photoTitleEl.textContent = item.title;
      photoTitleEl.title = item.title;
      if (photoTitleEl.tagName === 'A') photoTitleEl.href = item.href;
    }
    if (photoDateEl) photoDateEl.textContent = item.date;
    if (photoCatEl) {
      photoCatEl.textContent = item.cat;
      photoCatEl.className = `photo-cat${item.catType ? ' ' + item.catType : ''}`;
    }
    if (photoBadgeEl && typeof index === 'number' && total > 0) {
      photoBadgeEl.textContent = `${index + 1} / ${total}`;
    }
  };

  if (photoSwiperEl) {
    const photoMetaItems = [...photoSwiperEl.querySelectorAll('.swiper-wrapper > .swiper-slide')]
      .map(readPhotoSlideMeta);
    const photoSlideCount = photoMetaItems.length;

    if (photoSwiperEl.swiper) {
      photoSwiperEl.swiper.destroy(true, true);
    }

    if (photoSwiperEl && typeof Swiper !== 'undefined' && photoSlideCount > 0) {
      photoSwiperEl.classList.remove('swiper-fallback');

      const syncPhotoMeta = swiper => {
        const idx = swiper.realIndex;
        applyPhotoMeta(photoMetaItems[idx], idx, photoSlideCount);
      };

      const photoSwiper = new Swiper(photoSwiperEl, {
        loop: photoSlideCount > 1,
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 450,
        observer: true,
        observeParents: true,
        resizeObserver: true,
        autoplay: photoSlideCount > 1 ? {
          delay: 7000,
          disableOnInteraction: false
        } : false,
        navigation: photoSlideCount > 1 ? {
          nextEl: photoNextEl,
          prevEl: photoPrevEl
        } : false,
        on: {
          init: syncPhotoMeta,
          realIndexChange: syncPhotoMeta,
          slideChangeTransitionEnd: syncPhotoMeta
        }
      });

      photoSwiper.update();
      syncPhotoMeta(photoSwiper);
    } else {
      photoSwiperEl.classList.add('swiper-fallback');
      applyPhotoMeta(photoMetaItems[0], 0, photoSlideCount);
    }
  }

});
