'use strict';

const _ = require('lodash');

const Nav = require('../../tool/dbutil')(require('./nav.model'));
const Auth = require('../../tool/dbutil')(require('../auth/auth.model'));
const Role = require('../../tool/dbutil')(require('../role/role.model'));

const resUtil = require('../../tool/resutil');
const errorUtil = require('../../tool/errorutil');

// 将nav列表组装成树形结构
const buildNavTree = function(flatNavs) {
    // 1. 创建节点映射表（使用level+index作为唯一键）
    const nodeMap = {};
    const roots = [];
    
    // 2. 第一次遍历：创建所有节点的映射
    flatNavs.forEach(node => {
        const key = `${node.level}-${node.index}`;
        nodeMap[key] = {
            ...node,
            navArr: [],  // 子节点数组
            isSelect: false,
            hasChildNav: false
        };
    });
    
    // 3. 第二次遍历：建立父子关系
    flatNavs.forEach(node => {
        const currentKey = `${node.level}-${node.index}`;
        
        // 如果有父节点
        if (node.sup_level && node.sup_index) {
            const parentKey = `${node.sup_level}-${node.sup_index}`;
            const parent = nodeMap[parentKey];
            
            if (parent) {
                parent.navArr.push(nodeMap[currentKey]);
                parent.hasChildNav = true;
            } else {
                console.warn(`Parent not found for node: ${currentKey}`);
                // 找不到父节点的也作为根节点处理
                roots.push(nodeMap[currentKey]);
            }
        } else {
            // 没有父节点的就是根节点
            roots.push(nodeMap[currentKey]);
        }
    });
    
    // 4. 递归排序函数
    const sortTree = (nodes) => {
        if (!nodes || nodes.length === 0) return;
        
        // 先排序当前层级
        nodes.sort((a, b) => a.index - b.index);
        
        // 然后递归排序子节点
        nodes.forEach(node => {
            sortTree(node.navArr);
        });
    };
    
    // 对整棵树进行排序
    sortTree(roots);
    
    return roots;
}

/**​
 * 根据权限数组设置导航树选中状态
 * @param {Array} resultArr 导航树数组
 * @param {Array} authIds 权限数组
 * @param {Boolean} [filterUnselected=false] 是否过滤未选中节点
 * @returns {Array} 处理后的导航树
*/
const setNavSelection = function(resultArr, authIds, filterUnselected) {
    // 递归处理树形结构
    function processNode(node, parentSelected) {
        // 初始化class属性
        node.class = node.isLock ? "disabled" : "";
        
        // 判断当前节点是否被直接选中
        const directlySelected = node.isPublic ? true : authIds.includes(node._auth);
        
        // 处理按钮类型节点的特殊情况
        if (node.type === 'btn') {
            // 如果是按钮类型且被锁定，同时父节点被选中，则强制选中
            if (node.isLock && parentSelected) {
                node.isSelect = true;
                node.class = "disabled";
            } else {
                node.isSelect = directlySelected;
            }
        } else {
            node.isSelect = directlySelected;
        }
        
        // 处理子节点
        if (node.navArr && node.navArr.length > 0) {
            let hasSelectedChild = false;
            const newNavArr = [];
            
            // 递归处理子节点
            for (let i = 0; i < node.navArr.length; i++) {
                const child = node.navArr[i];
                const childSelected = processNode(child, node.isSelect);
                
                // 根据过滤条件决定是否保留子节点
                if (!filterUnselected || childSelected) {
                    newNavArr.push(child);
                    if (childSelected) {
                        hasSelectedChild = true;
                    }
                }
            }
            
            // 更新子节点数组（可能已被过滤）
            node.navArr = newNavArr;
            
            // 如果子节点有被选中的，当前节点也要被选中
            if (hasSelectedChild) {
                node.isSelect = true;
            }
        }
        
        return node.isSelect;
    }
    
    // 处理每个根节点
    const filteredResult = [];
    for (let j = 0; j < resultArr.length; j++) {
        const root = resultArr[j];
        const rootSelected = processNode(root, false);
        
        // 根据过滤条件决定是否保留根节点
        if (!filterUnselected || rootSelected) {
            filteredResult.push(root);
        }
    }
    
    return filteredResult;
};

/**
 * 将导航数组转换为前端可直接匹配的格式
 * @param {Array} resultArr 导航树数组
 * @returns {Array} 处理后的导航树
 */
