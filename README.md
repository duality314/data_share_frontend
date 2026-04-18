# data_share_frontend

这是中国人民大学 LitongLab 实验室的 data_share 系统前端代码仓库。

## 目录

- 简介
- 快速开始
- 项目结构
- 开发与运行

## 简介

本仓库包含系统的前端实现（基于 Vue + Vite + Vuetify），用于展示、注册与分享数据集，并与后端 API 对接以支持用户认证、数据集管理与下载记录等功能。

## 快速开始

先决条件：安装 Node.js（建议 16+）和 npm 或 yarn。

1. 启动前端开发服务器

```bash
cd frontend
npm install
npm run dev
```

2. 本地测试后端（可选，仓库内附带轻量测试后端）

```bash
cd test_backend
npm install
npm start
```

3. 构建前端生产包

```bash
cd frontend
npm run build
```

> 如果使用 `npm run dev`，默认会启动 Vite 开发服务器，页面默认在 `http://localhost:5173`（或控制台显示的端口）。

## 项目结构（概览）

- `frontend/`：前端源码与构建配置
	- `src/`：Vue 源码（页面、组件、路由、store、API 封装等）
	- `docs/`：前端相关文档（包含 API 接口文档、架构说明等）
	- `package.json`, `vite.config.js` 等构建与依赖配置
- `test_backend/`：演示/测试后端（用于本地快速联调）
- `uploads/`：示例上传文件

## 开发与调试

- 前端开发流程：修改 `src/` 下的组件或页面，保存后 Vite 会热重载。
- 前端 API 封装位于 `frontend/src/api.js`，如需更改后端地址或认证逻辑，可在此处调整。
- 常见命令：
	- `npm run dev`：启动开发服务器
	- `npm run build`：打包生产构建
	- `npm run preview`：本地预览构建（若已配置）

