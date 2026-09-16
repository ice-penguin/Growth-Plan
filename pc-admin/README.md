# pc-admin

成长计划 PC 管理端。Vue 2 + Ant Design Vue，对接本仓库 `server`。

## 要求

- Node.js >= 14
- 后端已启动（默认 `http://localhost:9000`）

## 启动

```bash
cd pc-admin
npm install
npm run serve
```

浏览器打开 http://localhost:8100/user/login

默认管理员（后端首次启动创建）：

```text
账号：admin@growth-plan.com
密码：GrowthPlan666
```

## 环境

三套：`local`（`npm run serve` 默认）/ `development` / `production`。

接口地址在对应 `.env.*` 的 `VUE_APP_API_BASE_URL`。

打包：`npm run build:local` / `build:dev` / `build:prd`。
