/**
 * Main application file
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
const multipart = require('connect-multiparty');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
mongoose.connect(config.mongo.uri, config.mongo.opt, function (err) {
	if (err) {
		console.log('连接失败');
		throw err;
	}
	console.log('连接成功');
	require('./config/init')().catch(function (initErr) {
		console.error('初始化失败', initErr);
	});
});

const app = express();
app.use(multipart({
	uploadDir: path.join(__dirname, 'cached')
}));
app.use(cors());
app.use(bodyParser.json({ limit: '600kb' }));
app.use(bodyParser.urlencoded({ limit: '600kb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

require('./config/express')(app);
require('./routes')(app);

const server = require('http').createServer(app);
server.listen(config.port, config.ip, function () {
	console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

exports = module.exports = app;
