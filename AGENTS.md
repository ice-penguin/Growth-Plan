# Growth-Plan Agent Index

新对话先读本文件。按能力表取文件，不要全仓扫描。  
细则在 `.cursor/rules/`：打开对应端文件时会加载写法；本文件只负责「有什么、去哪读」。

## 项目

成长计划：目标、计划、打卡、复盘。单仓四块：

| 块 | 路径 | 现状 |
| --- | --- | --- |
| 设计 | `docs/` | 草案，业务范围未完全定稿 |
| 后端 | `server/` | Express + mongoose；登录与权限基础设施已通 |
| PC 管理端 | `pc-admin/` | Vue2 + Ant Design Vue；账号/角色/权限/菜单已通 |
| 用户端 | `mobile-user/` | uni-app 微信小程序；微信登录页已通 |

业务（计划 / 目标 / 打卡 / 复盘 / 统计）**尚未实现**。列表写法参考账号页。

## 检索协议

1. 用用户原话匹配下面能力表的关键词。
2. 只读该行「先读」，最多再打开「再读」里 1～2 个文件。
3. **未做**：先读产品/模型文档，再按对应端规则新增；不要假装已有接口。
4. **已做**：先打开列出的代码再改；不要另起一套。
5. 表里没有对应行，再用 Grep；禁止无目标扫全仓。

## 能力表

| 用户可能说 | 状态 | 先读 | 再读 |
| --- | --- | --- | --- |
| 登录 / JWT / 微信 / token | 已做 | `docs/api/接口约定.md` | `server/auth/`；`pc-admin/src/views/user/Login.vue`；`mobile-user/pages/user/login.vue` |
| 用户 / 账号 / 员工 | 已做 | `server/api/user/` | `pc-admin/src/views/setting/staff/account/index.vue`；`pc-admin/src/api/modules/user.js` |
| 角色 / 权限 / 菜单 / 导航 | 已做 | `server/api/{role,auth,nav}/` | `server/config/init.js`；`pc-admin/src/views/admin/menu/`；`pc-admin/src/views/setting/staff/role/` |
| 上传 / OSS | 已做 | `server/api/upload/`、`server/api/aliyun/` | `server/tool/config/*.config.js` |
| 定时器 / schedule | 已做 | `server/app_schedule.js` | `server/api/z_schedule/`、`server/routes_schedule.js` |
| 配置 / config | 占位 | `server/api/config/` | `pc-admin/src/api/modules/config.js` |
| 计划 / 目标 / 打卡 / 复盘 / 统计 | **未做** | `docs/product/功能清单.md` | `docs/tech/数据模型.md`、`docs/ui/页面清单.md` |
| 怎么跑 / 端口 / 环境 / 管理员 | 已做 | 根 `README.md` | 各包 `README.md`；`server/config/environment/`；`server/tool/config.js` |
| 加后端模块 / CRUD | 约定 | `.cursor/rules/server.mdc` | 对照 `server/api/user/` |
| 加 PC 页面 | 约定 | `.cursor/rules/pc-admin.mdc` | `pc-admin/src/router/generator-routers.js` |
| 加小程序页 | 约定 | `.cursor/rules/mobile-user.mdc` | `mobile-user/pages.json`、`mobile-user/common/api.js` |

## 硬约束

- PC：Vue 2 + Options API；不要上 Vue 3 / TypeScript / Vite。
- 接口几乎全是 POST；统一 `{ code, data }`；业务错误常见 HTTP 200 + `code: 409`。
- PC：`Authorization: Bearer <token>`，角色 `admin` / `organization` / `staff`。
- 小程序：`Authorization: Wechat <token>`，角色 `wechat`。
- 新 PC 页：`constantRouterComponents` 的 key 必须等于后端菜单 `component`。
- 不要把接口字段、Schema 抄进本文件；改入口路径或能力状态时只改能力表。

## 维护

新增模块或搬家入口时，同步更新本表对应行（状态、先读、再读）。  
Cursor 规则 `.cursor/rules/00-index.mdc` 与本文件保持同一张能力表。
