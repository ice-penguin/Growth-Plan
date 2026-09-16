'use strict';

const express = require('express');
const controller = require('./schedule.controller');

const router = express.Router();

router.get('/ping', controller.ping);
router.post('/ping', controller.ping);

module.exports = router;
