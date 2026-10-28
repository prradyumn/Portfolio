// Motion for the portfolio. Everything here is progressive: without JS the page is complete.
const { gsap, ScrollTrigger, SplitText } = window;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

let lenis = null;
let hero = null;

function scrollToEl(el, offset = -90) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

// ---------- 3D hero (lazy, isolated: a CDN or WebGL failure leaves a static sun) ----------
async function startHero() {
  const host = $('#hero3d');
  try {
    const { initHero3D } = await import('./hero3d.js');
    hero = initHero3D(host, { reduced, onPick: id => pickProject(id) });
    if (!hero) return;
    if (!reduced && gsap) gsap.to(hero.state, { intro: 1, duration: 2.2, ease: 'power2.out', delay: .25 });
    if (!reduced && ScrollTrigger) {
      ScrollTrigger.create({
        trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: s => { hero.state.scroll = s.progress; },
      });
    }
  } catch (e) {
    host.closest('.hero__panel')?.classList.add('no-webgl');
    console.warn('3D hero skipped:', e);
  }
}

function pickProject(id) {
  const cover = document.getElementById('issue-' + id);
  const row = document.getElementById('arc-' + id);
  if (cover && coverScroll) coverScroll(cover);
  else scrollToEl(cover || row);
  const target = cover || row;
  if (target) {
    target.classList.add('live');
    setTimeout(() => target.classList.remove('live'), 2600);
  }
}

// ---------- the click POW ----------
const POWS = ['POW!', 'BAM!', 'ZAP!', 'KLIK!', 'WHAM!', 'BOOP!', 'THOK!'];
function pow(x, y, word) {
  if (reduced || !gsap) return;
  const el = document.createElement('span');
  el.className = 'pow sfx';
  el.textContent = word || POWS[(Math.random() * POWS.length) | 0];
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  gsap.timeline({ onComplete: () => el.remove() })
    .fromTo(el, { scale: .2, rotate: gsap.utils.random(-25, 25) }, { scale: 1, rotate: gsap.utils.random(-12, 12), duration: .32, ease: 'back.out(2.4)' })
    .to(el, { scale: .6, opacity: 0, y: -16, duration: .28, ease: 'power2.in' }, '+=.22');
}
document.addEventListener('pointerdown', e => {
  if (e.button !== 0 || e.target.closest('input, textarea, #hero3d')) return;
  pow(e.clientX, e.clientY);
});

// ---------- copy email ----------
const copyBtn = $('#copyEmail');
copyBtn?.addEventListener('click', async () => {
  const email = copyBtn.dataset.email;
  try { await navigator.clipboard.writeText(email); } catch (_) {
    const t = document.createElement('textarea'); t.value = email; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (__) {} t.remove();
  }
  const s = $('.sfx', copyBtn);
  copyBtn.setAttribute('aria-label', 'Email address copied');
  if (gsap && !reduced) {
    gsap.fromTo(s, { opacity: 1, scale: .3, rotate: -20 }, { scale: 1, rotate: -6, duration: .4, ease: 'back.out(2.6)' });
    gsap.to(s, { opacity: 0, y: -10, delay: 1.2, duration: .3, onComplete: () => gsap.set(s, { y: 0 }) });
  } else if (s) { s.style.opacity = 1; setTimeout(() => (s.style.opacity = 0), 1400); }
});

// ---------- masthead: hide on the way down, show on the way up; mark the active section ----------
function initMasthead() {
  const bar = $('#masthead');
  const dock = $('#dock');
  let last = 0;
  const onScroll = y => {
    if (y > 300 && y > last + 1) bar.classList.add('hide');
    else if (y < last - 1 || y < 300) bar.classList.remove('hide');
    dock?.classList.toggle('on', y > innerHeight * .9 && y < document.documentElement.scrollHeight - innerHeight * 1.6);
    last = y;
  };
  if (lenis) lenis.on('scroll', e => onScroll(e.scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  const links = $$('.nav a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'strip', 'archive', 'log', 'origin', 'signal'].forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });

  // anchor links go through Lenis so pinned sections land correctly
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    scrollToEl(el, id === '#top' ? -200 : -80);
  }));
}