const changeNavArr = function(resultArr) {
    // 递归处理树形结构
    function processNode(node, parent) {
        // 处理按钮类型节点的特殊情况
        if (node.type === 'btn') {
            // 只有父节点存在时才添加btns
            if (parent && parent.meta && parent.meta.btns) {
                parent.meta.btns.push(node.path.split('.')[1]);
            }
            return null; // 按钮节点不生成路由
        } else {
            const newNode = {
                name: node._auth,
                meta: {
                    ...(node.icon !== undefined && { icon: node.icon }),
                    title: node.name,
                    show: node.isShow !== false,
                    target: node.target,
                    btns: []
                },
                component: node.component,
                ...(node.redirect && { redirect: node.redirect }), // 假设redirect为假值时不需要
                path: node.path,
                hideChildrenInMenu: !!node.isHideChildrenInMenu,
            };

            // 只有navArr存在且不为空时才处理children
            if (node.navArr && node.navArr.length > 0) {
                newNode.children = [];
                node.navArr.forEach(child => {
                    const childNode = processNode(child, newNode);
                    // 只添加非按钮节点和有效节点
                    if (childNode) {
                        newNode.children.push(childNode);
                    }
                });
                
                // 如果处理后children为空，则删除该属性
                if (newNode.children.length === 0) {
                    delete newNode.children;
                }
            }

            return newNode;
        }
    }
    
    // 处理每个根节点
    return resultArr.map(root => processNode(root, null)).filter(Boolean);
}

/**
 * 创建/更新默认导航
 */
