# mobile-user

成长计划用户端。uni-app，先出微信小程序。

## 要求

- [HBuilderX](https://www.dcloud.io/hbuilderx.html)
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 后端已启动；小程序 AppID 填到 `manifest.json`

## 启动

1. 用 HBuilderX 打开本目录
2. 运行到微信小程序模拟器
3. 本机连本地后端时，开发者工具里勾选「不校验合法域名」

登录页：`pages/user/login`（微信 code 登录）。

## 环境

三套：`local`（默认）/ `development` / `production`。

在 `common/config.js` 里切换；接口根地址在 `common/config/*.config.js`。

后端需配置对应环境的微信小程序 AppId / Secret（与 manifest 一致）。
