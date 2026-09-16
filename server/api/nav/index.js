'use strict';

const express = require('express');
const controller = require('./nav.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.post('/update/default', auth.hasRole(['admin']), controller.updateDefault); // 创建、更新默认导航
router.post('/get/default', auth.hasRole(['admin']), controller.getDefault); // 获取默认导航
router.post('/get/other', auth.hasRole(['admin', 'organization']), controller.getOther); // 获取导航配置
router.post('/get/login', auth.hasRole(['admin', 'organization', 'staff']), controller.getLogin); // 获取登录用户导航

module.exports = router;