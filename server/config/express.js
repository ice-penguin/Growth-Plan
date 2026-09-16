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
	morgan.token('request-id', function (req) {
		return req.headers.requestId || '-';
	});
	app.use(morgan('[:request-id] :method :url :status :response-time ms'));

	if (env === 'development' || env === 'test') {
		app.use(errorHandler());
	}
};
