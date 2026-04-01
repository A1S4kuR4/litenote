# LiteNote API 设计文档

## 一、API 概述

> **适用阶段说明**
>
> 本文档分为两层内容：
> 1. **当前已实现 API**：基于 Express 的本地开发服务
> 2. **未来规划 API**：Phase 3+ 可能采用的云端 `/v1/*` 方案
>
> 如果你要对接当前仓库，请优先阅读本节 1.1 ~ 1.4；后续章节主要是未来规划。

### 1.1 当前实现概览

- 服务形态：本地 Express API
- 默认地址：`http://localhost:8787`
- 前端访问方式：通过 Vite 代理访问 `/api`
- 当前不包含认证、分页、版本前缀、统一响应包裹等云端能力
- 当前实现以 `apps/api/src/index.ts`、`apps/api/src/store.ts`、`apps/api/src/types.ts` 为准

### 1.2 当前接口列表

```
GET  /api/health
GET  /api/dashboard
POST /api/notes
PATCH /api/notes/:id
POST /api/notes/:id/favorite
POST /api/notes/:id/archive
```

### 1.3 当前请求与响应说明

#### `GET /api/health`

返回服务状态：

```json
{
  "status": "ok",
  "service": "litenote-api",
  "timestamp": "2026-04-01T10:00:00.000Z"
}
```

#### `GET /api/dashboard`

返回当前前端首页/工作台所需的聚合数据，包含：

- `user`
- `spotlight`
- `writingTip`
- `stats`
- `notes`
- `templates`
- `assets`
- `workshopPresets`

#### `POST /api/notes`

请求体：

```json
{
  "title": "New editorial entry",
  "body": "",
  "tags": ["travel", "spring"],
  "mood": "calm",
  "templateId": "botanical-reflection",
  "status": "draft"
}
```

说明：

- 所有字段都可选
- 服务端会补齐默认值
- `summary` 由服务端根据 `body` 自动生成
- 响应为创建后的完整 `Note` 对象，状态码 `201`

#### `PATCH /api/notes/:id`

请求体支持部分字段更新：

```json
{
  "title": "Updated title",
  "body": "Updated body",
  "tags": ["idea", "journal"],
  "mood": "focused",
  "templateId": "template-id",
  "status": "published",
  "isFavorite": true,
  "isArchived": false
}
```

说明：

- 找不到笔记时返回 `404`
- 错误体格式为：

```json
{
  "message": "Note not found."
}
```

#### `POST /api/notes/:id/favorite`

- 切换 `isFavorite`
- 成功时返回更新后的 `Note`
- 找不到笔记时返回 `404`

#### `POST /api/notes/:id/archive`

- 将笔记标记为归档
- 归档后该笔记不会出现在 `/api/dashboard` 的 `notes` 列表中
- 成功时返回更新后的 `Note`

### 1.4 当前数据与运行约束

- 数据持久化文件：`apps/api/data/litenote-db.json`
- 初次运行若文件不存在，会自动写入种子数据
- 前端默认 API 基址：`/api`
- Vite 代理目标：`http://localhost:8787`

---

## 二、未来规划（Phase 3+ 云端 API）

> 以下章节描述的是未来可能采用的云端 `/v1/*` RESTful 方案。  
> 它们不是当前仓库已经实现的接口，也不应当被当作当前集成依据。

---

### 2.1 HTTP 方法

```
GET     - 获取资源
POST    - 创建资源
PATCH   - 部分更新资源
PUT     - 完全替换资源
DELETE  - 删除资源
```

### 2.2 状态码

```
成功响应:
├─ 200 OK               - 请求成功，返回数据
├─ 201 Created          - 资源创建成功
├─ 204 No Content       - 请求成功，无返回数据
└─ 206 Partial Content  - 分页返回部分内容

重定向:
├─ 301 Moved Permanently
└─ 302 Found

客户端错误:
├─ 400 Bad Request      - 请求参数错误
├─ 401 Unauthorized     - 未认证
├─ 403 Forbidden        - 无权限
├─ 404 Not Found        - 资源不存在
├─ 409 Conflict         - 冲突（如重复创建）
├─ 429 Too Many Requests - 请求过于频繁
└─ 422 Unprocessable Entity - 参数有效但无法处理

服务器错误:
├─ 500 Internal Server Error
├─ 502 Bad Gateway
├─ 503 Service Unavailable
└─ 504 Gateway Timeout
```

