# Y.MINE 人格实验室 · Demo 层

> 多场景人格校准 Demo · 从偏好到压力

**部署**: [https://hellomind-star.github.io/ymine-demos/](https://hellomind-star.github.io/ymine-demos/)

## Demo 清单

| Demo | 状态 | 路径 | 说明 |
|------|------|------|------|
| 🍸 人格调酒 | ✅ LIVE | `/cocktail/` | 六维向量 → 风味偏好 → 3 款酒品推荐 |
| 🎵 人格音乐 | ✅ LIVE | `/music/` | 六维向量 → 风格推荐 + Web Audio 合成 |
| ♟️ 棋风投资 | ✅ LIVE | `/chess/` | 棋局行为 → 投资人匹配 |
| ♠️ 扑克压力 | ✅ LIVE | `/poker/` | Poker Face Arena 彩蛋简化版 |
| ⚖️ 平衡分析 | ✅ LIVE | `/balance/` | 16 型 MBTI 胜率分布 · 博弈论 |
| 🪪 人格护照 | ✅ LIVE | `/passport/` | 六维向量可视化护照 |

## 技术栈

- 纯 HTML + CSS + JS，无框架依赖
- 所有页面可双击 `index.html` 本地打开
- 统一样式 `shared/styles.css`（深空科技风）
- Web Audio API 实时合成音频（无外部文件）

## 本地运行

```bash
# 方式 1：直接双击打开
双击 index.html

# 方式 2：本地服务器
npx serve .
```

## 风格规范

- 深空紫 `#0a0a18` · 紫 `#A78BFA` · 霓虹青 `#22D3EE` · 琥珀金 `#FBBF24`
- 磨砂玻璃卡片 + 深色渐变背景
- 移动端适配（卡片单列）
- 图标使用 emoji 或 SVG

## 六维向量

```
TOL  · 容忍度    · 高→复杂、苦、烟熏
SPD  · 速度      · 高→清爽、简单、低酒精
INF  · 影响力    · 高→甜美、果香、高颜值
ENT  · 能量      · 高→高酒精、烈、刺激
LEAD · 主导性    · 高→经典、结构化、仪式感
VIS  · 视觉性    · 高→装饰华丽、颜色鲜明
```
