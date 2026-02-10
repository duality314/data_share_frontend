# 📘 数据共享平台 - 后端API接口文档

## 📌 文档说明

本文档定义了数据共享平台前端所需的所有后端 API 接口。后端开发人员需要按照此规范实现相应的接口。

**前端技术栈：** Vue 3 + Vite + Vuetify  
**后端要求：** Node.js / Python / Java（任选）  
**数据格式：** JSON  
**认证方式：** JWT Token

---

## 🔐 认证机制

### 认证流程

1. 用户登录成功后，后端返回 JWT Token
2. 前端将 Token 保存在 `localStorage` 中（键名：`token`）
3. 后续所有需要认证的请求，在 HTTP Header 中添加：
   ```
   Authorization: Bearer <token>
   ```

### Token 格式要求

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "name": "测试用户"
  }
}
```

---

## 📋 API 端点总览

| 分类 | 端点 | 方法 | 需要认证 | 说明 |
|------|------|------|---------|------|
| **认证** | `/api/auth/login` | POST | ❌ | 用户登录 |
| | `/api/auth/register` | POST | ❌ | 用户注册 |
| **数据市场** | `/api/datasets/market` | GET | ❌ | 获取已上架数据列表 |
| | `/api/datasets/:id` | GET | ❌ | 获取数据集详情 |
| | `/api/datasets/:id/download` | GET | ✅ | 下载数据文件 |
| **我的数据** | `/api/datasets/mine` | GET | ✅ | 获取我的数据集 |
| | `/api/datasets/:id/listing` | PATCH | ✅ | 更新上架状态 |
| | `/api/datasets/:id` | DELETE | ✅ | 删除数据集 |
| **数据上传** | `/api/datasets` | POST | ✅ | 创建数据集（含文件上传） |

---

## 🔑 1. 认证接口

### 1.1 用户登录

**端点：** `POST /api/auth/login`

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "username": "test",
  "password": "123456"
}
```

**成功响应：** `200 OK`
```json
{
  "success": true,
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "name": "测试用户"
  }
}
```

**失败响应：** `401 Unauthorized`
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

**字段说明：**
- `username`: 用户名，字符串，必填
- `password`: 密码，字符串，必填
- `token`: JWT Token，登录成功后返回
- `user`: 用户信息对象

---

### 1.2 用户注册

**端点：** `POST /api/auth/register`

**请求头：**
```
Content-Type: application/json
```

**请求体：**
```json
{
  "username": "newuser",
  "password": "123456",
  "email": "newuser@example.com",
  "name": "新用户"
}
```

**成功响应：** `201 Created`
```json
{
  "success": true,
  "message": "注册成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "name": "新用户"
  }
}
```

**失败响应：** `400 Bad Request`
```json
{
  "success": false,
  "message": "用户名已存在"
}
```

**字段说明：**
- `username`: 用户名，字符串，必填，3-20字符
- `password`: 密码，字符串，必填，6-32字符
- `email`: 邮箱，字符串，可选
- `name`: 显示名称，字符串，可选

---

## 🏪 2. 数据市场接口

### 2.1 获取数据市场列表

**端点：** `GET /api/datasets/market`

**请求头：**
```
无需认证
```

**查询参数：**
```
domain: string, 可选, 领域筛选（如：chemistry, finance）
sort: string, 可选, 排序方式（downloads=下载量, size=数据量, 默认=最新）
```

**请求示例：**
```
GET /api/datasets/market?domain=chemistry&sort=downloads
```