### 2.3 响应格式

#### 成功响应

```json
{
  "code": 200,
  "message": "OK",
  "data": {
    // 实际数据
  },
  "meta": {
    "timestamp": "2026-03-30T10:30:00Z",
    "request_id": "req_12345",
    "api_version": "v1"
  }
}
```

#### 列表响应（分页）

```json
{
  "code": 200,
  "message": "OK",
  "data": [
    { /* 项目 1 */ },
    { /* 项目 2 */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2026-03-30T10:30:00Z",
    "request_id": "req_12345"
  }
}
```

#### 错误响应

```json
{
  "code": 400,
  "message": "Bad Request",
  "error": {
    "type": "validation_error",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-03-30T10:30:00Z",
    "request_id": "req_12345"
  }
}
```

### 2.4 分页

```
查询参数:
├─ page: 页码，默认 1
├─ limit: 每页条数，默认 20，最大 100
└─ offset: 偏移量（可选，与 page 互斥）

示例:
GET /v1/notes?page=2&limit=20

响应包含分页元数据:
{
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### 2.5 字段选择

```
查询参数:
├─ fields: 指定返回的字段，逗号分隔

示例:
GET /v1/notes/123?fields=id,title,created_at

默认返回所有字段，可减少传输数据量
```

### 2.6 排序

```
查询参数:
├─ sort: 排序字段，使用 - 前缀表示降序

示例:
GET /v1/notes?sort=-created_at,title

说明:
├─ 默认升序
├─ -字段名 表示降序
├─ 多个字段用逗号分隔
└─ 优先级从左到右
```

### 2.7 过滤

```
查询参数:
├─ 按字段过滤: ?category=study&status=active
├─ 范围过滤: ?created_at_gte=2026-01-01&created_at_lte=2026-03-31
├─ 模糊搜索: ?search=Python&search_fields=title,content

常用操作符:
├─ _eq: 等于（默认）
├─ _ne: 不等于
├─ _gt: 大于
├─ _gte: 大于等于
├─ _lt: 小于
├─ _lte: 小于等于
├─ _in: 在列表中
├─ _contains: 包含（字符串）
└─ _icontains: 不区分大小写包含

示例:
GET /v1/notes?created_at_gte=2026-01-01&tags_in=python,javascript&status_eq=active
```

---

## 三、认证与授权

### 3.1 认证方式

#### Token 认证（推荐）

```
请求头:
Authorization: Bearer <access_token>

获取 Token:
POST /v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

