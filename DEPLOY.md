部署说明（data_share_frontend）

概述

本项目为 data_share 系统的前端（基于 Vite + Vue 3 + Element Plus / Vuetify）。本文档说明如何在本地构建、预览和将构建产物部署到生产环境（静态服务器 / Nginx / Docker / 静态托管服务）。

先决条件

- Node.js LTS（建议 >= 18）
- npm（随 Node 一起）或 yarn/pnpm
- 若使用 Docker，则需要 Docker

项目结构（相关）

- data-share-frontend/data-share-frontend/frontend  — 前端源代码（包含 package.json）

本地构建与预览

1. 进入前端目录：

   cd data-share-frontend/data-share-frontend/frontend

2. 安装依赖：

   npm install
   # 或者使用 yarn / pnpm

3. 开发模式（热重载）：

   npm run dev

4. 生产构建：

   npm run build

   构建产物位于 dist/ 目录。

5. 在本地预览生产构建（可选）：

   npm run preview

环境变量

- Vite 要求以 VITE_ 前缀暴露给前端代码，示例：

  在 frontend 根目录创建 .env.production：

  VITE_API_BASE=https://api.example.com

- 在构建前设置或修改这些变量（它们会被内联到构建产物中）。

生产部署选项

1) 静态文件 + Nginx

- 将 dist/ 目录的内容拷贝到服务器目录（例如 /var/www/data-share-frontend/dist）。
- 示例 Nginx 配置（/etc/nginx/sites-available/data-share-frontend）：

  server {
      listen 80;
      server_name your.domain.com;

      root /var/www/data-share-frontend/dist;
      index index.html;

      location / {
          try_files $uri $uri/ /index.html;
      }

      # 可根据需要启用 gzip、缓存等
  }

- 重载 Nginx：

  sudo ln -s /etc/nginx/sites-available/data-share-frontend /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx

2) 使用 Docker + Nginx

- 示例 Dockerfile：

  FROM node:18-alpine AS build
  WORKDIR /app
  COPY . .
  RUN cd data-share-frontend/frontend && npm ci && npm run build

  FROM nginx:stable-alpine
  COPY --from=build /app/data-share-frontend/frontend/dist /usr/share/nginx/html
  # 可替换默认的 nginx.conf 以支持 SPA 路由
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]

- 构建并运行：

  docker build -t data-share-frontend:latest .
  docker run -d -p 80:80 data-share-frontend:latest

3) 静态托管服务（Netlify / Vercel / Surge / GitHub Pages）

- 通常设置构建命令为：npm run build
- 指定发布目录为：data-share-frontend/frontend/dist（或将构建步骤放在仓库根的构建命令中以调整路径）

注意事项与排查

- 如果构建报错，请检查 Node 版本，建议使用 nvm 切换到推荐版本。
- 如果后端 API 地址有变化，确认在构建前正确设置 VITE_ 开头的环境变量。
- SPA 路由在 Nginx 部署时需做回退到 index.html（见 try_files 规则）。

附录：快速命令汇总

cd data-share-frontend/data-share-frontend/frontend
npm install
npm run build
# 可选本地预览
npm run preview

部署为 nginx：复制 dist 到 /var/www/your-site && 配置 nginx（见示例）。

---
（若需，我可以把此文档扩展为包含 CI/CD（GitHub Actions）示例、完整 nginx.conf、或根据实际后端 API 地址做示例配置。）
