# ot-expense-client AI 开发指南

> 内部加班报销系统 **管理后台**（Web 端）。基于 firefly-client 公共骨架裁剪。  
> 后端 API 对应 `ot-expense-server`。

## 项目概览

| 项 | 说明 |
|---|---|
| 名称 | ot-expense-client |
| 框架 | Vue 2.6 + Vue Router 3 + Vuex 3 |
| UI | Ant Design Vue 1.7 + `@ant-design-vue/pro-layout` |
| 构建 | Vue CLI 4 |
| 语言 | JavaScript（ES Module） |
| 入口 | `src/main.js` |
| 开发端口 | 8100 |
| 路径别名 | `@` → `src/` |

### 启动

```bash
npm run serve       # local，读 .env.local（默认）
npm run serve:dev   # development，读 .env.development
npm run build:dev
npm run build:prd
```

## 目录结构（精简后）

```
ot-expense-client/
├── vue.config.js
├── .env.local                # VUE_APP_API_BASE_URL → 本地 server
├── .env.development
├── .env.production
└── src/
    ├── api/request.js        # ★ API 入口
    ├── api/modules/          # auth / user / role / nav / config / aliyun
    ├── config/
    ├── router/generator-routers.js
    ├── store/
    ├── layouts/
    ├── components/           # STable 等公用组件
    └── views/
        ├── user/Login.vue
        ├── welcome/
        ├── exception/
        ├── admin/            # 机构 / 菜单
        └── setting/          # 通用设置、员工、角色
```

## 与 ot-expense-server 对接

- Base URL：`process.env.VUE_APP_API_BASE_URL`
- 全部 POST；Bearer Token；响应 `code` 在 body
- 分页：`page` / `itemsPerPage`；列表用 `setTableData`

## 新增页面 Checklist

1. `api/modules/` 或 `request.js` 补接口
2. `views/{域}/index.vue`（+ 可选 `modules/`）
3. `generator-routers.js` → `constantRouterComponents` 注册
4. 后端 nav 配置菜单（component 名与 key 一致）

## AI 编写注意

1. 保持 Vue 2 + Options API，不引入 Vue 3 / TS / Vite
2. API 集中在 `src/api/`
3. 列表页优先 STable + setTableData
4. 修改范围最小化
