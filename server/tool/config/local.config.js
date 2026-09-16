/**
 * 本地环境对接配置
 * 切换环境：改 tool/config.js 顶部 require
 * 字段风格对齐 field-pc/server/tool/config
 */

// 环境标识，用于区分当前配置名
exports.name = 'local';

// ---------- 站点展示（/api/config/show 返回给管理端布局） ----------
exports.site = {
	title: '成长计划', // 站点名称
	logo: '', // 侧栏 / 页头 logo 图片地址
	logoMin: '' // 小图 / favicon 图片地址，空则回退用 logo
};

// ---------- 上传开关 ----------
// storage: oss=阿里云OSS，local=存本地 uploads 目录
exports.upload = {
	storage: 'oss', // 上传方式：oss | local
	ossPrefix: 'growth-plan/', // OSS 对象名前缀（目录）
	localDir: 'uploads', // storage=local 时的本地目录（相对 server 根）
	publicPath: '/uploads', // storage=local 时对外访问路径前缀
	publicBaseUrl: '', // storage=local 时拼完整 URL 的域名，空则只回相对路径
	maxSizeMb: 10 // 单文件大小上限，单位 MB
};

// ---------- 阿里云 OSS 普通上传（对齐 field ossNormal） ----------
exports.ossNormal = {
	ali_AccessKeyId: '', // 阿里云 AccessKeyId
	ali_AccessKeySecret: '', // 阿里云 AccessKeySecret
	bucketName: '', // Bucket 名称
	region: 'oss-cn-hangzhou', // 地域，如 oss-cn-hangzhou；有 endpoint 时可不依赖它
	endpoint: '', // 自定义 Endpoint，有值时优先于 region
	internal: false, // 是否走内网访问
	secure: true, // 是否使用 https
	timeout: 600000, // 超时时间，毫秒
	changeHost: '' // 上传后替换返回域名（内网转公网等），空则用 OSS 默认 URL
};

// ---------- 微信小程序（mobile-user） ----------
exports.wechatMini = {
	appId: '', // 小程序 AppID
	appSecret: '' // 小程序 AppSecret
};

// ---------- 微信服务号 / 开放平台（预留） ----------
exports.wechat = {
	appId: '', // 公众号 / 开放平台 AppID
	appSecret: '' // 公众号 / 开放平台 AppSecret
};
