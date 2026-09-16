/**
 * Schedule process — 只跑定时器，不挂业务 API
 */

'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'local';

process.on('unhandledRejection', function (reason, promise) {
	console.error('Unhandled Rejection at:', promise);
	console.error('Reason:', reason);
});

const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/environment');
const cors = require('cors');
const bodyParser = require('body-parser');

require('./api/z_schedule/timer/timer');

mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
mongoose.connect(config.mongo.uri, config.mongo.opt, function (err) {
	if (err) {
		console.log('定时器进程：连接失败');
		throw err;
	}
	console.log('定时器进程：连接成功');
});

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '600kb' }));
app.use(bodyParser.urlencoded({ limit: '600kb', extended: true }));

require('./config/express')(app);
require('./routes_schedule')(app);

const server = require('http').createServer(app);
server.listen(config.port_schedule, config.ip, function () {
	console.log('Schedule server listening on %d, in %s mode', config.port_schedule, app.get('env'));
});

exports = module.exports = app;
