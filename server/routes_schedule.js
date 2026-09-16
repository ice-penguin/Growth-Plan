/**
 * Schedule process routes
 */

'use strict';

const errors = require('./components/errors');
const { initRequest } = require('./auth/auth.service');

module.exports = function (app) {
	app.use('/api/schedules', initRequest(), require('./api/z_schedule/schedule'));

	app.route('/:url(api)/*').get(errors[404]);
};
