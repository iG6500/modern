/* Lead küldés: FormSubmit (e-mail továbbítás). Hiba esetén cb(false). */
window.MKLead = (function () {
  var ENDPOINT = 'https://formsubmit.co/ajax/modern.konstrukt@gmail.com';
  function tracking() {
    var o = {}, q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].forEach(function (k) { if (q.get(k)) o[k] = q.get(k); });
    if (document.referrer) o.referrer = document.referrer;
    return o;
  }
  return {
    send: function (data, cb) {
      (window.dataLayer = window.dataLayer || []).push({ event: 'generate_lead', lead_type: data.tipus });
      var payload = Object.assign({ _subject: 'Új ajánlatkérés – ' + data.tipus + ' – ' + data.telefon, _template: 'table' }, data, tracking());
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { cb(r.ok); }).catch(function () { cb(false); });
    }
  };
})();
