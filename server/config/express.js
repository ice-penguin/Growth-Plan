'use strict';

const compression = require('compression');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

module.exports = function (app) {
	const env = app.get('env');

	app.use(compression());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.use(cookieParser());
	app.use(morgan('dev'));

	if (env === 'development' || env === 'test') {
		app.use(errorHandler());
	}
};
