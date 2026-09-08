// ============================================================
// Signeon360 — shared frontend interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* Mobile nav toggle */
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) icon.className = navLinks.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });
  }

  /* Shop filter sidebar (mobile) */
  const filterToggle = document.getElementById('mobile-filter-toggle');
  const filterSidebar = document.getElementById('filters-sidebar');
  const filterClose = document.getElementById('filters-close');
  const filterBackdrop = document.getElementById('filters-backdrop');

  function openFilters() {
    filterSidebar?.classList.add('open');
    filterBackdrop?.classList.add('show');
  }
  function closeFilters() {
    filterSidebar?.classList.remove('open');
    filterBackdrop?.classList.remove('show');
  }
  filterToggle?.addEventListener('click', openFilters);
  filterClose?.addEventListener('click', closeFilters);
  filterBackdrop?.addEventListener('click', closeFilters);

  /* Product tabs (description / specification / reviews) */
  const tabButtons = document.querySelectorAll('.tab-heads button');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-heads button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });

  /* Gallery thumbnails */
  const thumbs = document.querySelectorAll('.gallery-thumbs > div');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  /* Quantity stepper */
  document.querySelectorAll('.qty-box').forEach(box => {
    const input = box.querySelector('input');
    const minus = box.querySelector('.qty-minus');
    const plus = box.querySelector('.qty-plus');
    minus?.addEventListener('click', () => {
      let val = parseInt(input.value, 10) || 1;
      if (val > 1) input.value = val - 1;
    });
    plus?.addEventListener('click', () => {
      let val = parseInt(input.value, 10) || 1;
      input.value = val + 1;
    });
  });

  /* Back to top */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* Newsletter / contact / checkout forms — placeholder submit handling */
  document.querySelectorAll('form[data-placeholder-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = form.dataset.placeholderForm || 'Thanks! We will get back to you soon.';
      alert(msg);
      form.reset();
    });
  });

});
