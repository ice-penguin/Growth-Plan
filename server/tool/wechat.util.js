'use strict';

const https = require('https');
const config = require('../tool/config');
const resUtil = require('../tool/resutil');

/**
 * 微信小程序 jscode2session
 * @param {String} code uni.login 拿到的 js_code
 * @returns {Promise<{ openid: String, session_key: String, unionid?: String }>}
 */
exports.code2Session = function (code) {
	const appId = config.wechatMini && config.wechatMini.appId;
	const appSecret = config.wechatMini && config.wechatMini.appSecret;
	if (!appId || !appSecret) {
		return Promise.reject({
			status: 200,
			data: resUtil.code409('未配置微信小程序（tool/config.wechatMini.appId / appSecret）')
		});
	}
	if (!code) {
		return Promise.reject({
			status: 200,
			data: resUtil.code409('请填写小程序授权 code')
		});
	}

	const url =
		'https://api.weixin.qq.com/sns/jscode2session' +
		'?appid=' + encodeURIComponent(appId) +
		'&secret=' + encodeURIComponent(appSecret) +
		'&js_code=' + encodeURIComponent(code) +
		'&grant_type=authorization_code';

	return new Promise(function (resolve, reject) {
		https
			.get(url, function (res) {
				let raw = '';
				res.on('data', function (chunk) {
					raw += chunk;
				});
				res.on('end', function () {
					let body;
					try {
						body = JSON.parse(raw);
					} catch (e) {
						return reject({
							status: 200,
							data: resUtil.code409('微信返回数据解析失败')
						});
					}
					if (body.errcode) {
						return reject({
							status: 200,
							data: resUtil.code409('微信错误: ' + body.errcode + ' - ' + body.errmsg)
						});
					}
					if (!body.openid) {
						return reject({
							status: 200,
							data: resUtil.code409('微信未返回 openid')
						});
					}
					resolve({
						openid: body.openid,
						session_key: body.session_key,
						unionid: body.unionid
					});
				});
			})
			.on('error', function (err) {
				reject({
					status: 200,
					data: resUtil.code409('请求微信失败: ' + (err.message || String(err)))
				});
			});
	});
};
