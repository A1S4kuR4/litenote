# LiteNote (轻量笔记)

> **"Digital vellum for focused journaling."** —— 为专注手账打造的数字纸页。

---

## 🎨 项目愿景 (Product Vision)

**LiteNote** 是一款轻量级、手账风 (Hand-drawn style) 的开源跨平台记事本应用。它不仅仅是一个文本编辑器，更是一个致力于提供美观、易用且高度个性化体验的“数字创作画布”。

我们的核心目标是：
- **打造最美的开源笔记应用**：通过“Digital Vellum”设计语言，提供超越同类的 UI/UX 体验。
- **构建手账式审美生态**：引入组件化系统与样式工坊。
- **极致轻量且高效**：基于现代技术栈，保持快速流畅的交互。

---

## 🚀 核心特性 (Key Features - MVP)

目前项目处于 **Phase 1a (Web MVP)** 阶段，已实现以下核心能力：

- **🎨 写作工作台 (Journal)**：沉浸式编辑体验，支持情绪记录、模板切换及实时保存。
- **🧩 灵感发现 (Discover)**：社区导向的灵感墙，展示热门布局与写作提示。
- **🏮 素材资产库 (Library)**：管理视觉素材与预设模板，丰富笔记表现力。
- **🛠️ 样式工坊 (Workshop)**：灵活的风格实验室，预设多种审美方案。
- **🌍 多语言支持 (i18n)**：完美支持简体中文与英文。
- **📱 响应式布局**：基于 Vanilla CSS 实现的现代分栏式架构，适配多种屏幕尺寸。

---

## 🛠️ 技术架构 (Tech Stack)

项目采用 **Monorepo** 架构管理，确保前后端逻辑的高度协同：

- **前端 (Frontend)**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **后端 (Backend)**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **图标系统**: [Lucide React](https://lucide.dev/)
- **包管理**: [pnpm Workspace](https://pnpm.io/workspaces)
- **设计系统**: 纯原生 CSS (Vanilla CSS) + CSS 变量持久化

---

## 📂 目录结构 (Project Structure)

```bash
litenote/
├── apps/
│   ├── web/          # 前端应用 (React + Vite)
│   └── api/          # 后端服务 (Express API)
├── docs/             # 核心规划与详细设计文档
├── node_modules/     # 依赖包
├── package.json      # 根目录配置
└── pnpm-workspace.yaml
```

---

## ⌨️ 快速开始 (Getting Started)

### 1. 环境准备
- **Node.js**: >= 18.0.0
- **pnpm**: >= 9.0.0

### 2. 安装依赖
```bash
pnpm install
```

### 3. 开发环境启动
```bash
# 同时启动前端 (Port 3000) 与后端 (Port 8787)
pnpm dev

# 仅启动前端
pnpm dev:web

# 仅启动后端
pnpm dev:api
```

---

## 🗺️ 开发路线图 (Roadmap)

- [x] **Phase 1a: Web MVP** (当前阶段) - 核心笔记 CRUD、多维视图、基础样式。
- [ ] **Phase 1b: 桌面版发布** - 集成 Tauri + SQLite，支持离线存储与文件导出。
- [ ] **Phase 2: 组件系统** - 支持自定义组件拖拽与独立主题包。
- [ ] **Phase 3: 云端生态** - 可选云同步功能与社区素材共享市场。

---

## 📚 文档矩阵 (Documentation)

LiteNote 拥有详尽的设计文档，欢迎查阅以深入了解项目细节：

- 📅 [项目规划文档](file:///d:/GoogleProject/LiteNote/项目规划文档.md) - 核心目标与里程碑
- 🎨 [UI 设计规范](file:///d:/GoogleProject/LiteNote/UI设计规范文档.md) - “数字纸页”美学标准
- 🌉 [API 设计文档](file:///d:/GoogleProject/LiteNote/API设计文档.md) - RESTful 接口细节
- 🧭 [开发者指南](file:///d:/GoogleProject/LiteNote/开发者指南.md) - 开发流程与规范
- 🖼️ [UI 线框图设计](file:///d:/GoogleProject/LiteNote/UI页面线框图设计.md) - 界面交互草图
- 📊 [应用分析报告](file:///d:/GoogleProject/LiteNote/手账笔记类应用分析报告.md) - 竞品与市场分析
- 🏪 [社区运营方案](file:///d:/GoogleProject/LiteNote/社区运营方案.md) - 开源生态构建

---

## 🤝 贡献指南 (Contributing)

LiteNote 依然处于快速成长期，我们欢迎任何形式的贡献：
1. **报告 Bug**: 提交 Issue 描述问题。
2. **提交 Feature**: 在讨论区分享你的创意。
3. **代码贡献**: 遵循[提交规范](file:///d:/GoogleProject/LiteNote/开发者指南.md#42-提交规范)发起 Pull Request。

---

## 📄 开源协议 (License)

本项目遵循 **MIT License** 协议开源。
