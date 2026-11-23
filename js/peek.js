/* bhwebs.com — "look inside" (Nov 23 2026, his ask: people should see the client sites without leaving bhwebs.com).
   Any link with data-peek="slug" opens a window on this page with the whole front page of that site
   (/images/peek/<slug>.webp|.jpg) and an "Open the live site" button. Without JavaScript the link just opens the site.
   Also drives the arrows of the scrolling strip (.strip-row). ES5 only (old iPads). */
(function () {
  if (!document.querySelector || !window.addEventListener) return;
  var root = document.documentElement, box = null, last = null;
  var calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function host(u) { var a = document.createElement('a'); a.href = u; return (a.hostname || '').replace(/^www\./, ''); }
  function q(s) { return box.querySelector(s); }

  function build() {
    box = document.createElement('div');
    box.className = 'peek';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'peek-h');
    box.hidden = true;
    box.innerHTML = '<div class="peek-bg" data-x="1"></div>' +
      '<div class="peek-win">' +
        '<div class="peek-bar"><span class="peek-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="peek-url"></span>' +
        '<h2 class="peek-h" id="peek-h"></h2>' +
        '<a class="btn peek-go" target="_blank" rel="noopener">Open the live site<span class="ar" aria-hidden="true">↗</span></a>' +
        '<button type="button" class="peek-x" data-x="1" aria-label="Close">×</button></div>' +
        '<div class="peek-scroll" tabindex="0"><div class="peek-pic"></div>' +
        '<p class="peek-end">That is the whole front page. <a class="tlink peek-go2" target="_blank" rel="noopener">Open the live site ↗</a></p></div>' +
      '</div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var t = e.target;
      while (t && t !== box) { if (t.getAttribute && t.getAttribute('data-x')) { close(); return; } t = t.parentNode; }
    });
  }

  function open(a) {
    if (!box) build();
    last = a;
    var slug = a.getAttribute('data-peek'), url = a.href, nm = a.querySelector('.nm');
    var name = nm ? (nm.textContent || nm.innerText || '') : host(url);
    q('.peek-h').textContent = name;
    q('.peek-url').textContent = host(url);
    q('.peek-go').href = url;
    q('.peek-go2').href = url;
    q('.peek-pic').innerHTML = '<picture><source type="image/webp" srcset="/images/peek/' + slug + '.webp">' +
      '<img src="/images/peek/' + slug + '.jpg" width="900" alt="' + name.replace(/"/g, '&quot;') + ' website: the whole front page"></picture>';
    q('.peek-scroll').scrollTop = 0;
    box.hidden = false;
    if (!/(^| )peek-on( |$)/.test(root.className)) root.className += ' peek-on';
    q('.peek-x').focus();
  }

  function close() {
    if (!box || box.hidden) return;
    box.hidden = true;
    q('.peek-pic').innerHTML = '';
    root.className = root.className.replace(/(^| )peek-on( |$)/g, ' ').replace(/^ +| +$/g, '');
    if (last && last.focus) last.focus();
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || (e.button && e.button !== 0) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var t = e.target;
    while (t && t !== document) {
      if (t.tagName === 'A' && t.getAttribute('data-peek')) { e.preventDefault(); open(t); return; }
      t = t.parentNode;
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!box || box.hidden) return;
    if (e.keyCode === 27) { close(); return; }
    if (e.keyCode !== 9) return;
    var f = box.querySelectorAll('a[href],button,[tabindex="0"]');
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* strip arrows: one press = most of a screen of cards; buttons go grey at either end */
  var navs = document.querySelectorAll('[data-strip]');
  for (var i = 0; i < navs.length; i++) (function (nav) {
    var row = document.getElementById(nav.getAttribute('data-strip'));
    if (!row) return;
    var prev = nav.querySelector('[data-dir="-1"]'), next = nav.querySelector('[data-dir="1"]');
    function step() { var li = row.querySelector('li'); var w = li ? li.offsetWidth + 20 : 320; return Math.max(w, Math.floor(row.clientWidth / w) * w - w); }
    function go(d) {
      var x = d * step();
      if (!calm && row.scrollBy && 'scrollBehavior' in root.style) row.scrollBy({ left: x, behavior: 'smooth' });
      else row.scrollLeft += x;
    }
    function state() {
      if (prev) prev.disabled = row.scrollLeft <= 2;
      if (next) next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 2;
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    row.addEventListener('scroll', state);
    window.addEventListener('resize', state);
    nav.className += ' on';
    state();
  })(navs[i]);
})();
