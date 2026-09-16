const response = {};

/*
请求成功
 */
response.code200 = (value) => {
	return {
		code:200,
		data:value
	};
};

/*
Unauthorized/未授权
 */
response.code401 = () => {
	return {
		code:401,
		data:'未登录或登录过期'
	};
};

/*
其他错误
 */
response.code403 = (value) => {
	return {
		code:403,
		data:value
	};
};

/*
其他错误
 */
response.code404 = (value) => {
	return {
		code: 404,
		data: '找不到对象：' + value
	};
};

/*
业务冲突 / 参数校验失败
 */
response.code409 = (value) => {
	return {
		code: 409,
		data: value
	};
};

/*
用户在周期内多次购买商品提醒
 */
response.code10000 = (value) => {
	return {
		code:10000,
		data:value
	};
};

/*
服务器出错
 */
response.code500 = (value) => {
	return {
		code:500,
		data:value
	};
};

exports = module.exports = response;