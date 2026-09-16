'use strict';

const { AsyncLocalStorage } = require('async_hooks');

const als = new AsyncLocalStorage();
const original = {
	log: console.log.bind(console),
	info: console.info.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console),
	debug: console.debug.bind(console)
};

function getRequestId() {
	const store = als.getStore();
	return store && store.requestId;
}

function wrap(method) {
	return function () {
		const requestId = getRequestId();
		if (!requestId) {
			return original[method].apply(console, arguments);
		}
		const args = Array.prototype.slice.call(arguments);
		args.unshift('[' + requestId + ']');
		return original[method].apply(console, args);
	};
}

['log', 'info', 'warn', 'error', 'debug'].forEach(function (method) {
	console[method] = wrap(method);
});

exports.getRequestId = getRequestId;

exports.runWithRequestId = function (requestId, fn) {
	return als.run({ requestId: requestId }, fn);
};
