'use strict';

const express = require('express');
const controller = require('./auth.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.post('/update', auth.hasRole(['admin']), controller.update); // 创建/更新
router.post('/index', auth.hasRole(['admin', 'organization', 'staff']), controller.index);//列表
router.post('/delete', auth.hasRole(['admin']), controller.delete);//根据id删除

module.exports = router;