exports.updateDefault = async function(req, res) {
    try {
        const body = _.pick(req.body, 'type', 'navArr');
        
        // 参数验证
        if (!body.type) {
            return res.sendJson(200, resUtil.code409("请填写默认导航类型"));
        }
        if (!['default', 'adminDefault'].includes(body.type)) {
            return res.sendJson(200, resUtil.code409("请填写正确的默认导航类型"));
        }
        if (!body.navArr || body.navArr.length == 0) {
            return res.sendJson(200, resUtil.code409("请填写导航数组"));
        }

        // 收集所有权限ID
        const authIds = [];
        const getAuthIds = (arr) => {
            _.each(arr, (nav) => {
                if (nav._auth && authIds.indexOf(nav._auth) == -1) {
                    authIds.push(nav._auth);
                }
                if (typeof(nav.navArr) == "object" && nav.navArr.length > 0) {
                    getAuthIds(nav.navArr);
                }
            });
        };
        getAuthIds(body.navArr);

        // 查找归属权限
        const belongAuthArr = await Auth.find({
            belong_auth: {$in: authIds}
        });

        // 查询有效权限
        const auths = await Auth.leanFind({
            _id: {$in: authIds},
            isDelete: false
        });

        // 构建导航创建数组
        let createArr = [];
        let index = 0;
        
        const getNavArr = (arr, sup_index, sup_level) => {
            const level = sup_level + 1;
            _.each(arr, (nav) => {
                index++;
                const c = _.find(auths, (auth) => auth._id.toString() == nav._auth.toString());
                if (c) {
                    createArr.push({
                        type: body.type,
                        _auth: nav._auth,
                        level: level,
                        index: index,
                        sup_index: sup_index,
                        sup_level: sup_level
                    });
                }
                
                // 处理归属权限
                _.each(belongAuthArr, (auth) => {
                    if (auth.belong_auth.toString() == nav._auth.toString()) {
                        index++;
                        createArr.push({
                            type: body.type,
                            _auth: auth._id,
                            level: level,
                            index: index,
                            sup_index: sup_index,
                            sup_level: sup_level,
                        });
                    }
                });

                // 递归处理子导航
                if (nav.navArr && nav.navArr.length > 0) {
                    getNavArr(nav.navArr, index, level);
                }
            });
        };
        getNavArr(body.navArr, 0, 0);

        // 删除旧导航并创建新导航
        await Nav.deleteMany({type: body.type, isDelete: false});
        await Promise.all(createArr.map(obj => Nav.create(obj)));

        res.sendJson(200, resUtil.code200({result: 'success'}));
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};

/**
 * 获取默认导航
 */
exports.getDefault = async function(req, res) {
    try {
        const body = _.pick(req.body, 'type');
        const type = body.type == "adminDefault" ? "adminDefault" : "default";
        
        const condition = {
            type: type,
            isDelete: false
        };

        // 查询并构建导航树
        const auths = await Nav.aggregate([
            {$match: condition},
            {$addFields: {_authId: {$toObjectId: '$_auth'}}},
            {
                $lookup: {
                    from: 'auths',
                    localField: '_authId',
                    foreignField: '_id',
                    as: 'auth'
                }
            },
            {$unwind: '$auth'},
            {$match: {'auth.belong_auth': {$exists: false}}},
            {
                $project: {
                    _id: 1,
                    level: 1,
                    index: 1,
                    sup_index: 1,
                    sup_level: 1,
                    type: '$auth.type',
                    _auth: '$auth._id',
                    name: '$auth.name',
                    path: '$auth.path',
                    navArr: 1
                }
            }
        ]);

        const resultArr = buildNavTree(auths);
        res.sendJson(200, resUtil.code200({navArr: resultArr}));
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};

/**
 * 获取某个角色的导航
 */
exports.getOther = async function(req, res) {
    try {
        const body = _.pick(req.body, '_org', 'role', 'isChange');
        body.isChange = typeof body.isChange == "boolean" ? body.isChange : true;
        
        let condition = {isDelete: false};
        let resultArr = [];
        let authArr = [];

        // 设置查询条件
        switch (req.user.role) {
            case 'admin':
                body.role = 'organization';
                body._org = body._org;
                break;
            default:
                body._org = req.user._id.toString();
                break;
        }

        // 参数验证
        if (!body.role) {
            return res.sendJson(200, resUtil.code409("请填写角色"));
        }
        if (!body._org) {
            return res.sendJson(200, resUtil.code409("请填写机构id"));
        }
        if (body.role.includes("admin")) {
            condition = _.merge(condition, {type: 'adminDefault'});
        } else {
            condition = _.merge(condition, {type: 'default'});
        }

        // 查询默认导航
        const navs = await Nav.aggregate([
            {$match: condition},
            {$addFields: {_authId: {$toObjectId: '$_auth'}}},
            {
                $lookup: {
                    from: 'auths',
                    localField: '_authId',
                    foreignField: '_id',
                    as: 'auth'
                }
            },
            {$unwind: '$auth'},
            {$match: {'auth.belong_auth': {$exists: false}}},
            {
                $project: {
                    _id: 1,
                    level: 1,
                    index: 1,
                    sup_index: 1,
                    sup_level: 1,
                    _auth: {$toString: '$auth._id'},
                    name: '$auth.name',
                    type: '$auth.type',
                    icon: '$auth.icon',
                    isShow: '$auth.isShow',
                    component: '$auth.component',
                    redirect: '$auth.redirect',
                    path: '$auth.path',
                    isHideChildrenInMenu: '$auth.isHideChildrenInMenu',
                    isLock: '$auth.isLock',
                    isPublic: '$auth.isPublic',
                    target: '$auth.target',
                    navArr: 1
                }
            }
        ]);
        resultArr = buildNavTree(navs);

        // 处理机构权限
        if (req.user.role == 'organization') {
            const role = await Role.findOne({
                _organization: body._org,
                uuid: 'organization'
            });
            if (!role) {
                throw {status: 200, data: resUtil.code409("上层角色不存在")};
            }
            resultArr = setNavSelection(resultArr, role.authArr, true);
        }

        // 获取角色权限
        const roles = await Role.find({
            _organization: body._org,
            uuid: body.role
        });
        const authSet = new Set();
        roles.forEach(role => {
            role.authArr.forEach(_auth => authSet.add(_auth));
        });
        authArr = Array.from(authSet);

        // 处理导航数据
        resultArr = setNavSelection(resultArr, authArr, body.isChange);
        if (body.isChange) {
            resultArr = changeNavArr(resultArr);
        }

        res.sendJson(200, resUtil.code200({navArr: resultArr}));
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};

/**
 * 获取登录用户的导航
 */
exports.getLogin = async function(req, res) {
    try {
        let condition = {isDelete: false};

        if (req.user.role === 'admin') {
            condition = _.merge(condition, {type: 'adminDefault'});
        } else {
            condition = _.merge(condition, {type: 'default'});
        }

        const navs = await Nav.aggregate([
            {$match: condition},
            {$addFields: {_authId: {$toObjectId: '$_auth'}}},
            {
                $lookup: {
                    from: 'auths',
                    localField: '_authId',
                    foreignField: '_id',
                    as: 'auth'
                }
            },
            {$unwind: '$auth'},
            {
                $project: {
                    _id: 1,
                    level: 1,
                    index: 1,
                    sup_index: 1,
                    sup_level: 1,
                    _auth: {$toString: '$auth._id'},
                    name: '$auth.name',
                    type: '$auth.type',
                    icon: '$auth.icon',
                    isShow: '$auth.isShow',
                    component: '$auth.component',
                    redirect: '$auth.redirect',
                    path: '$auth.path',
                    isHideChildrenInMenu: '$auth.isHideChildrenInMenu',
                    isLock: '$auth.isLock',
                    isPublic: '$auth.isPublic',
                    target: '$auth.target',
                    navArr: 1
                }
            }
        ]);
        let resultArr = buildNavTree(navs);

        if (req.user.role === 'admin') {
            resultArr = changeNavArr(resultArr);
            return res.sendJson(200, resUtil.code200({navArr: resultArr}));
        }

        const roles = await Role.find({
            uuid: {$in: req.user.role.split(',')},
            isDelete: false
        });
        const authSet = new Set();
        roles.forEach(role => {
            (role.authArr || []).forEach(_auth => authSet.add(String(_auth)));
        });
        resultArr = setNavSelection(resultArr, Array.from(authSet), true);
        resultArr = changeNavArr(resultArr);

        res.sendJson(200, resUtil.code200({navArr: resultArr}));
    } catch (err) {
        errorUtil.handleControllerError(res, err);
    }
};