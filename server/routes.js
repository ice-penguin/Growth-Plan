'use strict';

const errors = require('./components/errors');
const { initRequest } = require('./auth/auth.service');

module.exports = function (app) {
	app.use('/api/upload', initRequest(), require('./api/upload'));
	app.use('/api/aliyun', initRequest(), require('./api/aliyun'));
	app.use('/api/auth', initRequest(), require('./api/auth'));
	app.use('/api/nav', initRequest(), require('./api/nav'));
	app.use('/api/role', initRequest(), require('./api/role'));
	app.use('/api/user', initRequest(), require('./api/user'));
	app.use('/api/config', initRequest(), require('./api/config'));
	app.use('/auth', initRequest(), require('./auth'));

	app.route('/:url(api|auth)/*').get(errors[404]);
};
