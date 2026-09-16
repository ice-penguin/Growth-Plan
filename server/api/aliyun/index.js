'use strict';

const express = require('express');
const uploadController = require('../upload/upload.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

// 兼容管理端默认上传地址 /api/aliyun/upload
router.post('/upload', auth.hasRole(['admin', 'organization', 'staff']), uploadController.upload);

module.exports = router;
