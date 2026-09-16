'use strict';

// 对应 tool/config/production.config.js，生产环境用
module.exports = {
	ip: process.env.IP || undefined, // 监听 IP，生产可指定
	port: process.env.PORT || 10000, // 主 API 端口
	port_schedule: process.env.PORT_SCHEDULE || 4545, // 定时器进程端口
	mongo: {
		uri: process.env.MONGO_URI || 'mongodb://localhost/growth-plan', // Mongo 连接串
		opt: {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	}
};
