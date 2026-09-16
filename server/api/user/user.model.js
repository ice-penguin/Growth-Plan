'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
	_organization: String, // 所属机构
	account: {
		type: String,
		lowercase: true
	}, // 账号
	name: String, // 名称
	tel: String, // 手机号
	openid: String, // 微信小程序 openid（移动端）
	unionid: String, // 微信 unionid（可选）
	hashedPassword: String, // 加密后密码
	role: String, // 角色
	roleName: String, // 角色名称
	provider: String,
	salt: String,
	isDelete: {
		type: Boolean,
		default: false
	},
}, {
	timestamps: {
		createdAt: 'createDate',
		updatedAt: 'updateDate'
	}
});

UserSchema.index({
	account: 1,
}, {
	unique: true,
	partialFilterExpression: { isDelete: false }
});

UserSchema.index({
	openid: 1,
}, {
	unique: true,
	partialFilterExpression: { openid: { $type: 'string' }, isDelete: false }
});

/**
 * Virtuals
 */
UserSchema
.virtual('password')
.set(function(password) {
	this._password = password;
	this.salt = this.makeSalt();
	this.hashedPassword = this.encryptPassword(password);
});

UserSchema.methods = {
	authenticate: async function(plainText) {
		return await bcrypt.compare(plainText, this.hashedPassword);
	},
	makeSalt: function() {
		return bcrypt.genSaltSync(10);
	},
	encryptPassword: function(password) {
		if (!password) return '';
		return bcrypt.hashSync(password, this.salt);
	},
};

module.exports = mongoose.model('User', UserSchema);
