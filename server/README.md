# server

成长计划后端。Express + mongoose。

## 要求

- Node.js >= 16
- MongoDB（本地默认库名 `growth-plan`）

## 启动

```bash
cd server
npm install
npm run dev            # 主 API，端口 9000
npm run dev:schedule   # 定时器，端口 4545（另开终端）
```

生产：`npm start` / `npm start:schedule`。

首次启动会初始化管理员、权限和菜单：

```text
账号：admin@growth-plan.com
密码：GrowthPlan666
```

## 环境与配置

三套环境：`local`（`npm run dev` 默认）/ `development` / `production`。

- 库与端口：`config/environment/`
- 上传、站点、微信等对接：`tool/config.js` 切换 `tool/config/*.config.js`

改 OSS、小程序 AppId 等，编辑当前对接配置文件即可。

## 说明

- PC 登录：`POST /auth/login`（Bearer）
- 小程序登录：`POST /auth/wx/login`（Wechat）
- 业务接口挂在 `routes.js`，按模块放在 `api/`

更细的接口约定见 [docs/api/接口约定.md](../docs/api/接口约定.md)。
