'use strict';

const _ = require('lodash');

const Role = require('../../tool/dbutil')(require('./role.model'));
const Auth = require('../../tool/dbutil')(require('../auth/auth.model'));

const resUtil = require('../../tool/resutil');
const errorUtil = require('../../tool/errorutil');
const util = require('../../tool/util');

/**
 * 创建/编辑角色
 */
exports.update = async function(req, res) {
    try {
        const body = _.pick(req.body, '_role', 'name', 'description');
        let roleObj;

        if (body._role) {
            const role = await Role.findOne({
                _id: body._role,
                isDelete: false
            });
            if (!role) {
                throw {status: 200, data: resUtil.code409("角色不存在")};
            }
            roleObj = _.assign(role, body);
        } else {
            roleObj = body;
            roleObj.uuid = util.uuid();
        }

        if (!roleObj.name) {
            throw {status: 200, data: resUtil.code409("请填写角色名")};
        }

        if (roleObj._id) {
            const role = await Role.findOneAndUpdate(
                {_id: roleObj._id, isDelete: false},
                roleObj
            );
            res.sendJson(200, resUtil.code200({result: role}));
        } else {
            const role = await Role.create(roleObj);
            res.sendJson(200, resUtil.code200({result: role}));
        }
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};

/**
 * 更新角色权限
 */
exports.updateAuth = async function(req, res) {
    try {
        const body = _.pick(req.body, 'role', 'authArr');

        if (!body.role) {
            return res.sendJson(200, resUtil.code409("请填写角色"));
        }
        if (!body.authArr || body.authArr.length == 0) {
            return res.sendJson(200, resUtil.code409("请填写权限数组"));
        }

        const roleObj = await Role.findOne({
            uuid: body.role,
            isDelete: false
        });
        if (!roleObj) {
            throw {status: 200, data: resUtil.code409("角色不存在")};
        }

        const auths = await Auth.leanFind({
            isDelete: false,
            $or: [
                {_id: {$in: body.authArr}},
                {belong_auth: {$in: body.authArr}}
            ]
        });
        roleObj.authArr = auths.map(item => String(item._id));

        const updatedRole = await Role.findOneAndUpdate(
            {_id: roleObj._id},
            {authArr: roleObj.authArr}
        );
        res.sendJson(200, resUtil.code200({result: updatedRole}));
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};

/**
 * 获取角色列表
 */
exports.index = async function(req, res) {
    try {
        const page = req.body.page || 1;
        const itemsPerPage = req.body.itemsPerPage || 40;
        const mix = req.body.mix;

        let condition = {isDelete: false};
        const opt = {
            skip: (page - 1) * itemsPerPage,
            limit: itemsPerPage,
            sort: {createDate: -1}
        };

        if (mix) {
            condition = _.merge(condition, {
                name: {$regex: ".*" + mix + ".*", $options: "i"}
            });
        }

        // 设置查询条件
        if (req.user.role !== 'admin') {
            condition = _.merge(condition, {
                uuid: {$nin: ['admin']}
            });
        }

        const count = await Role.findAndCount(condition);
        const roles = await Role.find(condition, "-authArr", opt);
        
        res.sendJson(200, resUtil.code200({
            count: count,
            result: roles
        }));
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};

/**
 * 删除角色
 */
exports.delete = async function(req, res) {
    try {
        const body = _.pick(req.body, '_role');
        if (!body._role) {
            return res.sendJson(200, resUtil.code409("请填写角色id"));
        }

        const role = await Role.findOneAndUpdate({
            _id: body._role,
            uuid: {$nin: ['admin']}
        }, {isDelete: true});

        if (!role) {
            throw {status: 200, data: resUtil.code409("角色不存在")};
        }
        res.sendJson(200, resUtil.code200({result: 'success'}));
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};