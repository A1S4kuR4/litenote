# LiteNote (轻量笔记)

> **"Digital vellum for focused journaling."**  
> 为专注手账与轻量创作打造的数字纸页。

---

## 🎨 项目概览

**LiteNote** 当前处于 **Phase 1a（Web MVP）** 阶段，是一个以手账审美为核心的轻量笔记应用。仓库当前已经落地的是 **Web 前端 + 本地 Express API** 的双应用架构，而不是桌面端或云端版本。

当前已实现的主视图：

- **Discover**：展示灵感、模板与写作提示
- **Journal**：编辑笔记、切换模板、收藏与归档
- **Library**：浏览素材与模板
- **Workshop**：查看样式预设与预览效果
- **Settings**：切换语言与查看基础设置

---

## 🛠️ 当前技术栈

- **前端**：React 19 + Vite + TypeScript
- **样式**：Tailwind CSS v4 + CSS 变量 + 全局样式文件协作
- **后端**：Node.js + Express + TypeScript
- **图标**：Lucide React
- **包管理**：pnpm workspace
- **本地数据**：JSON 文件持久化（开发态）

> `Tauri`、`SQLite`、云同步、组件市场等仍然属于后续阶段规划，不代表当前仓库已实现。

---

## 📂 目录结构

```bash
litenote/
├── apps/
│   ├── web/                    # React + Vite 前端
│   └── api/                    # Express API
├── memory/                     # 过程记录、截图、迁移备忘
├── reference/                  # 参考原型/外部参考工程
├── README.md
├── 开发者指南.md
├── API设计文档.md
├── UI设计规范文档.md
├── UI页面线框图设计.md
├── 项目规划文档.md
├── package.json
└── pnpm-workspace.yaml
```

---

## ⌨️ 快速开始

### 1. 环境要求

- **Node.js**: `>= 20.18.0`
- **pnpm**: `>= 9.0.0`

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发环境

```bash
# 同时启动 Web (3000) 与 API (8787)
pnpm dev

# 仅启动前端
pnpm dev:web

# 仅启动后端
pnpm dev:api
```

启动后：

- Web: `http://localhost:3000`
- API: `http://localhost:8787`
- 前端默认通过 `/api` 代理访问本地 API

---

## 🔌 当前已实现 API

当前 Express API 提供以下接口：

- `GET /api/health`
- `GET /api/dashboard`
- `POST /api/notes`
- `PATCH /api/notes/:id`
- `POST /api/notes/:id/favorite`
- `POST /api/notes/:id/archive`

详细说明请查看 [API设计文档](./API设计文档.md)。

---

## 🗺️ 路线图

- [x] **Phase 1a: Web MVP**  
  React Web 前端、本地 Express API、基础笔记 CRUD、多视图体验
- [ ] **Phase 1b: 桌面版探索**  
  规划引入 Tauri + SQLite，补足离线与导出能力
- [ ] **Phase 2: 组件系统**  
  规划中的编辑器增强、组件化内容块、主题能力
- [ ] **Phase 3: 云端生态**  
  规划中的云同步、用户体系、素材/组件市场

---

## 📚 文档矩阵

- [开发者指南](./开发者指南.md)  
  当前仓库开发入口、目录说明、运行方式与协作建议
- [API设计文档](./API设计文档.md)  
  当前已实现 API + 未来云端 API 规划
- [UI设计规范文档](./UI设计规范文档.md)  
  视觉系统、设计原则、前端落地策略
- [UI页面线框图设计](./UI页面线框图设计.md)  
  页面信息架构与线框草图，偏结构参考
- [项目规划文档](./项目规划文档.md)  
  中长期路线图、架构设想、阶段目标
- [编辑器选型报告](./编辑器选型报告.md)  
  未来编辑器方向的候选方案分析
- [手账笔记类应用分析报告](./手账笔记类应用分析报告.md)  
  竞品、用户与市场分析
- [社区运营方案](./社区运营方案.md)  
  开源社区建设与运营规划

> 若文档描述与当前代码冲突，请优先以 `apps/web`、`apps/api` 与根目录 `package.json` 为准。

---

## 🤝 贡献说明

LiteNote 仍在快速迭代中，欢迎通过以下方式参与：

1. 提交 issue 反馈问题或体验建议
2. 提出产品、交互或设计方向建议
3. 直接提交代码或文档修正

提交前建议先阅读 [开发者指南](./开发者指南.md)。

---

## 📄 License

本项目遵循 **MIT License**。
