'use strict';

const express = require('express');
const controller = require('./config.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.post('/show', auth.hasRole(['admin', 'organization', 'staff']), controller.show);
router.post('/update', auth.hasRole(['admin']), controller.update);

module.exports = router;
