'use strict';

const _ = require('lodash');

const Auth = require('../../tool/dbutil')(require('./auth.model'));
const Nav = require('../../tool/dbutil')(require('../nav/nav.model'));
const Role = require('../../tool/dbutil')(require('../role/role.model'));

const resUtil = require('../../tool/resutil');
const errorUtil = require('../../tool/errorutil');

/**
 * 创建
 * @param {[String]} type [权限类型，nav导航，page页面，btn按钮，默认page]
 * @param {[String]} name [权限名]
 * @param {[String]} icon [图标]
 * @param {[String]} target [打开方式，_blank,_self]
 * @param {[String]} component [引入的页面,导航页为RouteView，着陆页为具体的着陆页地址，按钮页不需要]
 * @param {[String]} path [页面地址]
 * @param {[String]} redirect [重定向地址]
 * @param {[String]} description [描述]
 * @param {[Boolean]} isShow [是否显示]
 * @param {[String]} isLock [是否锁定，锁定权限无需选则，默认选中，不可修改]
 * @param {[String]} isHideChildrenInMenu [是否隐藏下级]
 * @param {[String]} belong_auth [归属权限，上级授权则本级授权,内部页面填写]
 * @param {[Boolean]} isPublic [是否公开访问]
*/
exports.update = async function(req, res) {
    try {
        const body = _.pick(req.body, '_auth', 'type', 'name', 'icon', 'target', 'component', 'path', 'redirect', 'description', 'isShow', 'isLock', 'isHideChildrenInMenu', 'belong_auth', 'isPublic');
        let authObj;

        // 查找或创建权限对象
        if (body._auth) {
            const auth = await Auth.findOne({_id: body._auth, isDelete: false});
            if (!auth) {
                throw {status: 200, data: resUtil.code409('权限不存在')};
            }
            authObj = _.assign(auth, body);
        } else {
            authObj = body;
        }

        // 设置默认值和验证
        authObj.type = authObj.type ? authObj.type : 'page';
        authObj.target = authObj.target === '_blank' ? '_blank' : undefined;
        authObj.isShow = typeof authObj.isShow === "boolean" ? authObj.isShow : true;
        authObj.isLock = typeof authObj.isLock === "boolean" ? authObj.isLock : false;
        authObj.isHideChildrenInMenu = typeof authObj.isHideChildrenInMenu === "boolean" ? authObj.isHideChildrenInMenu : false;
        authObj.isPublic = typeof authObj.isPublic === "boolean" ? authObj.isPublic : false;

        if (!authObj.name) {
            throw {status: 200, data: resUtil.code409('请填写权限名称')};
        }

        // 处理特殊类型
        if (!authObj.belong_auth || authObj.belong_auth === 'reset') {
            delete authObj.belong_auth;
        }
        if (authObj.type === 'nav') {
            authObj.component = 'RouteView';
            delete authObj.belong_auth;
        }
        if (authObj.type === 'btn') {
            authObj.component = undefined;
            delete authObj.belong_auth;
        }

        // 保存或更新
        if (authObj._id) {
            const savedAuth = await authObj.save();
            res.sendJson(200, resUtil.code200({result: savedAuth}));
        } else {
            const createdAuth = await Auth.create(authObj);
            res.sendJson(200, resUtil.code200({result: createdAuth}));
        }
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};

/**
 * 获取权限列表
 */
exports.index = async function(req, res) {
    try {
        const page = req.body.page || 1;
        const itemsPerPage = req.body.itemsPerPage || 40;
        const {type, name, mix, isPassBelongAuth} = req.body;

        let condition = {isDelete: false};
        const opt = {
            skip: (page - 1) * itemsPerPage,
            limit: itemsPerPage,
            sort: {createDate: -1}
        };

        // 构建查询条件
        if (type) {
            condition = _.merge(condition, {type: type});
        }
        if (name) {
            condition = _.merge(condition, {name: {$regex: ".*" + name + ".*", $options: "i"}});
        }
        if (mix) {
            condition = _.merge(condition, {
                $or: [
                    {name: {$regex: ".*" + mix + ".*", $options: "i"}},
                    {path: {$regex: ".*" + mix + ".*", $options: "i"}},
                    {description: {$regex: ".*" + mix + ".*", $options: "i"}}
                ]
            });
        }
        if (isPassBelongAuth) {
            condition = _.merge(condition, {belong_auth: {$exists: false}});
        }

        // 非管理员用户需要过滤权限
        if (req.user.role !== 'admin') {
            let con = {isDelete: false};
            switch (req.user.role) {
                case 'organization':
                    con = _.merge(con, {
                        _organization: req.user._organization,
                        uuid: 'organization'
                    });
                    break;
                default:
                    con = _.merge(con, {
                        _organization: req.user._organization,
                        uuid: {$in: req.user.role.split(',')}
                    });
                    break;
            }

            const roles = await Role.find(con);
            const ids = [];
            roles.forEach(role => {
                role.authArr.forEach(_auth => {
                    if (ids.indexOf(_auth) === -1) {
                        ids.push(_auth);
                    }
                });
            });
            condition = _.merge(condition, {_id: {$in: ids}});
        }

        // 查询数据
        const count = await Auth.findAndCount(condition);
        const auths = await Auth.find(condition, "", opt);

        res.sendJson(200, resUtil.code200({
            count: count,
            result: auths
        }));
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};

/**
 * 删除权限
 */
exports.delete = async function(req, res) {
    try {
        const body = _.pick(req.body, '_auth');
        if (!body._auth) {
            return res.sendJson(200, resUtil.code409("缺少权限id"));
        }

        // 检查权限是否被导航使用
        const nav = await Nav.findOne({
            uuid: {$in: ['adminDefault', 'default']},
            _auth: body._auth,
            isDelete: false
        });
        if (nav) {
            throw {status: 200, data: resUtil.code409("权限已被导航使用，不能删除")};
        }

        // 删除权限
        const auth = await Auth.findOneAndUpdate(
            {_id: body._auth, isDelete: false},
            {isDelete: true}
        );
        if (!auth) {
            throw {status: 200, data: resUtil.code409("权限不存在")};
        }

        res.sendJson(200, resUtil.code200({result: 'success'}));
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};