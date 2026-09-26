/* プロフィールのページの動き(案A「静かに現れる」):動かす部分に印(fx)をつけ、画面に入ったら in をつける。
   動き方そのものは、style.css の「プロフィールのページの動き」に書いてある */
(function () {
  var sel = [
    '.profile-page > .sec-title', '.profile-photo', '.profile-name', '.profile-body p',
    '.members .sec-title', '.member-photo', '.member-name', '.member-text p'
  ];
  var els = [];
  sel.forEach(function (s) {
    [].forEach.call(document.querySelectorAll(s), function (e) { e.classList.add('fx'); els.push(e); });
  });
  // メンバーの2人目は、少し遅らせる(左右で時間差)
  [].forEach.call(document.querySelectorAll('.member:nth-child(2) .fx'), function (e) { e.style.setProperty('--late', '.25s'); });
  // 同じ箱の中の段落は、上から順に(--n = 何番目か)
  [].forEach.call(document.querySelectorAll('.profile-body, .member-text'), function (box) {
    [].forEach.call(box.querySelectorAll('p'), function (p, i) { p.style.setProperty('--n', i); });
  });
  // 名前を1文字ずつに(墨のにじみ用)
  [].forEach.call(document.querySelectorAll('.profile-name'), function (h) {
    var t = h.textContent; h.setAttribute('aria-label', t); h.textContent = '';
    Array.from(t).forEach(function (c, i) { var s = document.createElement('span'); s.textContent = c; s.style.setProperty('--i', i); h.appendChild(s); });
  });
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();
