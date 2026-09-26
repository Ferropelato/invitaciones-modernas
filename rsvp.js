/* Sellomail · Invitaciones digitales
   Manda las confirmaciones del formulario #rsvpForm a la lista privada del evento.
   Uso: <script src="/rsvp.js" data-evento="boda-vale-rodri" defer></script> */
(function () {
  var s = document.currentScript;
  var evento = s && s.getAttribute('data-evento');
  if (!evento) return;
  var API = 'https://puente.sellomail.com/api/rsvp';
  var demo = evento.indexOf('demo-') === 0;

  function aviso(texto, dondeAntes) {
    var p = document.createElement('p');
    p.className = 'rsvp-aviso';
    p.setAttribute('role', 'status');
    p.style.cssText = 'margin-top:14px;font-size:13px;line-height:1.6;opacity:.85';
    p.textContent = texto;
    dondeAntes.parentNode.insertBefore(p, dondeAntes.nextSibling);
    return p;
  }

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.id !== 'rsvpForm') return;
    e.preventDefault();
    e.stopImmediatePropagation();

    var datos = {};
    var campos = f.querySelectorAll('input,select,textarea');
    for (var i = 0; i < campos.length; i++) {
      var el = campos[i];
      if (el.id && el.value) datos[el.id] = el.value;
    }
    if (!datos.nombre || !datos.asistencia) {
      var falta = f.querySelector(!datos.nombre ? '#nombre' : '#asistencia');
      if (falta) falta.focus();
      return;
    }

    var boton = f.querySelector('button[type="submit"],button:not([type])');
    var textoBoton = boton ? boton.textContent : '';
    if (boton) { boton.disabled = true; boton.textContent = 'Enviando…'; }
    var previo = f.parentNode.querySelector('.rsvp-aviso');
    if (previo) previo.remove();

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ evento: evento, datos: datos })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || !j.ok) throw new Error(j.error || 'error');
      });
    }).then(function () {
      f.style.display = 'none';
      var ok = document.getElementById('rsvpConfirm');
      if (ok) ok.style.display = 'block';
      if (demo && ok) aviso('Esto es un modelo de muestra. En tu invitación, cada confirmación te llega por email y la ves en una lista privada, lista para pasar a Excel.', ok);
    }).catch(function (err) {
      if (boton) { boton.disabled = false; boton.textContent = textoBoton; }
      aviso(err && err.message === 'limite'
        ? 'Recibimos muchas confirmaciones desde esta conexión. Probá de nuevo en un rato.'
        : 'No pudimos enviar tu confirmación. Revisá tu conexión y probá de nuevo.', f);
    });
  }, true);

  if (!demo) return;

  // Modelos de muestra: el álbum no tiene carpeta real, y abajo va el acceso para pedir la tuya.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="LINK_AQUI"]');
    if (!a) return;
    e.preventDefault();
    if (a.parentNode.querySelector('.rsvp-aviso')) return;
    aviso('En tu invitación, este botón abre la carpeta compartida de tu evento para que todos suban sus fotos.', a);
  });

  function cinta() {
    var c = document.createElement('a');
    c.href = 'https://invitaciones.sellomail.com/#precio';
    c.textContent = 'Modelo de muestra · Quiero una así →';
    c.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:999;' +
      'background:#6B35D9;color:#fff;font:500 13px/1 "DM Sans",system-ui,sans-serif;letter-spacing:.02em;' +
      'padding:12px 20px;border-radius:99px;text-decoration:none;box-shadow:0 8px 24px rgba(13,11,20,.28);white-space:nowrap';
    document.body.appendChild(c);
    document.body.style.paddingBottom = '72px';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cinta); else cinta();
})();
