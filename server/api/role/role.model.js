'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    _organization:String, // 机构id
    uuid:String, // 唯一编码
    name:String, // 名称
    description:String, // 描述
    authArr:[String], // 权限数组
    isDelete:{
        type:Boolean,
        default:false
    },//是否删除
},{
    timestamps:{
        createdAt: 'createDate',
        updatedAt: 'updateDate'
    }
});

module.exports = mongoose.model('Role', RoleSchema);