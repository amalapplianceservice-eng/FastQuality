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
      setTimeout(hidePreloader, 1400);
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

  // How-it-works: wheel-hijack (single card, horizontal slide)
  var hiwSection = document.querySelector('.hiw');
  if (hiwSection) {
    var steps = [
      { num: '01', title: 'Set an Appointment', desc: 'Call or book online and tell us the appliance and what\u2019s going wrong.' },
      { num: '02', title: 'Diagnosis & Estimate', desc: 'Our experienced technician evaluates your appliance, explains the issue, and gives you a clear repair estimate.' },
      { num: '03', title: 'Quick, Easy Repair', desc: 'We restore your appliance to full functionality with prompt, professional repair service.' },
      { num: '04', title: 'Enjoy & Review', desc: 'Enjoy your fully working appliance — and let us know how we did with a quick review.' }
    ];
    var hiwCardInner = hiwSection.querySelector('.hiw-card-inner');
    var hiwCur = hiwSection.querySelector('.hiw-cur');
    var hiwFill = hiwSection.querySelector('.hiw-progress-fill');
    var hiwPrev = hiwSection.querySelector('.hiw-arrow-prev');
    var hiwNext = hiwSection.querySelector('.hiw-arrow-next');
    var hiwAnimTimer;
    var hiwStep = 0;
    var hiwLocked = false;
    var hiwStepTime = 0;
    var hiwUnlockTime = 0;
    var hiwLastScrollY = 0;

    function hiwRender(index, direction) {
      clearTimeout(hiwAnimTimer);
      var s = steps[index];
      var exitX = direction === 'down' ? '-40px' : '40px';
      var enterX = direction === 'down' ? '40px' : '-40px';

      hiwCardInner.style.transition = 'opacity .28s ease-in, transform .28s ease-in';
      hiwCardInner.style.opacity = '0';
      hiwCardInner.style.transform = 'translateX(' + exitX + ')';

      hiwCur.textContent = String(index + 1);
      hiwFill.style.width = ((index + 1) / steps.length * 100) + '%';

      hiwAnimTimer = setTimeout(function () {
        hiwCardInner.querySelector('.hiw-num').textContent = s.num;
        hiwCardInner.querySelector('.hiw-title').textContent = s.title;
        hiwCardInner.querySelector('.hiw-desc').textContent = s.desc;

        hiwCardInner.style.transition = 'none';
        hiwCardInner.style.transform = 'translateX(' + enterX + ')';
        void hiwCardInner.offsetHeight;

        hiwCardInner.style.transition = 'opacity .5s cubic-bezier(.22,.61,.36,1), transform .5s cubic-bezier(.22,.61,.36,1)';
        hiwCardInner.style.opacity = '1';
        hiwCardInner.style.transform = 'translateX(0)';
        hiwUpdateArrows();
      }, 280);
    }

    function hiwUpdateArrows() {
      if (hiwPrev) hiwPrev.classList.toggle('is-disabled', hiwStep <= 0);
      if (hiwNext) hiwNext.classList.toggle('is-disabled', hiwStep >= steps.length - 1);
    }

    function hiwSetStep(index) {
      var s = steps[index];
      hiwCardInner.querySelector('.hiw-num').textContent = s.num;
      hiwCardInner.querySelector('.hiw-title').textContent = s.title;
      hiwCardInner.querySelector('.hiw-desc').textContent = s.desc;
      hiwCardInner.style.transition = 'none';
      hiwCardInner.style.opacity = '1';
      hiwCardInner.style.transform = 'translateX(0)';
      hiwCur.textContent = String(index + 1);
      hiwFill.style.width = ((index + 1) / steps.length * 100) + '%';
      hiwUpdateArrows();
    }

    function hiwLock(goingDown) {
      hiwLocked = true;
      hiwStepTime = Date.now();
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, hiwSection.offsetTop);
      if (goingDown) {
        hiwStep = 0;
        hiwSetStep(0);
      } else {
        hiwStep = steps.length - 1;
        hiwSetStep(steps.length - 1);
      }
    }

    function hiwUnlock(scrollTarget) {
      hiwLocked = false;
      hiwUnlockTime = Date.now();
      document.documentElement.style.overflow = '';
      if (scrollTarget != null) {
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
    }

    window.addEventListener('wheel', function (e) {
      if (hiwLocked) {
        e.preventDefault();
        if (Date.now() - hiwStepTime < 700) return;
        var dir = e.deltaY > 0 ? 1 : -1;
        var next = hiwStep + dir;
        if (next < 0) { hiwUnlock(); return; }
        if (next >= steps.length) {
          hiwUnlock(hiwSection.offsetTop + hiwSection.offsetHeight);
          return;
        }
        hiwStepTime = Date.now();
        hiwStep = next;
        hiwRender(hiwStep, dir > 0 ? 'down' : 'up');
        return;
      }
      if (Date.now() - hiwUnlockTime < 1200) return;
      var rect = hiwSection.getBoundingClientRect();
      if (rect.top <= 60 && rect.bottom > window.innerHeight * 0.5) {
        e.preventDefault();
        hiwLock(e.deltaY > 0);
      }
    }, { passive: false });

    window.addEventListener('scroll', function () {
      var sy = window.scrollY;
      var goingDown = sy > hiwLastScrollY;
      hiwLastScrollY = sy;
      if (hiwLocked) return;
      if (Date.now() - hiwUnlockTime < 1200) return;
      var rect = hiwSection.getBoundingClientRect();
      if (rect.top <= 0 && rect.bottom > window.innerHeight * 0.5) {
        hiwLock(goingDown);
      }
    }, { passive: true });

    var hiwTouchY = 0;
    var hiwTouchActive = false;
    hiwSection.addEventListener('touchstart', function (e) {
      hiwTouchY = e.touches[0].clientY;
      hiwTouchActive = false;
    }, { passive: true });
    hiwSection.addEventListener('touchmove', function (e) {
      if (!hiwLocked || Date.now() - hiwStepTime < 1000 || hiwTouchActive) return;
      var dy = hiwTouchY - e.touches[0].clientY;
      if (Math.abs(dy) < 50) return;
      hiwTouchActive = true;
      hiwTouchY = e.touches[0].clientY;
      var dir = dy > 0 ? 1 : -1;
      var next = hiwStep + dir;
      if (next < 0) { hiwLocked = false; hiwUnlockTime = Date.now(); return; }
      if (next >= steps.length) {
        hiwLocked = false;
        hiwUnlockTime = Date.now();
        window.scrollTo({ top: hiwSection.offsetTop + hiwSection.offsetHeight, behavior: 'smooth' });
        e.preventDefault();
        return;
      }
      e.preventDefault();
      hiwStepTime = Date.now();
      hiwStep = next;
      hiwRender(hiwStep, dir > 0 ? 'down' : 'up');
    }, { passive: false });

    if (hiwPrev) {
      hiwPrev.addEventListener('click', function () {
        if (hiwStep <= 0 || Date.now() - hiwStepTime < 700) return;
        hiwStepTime = Date.now();
        hiwStep--;
        hiwRender(hiwStep, 'up');
      });
    }
    if (hiwNext) {
      hiwNext.addEventListener('click', function () {
        if (hiwStep >= steps.length - 1 || Date.now() - hiwStepTime < 700) return;
        hiwStepTime = Date.now();
        hiwStep++;
        hiwRender(hiwStep, 'down');
      });
    }
    hiwUpdateArrows();
  }

  // Service accordion panels
  var panels = document.querySelectorAll('.svc-panel');
  var prevBtn = document.querySelector('.svc-arrow-prev');
  var nextBtn = document.querySelector('.svc-arrow-next');

  function activatePanel(index) {
    panels.forEach(function (p) { p.classList.remove('active'); });
    panels[index].classList.add('active');
  }
  function getActiveIndex() {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].classList.contains('active')) return i;
    }
    return 0;
  }

  panels.forEach(function (panel) {
    panel.addEventListener('click', function (e) {
      if (e.target.closest('.svc-panel-link')) return;
      activatePanel(Array.prototype.indexOf.call(panels, panel));
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      var idx = getActiveIndex();
      activatePanel(idx > 0 ? idx - 1 : panels.length - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      var idx = getActiveIndex();
      activatePanel(idx < panels.length - 1 ? idx + 1 : 0);
    });
  }

  // Animated counters (bento cards)
  var counters = document.querySelectorAll('.bento-num');
  var counterDone = false;
  function animateCounters() {
    if (counterDone) return;
    counterDone = true;
    counters.forEach(function (el) {
      var target = parseFloat(el.dataset.target);
      var prefix = el.dataset.prefix || '';
      var suffix = el.dataset.suffix || '';
      var decimals = parseInt(el.dataset.decimals) || 0;
      var duration = 1800;
      var start = performance.now();
      function tick(now) {
        var t = Math.min((now - start) / duration, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        var val = (ease * target).toFixed(decimals);
        el.textContent = prefix + val + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if (counters.length) {
    var bentoSection = document.querySelector('.commercial-bento');
    if (bentoSection && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
      }, { threshold: 0.3 }).observe(bentoSection);
    }
  }

  // Service-area map (Leaflet + dark CARTO tiles, brand-colored zone)
  var mapEl = document.getElementById('serviceMap');
  if (mapEl && window.L) {
    var map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: true });
    map.attributionControl.setPrefix(false);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap, &copy; CARTO'
    }).addTo(map);

    // Service area — Inland Empire (matches Google Business Profile coverage)
    var serviceArea = [
      [34.12, -117.72], [34.17, -117.55], [34.18, -117.35], [34.17, -117.20],
      [34.12, -117.08], [34.05, -116.98], [33.93, -116.97], [33.78, -117.02],
      [33.70, -117.17], [33.68, -117.35], [33.73, -117.50], [33.82, -117.58],
      [33.93, -117.68], [34.02, -117.73]
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
            btn.textContent = 'Couldn\u2019t send — call 909-554-3252';
            btn.disabled = false;
            setTimeout(function () { btn.textContent = original; }, 4500);
          }
        })
        .catch(function () {
          btn.textContent = 'Couldn\u2019t send — call 909-554-3252';
          btn.disabled = false;
          setTimeout(function () { btn.textContent = original; }, 4500);
        });
    });
  });
})();
