// Shared interactions for every page: custom cursor, contact overlay
// (choice / form / sent), topic chips, and the iDrop website tabs.
(function () {
  'use strict';

  var MAIL = 'an.kirschbauer@gmail.com';
  var STRINGS = {
    de: { subject: 'Projektanfrage von ', mail: 'E-Mail', project: 'Projekt', message: 'Nachricht' },
    en: { subject: 'Project request from ', mail: 'Email', project: 'Project', message: 'Message' }
  };
  var t = STRINGS[document.documentElement.lang] || STRINGS.de;

  var state = { open: false, ox: 0, oy: 0, view: 'choice', chips: {}, tab: 0 };

  var shown = {
    view: function (v) { return state.view === v; },
    chip: function (i, mode) { return !!state.chips[i] === (mode === 'on'); },
    tab: function (i, mode) {
      var on = state.tab === Number(i);
      return mode === undefined || mode === 'on' ? on : !on;
    }
  };

  var overlay = document.querySelector('[data-contact]');

  function render() {
    document.querySelectorAll('[data-if]').forEach(function (el) {
      var parts = el.getAttribute('data-if').split(':');
      el.hidden = !shown[parts[0]](parts[1], parts[2]);
    });
    if (!overlay) return;
    overlay.style.clipPath = 'circle(' + (state.open ? '150vmax' : '0px') + ' at ' + state.ox + 'px ' + state.oy + 'px)';
    overlay.style.pointerEvents = state.open ? 'auto' : 'none';
    overlay.setAttribute('aria-hidden', state.open ? 'false' : 'true');
  }

  var actions = {
    'open-contact': function (e) {
      e.preventDefault();
      state.open = true;
      state.ox = e.clientX || window.innerWidth / 2;
      state.oy = e.clientY || window.innerHeight / 2;
      state.view = 'choice';
    },
    'close-contact': function () { state.open = false; state.view = 'choice'; },
    'open-form': function () { state.view = 'form'; },
    'back-to-choice': function () { state.view = 'choice'; },
    'toggle-chip': function (e, el) {
      var i = el.getAttribute('data-index');
      state.chips[i] = !state.chips[i];
    },
    'pick-tab': function (e, el) { state.tab = Number(el.getAttribute('data-index')); }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    actions[el.getAttribute('data-action')](e, el);
    render();
  });

  var form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value, mail = form.elements.email.value, msg = form.elements.message.value;
      // one label per chip index: read from the visible-when-off button so the text matches the page language
      var topics = Object.keys(state.chips).filter(function (i) { return state.chips[i]; }).map(function (i) {
        return form.querySelector('[data-if="chip:' + i + ':off"] button').textContent;
      }).join(', ');
      var body = 'Name: ' + name + '\n' + t.mail + ': ' + mail + '\n' + t.project + ': ' + (topics || '-') + '\n\n' + t.message + ':\n' + msg;
      window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(t.subject + name) + '&body=' + encodeURIComponent(body);
      state.view = 'sent';
      render();
    });
  }

  var site = document.querySelector('.site');
  var cursor = document.querySelector('.cursor');
  if (site && cursor) {
    site.addEventListener('mousemove', function (e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursor.style.opacity = '1';
    });
    site.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; });
  }
})();
