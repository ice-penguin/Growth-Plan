'use strict';

const path = require('path');
const _ = require('lodash');

process.env.NODE_ENV = process.env.NODE_ENV || 'local';

const all = {
	env: process.env.NODE_ENV,
	root: path.normalize(__dirname + '/../..'),
	port: process.env.PORT || 9000,
	seedDB: false,
	secrets: {
		session: process.env.SESSION_SECRET || 'growth-plan-secret'
	},
	userRoles: ['guest', 'user', 'admin']
};

module.exports = _.merge(
	all,
	require('./' + process.env.NODE_ENV + '.js') || {}
);
