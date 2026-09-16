'use strict';

const User = require('../tool/dbutil')(require('../api/user/user.model'));
const Token = require('../tool/dbutil')(require('../api/token/token.model'));

const auth = require('./auth.service');
const resUtil = require('../tool/resutil');
const errorUtil = require('../tool/errorutil');
const wechatUtil = require('../tool/wechat.util');

/**
 * PC 登录：Authorization 后续用 Bearer
 * POST /auth/login { account, password }
 */
exports.login = async function(req, res) {
	try {
		const account = req.body.account;
		const password = req.body.password;
		if (!account) {
			throw { status: 200, data: resUtil.code409('请填写账号') };
		}
		if (!password) {
			throw { status: 200, data: resUtil.code409('请填写密码') };
		}
		const user = await User.findOne({ account: account.toLowerCase(), isDelete: false });
		if (!user) {
			throw { status: 200, data: resUtil.code409('账号或密码错误.') };
		}
		const isPass = await user.authenticate(password);
		if (!isPass) {
			throw { status: 200, data: resUtil.code409('账号或密码错误.') };
		}
		const role = ['admin', 'organization'].includes(user.role) ? user.role : 'staff';
		const tokenObj = await auth.createSessionToken({
			user,
			role,
			scheme: 'Bearer',
			req,
			expiresIn: '1d'
		});
		return res.sendJson(200, resUtil.code200({
			role: user.role,
			token: tokenObj.token,
			scheme: 'Bearer',
			expiresIn: tokenObj.expiresIn
		}));
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};

/**
 * 小程序登录：code → openid → 查/建用户 → Wechat token
 * 对齐 field managerCodeGetToken + 华润 Authorization: Wechat <token>
 * POST /auth/wx/login { code }
 */
exports.wxLogin = async function(req, res) {
	try {
		const code = req.body.code;
		if (!code) {
			throw { status: 200, data: resUtil.code409('请填写小程序授权 code') };
		}
		const session = await wechatUtil.code2Session(code);
		let user = await User.findOne({ openid: session.openid, isDelete: false });
		if (!user) {
			user = await User.create({
				account: ('wx_' + session.openid).toLowerCase(),
				name: '微信用户',
				openid: session.openid,
				unionid: session.unionid,
				role: 'wechat',
				roleName: '微信用户',
				provider: 'wechat'
			});
		} else if (session.unionid && !user.unionid) {
			user.unionid = session.unionid;
			await user.save();
		}
		const tokenObj = await auth.createSessionToken({
			user,
			role: 'wechat',
			scheme: 'Wechat',
			req,
			expiresIn: '1d'
		});
		return res.sendJson(200, resUtil.code200({
			role: user.role,
			token: tokenObj.token,
			scheme: 'Wechat',
			expiresIn: tokenObj.expiresIn,
			openid: user.openid,
			user: {
				_id: user._id,
				name: user.name,
				tel: user.tel,
				openid: user.openid,
				role: user.role
			}
		}));
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};

/**
 * PC / 通用登出（Bearer）
 */
exports.logout = async function(req, res) {
	try {
		await Token.findOneAndUpdate(
			{ uuid: req.user._id, isDelete: false },
			{ isDelete: true }
		);
		return res.sendJson(200, resUtil.code200({ result: 'success' }));
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};

/**
 * 小程序登出：软删当前 Wechat token（不解绑 openid，下次仍可静默登录）
 * POST /auth/wx/logout  Header: Authorization: Wechat <token>
 */
exports.wxLogout = async function(req, res) {
	try {
		const parsed = auth.parseAuthorization(req.headers.authorization);
		if (parsed && parsed.token) {
			await Token.findOneAndUpdate(
				{ token: parsed.token, isDelete: false },
				{ isDelete: true }
			);
		} else {
			await Token.findOneAndUpdate(
				{ uuid: req.user._id, scheme: 'Wechat', isDelete: false },
				{ isDelete: true }
			);
		}
		return res.sendJson(200, resUtil.code200({ result: 'success' }));
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};
