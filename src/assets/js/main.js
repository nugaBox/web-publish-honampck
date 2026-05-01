/**
 * main.js — index.html 메인 페이지 전용 스크립트
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 메인 게시판 탭 전환 ──────────────────────────────── */
  const tabs = document.querySelectorAll('.btabs button[data-tab]');
  const panels = document.querySelectorAll('.blist-panel');
  const moreLink = document.querySelector('.btabs .more');

  const updateMoreLink = (btn) => {
    if (moreLink && btn.dataset.href) moreLink.href = btn.dataset.href;
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

  /* ── 최근 사진 Swiper ─────────────────────────────────── */
  const photoSwiperEl = document.querySelector('.photo-thumb-swiper');
  const photoPrevEl = document.querySelector('.photo-meta .swiper-button-prev');
  const photoNextEl = document.querySelector('.photo-meta .swiper-button-next');
  const photoTitleEl = document.querySelector('.photo-title');
  const photoDateEl = document.querySelector('.photo-date');

  if (photoSwiperEl && typeof Swiper !== 'undefined') {
    if (photoSwiperEl.swiper) {
      photoSwiperEl.swiper.destroy(true, true);
    }
    photoSwiperEl.classList.remove('swiper-fallback');

    const syncPhotoMeta = (swiper) => {
      const active = swiper.slides[swiper.realIndex];
      if (!active) return;
      const title = active.dataset.title || '';
      const date = active.dataset.date || '';
      const displayTitle = title.length > 15 ? `${title.slice(0, 15)}...` : title;
      if (photoTitleEl) {
        photoTitleEl.textContent = displayTitle;
        photoTitleEl.title = title;
      }
      if (photoDateEl) photoDateEl.textContent = date;
    };

    const photoSwiper = new Swiper(photoSwiperEl, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 450,
      observer: true,
      observeParents: true,
      resizeObserver: true,
      navigation: {
        nextEl: photoNextEl,
        prevEl: photoPrevEl
      }
    });

    photoSwiper.update();
    syncPhotoMeta(photoSwiper);
    photoSwiper.on('slideChange', () => syncPhotoMeta(photoSwiper));
  } else if (photoSwiperEl) {
    photoSwiperEl.classList.add('swiper-fallback');
  }

});
