'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
	_organization: String, // 所属机构
	name: String, // 名称
	uuid: String, // 唯一标识（对应用户 _id）
	role: String, // 角色（JWT 归一化：admin/organization/staff/wechat）
	scheme: String, // 鉴权头前缀：Bearer（PC）| Wechat（小程序）
	token: String, // 令牌
	expiresIn: Date, // 有效时间
	ip: String, // 登录ip地址
	isDelete: {
		type: Boolean,
		default: false
	}, // 是否删除
}, {
	timestamps: {
		createdAt: 'createDate',
		updatedAt: 'updateDate'
	}
});

module.exports = mongoose.model('Token', TokenSchema);