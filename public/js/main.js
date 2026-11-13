(() => {
  const data = window.SITE_DATA || { hours: {}, gallery: [] };

  // ---------- Mobile nav ----------
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  const closeNav = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  // ---------- Header shadow on scroll ----------
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Drifting sand (scroll-linked) ----------
  // Grain layer drifts slower than the page; the wind-ripple layer slides sideways,
  // so the beach looks alive as you scroll. Skipped for reduced-motion users.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const rootStyle = document.documentElement.style;
    let ticking = false;
    const drift = () => {
      const y = window.scrollY;
      rootStyle.setProperty('--sand-y', (-y * 0.18).toFixed(1));
      rootStyle.setProperty('--sand-ry', (-y * 0.32).toFixed(1));
      rootStyle.setProperty('--sand-rx', (y * 0.22).toFixed(1));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(drift); }
    }, { passive: true });
    drift();
  }

  // ---------- Open-now pill (Maine time) ----------
  try {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const today = data.hours[day];
    const open = Boolean(today) && mins >= toMin(today[0]) && mins < toMin(today[1]);
    const fmt = t => { let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return m ? `${h}:${String(m).padStart(2, '0')} ${ap}` : `${h} ${ap}`; };
    const label = open
      ? `Open now · till ${fmt(today[1])}`
      : (today && mins < toMin(today[0]) ? `Opens today at ${fmt(today[0])}` : 'Closed now');
    ['openPill', 'openPill2'].forEach(id => {
      const pill = document.getElementById(id);
      if (!pill) return;
      pill.textContent = label;
      pill.classList.add(open ? 'pill-open' : 'pill-closed');
    });
    document.querySelectorAll(`#hoursList [data-day="${day}"]`).forEach(el => el.classList.add('today'));
  } catch (_) { /* keep defaults */ }

  // ---------- Menu category tabs (all items stay in the HTML for Google) ----------
  const tabs = document.getElementById('menuTabs');
  if (tabs) {
    const cats = document.querySelectorAll('.menu-cat');
    tabs.hidden = false;
    tabs.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
      const cat = btn.dataset.cat;
      cats.forEach(c => { c.hidden = cat !== 'all' && c.dataset.cat !== cat; });
    });
  }

  // ---------- Gallery ----------
  const grid = document.getElementById('gallery-grid');
  data.gallery.forEach(p => {
    const fig = document.createElement('figure');
    if (p.wide) fig.classList.add('wide');
    if (p.tall) fig.classList.add('tall');
    const img = document.createElement('img');
    img.src = p.src; img.alt = p.alt; img.loading = 'lazy';
    if (p.pos) img.style.objectPosition = p.pos; // keep faces in frame
    img.addEventListener('error', () => fig.remove()); // missing photo? just hide the tile
    fig.appendChild(img);
    grid.appendChild(fig);
  });

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.section-head, .ticket-wrap, .sig, .full-menu, .hours-card, .review-big, .story-photos, .market-photo, .booking-form, .gift-card');
  if ('IntersectionObserver' in window) {
    revealEls.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  }

  // ---------- Catering form ----------
  const form = document.getElementById('bookingForm');
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form-status';
    const fd = Object.fromEntries(new FormData(form).entries());
    if (!fd.name.trim() || !fd.phone.trim()) {
      status.textContent = 'Please add your name and phone number.';
      status.classList.add('err');
      return;
    }
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await fetch('/api/booking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd)
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Something went wrong.');
      form.reset();
      status.textContent = 'Respect! We got your request and will reach out soon. Need it faster? Call (207) 835-0236.';
      status.classList.add('ok');
    } catch (err) {
      status.textContent = err.message + ' You can also call (207) 835-0236.';
      status.classList.add('err');
    } finally {
      btn.disabled = false; btn.textContent = 'Send My Request';
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
