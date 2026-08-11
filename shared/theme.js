/**
 * Y.Mine Demos · 主题/工具函数
 * 纯 JS，无外部依赖
 */

// ═════════════════════════════════════════════════════════
// 颜色常量
// ═════════════════════════════════════════════════════════

const COLORS = {
  bg: '#0a0a18',
  card: '#111128',
  purple: '#A78BFA',
  purpleDim: '#7C5FBF',
  cyan: '#22D3EE',
  gold: '#FBBF24',
  text: '#E8E6FF',
  textSecondary: '#8B8FB8',
  textMuted: '#4A4A6A',
};

// ═════════════════════════════════════════════════════════
// 六维向量维度定义
// ═════════════════════════════════════════════════════════

const DIMENSIONS = [
  { key: 'TOL', label: '容忍度', en: 'Tolerance', desc: '高→偏苦、烟熏、复杂 / 低→简单、直接', color: '#A78BFA' },
  { key: 'SPD', label: '速度', en: 'Speed', desc: '高→清爽、简单、低酒精 / 低→厚重、慢节奏', color: '#22D3EE' },
  { key: 'INF', label: '影响力', en: 'Influence', desc: '高→甜美、果香、高颜值 / 低→内敛、低调', color: '#FBBF24' },
  { key: 'ENT', label: '能量', en: 'Energy', desc: '高→高酒精、烈、刺激 / 低→柔和、温润', color: '#F87171' },
  { key: 'LEAD', label: '主导性', en: 'Leadership', desc: '高→经典、结构化、仪式感 / 低→随性、自由', color: '#34D399' },
  { key: 'VIS', label: '视觉性', en: 'Visual', desc: '高→装饰华丽、颜色鲜明 / 低→极简、克制', color: '#F472B6' },
];

// ═════════════════════════════════════════════════════════
// 时段定义
// ═════════════════════════════════════════════════════════

const TIME_SLOTS = [
  { slot: 'dawn', label: '破晓', hours: [5, 9], poem: '夜将尽，第一缕光落进杯里。', mood: '清醒、果断' },
  { slot: 'noon', label: '白昼', hours: [9, 17], poem: '阳光太满，需要一杯让心慢下来。', mood: '稳定、清晰' },
  { slot: 'dusk', label: '暮色', hours: [17, 19], poem: '天光将熄，思念有了颜色。', mood: '浪漫、沉思' },
  { slot: 'night', label: '夜深', hours: [19, 23], poem: '夜正式开始，杯沿沾着星光。', mood: '神秘、优雅' },
  { slot: 'midnight', label: '子夜', hours: [23, 5], poem: '世界睡了，只剩杯与自己。', mood: '深沉、内省' },
];

/** 获取当前时段 */
function getCurrentTimeSlot() {
  const h = new Date().getHours();
  if (h >= 23 || h < 5) return TIME_SLOTS[4];
  for (const slot of TIME_SLOTS) {
    if (slot.slot === 'midnight') continue;
    if (h >= slot.hours[0] && h < slot.hours[1]) return slot;
  }
  return TIME_SLOTS[3];
}

// ═════════════════════════════════════════════════════════
// 六维向量 → 风味偏好映射
// ═════════════════════════════════════════════════════════

/** 从六维向量计算八维风味偏好 */
function vectorToFlavor(vec) {
  return {
    sweet:   clamp(vec.INF * 0.5 + vec.VIS * 0.3 + vec.ENT * 0.2, 0, 1),
    sour:    clamp(vec.SPD * 0.5 + vec.LEAD * 0.3 + vec.TOL * 0.2, 0, 1),
    bitter:  clamp(vec.TOL * 0.6 + vec.LEAD * 0.3 + (1 - vec.INF) * 0.1, 0, 1),
    strong:  clamp(vec.ENT * 0.6 + vec.LEAD * 0.3 + (1 - vec.SPD) * 0.1, 0, 1),
    smoky:   clamp(vec.TOL * 0.5 + vec.LEAD * 0.3 + (1 - vec.SPD) * 0.2, 0, 1),
    fruity:  clamp(vec.INF * 0.5 + vec.VIS * 0.3 + vec.SPD * 0.2, 0, 1),
    herbal:  clamp(vec.TOL * 0.4 + vec.VIS * 0.3 + vec.LEAD * 0.3, 0, 1),
    creamy:  clamp(vec.INF * 0.4 + (1 - vec.ENT) * 0.3 + vec.VIS * 0.3, 0, 1),
  };
}

// ═════════════════════════════════════════════════════════
// 工具函数
// ═════════════════════════════════════════════════════════

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/** 余弦相似度 */
function cosineSimilarity(a, b) {
  const keys = Object.keys(a);
  let dot = 0, na = 0, nb = 0;
  for (const k of keys) {
    dot += (a[k] || 0) * (b[k] || 0);
    na += (a[k] || 0) ** 2;
    nb += (b[k] || 0) ** 2;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** 格式化百分比 */
function pct(v) { return (v * 100).toFixed(0) + '%'; }

/** 格式化数值 */
function fmt(v) { return v.toFixed(2); }

// ═════════════════════════════════════════════════════════
// DOM 工具
// ═════════════════════════════════════════════════════════

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

/** 创建六维向量滑块组 */
function createVectorSliders(container, onChange, initialValues) {
  const vals = initialValues || { TOL: 0.5, SPD: 0.5, INF: 0.5, ENT: 0.5, LEAD: 0.5, VIS: 0.5 };

  container.innerHTML = DIMENSIONS.map((dim, i) => `
    <div class="slider-group animate-in" style="animation-delay:${i * 0.05}s">
      <div class="slider-header">
        <span class="slider-label" style="color:${dim.color}">${dim.label} <small>${dim.en}</small></span>
        <span class="slider-value" style="color:${dim.color}">${fmt(vals[dim.key])}</span>
      </div>
      <input type="range" min="0" max="1" step="0.01" value="${vals[dim.key]}" data-dim="${dim.key}">
      <div class="slider-desc">${dim.desc}</div>
    </div>
  `).join('');

  // 绑定事件
  const result = {};
  DIMENSIONS.forEach(d => { result[d.key] = vals[d.key]; });

  container.addEventListener('input', (e) => {
    if (e.target.type === 'range') {
      const dim = e.target.dataset.dim;
      result[dim] = parseFloat(e.target.value);
      const valEl = container.querySelector(`[data-dim="${dim}"]`).parentElement.querySelector('.slider-value');
      if (valEl) valEl.textContent = fmt(result[dim]);
      if (onChange) onChange(result);
    }
  });

  return result;
}

/** 获取当前向量值 */
function getVectorValues() {
  const vals = {};
  DIMENSIONS.forEach(d => {
    const input = document.querySelector(`input[data-dim="${d.key}"]`);
    vals[d.key] = input ? parseFloat(input.value) : 0.5;
  });
  return vals;
}