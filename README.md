# Growth-Plan

成长计划：目标、计划、打卡与复盘。单仓四块：

```text
docs/          设计文档
server/        Node 后端
pc-admin/      PC 管理端
mobile-user/   用户端小程序（微信）
```

## 怎么跑

各端分别安装依赖后启动，细节见对应 README：

| 端 | 说明 |
| --- | --- |
| [server](./server/README.md) | API + 定时器，默认端口 9000 |
| [pc-admin](./pc-admin/README.md) | 管理后台，默认 http://localhost:8100 |
| [mobile-user](./mobile-user/README.md) | 用 HBuilderX 跑到微信开发者工具 |

设计文档入口：[docs/](./docs/README.md)。  
Agent 索引：[AGENTS.md](./AGENTS.md)。
