/* ============================================================
   Y.MINE 人格实验室 · 社交面具 × 真实人格 双面视图模块
   mask.js — 翻转切换 / 双组向量编辑 / 差异计算 / 洞察生成
   纯原生 JS，零外部依赖，不调用任何 LLM 接口。

   用法：
     <div id="mask-app"></div>
     <script src="./mask.js"></script>
     <script>
       const api = YMask.mount('#mask-app', {
         mask: { TOL: 64, SPD: 70, INF: 58, ENT: 88, LEAD: 56, VIS: 52 },
         true: { TOL: 56, SPD: 44, INF: 38, ENT: 20, LEAD: 42, VIS: 62 },
         onChange(state) { console.log(state); }
       });
     </script>
   ============================================================ */
(function (global) {
  'use strict';

  /* ============================================================
     一、常量与数据
     ============================================================ */

  // 六维向量定义（顺序即展示顺序）
  var DIMS = [
    { key: 'TOL',  name: '容忍度', en: 'Tolerance' },
    { key: 'SPD',  name: '速度',   en: 'Speed' },
    { key: 'INF',  name: '影响力', en: 'Influence' },
    { key: 'ENT',  name: '能量',   en: 'Energy' },
    { key: 'LEAD', name: '主导性', en: 'Dominance' },
    { key: 'VIS',  name: '视觉性', en: 'Vision' }
  ];

  var DIM_KEYS = DIMS.map(function (d) { return d.key; });

  // 两侧主题色（滑块着色用）
  var SIDE_COLOR = { mask: '#FBBF24', true: '#22D3EE' };
  var SIDE_LABEL = { mask: '社交面具', true: '真实人格' };

  // 预设组合：面具向量 + 真实向量
  var PRESETS = [
    {
      id: 'e-mask-i-core',
      name: 'E面具 · I内核',
      desc: '对外高能量，对内独处回血',
      mask: { TOL: 64, SPD: 70, INF: 58, ENT: 88, LEAD: 56, VIS: 52 },
      true: { TOL: 56, SPD: 44, INF: 38, ENT: 20, LEAD: 42, VIS: 62 }
    },
    {
      id: 'lead-mask-follow-core',
      name: '领导面具 · 服从内核',
      desc: '在外拍板，回家想被安排',
      mask: { TOL: 58, SPD: 64, INF: 68, ENT: 60, LEAD: 90, VIS: 55 },
      true: { TOL: 54, SPD: 48, INF: 44, ENT: 44, LEAD: 26, VIS: 50 }
    },
    {
      id: 'quiet-mask-storm-core',
      name: '安静面具 · 风暴内核',
      desc: '寡言是表面，脑内很吵',
      mask: { TOL: 50, SPD: 34, INF: 26, ENT: 24, LEAD: 30, VIS: 40 },
      true: { TOL: 60, SPD: 78, INF: 72, ENT: 84, LEAD: 56, VIS: 86 }
    },
    {
      id: 'tough-mask-soft-core',
      name: '强硬面具 · 柔软内核',
      desc: '锋利是护甲，不是敌意',
      mask: { TOL: 24, SPD: 68, INF: 54, ENT: 58, LEAD: 72, VIS: 44 },
      true: { TOL: 82, SPD: 46, INF: 60, ENT: 46, LEAD: 44, VIS: 56 }
    },
    {
      id: 'nice-mask-thorn-core',
      name: '老好人面具 · 有刺内核',
      desc: '有求必应，门槛在内',
      mask: { TOL: 88, SPD: 56, INF: 60, ENT: 58, LEAD: 40, VIS: 46 },
      true: { TOL: 34, SPD: 50, INF: 44, ENT: 42, LEAD: 52, VIS: 48 }
    }
  ];

  // 显著差异阈值
  var HOT_DELTA = 25;   // |Δ| ≥ 25：显著差异，行高亮
  var SIG_DELTA = 15;   // |Δ| ≥ 15：进入解读文案

  // 差异解读规则表：pos = 面具高于真实，neg = 真实高于面具
  var RULES = {
    ENT: {
      pos: { label: '技能型社交者',
             text: '对外高能量输出，对内需要独处回血——社交是你的技能，不是你的本能。' },
      neg: { label: '蛰伏的能量体',
             text: '内在能量充沛，对外却选择收敛——你不是不合群，只是在等值得开口的场合。' }
    },
    LEAD: {
      pos: { label: '责任型领队',
             text: '在外扛事、拍板、兜底；回到自己，你更想被安排——主导是你的职责，不是你的欲望。' },
      neg: { label: '隐性掌舵者',
             text: '你习惯把方向盘让给别人，但心里的路线图从未消失——退让是策略，不是本性。' }
    },
    INF: {
      pos: { label: '舞台型表达者',
             text: '对外释放观点与存在感，对内更愿安静旁观——表达是你的工作模式，沉默才是待机画面。' },
      neg: { label: '深水观察者',
             text: '你内在的洞察满溢，却很少批发观点——不是无话可说，是不轻易开仓。' }
    },
    SPD: {
      pos: { label: '变速跑者',
             text: '人前把节奏调快，独处时只想慢下来——快是你的盔甲，慢是你的底盘。' },
      neg: { label: '内置涡轮',
             text: '你的内在转速极高，对外却刻意降速——慢是你的选择，不是你的速度上限。' }
    },
    TOL: {
      pos: { label: '训练有素的好脾气',
             text: '对外宽厚包容，对内其实门槛清晰——你的好脾气，有一部分是练出来的。' },
      neg: { label: '外冷内温',
             text: '你看起来锋利，内里比谁都宽容——冷脸是护甲，不是敌意。' }
    },
    VIS: {
      pos: { label: '造梦外包',
             text: '你擅长对外描绘画面与愿景，对内更在意眼前可触的东西——想象力是你的工具，不是你的住所。' },
      neg: { label: '私藏放映厅',
             text: '你脑内住着完整的画面，却很少公开放映——低调不是空白，是未公开。' }
    }
  };

  var CONGRUENT_LABEL = '内外同频者';
  var CONGRUENT_TEXT =
    '六维之中没有任何一维出现显著偏移——你示人的样子，和你自己居住的样子，是同一个房间。';

  /* ============================================================
     二、纯逻辑层（不依赖 DOM，可独立测试）
     ============================================================ */

  function clamp(v) {
    v = Math.round(Number(v) || 0);
    return v < 0 ? 0 : v > 100 ? 100 : v;
  }

  // 规范化一组向量：补齐缺失维度、收敛到 0-100
  function normalizeVec(src, fallback) {
    var out = {};
    DIM_KEYS.forEach(function (k) {
      if (src && typeof src[k] !== 'undefined') out[k] = clamp(src[k]);
      else if (fallback && typeof fallback[k] !== 'undefined') out[k] = clamp(fallback[k]);
      else out[k] = 50;
    });
    return out;
  }

  // 差异计算：Δ = 面具 − 真实
  function computeDiff(maskVec, trueVec) {
    var deltas = {};
    var sum = 0;
    var sorted = [];
    DIMS.forEach(function (d) {
      var delta = clamp(maskVec[d.key]) - clamp(trueVec[d.key]);
      deltas[d.key] = delta;
      sum += Math.abs(delta);
      sorted.push({ key: d.key, name: d.name, delta: delta });
    });
    sorted.sort(function (a, b) { return Math.abs(b.delta) - Math.abs(a.delta); });
    return {
      deltas: deltas,
      absMean: Math.round((sum / DIMS.length) * 10) / 10,
      sorted: sorted
    };
  }

  // 裂合等级：<8 内外同频 / 8-18 温和分野 / >18 清晰分野
  function levelOf(absMean) {
    if (absMean < 8) return '内外同频';
    if (absMean <= 18) return '温和分野';
    return '清晰分野';
  }

  function levelSentence(absMean) {
    var m = Math.round(absMean);
    if (absMean < 8) {
      return '裂合指数 ' + m + '——面具与内核几乎重合，所见即所得，这是一种罕见的自洽。';
    }
    if (absMean <= 18) {
      return '裂合指数 ' + m + '——存在温和分野：你在场景之间切换姿态，但从未离开自己太远。';
    }
    return '裂合指数 ' + m + '——面具与内核分野清晰：社交是你后天习得的能力，不是你的出厂配置。';
  }

  // 洞察生成：最多 2 条维度解读 + 1 条裂合总结
  function buildInsight(diff) {
    var sig = diff.sorted.filter(function (x) { return Math.abs(x.delta) >= SIG_DELTA; });
    var sentences = [];
    var persona = CONGRUENT_LABEL;

    if (sig.length > 0) {
      var r0 = RULES[sig[0].key][sig[0].delta > 0 ? 'pos' : 'neg'];
      persona = r0.label;
      sentences.push(r0.text);
      if (sig.length > 1) {
        var r1 = RULES[sig[1].key][sig[1].delta > 0 ? 'pos' : 'neg'];
        sentences.push(r1.text);
      }
    } else {
      sentences.push(CONGRUENT_TEXT);
    }
    sentences.push(levelSentence(diff.absMean));

    return { persona: persona, sentences: sentences.slice(0, 3) };
  }

  // 证件编号：由 12 个向量值确定性生成，随画像变化
  function makeDocNo(maskVec, trueVec) {
    var h = 5381;
    DIM_KEYS.forEach(function (k) {
      h = ((h * 33) ^ clamp(maskVec[k])) >>> 0;
      h = ((h * 33) ^ clamp(trueVec[k])) >>> 0;
    });
    var s = h.toString(36).toUpperCase();
    while (s.length < 8) s = '0' + s;
    s = s.slice(-8);
    return 'YM-' + s.slice(0, 4) + '-' + s.slice(4, 8);
  }

  // 分享摘要文本
  function summaryText(state, diff, insight, docNo, docDate) {
    function line(vec) {
      return DIMS.map(function (d) { return d.key + ' ' + vec[d.key]; }).join(' / ');
    }
    var lines = [
      '【Y.MINE 人格护照 · 双面检视】',
      '证件编号 NO. ' + docNo + ' · 签发 ' + docDate,
      '人格标签：「' + insight.persona + '」 · 裂合指数 ' + Math.round(diff.absMean) +
        '/100（' + levelOf(diff.absMean) + '）',
      '社交面具｜' + line(state.mask),
      '真实人格｜' + line(state.true),
      '—— 解读 ——'
    ];
    insight.sentences.forEach(function (s) { lines.push('· ' + s); });
    lines.push('—— Y.MINE 人格实验室 · 社交是学习的结果，不是本能');
    return lines.join('\n');
  }

  /* ============================================================
     三、DOM 模板
     ============================================================ */

  var instanceSeq = 0;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 钢印 SVG（每面一枚，配色随面主题）
  function sealSVG(uid, side) {
    var pid = uid + '-seal-' + side;
    var line = side === 'mask'
      ? 'Y.MINE PERSONALITY LAB · 人格实验室 · 社交面具 · SOCIAL MASK ·'
      : 'Y.MINE PERSONALITY LAB · 人格实验室 · 真实人格 · TRUE SELF ·';
    return '' +
      '<svg class="ymm-seal-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
        '<defs><path id="' + pid + '" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs>' +
        '<circle cx="60" cy="60" r="57" class="ymm-seal-ring"/>' +
        '<circle cx="60" cy="60" r="33" class="ymm-seal-ring ymm-seal-ring--in"/>' +
        '<text class="ymm-seal-text"><textPath href="#' + pid + '" textLength="286" lengthAdjust="spacingAndGlyphs">' +
          esc(line) + '</textPath></text>' +
        '<text x="60" y="57" class="ymm-seal-center">Y.MINE</text>' +
        '<text x="60" y="73" class="ymm-seal-center2">EST. MMXXV</text>' +
      '</svg>';
  }

  // 单侧滑块组
  function slidersHTML(side) {
    return DIMS.map(function (d) {
      return '' +
        '<div class="ymm-slider">' +
          '<div class="ymm-slider-head">' +
            '<span class="ymm-slider-name">' + d.key + ' · ' + d.name +
              '<small>' + d.en + '</small></span>' +
            '<span class="ymm-slider-val" data-ymm-val="' + side + '-' + d.key + '">50</span>' +
          '</div>' +
          '<input type="range" min="0" max="100" step="1" value="50" ' +
            'data-side="' + side + '" data-dim="' + d.key + '" ' +
            'aria-label="' + SIDE_LABEL[side] + ' ' + d.key + ' ' + d.name + '">' +
          '<div class="ymm-slider-printbar" aria-hidden="true">' +
            '<i data-ymm-pbar="' + side + '-' + d.key + '" style="width:50%"></i>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  // 单面（面具 / 真实）
  function faceHTML(uid, side) {
    var isMask = side === 'mask';
    var bandText = 'PERSONALITY PASSPORT · Y.MINE LAB · DUAL-VIEW · ' +
      (isMask ? 'SOCIAL MASK' : 'TRUE SELF') + ' · ';
    var band = (bandText + bandText + bandText + bandText);
    return '' +
      '<div class="ymm-face ymm-face--' + side + '" data-ymm-face="' + side + '">' +
        '<div class="ymm-face-inner">' +
          '<div class="ymm-band" aria-hidden="true"><span>' + esc(band + band) + '</span></div>' +
          '<div class="ymm-face-head">' +
            '<div class="ymm-face-id">' +
              '<span class="ymm-face-icon" aria-hidden="true">' + (isMask ? '🎭' : '🌌') + '</span>' +
              '<div>' +
                '<div class="ymm-face-title">' + (isMask ? '社交面具' : '真实人格') + '</div>' +
                '<div class="ymm-face-en">' + (isMask ? 'SOCIAL MASK' : 'TRUE SELF') + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="ymm-face-badge">' + (isMask ? '别人眼中的你' : '只有你知道的你') + '</div>' +
          '</div>' +
          '<p class="ymm-face-note">' +
            (isMask
              ? '它知道何时开口、何时微笑、何时撑住场面——这一面经过训练，是装备，不是本能。'
              : '这一面无需表演：独处时的能量分配、真实的好奇与抗拒，都写在这里。') +
          '</p>' +
          '<div class="ymm-sliders">' + slidersHTML(side) + '</div>' +
          '<div class="ymm-face-foot">' +
            '<span class="ymm-flip-hint">' +
              (isMask ? '点击卡片或按 Enter · 查看真实人格 →' : '← 返回社交面具 · 点击卡片或按 Enter') +
            '</span>' +
            '<span class="ymm-holo" aria-hidden="true"></span>' +
          '</div>' +
          '<div class="ymm-seal">' + sealSVG(uid, side) + '</div>' +
        '</div>' +
      '</div>';
  }

  // 六维对比行
  function compareRowsHTML() {
    return DIMS.map(function (d) {
      return '' +
        '<div class="ymm-row" data-ymm-row="' + d.key + '">' +
          '<div class="ymm-row-head">' +
            '<span class="ymm-row-name"><b>' + d.key + '</b>' + d.name + '</span>' +
            '<span class="ymm-row-delta" data-ymm-delta="' + d.key + '">Δ 0</span>' +
          '</div>' +
          '<div class="ymm-barline">' +
            '<span class="ymm-bar-tag">面具</span>' +
            '<span class="ymm-track"><span class="ymm-fill ymm-fill--mask" ' +
              'data-ymm-fill="mask-' + d.key + '" style="width:0%"></span></span>' +
            '<span class="ymm-bar-val" data-ymm-cval="mask-' + d.key + '">0</span>' +
          '</div>' +
          '<div class="ymm-barline">' +
            '<span class="ymm-bar-tag">真实</span>' +
            '<span class="ymm-track"><span class="ymm-fill ymm-fill--true" ' +
              'data-ymm-fill="true-' + d.key + '" style="width:0%"></span></span>' +
            '<span class="ymm-bar-val" data-ymm-cval="true-' + d.key + '">0</span>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  function template(uid) {
    return '' +
    '<section class="ym-mask-module" data-ymm-root aria-label="社交面具与真实人格双面检视模块">' +

      '<header class="ymm-header">' +
        '<div class="ymm-title-block">' +
          '<div class="ymm-eyebrow">Y.MINE Personality Lab · Dual-View</div>' +
          '<h2 class="ymm-title">社交面具 <span class="ymm-title-x">×</span> 真实人格</h2>' +
          '<p class="ymm-sub">别人眼中的你 / 你自己知道的你——社交是学习的结果，不是本能。</p>' +
        '</div>' +
        '<div class="ymm-docmeta">' +
          '<div class="ymm-docno">NO. <span data-ymm="docno">YM-0000-0000</span></div>' +
          '<div>签发 <span data-ymm="docdate">----.--.--</span></div>' +
          '<div>Y.MINE 人格实验室</div>' +
        '</div>' +
      '</header>' +

      '<div class="ymm-presets">' +
        '<span class="ymm-presets-label">预设组合 · Presets</span>' +
        '<div class="ymm-presets-list" data-ymm="presets" role="group" aria-label="人格组合预设">' +
          PRESETS.map(function (p) {
            return '<button type="button" class="ymm-preset" data-preset="' + p.id + '">' +
              '<span class="ymm-preset-name">' + esc(p.name) + '</span>' +
              '<span class="ymm-preset-desc">' + esc(p.desc) + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="ymm-stage-wrap">' +
        '<div class="ymm-stage">' +
          '<div class="ymm-card" data-ymm="card" tabindex="0" role="button" ' +
            'aria-pressed="false" aria-label="人格卡片，点击或按 Enter 翻转查看另一面">' +
            faceHTML(uid, 'mask') +
            faceHTML(uid, 'true') +
          '</div>' +
        '</div>' +
        '<div class="ymm-stage-controls">' +
          '<button type="button" class="ymm-btn ymm-btn--flip" data-ymm="flip-btn">' +
            '<span data-ymm="flip-btn-text">⇄ 翻到真实人格</span>' +
            '<span class="ymm-btn-en" data-ymm="flip-btn-en">TRUE SELF</span>' +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="ymm-compare">' +
        '<div class="ymm-compare-head">' +
          '<div>' +
            '<h3 class="ymm-compare-title">六维差异检视</h3>' +
            '<div class="ymm-compare-sub">Diff Map · Δ = 面具 − 真实</div>' +
          '</div>' +
          '<div class="ymm-gap">' +
            '<div class="ymm-gap-gauge">' +
              '<svg viewBox="0 0 120 120" aria-hidden="true">' +
                '<defs>' +
                  '<linearGradient id="' + uid + '-gauge" x1="0" y1="0" x2="1" y2="1">' +
                    '<stop offset="0" stop-color="#FBBF24"/>' +
                    '<stop offset="1" stop-color="#22D3EE"/>' +
                  '</linearGradient>' +
                '</defs>' +
                '<circle class="ymm-gauge-bg" cx="60" cy="60" r="50"/>' +
                '<circle class="ymm-gauge-fg" cx="60" cy="60" r="50" ' +
                  'stroke="url(#' + uid + '-gauge)" transform="rotate(-90 60 60)" ' +
                  'data-ymm="gauge-fg" stroke-dasharray="314.16" stroke-dashoffset="314.16"/>' +
              '</svg>' +
              '<div class="ymm-gauge-num"><b data-ymm="gap-val">0</b><span>裂合指数</span></div>' +
            '</div>' +
            '<div class="ymm-gap-level" data-ymm="gap-level">内外同频</div>' +
          '</div>' +
        '</div>' +
        '<div class="ymm-legend">' +
          '<span class="ymm-legend-item"><i class="ymm-legend-swatch ymm-legend-swatch--mask"></i>社交面具</span>' +
          '<span class="ymm-legend-item"><i class="ymm-legend-swatch ymm-legend-swatch--true"></i>真实人格</span>' +
          '<span class="ymm-legend-item">|Δ| ≥ ' + HOT_DELTA + ' 标记为显著差异</span>' +
        '</div>' +
        '<div class="ymm-compare-rows">' + compareRowsHTML() + '</div>' +
      '</div>' +

      '<div class="ymm-insight">' +
        '<div class="ymm-insight-label">Diff Insight · 差异解读</div>' +
        '<div class="ymm-persona" data-ymm="persona">「内外同频者」</div>' +
        '<ul class="ymm-insight-list" data-ymm="insight"></ul>' +
      '</div>' +

      '<div class="ymm-actions">' +
        '<button type="button" class="ymm-btn" data-ymm="copy-btn">复制分享摘要</button>' +
        '<button type="button" class="ymm-btn ymm-btn--gold" data-ymm="print-btn">打印护照页</button>' +
      '</div>' +

      '<p class="ymm-footnote">Y.MINE 人格实验室 · 解读由本地规则生成，不构成心理诊断</p>' +
      '<div class="ymm-toast" data-ymm="toast" role="status" aria-live="polite"></div>' +
    '</section>';
  }

  /* ============================================================
     四、挂载与交互
     ============================================================ */

  function mount(target, options) {
    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) throw new Error('[YMask] 容器元素不存在：' + target);
    options = options || {};

    var uid = 'ymm' + (++instanceSeq);

    // 状态：默认加载第一组预设（E面具 · I内核）
    var state = {
      mask: normalizeVec(options.mask, PRESETS[0].mask),
      true: normalizeVec(options.true || options.tru, PRESETS[0].true),
      flipped: !!options.flipped,
      presetId: options.presetId || (options.mask || options.true || options.tru ? null : PRESETS[0].id)
    };

    host.innerHTML = template(uid);
    var root = host.querySelector('[data-ymm-root]');

    /* ---- 元素引用 ---- */
    function q(sel) { return root.querySelector(sel); }
    function qa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    var refs = {
      card: q('[data-ymm="card"]'),
      flipBtn: q('[data-ymm="flip-btn"]'),
      flipBtnText: q('[data-ymm="flip-btn-text"]'),
      flipBtnEn: q('[data-ymm="flip-btn-en"]'),
      docno: q('[data-ymm="docno"]'),
      docdate: q('[data-ymm="docdate"]'),
      persona: q('[data-ymm="persona"]'),
      insight: q('[data-ymm="insight"]'),
      gapVal: q('[data-ymm="gap-val"]'),
      gapLevel: q('[data-ymm="gap-level"]'),
      gaugeFg: q('[data-ymm="gauge-fg"]'),
      toast: q('[data-ymm="toast"]'),
      faces: {
        mask: q('[data-ymm-face="mask"]'),
        true: q('[data-ymm-face="true"]')
      },
      presetBtns: qa('.ymm-preset')
    };

    var sliders = qa('input[type="range"]');
    var toastTimer = null;

    /* ---- 签发日期 ---- */
    function fmtDate(d) {
      function p(n) { return n < 10 ? '0' + n : '' + n; }
      return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate());
    }
    refs.docdate.textContent = options.docDate || fmtDate(new Date());

    /* ---- 渲染：单侧滑块 ---- */
    function renderSide(side) {
      DIMS.forEach(function (d) {
        var v = state[side][d.key];
        var valEl = q('[data-ymm-val="' + side + '-' + d.key + '"]');
        var pbarEl = q('[data-ymm-pbar="' + side + '-' + d.key + '"]');
        if (valEl) valEl.textContent = v;
        if (pbarEl) pbarEl.style.width = v + '%';
      });
      sliders.forEach(function (input) {
        if (input.dataset.side !== side) return;
        var v = state[side][input.dataset.dim];
        if (Number(input.value) !== v) input.value = v;
        var p = v + '%';
        var rest = 'rgba(255,255,255,0.08)';
        input.style.background =
          'linear-gradient(90deg, ' + SIDE_COLOR[side] + ' ' + p + ', ' + rest + ' ' + p + ')';
      });
    }

    /* ---- 渲染：差异区 + 洞察 ---- */
    function renderDiff() {
      var diff = computeDiff(state.mask, state.true);
      var insight = buildInsight(diff);
      var docNo = makeDocNo(state.mask, state.true);

      refs.docno.textContent = docNo;

      DIMS.forEach(function (d) {
        var mv = state.mask[d.key];
        var tv = state.true[d.key];
        var delta = diff.deltas[d.key];
        var row = q('[data-ymm-row="' + d.key + '"]');
        var fillM = q('[data-ymm-fill="mask-' + d.key + '"]');
        var fillT = q('[data-ymm-fill="true-' + d.key + '"]');
        var valM = q('[data-ymm-cval="mask-' + d.key + '"]');
        var valT = q('[data-ymm-cval="true-' + d.key + '"]');
        var deltaEl = q('[data-ymm-delta="' + d.key + '"]');

        if (fillM) fillM.style.width = mv + '%';
        if (fillT) fillT.style.width = tv + '%';
        if (valM) valM.textContent = mv;
        if (valT) valT.textContent = tv;

        var abs = Math.abs(delta);
        var hot = abs >= HOT_DELTA;
        if (row) row.classList.toggle('ymm-row--hot', hot);
        if (deltaEl) {
          deltaEl.classList.toggle('is-pos', delta > 0);
          deltaEl.classList.toggle('is-neg', delta < 0);
          var sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
          deltaEl.innerHTML = 'Δ ' + sign + abs +
            (hot ? '<span class="ymm-hot-chip">显著</span>' : '');
          deltaEl.title = delta > 0 ? '面具高于真实 ' + abs
            : delta < 0 ? '真实高于面具 ' + abs : '两侧一致';
        }
      });

      // 裂合指数仪表盘
      var gapRounded = Math.round(diff.absMean);
      refs.gapVal.textContent = gapRounded;
      refs.gapLevel.textContent = levelOf(diff.absMean);
      var C = 314.16; // 2πr, r = 50
      var ratio = Math.min(1, diff.absMean / 50);
      refs.gaugeFg.style.strokeDashoffset = String(C * (1 - ratio));

      // 洞察
      refs.persona.textContent = '「' + insight.persona + '」';
      refs.insight.innerHTML = insight.sentences.map(function (s, i) {
        var cls = i === insight.sentences.length - 1 ? ' class="ymm-insight-summary"' : '';
        return '<li' + cls + '>' + esc(s) + '</li>';
      }).join('');

      return { diff: diff, insight: insight, docNo: docNo };
    }

    function renderAll() {
      renderSide('mask');
      renderSide('true');
      return renderDiff();
    }

    /* ---- 翻转 ---- */
    function applyFlip() {
      refs.card.classList.toggle('is-flipped', state.flipped);
      refs.card.setAttribute('aria-pressed', state.flipped ? 'true' : 'false');
      refs.flipBtnText.textContent = state.flipped ? '⇄ 翻到社交面具' : '⇄ 翻到真实人格';
      refs.flipBtnEn.textContent = state.flipped ? 'SOCIAL MASK' : 'TRUE SELF';

      // 隐藏面：禁止指针与焦点（动画期间即刻禁用背面，不影响视觉过渡）
      var hiddenSide = state.flipped ? 'mask' : 'true';
      var shownSide = state.flipped ? 'true' : 'mask';
      [hiddenSide, shownSide].forEach(function (side) {
        var face = refs.faces[side];
        var hidden = side === hiddenSide;
        face.classList.toggle('ymm-face--hidden', hidden);
        face.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        if ('inert' in face) face.inert = hidden;
        else if (hidden) face.setAttribute('inert', '');
        else face.removeAttribute('inert');
      });

      // 若焦点落在被隐藏的面内，移交到翻转按钮
      var active = document.activeElement;
      if (active && refs.faces[hiddenSide].contains(active)) {
        refs.flipBtn.focus();
      }
    }

    function flip(force) {
      state.flipped = typeof force === 'boolean' ? force : !state.flipped;
      applyFlip();
      notify();
    }

    /* ---- 变更通知 ---- */
    function notify() {
      if (typeof options.onChange === 'function') {
        options.onChange({
          mask: Object.assign({}, state.mask),
          true: Object.assign({}, state.true),
          flipped: state.flipped,
          presetId: state.presetId
        });
      }
    }

    function markPreset(id) {
      state.presetId = id;
      refs.presetBtns.forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.preset === id);
      });
    }

    function loadPreset(id) {
      var p = null;
      for (var i = 0; i < PRESETS.length; i++) {
        if (PRESETS[i].id === id) { p = PRESETS[i]; break; }
      }
      if (!p) return false;
      state.mask = normalizeVec(p.mask);
      state.true = normalizeVec(p.true);
      markPreset(id);
      renderAll();
      notify();
      return true;
    }

    /* ---- Toast ---- */
    function toast(msg) {
      refs.toast.textContent = msg;
      refs.toast.classList.add('is-show');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        refs.toast.classList.remove('is-show');
      }, 2200);
    }

    /* ---- 复制摘要 ---- */
    function copySummary() {
      var diff = computeDiff(state.mask, state.true);
      var insight = buildInsight(diff);
      var text = summaryText(state, diff, insight,
        makeDocNo(state.mask, state.true), refs.docdate.textContent);

      function done(ok) {
        toast(ok ? '分享摘要已复制到剪贴板' : '复制失败，请手动选择文本');
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        done(ok);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
      } else {
        fallback();
      }
    }

    /* ---- 事件绑定（全部委托在 root 上） ---- */
    root.addEventListener('input', function (e) {
      var t = e.target;
      if (!t || t.tagName !== 'INPUT' || t.type !== 'range') return;
      var side = t.dataset.side;
      var dim = t.dataset.dim;
      if (!side || !dim) return;
      state[side][dim] = clamp(t.value);
      markPreset(null); // 手动调整后不再属于任何预设
      renderAll();
      notify();
    });

    root.addEventListener('click', function (e) {
      var presetBtn = e.target.closest ? e.target.closest('.ymm-preset') : null;
      if (presetBtn && root.contains(presetBtn)) {
        loadPreset(presetBtn.dataset.preset);
        return;
      }
      if (e.target.closest && e.target.closest('[data-ymm="flip-btn"]')) {
        flip();
        return;
      }
      if (e.target.closest && e.target.closest('[data-ymm="copy-btn"]')) {
        copySummary();
        return;
      }
      if (e.target.closest && e.target.closest('[data-ymm="print-btn"]')) {
        window.print();
        return;
      }
      // 点击卡片翻面：忽略滑块 / 按钮等交互元素
      var card = e.target.closest ? e.target.closest('[data-ymm="card"]') : null;
      if (card && root.contains(card)) {
        if (e.target.closest('input, button, a, textarea, select, label')) return;
        flip();
      }
    });

    refs.card.addEventListener('keydown', function (e) {
      if (e.target !== refs.card) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        flip();
      }
    });

    /* ---- 初始化 ---- */
    markPreset(state.presetId);
    renderAll();
    applyFlip();

    /* ---- 对外 API ---- */
    return {
      root: root,
      getState: function () {
        return {
          mask: Object.assign({}, state.mask),
          true: Object.assign({}, state.true),
          flipped: state.flipped,
          presetId: state.presetId
        };
      },
      setVectors: function (side, vec) {
        if (side !== 'mask' && side !== 'true') return;
        state[side] = normalizeVec(vec, state[side]);
        markPreset(null);
        renderAll();
        notify();
      },
      loadPreset: loadPreset,
      flip: flip,
      getDiff: function () { return computeDiff(state.mask, state.true); },
      getInsight: function () { return buildInsight(computeDiff(state.mask, state.true)); }
    };
  }

  /* ============================================================
     五、导出
     ============================================================ */
  global.YMask = {
    version: '1.0.0',
    DIMS: DIMS,
    PRESETS: PRESETS,
    mount: mount,
    // 纯逻辑接口（供测试与宿主复用）
    computeDiff: computeDiff,
    buildInsight: buildInsight,
    makeDocNo: makeDocNo,
    levelOf: levelOf,
    normalizeVec: normalizeVec
  };

})(typeof window !== 'undefined' ? window : globalThis);
