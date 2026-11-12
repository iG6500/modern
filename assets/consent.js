/* Süti-hozzájárulás. Az oldal alapvetően nem használ követő sütit.
   A látogatottsági statisztika (GoatCounter, sütimentes) csak hozzájárulás után töltődik be. */
(function () {
  'use strict';
  var KEY = 'mk-consent', GC = 'https://modernkonstrukt.goatcounter.com/count', GCSRC = '//gc.zgo.at/count.js';
  var get = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var set = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };
  var loaded = false, box;
  function loadStats() {
    if (loaded) return; loaded = true;
    var s = document.createElement('script');
    s.async = true; s.setAttribute('data-goatcounter', GC); s.src = GCSRC;
    document.head.appendChild(s);
  }
  function build() {
    box = document.createElement('div');
    box.className = 'ck'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', 'ckT'); box.hidden = true;
    box.innerHTML = '<h2 id="ckT">Süti-beállítások</h2>' +
      '<p>Az oldal működéséhez nincs szükség követő sütikre. Névtelen látogatottsági statisztikát (GoatCounter) csak a hozzájárulásoddal mérünk. Részletek az <a href="#">adatkezelési tájékoztatóban</a>.</p>' +
      '<div class="ck-b"><button type="button" class="pri" data-ck="all">Elfogadom</button><button type="button" data-ck="necessary">Csak a szükségesek</button></div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]'); if (!b) return;
      var v = b.getAttribute('data-ck'); set(v); box.hidden = true;
      if (v === 'all') loadStats();
    });
  }
  function open() { if (!box) build(); box.hidden = false; var b = box.querySelector('button'); if (b) b.focus(); }
  function init() {
    var c = get();
    if (c === 'all') loadStats();
    else if (!c) { build(); setTimeout(function () { box.hidden = false; }, 600); }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-cookie-settings]'); if (a) { e.preventDefault(); open(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
