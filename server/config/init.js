'use strict';

const UserModel = require('../api/user/user.model');
const User = require('../tool/dbutil')(UserModel);
const Auth = require('../tool/dbutil')(require('../api/auth/auth.model'));
const Nav = require('../tool/dbutil')(require('../api/nav/nav.model'));
const Role = require('../tool/dbutil')(require('../api/role/role.model'));

const MENUS = [
	{ name: '设置', type: 'nav', component: 'RouteView', icon: 'setting', path: '/setting', level: 1, index: 1 },
	{ name: '账号管理', type: 'page', component: 'SettingStaffAccount', path: '/setting/staff/account', level: 2, index: 1, sup_level: 1, sup_index: 1 },
	{ name: '角色管理', type: 'page', component: 'SettingStaffRole', path: '/setting/staff/role', level: 2, index: 2, sup_level: 1, sup_index: 1 },
	{ name: '菜单', type: 'nav', component: 'RouteView', icon: 'control', path: '/admin/menu', level: 1, index: 2 },
	{ name: '权限定义', type: 'page', component: 'Define', path: '/admin/menu/define', level: 2, index: 1, sup_level: 1, sup_index: 2 },
	{ name: '菜单设置', type: 'page', component: 'Settings', path: '/admin/menu/settings', level: 2, index: 2, sup_level: 1, sup_index: 2 }
];

async function ensureAuth(item) {
	let auth = await Auth.findOne({ path: item.path, isDelete: false });
	if (!auth) {
		auth = await Auth.create({
			type: item.type,
			name: item.name,
			icon: item.icon,
			component: item.component,
			path: item.path,
			isShow: true
		});
		console.log('初始化权限：' + item.name);
	}
	return auth;
}

async function ensureNav(auth, item, navType) {
	const exists = await Nav.findOne({
		type: navType,
		_auth: String(auth._id),
		isDelete: false
	});
	if (!exists) {
		await Nav.create({
			type: navType,
			_auth: String(auth._id),
			level: item.level,
			index: item.index,
			sup_index: item.sup_index,
			sup_level: item.sup_level
		});
	}
}

module.exports = async function init() {
	let admin = await User.findOne({ account: 'admin@growth-plan.com', isDelete: false });
	if (!admin) {
		admin = new UserModel({
			provider: 'local',
			role: 'admin',
			roleName: '平台管理员',
			name: '管理员',
			account: 'admin@growth-plan.com',
			tel: '13800000000'
		});
		admin.password = 'GrowthPlan666';
		await admin.save();
		console.log('已创建管理员 admin@growth-plan.com / GrowthPlan666');
	}

	const authIds = [];
	for (let i = 0; i < MENUS.length; i++) {
		const auth = await ensureAuth(MENUS[i]);
		authIds.push(String(auth._id));
		await ensureNav(auth, MENUS[i], 'adminDefault');
		await ensureNav(auth, MENUS[i], 'default');
	}

	let staffRole = await Role.findOne({ uuid: 'staff', isDelete: false });
	if (!staffRole) {
		staffRole = await Role.create({
			uuid: 'staff',
			name: '员工',
			description: '默认员工角色',
			authArr: authIds
		});
		console.log('已创建默认角色：员工');
	} else if (!staffRole.authArr || staffRole.authArr.length === 0) {
		await Role.findOneAndUpdate({ _id: staffRole._id }, { authArr: authIds });
	}

	console.log('基础数据初始化完成');
};
