/* ==========================================================
   NEWS（microCMS から読み込む）
   - 項目は、日にち（date）と一言（title）だけ。
   - トップ：NEWS 欄に、新しい順に3件。
   - news.html：全部を、新しい順に、同じ形で。
   - 日付は「日にち（date）」の欄。空なら、microCMS で公開した日。どんな書き方でも 2026.09.20 の形にそろう。
   - 読み込めないときは、トップは HTML に書いてある内容のまま。
   ========================================================== */
(function () {
  var cfg = window.SITE_CONFIG || {};
  var F = window.LiveFormat;   // 書き方をそろえるしくみ（js/format.js）

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  // 日付：「日にち」の欄 → なければ公開した日
  function dateOf(it) {
    var d = it.date ? F.parseDate(it.date) : { end: null };
    if (d.end) return { ymd: d.ymd, time: d.end.getTime() };
    var p = new Date(it.publishedAt || it.createdAt);
    if (isNaN(p)) return { ymd: it.date || '', time: 0 };
    return { ymd: p.getFullYear() + '.' + pad2(p.getMonth() + 1) + '.' + pad2(p.getDate()), time: p.getTime() };
  }

  function load() {
    var m = cfg.microcms || {};
    if (!m.serviceDomain || !m.apiKey) return Promise.reject(new Error('microCMS の設定が空'));
    var url = 'https://' + m.serviceDomain + '.microcms.io/api/v1/' + (m.newsEndpoint || 'news') + '?limit=100';
    return fetch(url, { headers: { 'X-MICROCMS-API-KEY': m.apiKey } })
      .then(function (r) { if (!r.ok) throw new Error('microCMS ' + r.status); return r.json(); })
      .then(function (data) {
        return (data.contents || []).map(function (it) {
          var d = dateOf(it);
          return { title: F.formatPlace(it.title), ymd: d.ymd, time: d.time };
        }).sort(function (a, b) { return b.time - a.time; });
      });
  }

  // 1件ぶんの行（日付と一言）
  function row(x) {
    var li = el('li');
    li.appendChild(el('span', 'date', x.ymd));
    li.appendChild(document.createTextNode(x.title));
    return li;
  }

  function fill(list, items) {
    list.innerHTML = '';
    if (!items.length) { list.appendChild(el('li', '', 'お知らせは、まだありません。')); return; }
    items.forEach(function (x) { list.appendChild(row(x)); });
  }

  load().then(function (items) {
    var page = document.getElementById('news-list');
    if (page) fill(page, items);   // news.html：全部
    else {
      var top = document.querySelector('#info .list');
      if (top) fill(top, items.slice(0, 3));   // トップ：新しい3件
    }
  }).catch(function (err) {
    console.error('NEWS の読み込みに失敗:', err);
    var page = document.getElementById('news-list');
    if (page) page.innerHTML = '<li>お知らせの読み込みに失敗しました。</li>';
  });
})();
