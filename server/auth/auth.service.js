'use strict';

const jwt = require('jsonwebtoken');
const compose = require('composable-middleware');
const { UnauthorizedError, expressjwt } = require('express-jwt');

const User = require('../tool/dbutil')(require('../api/user/user.model'));
const Token = require('../tool/dbutil')(require('../api/token/token.model'));

const util = require('../tool/util');
const logger = require('../tool/logger');
const resUtil = require('../tool/resutil');
const environmentConfig = require('../config/environment');

const validateJwt = expressjwt({
	secret: environmentConfig.secrets.session,
	algorithms: ['HS256'],
	requestProperty: 'user',
	getToken: function fromHeader(req) {
		const parsed = parseAuthorization(req.headers.authorization);
		return parsed ? parsed.token : null;
	}
});

/**
 * 解析 Authorization：Bearer <token>（PC）或 Wechat <token>（小程序）
 */
function parseAuthorization(authorization) {
	if (!authorization || typeof authorization !== 'string') {
		return null;
	}
	const match = authorization.match(/^(Bearer|Wechat)\s+(\S+)$/i);
	if (!match) {
		return null;
	}
	const scheme = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
	// 统一成 Bearer / Wechat
	const normalized = scheme.toLowerCase() === 'wechat' ? 'Wechat' : 'Bearer';
	return {
		scheme: normalized,
		token: match[2]
	};
}

exports.parseAuthorization = parseAuthorization;

// 权限判断
exports.hasRole = function(role) {
	if (!role) throw new Error('请填写角色');

	return compose()
	.use(async function(req, res, next) {
		try {
			if (role.includes('noAuth')) {
				next();
			} else {
				const parsed = parseAuthorization(req.headers.authorization);
				if (!parsed) {
					return res.sendJson(200, resUtil.code401());
				}
				req.authScheme = parsed.scheme;
				// express-jwt getToken 读原始 header；保证后续验签能取到 token
				req.headers.authorization = parsed.scheme + ' ' + parsed.token;

				const result = await Token.findOne({
					token: parsed.token,
					expiresIn: { $gt: new Date() },
					isDelete: false
				});
				if (!result) {
					return res.sendJson(200, resUtil.code401());
				}
				// 若入库时记了 scheme，则要求与请求头一致（旧数据无 scheme 则放行）
				if (result.scheme && result.scheme !== parsed.scheme) {
					return res.sendJson(200, resUtil.code401());
				}

				await new Promise((resolve, reject) => {
					validateJwt(req, res, (err) => {
						if (err) return reject(err);
						resolve();
					});
				});
				console.log(`${req.user._id}(${req.user.role})用户的token签发时间：${util.getShowDate(req.user.iat * 1000, 'YYYY-MM-DD HH:mm:ss')},过期时间：${util.getShowDate(req.user.exp * 1000, 'YYYY-MM-DD HH:mm:ss')},scheme：${parsed.scheme}`);
				if (!req.user) {
					return res.sendJson(200, resUtil.code401());
				}
				next();
			}
		} catch (error) {
			if (error instanceof UnauthorizedError) {
				let message = '认证失败';
				if (error.message.includes('malformed')) {
					message = 'Token格式不正确';
				} else if (error.message.includes('expired')) {
					message = 'Token已过期';
				}
				console.log(message);
				return res.sendJson(200, resUtil.code401());
			}
			next(error);
		}
	})
	.use(async function(req, res, next) {
		try {
			if (!req.user) {
				if (!req.headers._org) {
					return res.sendJson(200, resUtil.code409('请填写机构id'));
				}
				req.body._org = req.headers._org;
				req.user = {
					_organization: req.body._org,
					role: 'noAuth'
				};
				next();
			} else {
				if (role.indexOf(req.user.role) > -1) {
					const item = await User.leanFindOne({ _id: req.user._id, isDelete: false });
					if (!item) {
						return res.sendJson(200, resUtil.code401());
					}
					item._id = item._id.toString();
					// tokenRole：JWT 归一化角色 admin/organization/staff/wechat
					// role：库中角色（自定义角色为 uuid；微信端为 wechat）
					const tokenRole = req.user.role;
					req.user = {
						_id: item._id,
						name: item.name,
						tel: item.tel,
						openid: item.openid,
						_organization: item._organization,
						role: item.role,
						tokenRole,
						authScheme: req.authScheme,
						user: item
					};
					console.log('[请求人信息] ' + JSON.stringify({ role: req.user.role, name: req.user.name, tel: req.user.tel, _id: req.user._id, scheme: req.authScheme }));
					next();
				} else {
					return res.sendJson(200, resUtil.code409('暂无权限'));
				}
			}
		} catch (error) {
			next(error);
		}
	})
	.use(async function(req, res, next) {
		try {
			const cleanArray = (arr) => arr.filter((item) => item && item.value !== 'NaN' && item.value !== 'undefined' && item.value !== null);
			req.body = util.arrToObject(cleanArray(util.objectToArr(req.body)));
			req.query = util.arrToObject(cleanArray(util.objectToArr(req.query)));
			next();
		} catch (error) {
			next(error);
		}
	});
};

// 生成token
exports.signToken = function(params) {
	return jwt.sign(
		{ _id: params._id, role: params.role },
		environmentConfig.secrets.session,
		{ expiresIn: params.expiresIn ? params.expiresIn : '8h' }
	);
};

/**
 * 登录成功后写入 Token 表
 * @param {Object} opts
 * @param {Object} opts.user
 * @param {String} opts.role JWT 角色
 * @param {String} opts.scheme Bearer | Wechat
 * @param {Object} opts.req
 * @param {String} [opts.expiresIn] JWT 有效期，默认 1d
 */
exports.createSessionToken = async function(opts) {
	const expiresIn = opts.expiresIn || '1d';
	const token = exports.signToken({
		_id: opts.user._id,
		role: opts.role,
		expiresIn
	});
	const ms = expiresIn.endsWith('d')
		? parseInt(expiresIn, 10) * 86400000
		: expiresIn.endsWith('h')
			? parseInt(expiresIn, 10) * 3600000
			: 86400000;
	const tokenObj = await Token.create({
		uuid: opts.user._id,
		token: token,
		scheme: opts.scheme,
		expiresIn: new Date(Date.now() + ms),
		ip: util.getClientIp(opts.req),
		role: opts.role,
		name: opts.user.name,
		...(opts.user._organization && { _organization: opts.user._organization })
	});
	return tokenObj;
};

// 初始化路由：生成 requestId，后续 console 自动带上
exports.initRequest = function() {
	return compose()
	.use(function(req, res, next) {
		const requestId = util.uuid();
		req.headers.requestId = requestId;
		logger.runWithRequestId(requestId, function () {
			res.sendJson = (status, obj) => {
				console.log('[请求响应] 状态：' + status + ' 响应体：' + JSON.stringify(obj).slice(0, 1000));
				res.status(status).json(obj);
			};
			console.log('[请求信息] ' + req.method + ' ' + req.originalUrl + '\nheaders：' + JSON.stringify(req.headers) + '\nquery：' + JSON.stringify(req.query).slice(0, 1000) + '\nbody：' + JSON.stringify(req.body).slice(0, 1000));
			next();
		});
	});
};
