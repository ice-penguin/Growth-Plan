'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NavSchema = new Schema({
    type:{
        type:String,
        enum:[
            'default', // 默认
            'adminDefault', // 管理员默认
        ],
        default:'default'
    }, // 默认导航类型
    _auth:{
        type:String,
        ref:'Auth'
    },//权限id
    level:Number, // 层级,从1开始
    index:Number, // 编号,从1开始
    sup_index:Number, // 上级导航编号
    sup_level:Number, // 上级层级
    isDelete:{
        type:Boolean,
        default:false
    }, // 是否删除
},{
    timestamps: {
        createdAt: 'createDate',
        updatedAt: 'updateDate'
    }
});

module.exports = mongoose.model('Nav', NavSchema);
