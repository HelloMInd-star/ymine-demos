# 🧪 Y.MINE 人格实验室

> **六维人格向量驱动 · 多场景人格校准 Demo 合集**  
> 将抽象的 MBTI 人格转化为可计算、可体验的交互场景

[![在线体验](https://img.shields.io/badge/🌐-在线体验-22D3EE?style=for-the-badge)](https://hellomind-star.github.io/ymine-demos/)
[![GitHub last commit](https://img.shields.io/github/last-commit/HelloMInd-star/ymine-demos?style=flat-square&color=A78BFA)](https://github.com/HelloMInd-star/ymine-demos/commits/main)

---

## 🎯 项目定位

Y.MINE 是一套**人格可计算化**的验证场——将 16 型 MBTI 人格映射为六维向量，在调酒、音乐、棋风、扑克等跨域场景中，验证同一套人格模型的可迁移性。

**核心问题**：人格能否被量化为可计算的向量，并在不同场景中保持一致的行为映射？

**我的答案**：可以。Y.MINE 的 6 个 Demo 证明了同一套六维向量模型，能够驱动完全不同的交互场景——从风味推荐到音乐合成，从棋风分析到博弈对抗。

---

## 🧩 Demo 矩阵

| Demo | 状态 | 路径 | 核心逻辑 |
|------|------|------|----------|
| 🍸 人格调酒 | ✅ LIVE | `/cocktail/` | 六维向量 → 风味偏好 → 3 款酒品推荐 |
| 🎵 人格音乐 | ✅ LIVE | `/music/` | 六维向量 → 风格推荐 + Web Audio 实时合成 |
| ♟️ 棋风投资 | ✅ LIVE | `/chess/` | 棋局行为 → 3D 坐标 → 投资人匹配 |
| ♠️ 扑克压力 | ✅ LIVE | `/poker/` | 人格驱动的 AI 对手 · 不完全信息博弈 |
| ⚖️ 平衡分析 | ✅ LIVE | `/balance/` | 16 型 MBTI 胜率分布 · 纳什均衡 |
| 🪪 人格护照 | ✅ LIVE | `/passport/` | 六维向量可视化 · 可分享的人格名片 |

> 💡 所有 Demo 均部署上线，点击即可体验：[https://hellomind-star.github.io/ymine-demos/](https://hellomind-star.github.io/ymine-demos/)

---

## 🧠 六维人格向量模型

Y.MINE 的核心是一套六维向量体系，将 MBTI 人格映射为可计算的数值坐标：

| 维度 | 英文 | 高值指向 |
|------|------|----------|
| 容忍度 | TOL | 复杂、苦、烟熏 |
| 速度 | SPD | 清爽、简单、低酒精 |
| 影响力 | INF | 甜美、果香、高颜值 |
| 能量 | ENT | 高酒精、烈、刺激 |
| 主导性 | LEAD | 经典、结构化、仪式感 |
| 视觉性 | VIS | 装饰华丽、颜色鲜明 |

每个 MBTI 类型在这六个维度上有独特的向量分布，驱动不同场景下的行为输出——**同一套向量，跨场景复用**。

---

## 🛠 技术栈

- **纯原生**：HTML + CSS + JS，无框架依赖
- **统一样式**：`shared/styles.css`（深空科技风）
- **实时音频**：Web Audio API 合成（无外部音频文件）
- **零构建**：所有页面可双击 `index.html` 本地打开

### 本地运行

```bash
# 方式一：直接双击打开
双击 index.html

# 方式二：本地服务器
npx serve .
```

---

## 🎨 设计规范

- **深空紫** `#0a0a18` · **紫** `#A78BFA` · **霓虹青** `#22D3EE` · **琥珀金** `#FBBF24`
- 磨砂玻璃卡片 + 深色渐变背景
- 移动端适配（卡片单列）
- 图标使用 emoji 或 SVG

---

## 👤 关于构建者

**罗煜** · AI 产品经理

- 独立构建 Game-OS 人格决策引擎，从 0 到 1 孵化 6+ 可玩产品
- 幻觉率压至 0.5%（行业平均 15%），148 项单元测试 100% 通过
- 400+ 次规范化 Git 迭代，全栈落地（React + FastAPI）
- 跨界背景：审计 / 工程 / MBA，擅于在复杂非稳态场景中抽象决策系统

📧 hellomind-y@outlook.com  
🐙 [GitHub](https://github.com/HelloMInd-star) · 🌐 [作品集](https://hellomind-star.github.io/ymine-demos/)

---

## 📄 License

MIT © 2026 Y.MINE 人格实验室
