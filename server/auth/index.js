'use strict';

const express = require('express');
const controller = require('./local.controller');
const auth = require('./auth.service');

const router = express.Router();

// PC
router.post('/login', controller.login);
router.post('/logout', auth.hasRole(['admin', 'organization', 'staff']), controller.logout);

// 小程序：Authorization: Wechat <token>
router.post('/wx/login', controller.wxLogin);
router.post('/wx/logout', auth.hasRole(['wechat']), controller.wxLogout);

module.exports = router;
