'use strict';

const resUtil = require('./resutil');

const VALIDATION_ERROR_REGEXP = /ValidationError:.*:\s/g;

const sanitizeErrorPayload = function(payload) {
	if (!payload || typeof payload !== 'object') {
		return payload;
	}
	if (typeof payload.data === 'string') {
		return {
			...payload,
			data: payload.data.replace(VALIDATION_ERROR_REGEXP, '')
		};
	}
	return payload;
};

/**
 * 统一处理 controller 中的 catch 错误
 * 业务错误：throw { status: 200, data: resUtil.code409('...') }
 */
exports.handleControllerError = function(res, err) {
	if (err && err.status) {
		return res.sendJson(err.status, err.data);
	}
	const message = err && err.message ? err.message : String(err);
	return res.sendJson(500, sanitizeErrorPayload(resUtil.code500(message)));
};

exports.sanitizeErrorPayload = sanitizeErrorPayload;
