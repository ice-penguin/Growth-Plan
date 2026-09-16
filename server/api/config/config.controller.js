'use strict';

const _ = require('lodash');
const appConfig = require('../../tool/config');
const resUtil = require('../../tool/resutil');

function siteResult() {
	const site = appConfig.site || {};
	return {
		title: site.title || '成长计划',
		logo: site.logo || '',
		logoMin: site.logoMin || site.logo || ''
	};
}

exports.show = function (req, res) {
	return res.sendJson(200, resUtil.code200({
		result: siteResult()
	}));
};

exports.update = function (req, res) {
	const body = _.pick(req.body, 'title', 'logo', 'logoMin');
	appConfig.site = appConfig.site || {};
	if (body.title !== undefined) {
		appConfig.site.title = body.title;
	}
	if (body.logo !== undefined) {
		appConfig.site.logo = body.logo;
	}
	if (body.logoMin !== undefined) {
		appConfig.site.logoMin = body.logoMin;
	}
	return res.sendJson(200, resUtil.code200({
		result: siteResult()
	}));
};
