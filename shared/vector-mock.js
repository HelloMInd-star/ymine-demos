/**
 * Y.Mine Demos · 模拟六维向量生成器
 * 开发用 · 模拟不同人格类型的向量
 */

const MOCK_PROFILES = {
  INTJ: { TOL: 0.35, SPD: 0.55, INF: 0.85, ENT: 0.25, LEAD: 0.80, VIS: 0.60 },
  ENFP: { TOL: 0.80, SPD: 0.70, INF: 0.30, ENT: 0.90, LEAD: 0.40, VIS: 0.85 },
  ISTJ: { TOL: 0.20, SPD: 0.30, INF: 0.75, ENT: 0.15, LEAD: 0.70, VIS: 0.25 },
  ISFJ: { TOL: 0.65, SPD: 0.35, INF: 0.45, ENT: 0.25, LEAD: 0.35, VIS: 0.40 },
  ENTP: { TOL: 0.70, SPD: 0.85, INF: 0.55, ENT: 0.80, LEAD: 0.65, VIS: 0.70 },
  INFJ: { TOL: 0.55, SPD: 0.40, INF: 0.70, ENT: 0.35, LEAD: 0.60, VIS: 0.75 },
  ESTP: { TOL: 0.75, SPD: 0.90, INF: 0.20, ENT: 0.85, LEAD: 0.75, VIS: 0.55 },
};

/** 生成随机向量 */
function randomVector() {
  return {
    TOL: Math.round(Math.random() * 100) / 100,
    SPD: Math.round(Math.random() * 100) / 100,
    INF: Math.round(Math.random() * 100) / 100,
    ENT: Math.round(Math.random() * 100) / 100,
    LEAD: Math.round(Math.random() * 100) / 100,
    VIS: Math.round(Math.random() * 100) / 100,
  };
}

/** 获取预设人格向量 */
function presetVector(type) {
  return MOCK_PROFILES[type] || randomVector();
}

/** 获取所有预设类型 */
function getPresetTypes() {
  return Object.keys(MOCK_PROFILES);
}