'use strict';

const _ = require('lodash');

const User = require('../../tool/dbutil')(require('./user.model'));
const Role = require('../../tool/dbutil')(require('../role/role.model'));

const util = require('../../tool/util');
const resUtil = require('../../tool/resutil');
const errorUtil = require('../../tool/errorutil');

const accountRegex = /^(1\d{10}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

exports.update = async function (req, res) {
	try {
		const body = _.pick(req.body, '_user', 'role', 'account', 'password', 'name', 'tel');
		let userObj;

		if (body._user) {
			const user = await User.findOne({ _id: body._user, isDelete: false });
			if (!user) {
				throw { status: 200, data: resUtil.code409('员工不存在') };
			}
			userObj = _.assign(user, body);
		} else {
			userObj = body;
			userObj.provider = 'local';
		}

		if (!userObj.role) {
			throw { status: 200, data: resUtil.code409('请填写角色') };
		}
		if (userObj.role.includes('admin')) {
			throw { status: 200, data: resUtil.code409('请填写正确的角色') };
		}
		if (!userObj.account) {
			throw { status: 200, data: resUtil.code409('请填写账号') };
		}
		if (!accountRegex.test(userObj.account)) {
			throw { status: 200, data: resUtil.code409('请填写正确的账号(手机号或邮箱)') };
		}
		if (!userObj._id) {
			if (!userObj.password) {
				throw { status: 200, data: resUtil.code409('请填写密码') };
			}
			if (!passwordRegex.test(userObj.password)) {
				throw { status: 200, data: resUtil.code409('请填写正确的密码(不小于8位且包含数字、大小写字母)') };
			}
		} else {
			delete userObj.password;
		}
		if (!userObj.name) {
			throw { status: 200, data: resUtil.code409('请填写姓名') };
		}
		if (!userObj.tel) {
			throw { status: 200, data: resUtil.code409('请填写手机号') };
		}
		if (!util.isTel(userObj.tel)) {
			throw { status: 200, data: resUtil.code409('请填写正确的手机号') };
		}

		let con = { account: userObj.account, isDelete: false };
		if (userObj._id) {
			con = _.merge(con, { _id: { $ne: userObj._id } });
		}
		const existUser = await User.findOne(con);
		if (existUser) {
			throw { status: 200, data: resUtil.code409('账号已存在') };
		}

		const roles = await Role.find({
			uuid: { $in: userObj.role.split(','), $nin: ['admin'] },
			isDelete: false
		});
		if (roles.length === 0) {
			throw { status: 200, data: resUtil.code409('角色不存在') };
		}
		userObj.role = roles.map(function (role) { return role.uuid; }).join(',');
		userObj.roleName = roles.map(function (role) { return role.name; }).join(',');

		if (userObj._id) {
			const user = await User.findOneAndUpdate({ _id: userObj._id, isDelete: false }, userObj);
			res.sendJson(200, resUtil.code200({ result: user }));
		} else {
			const user = await User.create(userObj);
			res.sendJson(200, resUtil.code200({ result: user }));
		}
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};

exports.resetPsd = async function (req, res) {
	try {
		const body = _.pick(req.body, '_user');
		if (!body._user) {
			return res.sendJson(200, resUtil.code409('请填写员工id'));
		}
		const user = await User.findOne({ _id: body._user, isDelete: false, role: { $ne: 'admin' } });
		if (!user) {
			throw { status: 200, data: resUtil.code409('员工不存在') };
		}
		const newPsd = util.uuid();
		user.password = newPsd;
		await user.save();
		res.sendJson(200, resUtil.code200({
			result: '修改成功，新密码为:' + newPsd
		}));
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};

exports.updatePsd = async function (req, res) {
	try {
		const body = _.pick(req.body, 'oldPass', 'newPass');
		if (!body.oldPass) {
			return res.sendJson(200, resUtil.code409('请输入旧密码'));
		}
		if (!body.newPass) {
			return res.sendJson(200, resUtil.code409('请输入新密码'));
		}
		const user = await User.findOne({ _id: req.user._id, isDelete: false });
		if (!user) {
			throw { status: 200, data: resUtil.code409('用户不存在') };
		}
		const isPass = await user.authenticate(body.oldPass);
		if (!isPass) {
			throw { status: 200, data: resUtil.code409('原密码错误') };
		}
		user.password = body.newPass;
		await user.save();
		res.sendJson(200, resUtil.code200({ result: 'success' }));
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};

exports.index = async function (req, res) {
	try {
		const page = req.body.page || 1;
		const itemsPerPage = req.body.itemsPerPage || 40;
		const mix = req.body.mix;
		let condition = { isDelete: false, role: { $ne: 'admin' } };
		const opt = {
			skip: (page - 1) * itemsPerPage,
			limit: itemsPerPage,
			sort: { createDate: -1 }
		};
		if (mix) {
			condition = _.merge(condition, {
				$or: [
					{ name: { $regex: '.*' + mix + '.*' } },
					{ account: { $regex: '.*' + mix + '.*' } }
				]
			});
		}
		const count = await User.findAndCount(condition);
		const users = await User.find(condition, '-salt -provider -hashedPassword', opt);
		res.sendJson(200, resUtil.code200({ count: count, result: users }));
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};

exports.delete = async function (req, res) {
	try {
		const body = _.pick(req.body, '_user');
		if (!body._user) {
			return res.sendJson(200, resUtil.code409('请填写员工id'));
		}
		const user = await User.findOneAndUpdate(
			{ _id: body._user, isDelete: false, role: { $ne: 'admin' } },
			{ isDelete: true }
		);
		if (!user) {
			throw { status: 200, data: resUtil.code409('用户不存在') };
		}
		res.sendJson(200, resUtil.code200({ result: 'success' }));
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};

exports.getMe = async function (req, res) {
	try {
		const user = await User.findById(req.user._id, '-salt -hashedPassword');
		if (!user) {
			throw { status: 200, data: resUtil.code409('用户不存在') };
		}
		res.sendJson(200, resUtil.code200({ result: user }));
	} catch (err) {
		errorUtil.handleControllerError(res, err);
	}
};
