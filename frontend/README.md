# 数据共享平台 - 前端项目

一个基于 Vue 3 + Vuetify 3 的现代化数据共享平台前端应用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vuetify 3** - Material Design 组件库
- **Vue Router** - 官方路由管理
- **Pinia** - 状态管理
- **Axios** - HTTP 客户端
- **Vite** - 下一代前端构建工具

## 项目特性

### 🎨 现代化 UI 设计
- Material Design 风格
- 响应式布局，支持移动端和桌面端
- 流畅的页面切换动画
- 丰富的图标和视觉反馈

### 📱 页面功能

#### 1. 登录页面 (`/login`)
- 表单验证
- 密码显示/隐藏切换
- 支持注册新用户
- 友好的错误提示

#### 2. 数据市场 (`/market`)
- 数据集列表展示
- 领域筛选功能
- 多种排序方式（最新、下载量、数据量）
- 卡片式布局，悬停效果

#### 3. 数据登记 (`/register-data`)
- 完整的表单验证
- 文件上传功能
- 实时文件大小显示
- 上传进度反馈

#### 4. 我的数据 (`/my`)
- 已登记数据列表
- 上架/下架开关控制
- 数据统计信息
- 空状态提示

#### 5. 数据集详情 (`/dataset/:id`)
- 详细信息展示
- 数据预览功能
- 一键下载
- 面包屑导航

### 🎯 开发特性

- **组件化开发** - 可复用的组件设计
- **TypeScript 支持** - 类型安全（可选）
- **代码规范** - 统一的代码风格
- **响应式设计** - 适配各种屏幕尺寸
- **深色模式支持** - Vuetify 内置主题切换

## 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 开发模式

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:5173

### 生产构建

\`\`\`bash
npm run build
\`\`\`

### 预览构建

\`\`\`bash
npm run preview
\`\`\`

## 项目结构

\`\`\`
frontend/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── Login.vue       # 登录页
│   │   ├── Market.vue      # 数据市场
│   │   ├── MyData.vue      # 我的数据
│   │   ├── RegisterData.vue # 数据登记
│   │   └── DatasetDetail.vue # 数据详情
│   ├── plugins/            # 插件配置
│   │   └── vuetify.js      # Vuetify 配置
│   ├── store/              # 状态管理
│   │   └── auth.js         # 认证状态
│   ├── App.vue             # 根组件
│   ├── main.js             # 应用入口
│   ├── router.js           # 路由配置
│   └── api.js              # API 封装
├── index.html              # HTML 模板
├── vite.config.js          # Vite 配置
└── package.json            # 项目配置
\`\`\`

## 配置说明

### API 地址配置

在 `src/api.js` 中配置后端 API 地址：

\`\`\`javascript
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3001",
});
\`\`\`

可以通过环境变量 `VITE_API_BASE` 自定义 API 地址。

### 主题配置

在 `src/plugins/vuetify.js` 中自定义主题颜色：

\`\`\`javascript
theme: {
  themes: {
    light: {
      colors: {
        primary: "#1976D2",
        secondary: "#424242",
        // ... 更多颜色
      },
    },
  },
}
\`\`\`

## 开发模式说明

在开发模式下，路由守卫已配置为跳过登录验证，方便前端独立开发和测试。

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

## 待优化功能

- [ ] 添加数据可视化
- [ ] 支持批量上传
- [ ] 添加数据标签系统
- [ ] 实现高级搜索
- [ ] 添加用户个人中心
- [ ] 数据下载历史记录

## License

MIT
