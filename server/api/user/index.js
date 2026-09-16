'use strict';

const express = require('express');
const controller = require('./user.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.post('/update', auth.hasRole(['admin', 'organization', 'staff']), controller.update); // 创建/编辑员工账号
router.post('/reset/password', auth.hasRole(['admin', 'organization', 'staff']), controller.resetPsd); // 重置密码
router.post('/update/password', auth.hasRole(['admin', 'organization', 'staff']), controller.updatePsd); // 修改密码
router.post('/index', auth.hasRole(['admin', 'organization', 'staff']), controller.index); // 列表
router.post('/delete', auth.hasRole(['admin', 'organization', 'staff']), controller.delete); // 删除
router.post('/me', auth.hasRole(['admin', 'organization', 'staff', 'wechat']), controller.getMe); // 获取自己信息

module.exports = router;
