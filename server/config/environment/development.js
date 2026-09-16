'use strict';

// 对应 tool/config/dev.config.js，测试 / 开发机用
module.exports = {
	port: process.env.PORT || 9000, // 主 API 端口
	port_schedule: process.env.PORT_SCHEDULE || 4545, // 定时器进程端口
	mongo: {
		uri: process.env.MONGO_URI || 'mongodb://localhost/growth-plan-dev', // Mongo 连接串
		opt: {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	}
};
