'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../../tool/config');
const aliyunUtil = require('../aliyun/aliyun.util');
const resUtil = require('../../tool/resutil');
const errorUtil = require('../../tool/errorutil');

function resolveUploadDir() {
	const conf = config.upload || {};
	const localDir = conf.localDir || 'uploads';
	if (path.isAbsolute(localDir)) {
		return localDir;
	}
	return path.join(__dirname, '../../', localDir);
}

function buildLocalPublicUrl(fileName) {
	const conf = config.upload || {};
	const publicPath = (conf.publicPath || '/uploads').replace(/\/$/, '');
	const relative = publicPath + '/' + fileName;
	if (conf.publicBaseUrl) {
		return conf.publicBaseUrl.replace(/\/$/, '') + relative;
	}
	return relative;
}

function assertFileSize(file, conf) {
	const maxBytes = (conf.maxSizeMb || 10) * 1024 * 1024;
	const size = file.size || (file.path && fs.existsSync(file.path) && fs.statSync(file.path).size) || 0;
	if (size > maxBytes) {
		throw { status: 200, data: resUtil.code409('文件大小不能超过' + conf.maxSizeMb + 'MB') };
	}
}

function renameFile(file) {
	const max = Math.pow(2, 32);
	const min = 1;
	const nowStr = Date.now().toString();
	const randStr = (Math.floor(Math.random() * (max - min)) + min).toString();
	const raw = (file.originalFilename || file.name || 'file').replace(/[^0-9a-z.]+/gi, '');
	return nowStr + '_' + randStr + '_' + raw;
}

async function uploadLocal(file, name) {
	const uploadDir = resolveUploadDir();
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}
	const dest = path.join(uploadDir, name);
	fs.renameSync(file.path, dest);
	return {
		url: buildLocalPublicUrl(name),
		fileName: name
	};
}

async function uploadOss(file, name) {
	const prefix = ((config.upload && config.upload.ossPrefix) || 'growth-plan/').replace(/^\/+/, '');
	const objectName = (prefix.endsWith('/') ? prefix : prefix + '/') + name;
	const obj = await aliyunUtil.uploadOss(objectName, file.path);
	aliyunUtil.clearCachedFile(file.path);
	if (obj.code !== '200') {
		const msg = obj.msg && obj.msg.message ? obj.msg.message : (obj.msg || 'OSS 上传失败');
		throw { status: 200, data: resUtil.code409(String(msg)) };
	}
	return {
		url: obj.url,
		fileName: obj.name || objectName
	};
}

exports.upload = async function (req, res) {
	try {
		const file = req.files && req.files.file;
		if (!file) {
			throw { status: 200, data: resUtil.code409('请上传文件') };
		}

		const conf = config.upload || {};
		assertFileSize(file, conf);

		const name = renameFile(file);
		const storage = conf.storage || 'oss';
		const result = storage === 'local'
			? await uploadLocal(file, name)
			: await uploadOss(file, name);

		res.sendJson(200, resUtil.code200({ result: result }));
	} catch (err) {
		if (req.files && req.files.file && req.files.file.path) {
			aliyunUtil.clearCachedFile(req.files.file.path);
		}
		errorUtil.handleControllerError(res, err);
	}
};
