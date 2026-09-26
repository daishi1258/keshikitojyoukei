/* ==========================================================
   設定（ここだけ書き換える）
   ========================================================== */
window.SITE_CONFIG = {
  // microCMS：ライブ情報の読み込み先
  //   serviceDomain … 管理画面のURL「https://○○○.microcms.io」の ○○○ の部分
  //   apiKey        … 「API キー」画面の、読み取り（GET）だけのキー
  //   endpoint      … ライブの API のエンドポイント名（項目は date / place / detail）
  //   newsEndpoint  … NEWS の API のエンドポイント名（項目は title / date / body）
  // ※ 2つが空のときは、sample（見本のライブ）を表示する。
  microcms: {
    serviceDomain: "keshikitojyoukei",
    apiKey: "PrnxZYvHWPmVA71Gq7Bm0DmhbIIAGnGcbNys",
    endpoint: "live",
    newsEndpoint: "news"
  }
};
