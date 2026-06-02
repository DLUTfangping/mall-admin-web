# mall-admin-web Project Configuration

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | mall-admin-web |
| **Description** | mall 后台管理前端 (Vue 2.6 + Element UI) |
| **Type** | Frontend Application |
| **Language** | JavaScript |
| **Framework** | Vue 2.6 + Element UI 2.3 |
| **Repository** | Multi-repo (api + frontend) |
| **Backend Path** | `/Users/pikaqiu/Documents/backend/mall-tiny` |

## Tech Stack

| Category | Technology |
|---------|------------|
| Framework | Vue 2.6 |
| UI Library | Element UI 2.3 |
| HTTP Client | Axios |
| Charts | ECharts |
| Build | Webpack |
| State | Vuex |

## Repositories

| Repository | Path | Description |
|------------|------|-------------|
| **frontend** | `/Users/pikaqiu/Documents/front/mall-admin-web` | Vue 2.6 + Element UI 前端 |
| **api** (backend) | `/Users/pikaqiu/Documents/backend/mall-tiny` | Spring Boot 后端服务 |

## Project Structure

```
src/
├── api/              # API 请求模块
├── components/       # 公共组件
├── router/           # 路由配置
├── store/            # Vuex 状态管理
├── utils/            # 工具函数
└── views/            # 页面组件
```

## Build & Run

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

## Integrations

| Category | Integration | Status |
|----------|-------------|--------|
| Project Management | GitHub Issues & Projects | Available (未配置API) |
| CI/CD | GitHub Actions | Available |
| Notifications | None | - |

## Development Team

| Role | Agent |
|------|-------|
| Orchestrator | prime-orchestrator |
| Architect | solution-architect |
| Product Manager | product-manager |
| QA Engineer | qa-engineer |
| DevOps | devops-engineer |

## 基础规则
[导入](./.claude/rules/pagination.md)
[导入](./.claude/rules/vue-element-switch.md)