// ---------- archive peek ----------
function initPeek() {
  if (!finePointer) return;
  const peek = $('#peek'), img = $('#peekImg');
  const W = 340, H = W * 10 / 16;
  const qx = gsap ? gsap.quickTo(peek, 'x', { duration: .45, ease: 'power3' }) : v => (peek.style.left = v + 'px');
  const qy = gsap ? gsap.quickTo(peek, 'y', { duration: .45, ease: 'power3' }) : v => (peek.style.top = v + 'px');
  const qr = gsap ? gsap.quickTo(peek, 'rotation', { duration: .6, ease: 'power3' }) : () => {};
  let lastX = 0;
  addEventListener('pointermove', e => {
    const x = Math.min(innerWidth - W - 16, e.clientX + 28);
    const y = Math.min(innerHeight - H - 16, Math.max(16, e.clientY - H / 2));
    qx(x); qy(y);
    qr(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * .6));
    lastX = e.clientX;
  }, { passive: true });
  $$('.ledger__row[data-img]').forEach(row => {
    row.addEventListener('pointerenter', () => { img.src = row.dataset.img; peek.classList.add('on'); });
    row.addEventListener('pointerleave', () => peek.classList.remove('on'));
  });
}

// ---------- magnetic buttons ----------
function initMagnetic() {
  if (!finePointer || reduced) return;
  $$('[data-magnetic]').forEach(el => {
    const qx = gsap.quickTo(el, 'x', { duration: .4, ease: 'power3' });
    const qy = gsap.quickTo(el, 'y', { duration: .4, ease: 'power3' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * .25);
      qy((e.clientY - r.top - r.height / 2) * .35);
    });
    el.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });
}

// ---------- hero name: split, rise, then settle from wide to condensed; letters swell near the pointer ----------
function initName() {
  const name = $('.hero__name');
  const split = SplitText.create(name.querySelectorAll('.line'), { type: 'chars', charsClass: 'char' });
  const chars = split.chars;
  gsap.set(name.querySelectorAll('.line'), { clipPath: 'inset(-20% -100vw 0 -20%)' });
  const tl = gsap.timeline({ delay: .1 });
  tl.from(chars, { yPercent: 110, duration: 1.0, ease: 'expo.out', stagger: .035 })
    .fromTo(chars, { '--w': 125 }, { '--w': 62, duration: 1.3, ease: 'expo.inOut', stagger: { each: .025, from: 'center' } }, .25)
    .from('.hero__lede, .hero .hero__actions, .hero__top', { y: 24, opacity: 0, duration: .8, ease: 'power3.out', stagger: .08 }, .7)
    .from('.proof__item', { y: 30, opacity: 0, duration: .7, ease: 'power3.out', stagger: .07 }, .9)
    .from('.hero__hint', { opacity: 0, y: 10, duration: .5 }, 1.6)
    .add(() => gsap.set(name.querySelectorAll('.line'), { clipPath: 'none' }));

  if (!finePointer) return;
  const setters = chars.map(c => gsap.quickTo(c, '--w', { duration: .6, ease: 'power3' }));
  let rects = [];
  const measure = () => { rects = chars.map(c => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); };
  let active = false;
  name.addEventListener('pointerenter', () => { measure(); active = true; });
  name.addEventListener('pointerleave', () => { active = false; setters.forEach(s => s(62)); });
  name.addEventListener('pointermove', e => {
    if (!active || tl.isActive()) return;
    rects.forEach((p, i) => {
      const d = Math.hypot(e.clientX - p.x, (e.clientY - p.y) * 1.6);
      const k = Math.max(0, 1 - d / 260);
      setters[i](62 + k * k * 63);
    });
  });
}

// ---------- counters ----------
function initCounters() {
  $$('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), sep = el.hasAttribute('data-sep');
    const o = { v: 0 };
    const fmt = v => sep ? Math.round(v).toLocaleString('en-IN') : v.toFixed(dec);
    gsap.to(o, {
      v: end, duration: 1.6, ease: 'power3.out', delay: 1,
      onUpdate: () => (el.textContent = fmt(o.v)),
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
    });
  });
}

