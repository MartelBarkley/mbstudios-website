/* ═══════════════════════════════════════════════════════════════
   MB Studios — script.js
   ═══════════════════════════════════════════════════════════════ */

/* ── EmailJS Config ──────────────────────────────────────────────
   Replace the placeholders below with your actual EmailJS values.
   Sign up at https://www.emailjs.com/ (free tier works great)
   ─────────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY  = 'xjo2HUAx5n0pSar3X';   // Account → API Keys
const EMAILJS_SERVICE_ID  = 'service_23wmayu';   // Email Services tab
const EMAILJS_TEMPLATE_ID = 'template_xshwkde';  // Email Templates tab

/* ── Calendly Config ─────────────────────────────────────────────
   Replace with your Calendly scheduling link.
   ─────────────────────────────────────────────────────────────── */
const CALENDLY_URL = 'https://calendly.com/martel-barkley/30min';

/* ════════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  emailjs.init(EMAILJS_PUBLIC_KEY);

  initCursor();
  initNav();
  initMobileMenu();
  initScrollReveal();
  initCounterAnimation();
  initContactForm();
  setYear();
});

/* ── Custom Cursor ────────────────────────────────────────────── */
function initCursor() {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (!cursor || !cursorDot) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // Smooth follow for the ring
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.12;
    cursorY += (mouseY - cursorY) * 0.12;
    cursor.style.left = cursorX + 'px';
    cursor.style.top  = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover state
  const hoverEls = document.querySelectorAll('a, button, .service-card, .work-card, input, textarea, select');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ── Nav Scroll Behavior ──────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── Mobile Hamburger ─────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';

    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    }
  }

  hamburger.addEventListener('click', toggleMenu);
  mobileLinks.forEach(link => link.addEventListener('click', () => {
    if (isOpen) toggleMenu();
  }));
}

/* ── Scroll Reveal ────────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
}

/* ── Counter Animation ────────────────────────────────────────── */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-num');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ── Contact Form (EmailJS) ───────────────────────────────────── */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText   = submitBtn?.querySelector('.btn-text');
  const btnLoad   = submitBtn?.querySelector('.btn-loading');
  const success   = document.getElementById('formSuccess');
  const error     = document.getElementById('formError');

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    // Loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoad.style.display = 'inline';
    success.style.display = 'none';
    error.style.display   = 'none';

    const templateParams = {
      from_name:  `${form.firstName.value} ${form.lastName.value}`,
      from_email: form.email.value,
      service:    form.service.value,
      budget:     form.budget.value || 'Not specified',
      message:    form.message.value,
      reply_to:   form.email.value,
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      success.style.display = 'block';
      form.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      error.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoad.style.display = 'none';
    }
  });
}

function validateForm(form) {
  const required = form.querySelectorAll('[required]');
  let valid = true;

  required.forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#e57373';
      valid = false;
    }
  });

  const emailField = form.querySelector('#email');
  if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
    emailField.style.borderColor = '#e57373';
    valid = false;
  }

  return valid;
}

/* ── Calendly Popup ───────────────────────────────────────────── */
function openCalendly() {
  // If you have Calendly's widget script loaded, use popup:
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  } else {
    // Fallback: open in new tab
    window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
  }
}

/* ── Footer Year ──────────────────────────────────────────────── */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}
