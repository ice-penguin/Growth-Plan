'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthSchema = new Schema({
    type:{
        type:String,
        enum:[
            'nav', // 导航
            'page', // 页面
            'btn' // 按钮
        ],
        default:'page'
    }, // 权限类型
    name:String, // 名称
    icon:String, // 图标
    target:String, // 打开方式,_blank为新窗口打开
    component:{
        type:String,
        default:'RouteView'
    }, // 引入的页面,导航页为RouteView，着陆页为具体的着陆页地址，按钮页为无须填写
    path:String, // 页面地址
    redirect:String, // 重定向地址
    description:String, // 描述介绍
    isShow:{
        type:Boolean,
        default:true
    },//是否显示,内部页面需隐藏，需要传入id才能请求的页面
    isLock:{
        type:Boolean,
        default:false
    },//按钮是否锁定，锁定权限无需选则，默认选中，不可修改
    isHideChildrenInMenu:{
        type:Boolean,
        default:false
    },//是否隐藏下级，默认不隐藏
    belong_auth:{
        type:String,
        ref:'Auth'
    },// 归属权限，上级授权则本级授权,内部页面填写
    isPublic:{
        type:Boolean,
        default:false
    },//是否公开，公开权限无需选则，默认选中，不可修改
    isDelete:{
        type:Boolean,
        default:false
    },//是否删除
},{
    timestamps: {
        createdAt: 'createDate',
        updatedAt: 'updateDate'
    }
});

module.exports = mongoose.model('Auth', AuthSchema);