**成功响应：** `200 OK`
```json
{
  "success": true,
  "list": [
    {
      "id": 1,
      "name": "化学反应数据集",
      "domain": "chemistry",
      "dataType": "CSV",
      "description": "包含1000+常见化学反应的数据",
      "fileSize": 2048000,
      "downloads": 156,
      "isListed": true,
      "ownerId": 1,
      "ownerName": "张三",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

**字段说明：**
- `id`: 数据集ID，整数
- `name`: 数据集名称，字符串
- `domain`: 专业领域，字符串
- `dataType`: 数据类型（CSV/Excel/JSON/TXT等）
- `description`: 描述，字符串
- `fileSize`: 文件大小（字节），整数
- `downloads`: 下载次数，整数
- `isListed`: 是否上架，布尔值
- `ownerId`: 所有者ID，整数
- `ownerName`: 所有者名称，字符串
- `createdAt`: 创建时间，ISO 8601格式
- `updatedAt`: 更新时间，ISO 8601格式

---

### 2.2 获取数据集详情

**端点：** `GET /api/datasets/:id`

**请求头：**
```
无需认证
```

**路径参数：**
- `id`: 数据集ID，整数

**请求示例：**
```
GET /api/datasets/1
```

**成功响应：** `200 OK`
```json
{
  "success": true,
  "dataset": {
    "id": 1,
    "name": "化学反应数据集",
    "domain": "chemistry",
    "dataType": "CSV",
    "description": "包含1000+常见化学反应的数据",
    "fileSize": 2048000,
    "fileName": "chemistry_reactions.csv",
    "fileUrl": "/uploads/chemistry_reactions.csv",
    "downloads": 156,
    "isListed": true,
    "ownerId": 1,
    "ownerName": "张三",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**失败响应：** `404 Not Found`
```json
{
  "success": false,
  "message": "数据集不存在"
}
```

**字段说明：**
- `fileName`: 原始文件名
- `fileUrl`: 文件下载URL（相对路径或完整URL）

---

### 2.3 下载数据文件

**端点：** `GET /api/datasets/:id/download`

**请求头：**
```
Authorization: Bearer <token>
```

**路径参数：**
- `id`: 数据集ID，整数

**请求示例：**
```
GET /api/datasets/1/download
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**成功响应：** `200 OK`
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="chemistry_reactions.csv"

[文件二进制流]
```

**失败响应：** `401 Unauthorized`
```json
{
  "success": false,
  "message": "需要登录才能下载"
}
```

**失败响应：** `404 Not Found`
```json
{
  "success": false,
  "message": "文件不存在"
}
```

**⚠️ 重要：**
- 下载成功后，后端应该将该数据集的 `downloads` 字段 +1
- 记录下载日志（可选）

---

## 📁 3. 我的数据接口

### 3.1 获取我的数据集

**端点：** `GET /api/datasets/mine`

**请求头：**
```
Authorization: Bearer <token>
```

**成功响应：** `200 OK`
```json
{
  "success": true,
  "owned": [
    {
      "id": 1,
      "name": "我的数据集",
      "domain": "chemistry",
      "dataType": "CSV",
      "description": "这是我上传的数据集",
      "fileSize": 2048000,
      "downloads": 156,
      "isListed": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "downloaded": []
}
```

**失败响应：** `401 Unauthorized`
```json
{
  "success": false,
  "message": "需要登录"
}
```

**字段说明：**
- `owned`: 我登记的数据集数组
- `downloaded`: 我下载过的数据集数组（可选实现）

---

### 3.2 更新数据集上架状态

**端点：** `PATCH /api/datasets/:id/listing`

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**路径参数：**
- `id`: 数据集ID，整数

**请求体：**
```json
{
  "isListed": true
}
```

**成功响应：** `200 OK`
```json
{
  "success": true,
  "message": "更新成功",
  "dataset": {
    "id": 1,
    "isListed": true
  }
}
```

**失败响应：** `403 Forbidden`
```json
{
  "success": false,
  "message": "无权操作此数据集"
}
```

**权限要求：**
- 只有数据集的所有者可以修改上架状态
- 后端需要验证 `ownerId === 当前用户ID`

---

### 3.3 删除数据集

**端点：** `DELETE /api/datasets/:id`

**请求头：**
```
Authorization: Bearer <token>
```

**路径参数：**
- `id`: 数据集ID，整数

**成功响应：** `200 OK`
```json
{
  "success": true,
  "message": "删除成功"
}
```

**失败响应：** `403 Forbidden`
```json
{
  "success": false,
  "message": "无权删除此数据集"
}
```

**权限要求：**
- 只有数据集的所有者可以删除
- 删除数据集时，同时删除对应的文件

---

## 📤 4. 数据上传接口

### 4.1 创建数据集（上传文件）

**端点：** `POST /api/datasets`

**请求头：**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求体（FormData）：**
```
name: string, 必填, 数据集名称
domain: string, 必填, 专业领域
dataType: string, 必填, 数据类型（CSV/Excel/JSON/TXT等）
description: string, 必填, 数据描述（最多500字）
file: File, 必填, 上传的文件
```

**请求示例（JavaScript）：**
```javascript
const formData = new FormData();
formData.append('name', '化学反应数据集');
formData.append('domain', 'chemistry');
formData.append('dataType', 'CSV');
formData.append('description', '包含1000+常见化学反应的数据');
formData.append('file', fileObject); // File 对象

await api.post('/api/datasets', formData);
```

**成功响应：** `201 Created`
```json
{
  "success": true,
  "message": "上传成功",
  "dataset": {
    "id": 2,
    "name": "化学反应数据集",
    "domain": "chemistry",
    "dataType": "CSV",
    "description": "包含1000+常见化学反应的数据",
    "fileSize": 2048000,
    "fileName": "chemistry_reactions.csv",
    "fileUrl": "/uploads/chemistry_reactions.csv",
    "downloads": 0,
    "isListed": false,
    "ownerId": 1,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**失败响应：** `400 Bad Request`
```json
{
  "success": false,
  "message": "文件大小超过限制（最大50MB）"
}
```

**失败响应：** `415 Unsupported Media Type`
```json
{
  "success": false,
  "message": "不支持的文件类型"
}
```

**文件上传要求：**
- 最大文件大小：50MB（可配置）
- 支持的文件类型：
  - CSV: `.csv`
  - Excel: `.xlsx`, `.xls`
  - JSON: `.json`
  - 文本: `.txt`
  - 压缩包: `.zip`（可选）
- 文件存储位置：`uploads/` 目录
- 文件命名：建议使用时间戳 + 原始文件名，避免重名

---

## 🔄 5. 错误响应规范

### 标准错误响应格式

所有错误响应都应该遵循以下格式：

```json
{
  "success": false,
  "message": "错误描述信息",
  "error": "ERROR_CODE",
  "details": {}
}
```

### HTTP 状态码使用

| 状态码 | 说明 | 使用场景 |
|--------|------|---------|
| 200 | 成功 | GET, PATCH, DELETE 成功 |
| 201 | 已创建 | POST 创建成功 |
| 400 | 请求错误 | 参数验证失败、数据格式错误 |
| 401 | 未认证 | Token 无效、未登录 |
| 403 | 无权限 | 无权操作该资源 |
| 404 | 未找到 | 资源不存在 |
| 415 | 不支持的媒体类型 | 文件类型不支持 |
| 500 | 服务器错误 | 内部错误 |

### 常见错误码

| 错误码 | 错误信息 | 说明 |
|--------|---------|------|
| `INVALID_CREDENTIALS` | 用户名或密码错误 | 登录失败 |
| `USER_EXISTS` | 用户名已存在 | 注册时用户名重复 |
| `TOKEN_INVALID` | Token无效或已过期 | 认证失败 |
| `UNAUTHORIZED` | 需要登录 | 未提供Token |
| `FORBIDDEN` | 无权操作 | 无权限访问资源 |
| `NOT_FOUND` | 资源不存在 | 数据集不存在 |
| `FILE_TOO_LARGE` | 文件过大 | 超过大小限制 |
| `INVALID_FILE_TYPE` | 文件类型不支持 | 文件格式错误 |
| `VALIDATION_ERROR` | 参数验证失败 | 字段缺失或格式错误 |

---

## 📊 6. 数据库设计建议

### 用户表 (users)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INT | 用户ID | PRIMARY KEY, AUTO_INCREMENT |
| username | VARCHAR(50) | 用户名 | UNIQUE, NOT NULL |
| password | VARCHAR(255) | 密码哈希 | NOT NULL |
| email | VARCHAR(100) | 邮箱 | UNIQUE |
| name | VARCHAR(100) | 显示名称 |  |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | 更新时间 | ON UPDATE CURRENT_TIMESTAMP |

### 数据集表 (datasets)

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INT | 数据集ID | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(200) | 数据集名称 | NOT NULL |
| domain | VARCHAR(100) | 专业领域 | NOT NULL |
| data_type | VARCHAR(50) | 数据类型 | NOT NULL |
| description | TEXT | 描述 |  |
| file_name | VARCHAR(255) | 原始文件名 | NOT NULL |
| file_path | VARCHAR(500) | 文件存储路径 | NOT NULL |
| file_size | BIGINT | 文件大小（字节） | NOT NULL |
| downloads | INT | 下载次数 | DEFAULT 0 |
| is_listed | BOOLEAN | 是否上架 | DEFAULT false |
| owner_id | INT | 所有者ID | FOREIGN KEY (users.id) |
| created_at | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | 更新时间 | ON UPDATE CURRENT_TIMESTAMP |

### 下载日志表 (download_logs) - 可选

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INT | 日志ID | PRIMARY KEY, AUTO_INCREMENT |
| dataset_id | INT | 数据集ID | FOREIGN KEY (datasets.id) |
| user_id | INT | 下载用户ID | FOREIGN KEY (users.id) |
| download_at | DATETIME | 下载时间 | DEFAULT CURRENT_TIMESTAMP |

---

## 🔧 7. 实现建议

### 7.1 密码安全

❌ **不要这样做：**
```javascript
// 明文存储密码
user.password = req.body.password;
```

✅ **应该这样做：**
```javascript
// 使用 bcrypt 哈希密码
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(req.body.password, 10);
user.password = hashedPassword;

// 验证密码
const isValid = await bcrypt.compare(inputPassword, user.password);
```

---

### 7.2 JWT Token 生成

```javascript
const jwt = require('jsonwebtoken');

// 生成 Token
const token = jwt.sign(
  { userId: user.id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '7d' } // 7天过期
);

// 验证 Token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

---

### 7.3 文件上传处理

**Node.js + Express + Multer 示例：**

```javascript
const multer = require('multer');
const path = require('path');

// 配置存储
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls', '.json', '.txt', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

// 配置 multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: fileFilter
});

// 使用
app.post('/api/datasets', upload.single('file'), async (req, res) => {
  const { name, domain, dataType, description } = req.body;
  const file = req.file;
  
  // 保存到数据库...
});
```

---

### 7.4 CORS 配置

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // 前端地址
  credentials: true
}));
```

---

## 🧪 8. 接口测试

### 测试工具推荐
- Postman
- Insomnia
- curl

### 测试用例示例

#### 1. 测试登录
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

#### 2. 测试获取数据列表
```bash
curl http://localhost:3001/api/datasets/market?domain=chemistry
```

#### 3. 测试上传文件
```bash
curl -X POST http://localhost:3001/api/datasets \
  -H "Authorization: Bearer <token>" \
  -F "name=测试数据" \
  -F "domain=test" \
  -F "dataType=CSV" \
  -F "description=测试描述" \
  -F "file=@./test.csv"
