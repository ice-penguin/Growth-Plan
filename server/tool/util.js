'use strict';

const moment = require('moment');
require('moment/locale/zh-cn');

exports.uuid = function () {
	const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	const time = new Date().getTime();
	const num = 16;
	const str = parseInt(time / num) + '' + (time % num < 10 ? ('0' + time % num) : time % num);
	const len = str.length;
	const arr = [];
	const id = [];
	for (let i = 0; i < parseInt(len / 3); i++) {
		arr[i] = parseInt(str.substring(3 * i, 3 * i + 3));
	}
	if (len % 3) {
		arr.push(parseInt(str.substring(3 * arr.length)));
	}
	for (let i = 0; i < arr.length; i++) {
		id.push(chars[parseInt(arr[i] / num)]);
		id.push(chars[parseInt(arr[i] % num)]);
	}
	return id.join('');
};

exports.isTel = function (tel) {
	return /^1[3456789]\d{9}$/.test(tel);
};

exports.getClientIp = function (req) {
	let ip = req.headers['x-forwarded-for'] ||
		req.headers['x-real-ip'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress;
	if (ip && ip.includes('::ffff:')) {
		ip = ip.replace('::ffff:', '');
	}
	if (ip && ip.includes(',')) {
		ip = ip.split(',')[0].trim();
	}
	return ip;
};

exports.getShowDate = function (date, value) {
	value = value ? value : 'YYYY-MM-DD HH:mm:ss';
	return moment(date).format(value);
};

exports.objectToArr = function (obj) {
	const arr = [];
	for (const i in obj) {
		arr.push({
			key: i,
			value: obj[i]
		});
	}
	return arr;
};

exports.arrToObject = function (arr) {
	const obj = {};
	for (let i = 0; i < arr.length; i++) {
		obj[arr[i].key] = arr[i].value;
	}
	return obj;
};
