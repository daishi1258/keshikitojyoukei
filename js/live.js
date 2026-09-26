/* ==========================================================
   ライブ情報（microCMS から読み込む）
   - トップ：写真の左の「NEXT LIVE」と、LIVE 欄のカードに、今日以降でいちばん近いライブを入れる。
             カードの下の一覧には、その次の2件。
   - live.html：年月ごとにまとめて、開催予定は近い順、終わったものは「PAST LIVE」の下に新しい順。
   - 日付は、その日の23:59まで「開催予定」に残る（当日のライブは、終わるまで NEXT LIVE のまま）。
   ========================================================== */
(function () {
  var cfg = window.SITE_CONFIG || {};
  // 書き方をそろえるしくみは js/format.js（先に読み込む）
  var F = window.LiveFormat;
  var parseDate = F.parseDate, statusOf = F.statusOf, formatDetail = F.formatDetail, formatPlace = F.formatPlace;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  // microCMS から読み込む（キーが空のあいだは、config.js の見本）
  function load() {
    var m = cfg.microcms || {};
    if (!m.serviceDomain || !m.apiKey) return Promise.resolve(cfg.sample || []);
    var url = 'https://' + m.serviceDomain + '.microcms.io/api/v1/' + (m.endpoint || 'live') + '?limit=100';
    return fetch(url, { headers: { 'X-MICROCMS-API-KEY': m.apiKey } })
      .then(function (r) { if (!r.ok) throw new Error('microCMS ' + r.status); return r.json(); })
      .then(function (data) { return data.contents || []; });
  }

  // 開催予定（近い順）・終了（新しい順）・日付が読めないもの、に分ける
  function split(items) {
    var now = new Date();
    var all = items.map(function (it) {
      return { place: formatPlace(it.place), detail: formatDetail(it.detail), d: parseDate(it.date || it.publishedAt) };
    });
    return {
      upcoming: all.filter(function (x) { return x.d.end && x.d.end >= now; }).sort(function (a, b) { return a.d.end - b.d.end; }),
      past: all.filter(function (x) { return x.d.end && x.d.end < now; }).sort(function (a, b) { return b.d.end - a.d.end; }),
      undated: all.filter(function (x) { return !x.d.end; })
    };
  }

  /* ── トップページ ── */
  function renderTop(g) {
    var next = g.upcoming[0];

    // 写真の左の NEXT LIVE
    var hero = document.querySelector('.idea-live');
    if (hero) {
      var hd = hero.querySelector('.d'), hp = hero.querySelector('.p'), ht = hero.querySelector('.t');
      if (next) {
        hd.textContent = (next.d.ymd || next.d.text) + ' ';
        if (next.d.week) hd.appendChild(el('small', '', next.d.week));
        hp.textContent = next.place;
        // 時間の行（open / start が入った行）。なければ1行目
        var lines = next.detail.split('\n');
        ht.textContent = lines.filter(function (l) { return /open|start/.test(l); })[0] || lines[0];
      } else {
        hd.textContent = 'COMING SOON';
        hp.textContent = '次のライブは準備中です';
        ht.textContent = '';
      }
    }

    // LIVE 欄のカード
    var card = document.querySelector('#live .live-card');
    if (card) {
      var set = function (sel, t) { var e = card.querySelector(sel); e.textContent = t; e.hidden = !t; };
      if (next) {
        set('.live-date', next.d.text);
        set('.live-status', statusOf(next.d));
        set('.live-place', next.place);
        set('.live-detail', next.detail);
      } else {
        set('.live-date', 'COMING SOON');
        set('.live-status', '');
        set('.live-place', '次のライブは準備中です');
        set('.live-detail', '');
      }
    }

    // カードの下の一覧（その次の2件）
    var list = document.querySelector('#live .list');
    if (list) {
      list.innerHTML = '';
      g.upcoming.slice(1, 3).forEach(function (x) {
        var li = el('li');
        li.appendChild(el('span', 'date', x.d.text));
        li.appendChild(document.createTextNode(x.place));
        list.appendChild(li);
      });
      list.hidden = !list.children.length;
    }
  }

  /* ── live.html ── */
  function renderSection(box, items, isPast) {
    var groups = [], byKey = {};
    items.forEach(function (x) {
      var key = x.d.year ? x.d.year + '年 ' + x.d.month + '月' : 'その他';
      if (!byKey[key]) { byKey[key] = []; groups.push(key); }
      byKey[key].push(x);
    });
    groups.forEach(function (key) {
      var grp = el('div', 'month-group');
      grp.appendChild(el('h3', 'month-title', key));
      var ul = el('ul', isPast ? 'live-list past' : 'live-list');
      byKey[key].forEach(function (x) {
        var li = el('li');
        li.appendChild(el('span', 'date', x.d.text));
        var st = isPast ? '' : statusOf(x.d);
        if (st) li.appendChild(el('span', 'status', st));
        li.appendChild(el('span', 'venue', x.place));
        if (x.detail) li.appendChild(el('span', 'desc', x.detail));
        ul.appendChild(li);
      });
      grp.appendChild(ul);
      box.appendChild(grp);
    });
  }

  function renderPage(box, g) {
    box.innerHTML = '';
    box.classList.remove('loading');
    if (!g.upcoming.length && !g.past.length && !g.undated.length) {
      box.appendChild(el('p', 'live-empty', '現在予定されているライブはありません。'));
      return;
    }
    if (!g.upcoming.length) box.appendChild(el('p', 'live-empty', '次のライブは準備中です。'));
    renderSection(box, g.upcoming, false);
    renderSection(box, g.undated, false);
    if (g.past.length) {
      box.appendChild(el('h3', 'past-divider', 'PAST LIVE'));
      renderSection(box, g.past, true);
    }
  }

  load().then(function (items) {
    var g = split(items);
    var page = document.getElementById('live-schedule');
    if (page) renderPage(page, g); else renderTop(g);
  }).catch(function (err) {
    console.error('ライブ情報の読み込みに失敗:', err);
    var page = document.getElementById('live-schedule');
    if (page) { page.classList.remove('loading'); page.textContent = 'ライブ情報の読み込みに失敗しました。'; }
    else renderTop({ upcoming: [] });   // 古い日付を出さないよう、「準備中」にする
  });
})();
