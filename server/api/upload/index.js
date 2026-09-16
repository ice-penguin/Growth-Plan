'use strict';

const express = require('express');
const controller = require('./upload.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.post('/', auth.hasRole(['admin', 'organization', 'staff']), controller.upload);
router.post('/pic', auth.hasRole(['admin', 'organization', 'staff']), controller.upload);

module.exports = router;