```

---

## 📞 技术支持

### 前端代码位置

- **API 配置：** `src/api.js`
- **路由配置：** `src/router.js`
- **认证管理：** `src/store/auth.js`
- **页面组件：**
  - 登录：`src/pages/Login.vue`
  - 数据市场：`src/pages/Market.vue`
  - 我的数据：`src/pages/MyData.vue`
  - 数据登记：`src/pages/RegisterData.vue`
  - 数据详情：`src/pages/DatasetDetail.vue`

### 前端 API 调用示例

```javascript
// src/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001", // 后端地址
});

// 自动添加 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📝 开发检查清单

### 后端开发完成标准

- [ ] 所有接口按照文档规范实现
- [ ] 密码使用 bcrypt 哈希存储
- [ ] JWT Token 正确生成和验证
- [ ] 文件上传功能正常（大小、类型限制）
- [ ] 权限验证正确（只能操作自己的数据）
- [ ] CORS 配置正确
- [ ] 错误响应格式统一
- [ ] 数据库索引优化（username, email, domain等）
- [ ] 使用 Postman 测试所有接口
- [ ] 编写接口单元测试

---

## 🎯 快速上手步骤

1. **阅读本文档**，了解所有接口规范
2. **设计数据库表**，参考第6节
3. **实现认证接口**，从登录/注册开始
4. **实现数据市场接口**，可以先返回假数据测试
5. **实现文件上传**，配置 multer 或类似中间件
6. **实现我的数据接口**，注意权限验证
7. **使用 Postman 测试**，确保所有接口正常
8. **与前端联调**，修改 `src/api.js` 中的 baseURL

---

**祝开发顺利！** 🎉

如有疑问，请联系前端开发人员。