响应:
{
  "code": 200,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

#### Token 刷新

```
POST /v1/auth/refresh
{
  "refresh_token": "eyJhbGc..."
}

响应:
{
  "code": 200,
  "data": {
    "access_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

### 3.2 权限模型

```
权限结构:
├─ 所有者权限（OWNER）：创建者
├─ 编辑权限（EDITOR）：可编辑
├─ 查看权限（VIEWER）：只读
└─ 协作者权限（COLLABORATOR）：受邀编辑

权限检查:
├─ 资源级权限检查
├─ 支持团队/群组权限
└─ 公开/私有设置
```

---

## 四、核心资源 API

### 4.1 笔记资源

#### 创建笔记

```
POST /v1/notes

请求体:
{
  "title": "今天的学习笔记",
  "content": "Markdown 格式的内容",
  "category": "study",      // 可选
  "tags": ["python", "算法"],  // 可选
  "is_favorite": false,     // 可选
  "is_public": false        // 可选
}

响应 (201):
{
  "code": 201,
  "message": "Created",
  "data": {
    "id": "note_12345",
    "title": "今天的学习笔记",
    "content": "Markdown 格式的内容",
    "category": "study",
    "tags": ["python", "算法"],
    "is_favorite": false,
    "is_public": false,
    "author": {
      "id": "user_123",
      "name": "张三",
      "avatar": "https://..."
    },
    "created_at": "2026-03-30T10:30:00Z",
    "updated_at": "2026-03-30T10:30:00Z",
    "version": 1
  }
}
```

#### 获取笔记列表

```
GET /v1/notes

查询参数:
├─ page: 1
├─ limit: 20
├─ sort: -created_at
├─ category: study
├─ tags: python,javascript
├─ search: 学习
├─ is_favorite: true (可选)
└─ fields: id,title,created_at

响应 (200):
{
  "code": 200,
  "message": "OK",
  "data": [
    {
      "id": "note_12345",
      "title": "今天的学习笔记",
      "preview": "Markdown 格式的内容摘要...",
      "category": "study",
      "tags": ["python"],
      "created_at": "2026-03-30T10:30:00Z",
      "updated_at": "2026-03-30T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

#### 获取单个笔记

```
GET /v1/notes/{note_id}

查询参数:
└─ fields: 可选的字段选择

响应 (200):
{
  "code": 200,
  "data": {
    "id": "note_12345",
    "title": "今天的学习笔记",
    "content": "完整 Markdown 内容",
    "category": "study",
    "tags": ["python", "算法"],
    "is_favorite": false,
    "is_public": false,
    "author": { /* 作者信息 */ },
    "created_at": "2026-03-30T10:30:00Z",
    "updated_at": "2026-03-30T10:30:00Z",
    "version": 1,
    "components": [
      {
        "id": "comp_1",
        "type": "title",
        "properties": { "text": "标题", "level": 2 }
      }
    ]
  }
}
```

#### 更新笔记

```
PATCH /v1/notes/{note_id}

请求体（可选）:
{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "category": "work",
  "tags": ["新标签"]
}

响应 (200):
{
  "code": 200,
  "data": { /* 更新后的笔记 */ }
}
```

#### 删除笔记

```
DELETE /v1/notes/{note_id}

响应 (204):
无返回体

或柔和删除（可恢复）:
PATCH /v1/notes/{note_id}
{
  "deleted_at": "2026-03-30T10:30:00Z"
}
```

### 4.2 分类资源

#### 创建分类

```
POST /v1/categories

请求体:
{
  "name": "学习",
  "color": "#5B9BD5",
  "icon": "book",
  "description": "学习相关笔记"
}

响应 (201):
{
  "code": 201,
  "data": {
    "id": "cat_12345",
    "name": "学习",
    "color": "#5B9BD5",
    "icon": "book",
    "description": "学习相关笔记",
    "count": 0,
    "created_at": "2026-03-30T10:30:00Z"
  }
}
```

#### 获取分类列表

```
GET /v1/categories

查询参数:
├─ sort: -created_at
└─ include_count: true（包含笔记数）

响应 (200):
{
  "code": 200,
  "data": [
    {
      "id": "cat_12345",
      "name": "学习",
      "color": "#5B9BD5",
      "icon": "book",
      "count": 12
    }
  ]
}
```

#### 更新分类

```
PATCH /v1/categories/{category_id}

请求体:
{
  "name": "新名称",
  "color": "#FFB74D"
}
```

#### 删除分类

```
DELETE /v1/categories/{category_id}

查询参数（可选）:
├─ transfer_to: 目标分类 ID（转移该分类的笔记）
└─ delete_notes: true（删除该分类的所有笔记）
```

### 4.3 标签资源

#### 创建标签

```
POST /v1/tags

请求体:
{
  "name": "Python",
  "color": "#81C784",
  "description": "Python 编程"
}
```

#### 获取标签列表

```
GET /v1/tags

查询参数:
├─ search: 搜索标签名
├─ sort: -usage_count
└─ include_usage: true（包含使用次数）

响应:
{
  "code": 200,
  "data": [
    {
      "id": "tag_12345",
      "name": "Python",
      "color": "#81C784",
      "usage_count": 25
    }
  ]
}
```

#### 删除标签

```
DELETE /v1/tags/{tag_id}

查询参数:
└─ remove_from_all: true（从所有笔记移除）
```

### 4.4 组件资源

#### 获取内置组件库

```
GET /v1/components/builtin

查询参数:
├─ category: content | ui
├─ search: 搜索组件
└─ version: 指定版本

响应:
{
  "code": 200,
  "data": [
    {
      "id": "component_title_h1",
      "name": "H1 标题",
      "version": "1.0.0",
      "category": "content",
      "schema": {
        "properties": {
          "text": { "type": "string" }
        }
      },
      "preview_image": "https://..."
    }
  ]
}
```

#### 创建用户组件

```
POST /v1/components/custom

请求体:
{
  "name": "我的组件",
  "category": "content",
  "version": "1.0.0",
  "schema": { /* JSON Schema */ },
  "template": "<div>...</div>",
  "styles": "/* CSS */",
  "preview_image": "base64 or URL",
  "documentation": "组件文档"
}
```

#### 获取用户组件

```
GET /v1/components/custom

查询参数:
├─ page: 1
├─ limit: 20
├─ sort: -created_at
└─ search: 搜索
```

#### 发布组件到社区市场

```
POST /v1/components/publish

请求体:
{
  "component_id": "component_123",
  "description": "组件描述",
  "tags": ["标签1", "标签2"],
  "source_url": "GitHub URL",
  "documentation_url": "文档 URL"
}

响应 (201):
{
  "code": 201,
  "data": {
    "id": "pub_component_123",
    "status": "pending_review",
    "published_at": "2026-03-30T10:30:00Z"
  }
}
```

### 4.5 主题资源

#### 获取主题列表

```
GET /v1/themes

查询参数:
├─ type: builtin | community
├─ sort: -popularity
└─ search: 搜索主题

响应:
{
  "code": 200,
  "data": [
    {
      "id": "theme_light_1",
      "name": "清晨",
      "type": "builtin",
      "colors": { /* 色彩方案 */ },
      "fonts": { /* 字体方案 */ },
      "preview_image": "https://...",
      "rating": 4.8,
      "downloads": 1250
    }
  ]
}
```

#### 应用主题

```
PATCH /v1/users/me/settings

请求体:
{
  "current_theme": "theme_light_1"
}
```

#### 创建自定义主题

```
POST /v1/themes/custom

请求体:
{
  "name": "我的主题",
  "description": "主题描述",
  "colors": {
    "primary": "#5B9BD5",
    "background": "#FFFFFF"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  }
}
```

---

## 五、用户资源 API

### 5.1 用户注册

```
POST /v1/auth/register

请求体:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}

响应 (201):
{
  "code": 201,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "用户名",
    "avatar": "https://...",
    "created_at": "2026-03-30T10:30:00Z"
  }
}
```

### 5.2 获取当前用户信息

```
GET /v1/users/me

响应 (200):
{
  "code": 200,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "用户名",
    "avatar": "https://...",
    "bio": "个人简介",
    "settings": {
      "language": "zh-CN",
      "theme": "light",
      "notifications_enabled": true
    },
    "stats": {
      "notes_count": 150,
      "categories_count": 8,
      "tags_count": 35
    },
    "created_at": "2026-03-30T10:30:00Z"
  }
}
```

### 5.3 更新用户信息

```
PATCH /v1/users/me

请求体:
{
  "name": "新名字",
  "bio": "新简介",
  "avatar": "base64 or URL"
}
```

### 5.4 用户设置

#### 获取设置

```
GET /v1/users/me/settings

响应:
{
  "code": 200,
  "data": {
    "language": "zh-CN",
    "theme": "light",
    "notifications_enabled": true,
    "auto_save_interval": 5,
    "privacy": {
      "profile_public": false,
      "notes_public_by_default": false
    }
  }
}
```

#### 更新设置

```
PATCH /v1/users/me/settings

请求体:
{
  "language": "en-US",
  "theme": "dark"
}
```

---

## 六、协作与分享 API

### 6.1 分享笔记

```
POST /v1/notes/{note_id}/share

请求体:
{
  "email": "friend@example.com",
  "permission": "view"  // view | edit | admin
}

响应 (201):
{
  "code": 201,
  "data": {
    "id": "share_12345",
    "note_id": "note_12345",
    "user_id": "user_456",
    "permission": "view",
    "share_url": "https://litenote.dev/share/abc123",
    "created_at": "2026-03-30T10:30:00Z"
  }
}
```

### 6.2 获取分享列表

```
GET /v1/notes/{note_id}/shares

响应:
{
  "code": 200,
  "data": [
    {
      "id": "share_12345",
      "user": {
        "id": "user_456",
        "name": "好友",
        "email": "friend@example.com"
      },
      "permission": "view",
      "shared_at": "2026-03-30T10:30:00Z"
    }
  ]
}
```

### 6.3 取消分享

```
DELETE /v1/notes/{note_id}/shares/{share_id}

响应 (204):
无返回体
```

### 6.4 公开笔记

```
PATCH /v1/notes/{note_id}

请求体:
{
  "is_public": true,
  "public_access": "view"  // view | comment
}
```

---

## 七、搜索与建议 API

### 7.1 全文搜索

```
GET /v1/search

查询参数:
├─ q: 搜索关键词（必需）
├─ type: 搜索类型（notes | categories | tags | all）
├─ limit: 返回结果数，最大 50
└─ offset: 偏移量

响应:
{
  "code": 200,
  "data": {
    "notes": [
      {
        "id": "note_12345",
        "title": "匹配的笔记",
        "preview": "在第 5 行找到匹配...",
        "highlights": {
          "title": ["Python"],
          "content": ["Python 是..."]
        }
      }
    ],
    "categories": [ /* 匹配的分类 */ ],
    "tags": [ /* 匹配的标签 */ ]
  },
  "total": 25,
  "query_time_ms": 45
}
```

### 7.2 建议

```
GET /v1/suggestions

查询参数:
├─ q: 输入的查询词
├─ type: tags | categories | recent
└─ limit: 最多返回数，默认 10

响应:
{
  "code": 200,
  "data": [
    {
      "type": "tag",
      "id": "tag_123",
      "name": "Python",
      "frequency": 45
    }
  ]
}
```

---

## 八、媒体上传 API

### 8.1 上传文件

```
POST /v1/upload

Content-Type: multipart/form-data

表单字段:
├─ file: 文件数据（必需）
├─ folder: 目标文件夹（可选，如 notes/attachments）
└─ type: 文件类型检查（可选，如 image | document）

响应 (201):
{
  "code": 201,
  "data": {
    "id": "upload_12345",
    "filename": "example.png",
    "url": "https://cdn.litenote.dev/uploads/example.png",
    "size": 102400,
    "mime_type": "image/png",
    "created_at": "2026-03-30T10:30:00Z"
  }
}
```

### 8.2 删除文件

```
DELETE /v1/uploads/{upload_id}

响应 (204):
无返回体
```

---

## 九、导出与导入 API

### 9.1 导出笔记

```
GET /v1/notes/{note_id}/export

查询参数:
├─ format: markdown | html | pdf | json
└─ include_attachments: true

响应:
视格式而定，文件下载流
Content-Disposition: attachment; filename="note.md"
```

### 9.2 批量导出

```
POST /v1/export

请求体:
{
  "note_ids": ["note_1", "note_2"],
  "format": "markdown",
  "archive_format": "zip"
}

响应 (202):
{
  "code": 202,
  "data": {
    "task_id": "export_12345",
    "status": "processing",
    "progress": 0,
    "created_at": "2026-03-30T10:30:00Z"
  }
}
```

### 9.3 导入笔记

```
POST /v1/import

Content-Type: multipart/form-data

表单字段:
├─ file: 导入文件（markdown、json 等）
├─ format: 文件格式（markdown | json | evernote | notion）
└─ target_category: 目标分类 ID（可选）

响应 (201):
{
  "code": 201,
  "data": {
    "task_id": "import_12345",
    "status": "processing",
    "estimated_items": 25
  }
}
```

### 9.4 查看导入/导出进度

```
GET /v1/tasks/{task_id}

响应:
{
  "code": 200,
  "data": {
    "id": "export_12345",
    "type": "export",
    "status": "completed",
    "progress": 100,
    "result": {
      "url": "https://cdn.litenote.dev/exports/export_12345.zip",
      "size": 1024000,
      "expires_at": "2026-04-06T10:30:00Z"
    }
  }
}
```

---

## 十、社区组件市场 API

### 10.1 浏览组件

```
GET /v1/marketplace/components

查询参数:
├─ category: content | ui
├─ sort: trending | newest | popular | rating
├─ search: 搜索词
├─ page: 1
├─ limit: 20
└─ tags: 逗号分隔的标签

响应:
{
  "code": 200,
  "data": [
    {
      "id": "mkp_component_123",
      "name": "组件名称",
      "author": {
        "id": "user_123",
        "name": "作者名",
        "avatar": "https://..."
      },
      "version": "1.2.0",
      "description": "组件描述",
      "category": "content",
      "preview_image": "https://...",
      "rating": 4.8,
      "downloads": 1250,
      "tags": ["标签1", "标签2"],
      "published_at": "2026-03-15T10:30:00Z"
    }
  ],
  "pagination": { /* 分页信息 */ }
}
```

### 10.2 获取组件详情

```
GET /v1/marketplace/components/{component_id}

响应:
{
  "code": 200,
  "data": {
    "id": "mkp_component_123",
    "name": "组件名称",
    "version": "1.2.0",
    "description": "详细描述",
    "author": { /* 作者信息 */ },
    "schema": { /* JSON Schema */ },
    "template": "<div>...</div>",
    "styles": "/* CSS */",
    "documentation": "组件使用文档",
    "source_url": "https://github.com/...",
    "license": "MIT",
    "changelog": [ /* 变更日志 */ ],
    "rating": 4.8,
    "downloads": 1250,
    "reviews": [
      {
        "id": "review_123",
        "author": "用户名",
        "rating": 5,
        "comment": "很好用！",
        "created_at": "2026-03-20T10:30:00Z"
      }
    ]
  }
}
```

### 10.3 安装组件

```
POST /v1/user-components/install

请求体:
{
  "component_id": "mkp_component_123",
  "version": "1.2.0"  // 可选，默认最新
}

响应 (201):
{
  "code": 201,
  "data": {
    "id": "user_comp_456",
    "component_id": "mkp_component_123",
    "version": "1.2.0",
    "installed_at": "2026-03-30T10:30:00Z"
  }
}
```

### 10.4 评分和评论

```
POST /v1/marketplace/components/{component_id}/reviews

请求体:
{
  "rating": 5,
  "comment": "很好用！"
}

响应 (201):
{
  "code": 201,
  "data": {
    "id": "review_123",
    "author": { /* 当前用户 */ },
    "rating": 5,
    "comment": "很好用！",
    "created_at": "2026-03-30T10:30:00Z"
  }
}
```

---

## 十一、同步与版本控制 API

### 11.1 获取笔记版本历史

```
GET /v1/notes/{note_id}/versions

查询参数:
├─ page: 1
├─ limit: 20
└─ sort: -created_at

响应:
{
  "code": 200,
  "data": [
    {
      "version": 5,
      "title": "标题",
      "created_at": "2026-03-30T10:30:00Z",
      "created_by": {
        "id": "user_123",
        "name": "用户名"
      }
    }
  ]
}
```

### 11.2 获取特定版本

```
GET /v1/notes/{note_id}/versions/{version_number}

响应:
{
  "code": 200,
  "data": {
    "version": 5,
    "title": "标题",
    "content": "内容",
    "created_at": "2026-03-30T10:30:00Z"
  }
}
```

### 11.3 恢复历史版本

```
POST /v1/notes/{note_id}/restore

请求体:
{
  "version": 3
}

响应 (200):
{
  "code": 200,
  "data": {
    "id": "note_12345",
    "version": 6,
    "restored_from": 3,
    "restored_at": "2026-03-30T10:30:00Z"
  }
}
```

---

## 十二、WebSocket API（实时功能）

### 12.1 连接

```
ws://api.litenote.dev/v1/ws

连接参数:
├─ token: Bearer Token
└─ client_id: 客户端唯一标识

连接成功响应:
{
  "type": "connected",
  "client_id": "client_abc",
  "server_id": "srv_123"
}
```

### 12.2 事件类型

```
笔记更新:
{
  "type": "note:updated",
  "data": {
    "note_id": "note_123",
    "field": "content",
    "updated_at": "2026-03-30T10:30:00Z"
  }
}

实时协作光标:
{
  "type": "cursor:moved",
  "data": {
    "user_id": "user_456",
    "note_id": "note_123",
    "position": { "line": 10, "column": 5 },
    "color": "#FF0000"
  }
}

同步请求:
{
  "type": "sync:request",
  "data": {
    "note_id": "note_123",
    "since": "2026-03-30T10:00:00Z"
  }
}
```

---

## 十三、错误处理

### 13.1 错误类型

```json
{
  "code": 400,
  "message": "Bad Request",
  "error": {
    "type": "validation_error",
    "details": [
      {
        "field": "title",
        "code": "required",
        "message": "标题必填"
      }
    ]
  }
}
```

### 13.2 常见错误代码

```
validation_error         - 验证失败
unauthorized            - 未认证
forbidden               - 无权限
not_found               - 资源不存在
conflict                - 冲突（如重复创建）
rate_limit              - 超限
internal_error          - 服务器内部错误
service_unavailable     - 服务暂时不可用
```

---

## 十四、速率限制

### 14.1 限制规则

```
未认证请求：
├─ 100 请求 / 小时

认证用户（免费）：
├─ 1000 请求 / 小时
├─ 100 请求 / 分钟

认证用户（高级）：
├─ 10000 请求 / 小时
└─ 1000 请求 / 分钟
```

### 14.2 限制响应头

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1648646400

429 Too Many Requests 时：
Retry-After: 60
```

---

## 十五、API 版本管理

### 15.1 版本策略

```
当前版本：v1
基础 URL：https://api.litenote.dev/v1

弃用周期：
├─ 弃用公告：提前 6 个月
├─ 支持期限：公告后 12 个月
└─ 完全移除：12 个月后
```

### 15.2 版本查询

```
GET /v1/version

响应:
{
  "code": 200,
  "data": {
    "api_version": "1.0.0",
    "deprecated": false,
    "sunset_date": null
  }
}
```

---

## 十六、最佳实践

### 16.1 请求/响应

```
✓ 使用 HTTP 缓存头（ETag、Last-Modified）
✓ 实现指数退避重试
✓ 设置合理的超时时间（30s 以上）
✓ 使用 gzip 压缩
✓ 实现幂等请求（使用 Idempotency-Key 头）
✓ 批量操作使用 POST 而非多个 GET
```

### 16.2 安全性

```
✓ 总是使用 HTTPS
✓ 安全地存储 Token
✓ 定期更新 Token（刷新）
✓ 实现 CSRF 防护
✓ 验证 SSL 证书
✓ 使用强密码和 MFA
✓ 不在 URL 中传递敏感信息
```

### 16.3 性能优化

```
✓ 使用字段选择（fields 参数）减少传输
✓ 实现分页避免一次性加载大量数据
✓ 使用缓存减少 API 调用
✓ 批量操作时使用 bulk 端点
✓ 考虑使用 WebSocket 进行实时同步
✓ 检查 X-RateLimit-* 头避免超限
```

---

**文档版本**: 3.0  
**最后更新**: 2026 年 4 月 1 日