// ---------- featured covers: pinned horizontal track on desktop ----------
let coverScroll = null;
function initIssues(mm) {
  const section = $('.issues'), track = $('#track'), rail = $('#rail');
  mm.add('(min-width: 901px)', () => {
    section.classList.add('js-hscroll');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.issues__viewport',
        start: 'center center',
        end: () => '+=' + dist(),
        pin: '.issues__viewport',
        scrub: .6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: s => gsap.set(rail, { scaleX: s.progress }),
      },
    });
    // a cover "prints" into full colour as it passes the middle of the screen
    $$('.cover', track).forEach(c => {
      ScrollTrigger.create({
        trigger: c, containerAnimation: tween, start: 'left 62%', end: 'right 38%',
        toggleClass: 'live',
      });
      const sfx = $('.cover__sfx', c);
      gsap.from(sfx, {
        scale: 2.6, rotate: -30, opacity: 0, ease: 'back.out(2)', duration: .5,
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 80%', toggleActions: 'play none none reverse' },
      });
    });
    coverScroll = cover => {
      const st = tween.scrollTrigger;
      const x = Math.min(dist(), Math.max(0, cover.offsetLeft - (innerWidth - cover.offsetWidth) / 2));
      const y = st.start + (x / Math.max(1, dist())) * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 1.6 }); else scrollTo({ top: y, behavior: 'smooth' });
    };
    return () => { section.classList.remove('js-hscroll'); coverScroll = null; };
  });

  mm.add('(max-width: 900px)', () => {
    $$('.cover').forEach(c => {
      ScrollTrigger.create({ trigger: c, start: 'top 60%', end: 'bottom 40%', toggleClass: 'live' });
      gsap.from(c, { y: 40, opacity: 0, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 92%', once: true } });
    });
  });
}

// ---------- the strip: panels ink in, SFX get stamped ----------
function initStrip() {
  $$('[data-panel]').forEach((p, i) => {
    gsap.from(p, {
      clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.out',
      scrollTrigger: { trigger: p, start: 'top 82%', once: true },
      onComplete: () => gsap.set(p, { clearProps: 'clipPath' }),
    });
    const inner = $$(':scope > *:not([data-sfx])', p);
    gsap.from(inner, { y: 18, opacity: 0, duration: .6, ease: 'power3.out', stagger: .06, delay: .2, scrollTrigger: { trigger: p, start: 'top 82%', once: true } });
  });
  $$('[data-sfx]').forEach(s => {
    gsap.from(s, { scale: 2.4, rotate: -18, opacity: 0, duration: .5, ease: 'back.out(2.2)', delay: .45, scrollTrigger: { trigger: s, start: 'top 85%', once: true } });
  });
  gsap.from('.ocr .bad s', { color: 'currentColor', textDecorationColor: 'transparent', duration: .4, delay: .9, scrollTrigger: { trigger: '.ocr', start: 'top 85%', once: true } });
  gsap.from('.metrics div', { x: -20, opacity: 0, duration: .5, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.metrics', start: 'top 88%', once: true } });
}

// ---------- generic section reveals ----------
function initReveals() {
  $$('.sec__head').forEach(h => {
    const h2 = $('.h2', h);
    if (h2) SplitText.create(h2, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: s => gsap.from(s.lines, { yPercent: 105, duration: 1, ease: 'expo.out', stagger: .09, scrollTrigger: { trigger: h, start: 'top 85%', once: true } }),
    });
    gsap.from($$('.sec__no, p', h), { y: 16, opacity: 0, duration: .7, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
  });
  gsap.from('.ledger__row', { y: 24, opacity: 0, duration: .55, ease: 'power3.out', stagger: .035, scrollTrigger: { trigger: '.ledger', start: 'top 85%', once: true } });
  gsap.from('.job, .kit', { y: 30, opacity: 0, duration: .7, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.log', start: 'top 82%', once: true } });
  gsap.from('.kit li', { scale: .6, opacity: 0, duration: .35, ease: 'back.out(2)', stagger: .015, scrollTrigger: { trigger: '.log__kit', start: 'top 80%', once: true } });
  gsap.from('.origin__photo img', { scale: 1.25, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.origin', start: 'top 80%', once: true } });
  gsap.from('.origin__text > *', { y: 20, opacity: 0, duration: .7, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '.origin', start: 'top 78%', once: true } });

  const big = $('.signal__big');
  SplitText.create(big, {
    type: 'lines,chars', mask: 'lines', charsClass: 'char',
    onSplit: s => gsap.from(s.chars, { yPercent: 110, '--w': 125, duration: 1.1, ease: 'expo.out', stagger: .02, scrollTrigger: { trigger: '.signal', start: 'top 70%', once: true } }),
  });
  gsap.from('.signal__row, .signal .hero__actions', { y: 24, opacity: 0, duration: .8, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: '.signal', start: 'top 60%', once: true } });
}

// ---------- boot ----------
function boot() {
  initMasthead();
  startHero();
  if (!gsap) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  initPeek();
  if (reduced) return;

  initMagnetic();
  initName();
  initCounters();
  const mm = gsap.matchMedia();
  initIssues(mm);
  initStrip();
  initReveals();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
}

if (!reduced && window.Lenis) {
  lenis = new window.Lenis({ lerp: .11, smoothWheel: true });
  if (window.gsap) {
    lenis.on('scroll', () => window.ScrollTrigger?.update());
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}
boot();
