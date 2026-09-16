'use strict';

const express = require('express');
const controller = require('./role.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.post('/update', auth.hasRole(['admin', 'organization']), controller.update);//创建/编辑
router.post('/update/auth', auth.hasRole(['admin', 'organization']), controller.updateAuth); // 更新权限
router.post('/index', auth.hasRole(['admin', 'organization', 'staff']), controller.index); // 列表
router.post('/delete', auth.hasRole(['admin', 'organization']), controller.delete); // 删除

module.exports = router;