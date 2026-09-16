'use strict';

const OSS = require('ali-oss');
const fs = require('fs');
const config = require('../../tool/config');
const resUtil = require('../../tool/resutil');

function getOssNormal() {
	const conf = config.ossNormal || {};
	if (!conf.ali_AccessKeyId || !conf.ali_AccessKeySecret || !conf.bucketName) {
		throw { status: 200, data: resUtil.code409('未配置阿里云 OSS（tool/config.ossNormal）') };
	}
	return conf;
}

function createClient(ossConf) {
	const opt = {
		accessKeyId: ossConf.ali_AccessKeyId,
		accessKeySecret: ossConf.ali_AccessKeySecret,
		bucket: ossConf.bucketName,
		secure: ossConf.secure !== false,
		timeout: ossConf.timeout || 600000,
		internal: !!ossConf.internal
	};
	if (ossConf.endpoint) {
		opt.endpoint = ossConf.endpoint;
	} else if (ossConf.region) {
		opt.region = ossConf.region;
	}
	return new OSS(opt);
}

/**
 * 上传到阿里云 OSS
 * @param {String} name OSS 对象名，可带目录前缀
 * @param {String|Buffer} url 本地文件路径或 Buffer
 * @returns {Promise<{code: string, url?: string, msg?: any}>}
 */
exports.uploadOss = function (name, url) {
	return new Promise(function (resolve) {
		try {
			const ossConf = getOssNormal();
			const client = createClient(ossConf);
			const objectName = String(name || '').replace(/^\//, '');
			client.put(objectName, url)
				.then(function (result) {
					let resultUrl = result.url;
					if (ossConf.changeHost) {
						resultUrl = resultUrl.replace(/^http(s)?:\/\/(.*?)\//, ossConf.changeHost);
					}
					console.log('OSS 上传成功：' + resultUrl);
					resolve({
						code: '200',
						url: resultUrl,
						name: result.name || objectName
					});
				})
				.catch(function (err) {
					console.error('OSS 上传失败', err);
					resolve({ code: '409', msg: err });
				});
		} catch (err) {
			resolve({
				code: '409',
				msg: err && err.data ? err.data : err
			});
		}
	});
};

/**
 * 删除 OSS 文件
 * @param {String} name
 */
exports.deleteOss = function (name) {
	return new Promise(function (resolve) {
		try {
			const ossConf = getOssNormal();
			const client = createClient(ossConf);
			client.delete(String(name || '').replace(/^\//, ''))
				.then(function () {
					resolve({ code: '200' });
				})
				.catch(function (err) {
					resolve({ code: '409', msg: err });
				});
		} catch (err) {
			resolve({
				code: '409',
				msg: err && err.data ? err.data : err
			});
		}
	});
};

/**
 * 清理 multipart 临时目录
 */
exports.clearCachedFile = function (filePath) {
	try {
		if (filePath && fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	} catch (err) {
		console.warn('清理临时文件失败：' + filePath, err && err.message);
	}
};
