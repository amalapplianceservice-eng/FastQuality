/* ===== Fast Quality Appliance Repair — main.js ===== */

// Mobile navigation
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  mainNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Booking form
const form = document.getElementById('order-form');

if (form) {
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';

    const data = new FormData(form);
    data.append('page', location.href);

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, { method: 'POST', body: data });
      const json = await res.json();
      if (json.ok) {
        form.reset();
        status.textContent = 'Thank you! Your request has been sent — we will call you back shortly.';
        status.classList.add('ok');
      } else {
        throw new Error(json.error || 'send');
      }
    } catch (err) {
      status.textContent = 'Something went wrong. Please call us at 909-554-3252.';
      status.classList.add('err');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit';
    }
  });
}

// Leaflet map (loaded with defer; init when everything is ready)
window.addEventListener('load', () => {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  const coords = [33.9732732, -117.3475771];
  const map = L.map(mapEl, { scrollWheelZoom: false }).setView(coords, 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker(coords).addTo(map)
    .bindPopup('<strong>Fast Quality Appliance Repair</strong><br>4020 Chicago Ave, Ste 1039<br>Riverside, CA 92507')
    .openPopup();
});
