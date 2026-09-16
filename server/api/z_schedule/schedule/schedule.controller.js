'use strict';

const resUtil = require('../../../tool/resutil');

exports.ping = function (req, res) {
	return res.sendJson(200, resUtil.code200({
		ok: true,
		process: 'schedule'
	}));
};
