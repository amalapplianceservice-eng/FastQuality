/* Fast Quality Appliance Repair — interactivity */
(function () {
  'use strict';

  // Preloader — hide once the page has loaded
  var preloader = document.getElementById('preloader');
  if (preloader) {
    document.documentElement.classList.add('no-scroll');
    var hidePreloader = function () {
      preloader.classList.add('is-hidden');
      document.documentElement.classList.remove('no-scroll');
      setTimeout(function () { if (preloader.parentNode) preloader.remove(); }, 600);
    };
    window.addEventListener('load', function () {
      setTimeout(hidePreloader, 400);
    });
    setTimeout(hidePreloader, 4000);
  }

  // Mobile menu toggle
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      });
    });
  }

  // FAQ accordion — keep only one open at a time
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // Service-area map (Leaflet + dark CARTO tiles, brand-colored zone)
  var mapEl = document.getElementById('serviceMap');
  if (mapEl && window.L) {
    var map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true });
    map.attributionControl.setPrefix(false);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap, &copy; CARTO'
    }).addTo(map);

    // Service area — Inland Empire (Riverside & San Bernardino County region)
    var serviceArea = [
      [34.30, -117.80], [34.32, -117.40], [34.30, -117.00], [34.20, -116.80],
      [34.05, -116.75], [33.90, -116.80], [33.78, -116.95], [33.72, -117.20],
      [33.72, -117.45], [33.78, -117.65], [33.85, -117.80], [33.95, -117.92],
      [34.08, -117.95], [34.20, -117.90]
    ];
    var poly = L.polygon(serviceArea, {
      color: '#5C9BE0', weight: 2.5, opacity: 1,
      fillColor: '#2C6FBF', fillOpacity: 0.25
    }).addTo(map);

    L.circleMarker([33.9732732, -117.3475771], {
      radius: 9, color: '#5C9BE0', weight: 4, fillColor: '#ffffff', fillOpacity: 1
    }).addTo(map).bindPopup('Fast Quality Appliance Repair &mdash; Riverside, CA');

    map.fitBounds(poly.getBounds(), { padding: [24, 24] });
  }

  // Current year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Booking modal — open from any link/button pointing to #book
  var bookingModal = document.getElementById('booking-modal');
  if (bookingModal) {
    var openModal = function (e) {
      if (e) e.preventDefault();
      bookingModal.hidden = false;
      document.documentElement.classList.add('no-scroll');
      var firstField = bookingModal.querySelector('input, select');
      if (firstField) setTimeout(function () { firstField.focus(); }, 60);
    };
    var closeModal = function () {
      bookingModal.hidden = true;
      document.documentElement.classList.remove('no-scroll');
    };
    document.querySelectorAll('a[href="#book"]').forEach(function (a) {
      a.addEventListener('click', openModal);
    });
    var closeBtn = bookingModal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    bookingModal.addEventListener('click', function (e) {
      if (e.target === bookingModal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !bookingModal.hidden) closeModal();
    });
  }

  // Booking forms — applies to inline + modal forms
  document.querySelectorAll('.book-form').forEach(function (form) {
    var applianceSel = form.querySelector('select[name="appliance"]');
    var issueField = form.querySelector('.issue-field');
    if (applianceSel && issueField) {
      var issueInput = issueField.querySelector('input, textarea');
      var syncIssue = function () {
        var show = applianceSel.value === 'Other';
        issueField.hidden = !show;
        if (issueInput) issueInput.required = show;
      };
      applianceSel.addEventListener('change', syncIssue);
      syncIssue();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';

      var data = new FormData(form);
      data.append('page', document.title + ' — ' + location.href);

      fetch('/contact.php', { method: 'POST', body: data })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            btn.textContent = '✓ Request received!';
            form.reset();
            if (issueField) { issueField.hidden = true; }
            setTimeout(function () {
              btn.textContent = original;
              btn.disabled = false;
              var overlay = form.closest('.modal-overlay');
              if (overlay) {
                overlay.hidden = true;
                document.documentElement.classList.remove('no-scroll');
              }
            }, 3500);
          } else {
            btn.textContent = 'Couldn’t send — call 909-554-3252';
            btn.disabled = false;
            setTimeout(function () { btn.textContent = original; }, 4500);
          }
        })
        .catch(function () {
          btn.textContent = 'Couldn’t send — call 909-554-3252';
          btn.disabled = false;
          setTimeout(function () { btn.textContent = original; }, 4500);
        });
    });
  });
})();
