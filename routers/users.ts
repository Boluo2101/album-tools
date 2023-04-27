// 配置信息
import CONFIGS from "../configs/index"

// 包
import express from "express"
import CommonTools from "../methods/CommonTools"
const { formatResponse, isEmail } = CommonTools
import UsersDB from "../methods/UsersDB"
const usersDB = new UsersDB()

// 路由
let router = express.Router()

// 注册
router.post("/", async (req, res) => {
	let { username, name, password, email } = req.body

	if (!username || !email || !password || !name) {
		formatResponse("提交参数不全", 0, res, req.body)
		return false
	}

	if (CommonTools.usernameAllowed(username) === false) {
		formatResponse("用户名不合法", 0, res, username)
		return false
	}

	if (name.length > 32) {
		formatResponse("昵称长度不能超过32个字符", 0, res, name)
		return false
	}

	if (password.length < 6) {
		formatResponse("密码长度需要大于6位", 0, res, password)
		return false
	}

	email = decodeURI(email)
	if (!isEmail(email)) {
		formatResponse("Email格式不正确", 0, res, email)
		return false
	}

	if (await usersDB.usernameExists(username)) {
		formatResponse("用户名已存在", 0, res, username)
		return false
	}

	if (await usersDB.emailExists(email)) {
		formatResponse("Email已存在", 0, res, email)
		return false
	}

	usersDB
		.createUser(username, password, email, { name })
		.then((userinfo: any) => {
			console.log("created userinfo", userinfo)
			formatResponse("USERS_POST_SUC", 1, res, userinfo)
		})
		.catch((err: any) => {
			console.error(err)
			formatResponse("USERS_POST_ERR", 0, res, err)
		})
})

// 登录
router.get("/login/:email/password/:password", async (req, res) => {
	let { email, password } = req.params
	if (!email || !password) {
		formatResponse("USERS_LOGIN_ERR", 0, { ...req.params }, res)
		return false
	}

	email = decodeURI(email)
	if (!isEmail(email)) {
		formatResponse("Email格式不正确", 0, res, email)
		return false
	}

	let userinfo: any = await usersDB.getUserByEmailAndPassword({ email, password })

	if (!userinfo) {
		formatResponse("USERS_LOGIN_ERROR", 0, res, req.params)
		return false
	}

	if (userinfo.isDeleted) {
		formatResponse("USERS_LOGIN_DIS", 0, res, req.params)
		return false
	}

	formatResponse("USERS_LOGIN_SUC", 1, res, userinfo)
	usersDB.updateLastLoginDate(userinfo)
})

// 刷新SID
router.post("/resetSID", async (req, res) => {
	const { sid } = req.body
	if (!sid) return formatResponse("请登录再进行此操作", 0, req.body, res)
	const userinfo = await usersDB.getUserBySID(sid)
	if (!userinfo) return formatResponse("登录失败", 0, req.body, res)

	let newUserinfo = await usersDB.resetSID(userinfo)
	if (!newUserinfo) return formatResponse("更新SID失败,请重新登录", 0, req.body, res)

	formatResponse("更新SID成功", 1, newUserinfo, res)
})

// 修改密码
router.post("/resetPassword", async (req, res) => {
	// password 应当md5后再提交，newPassword不需要
	const { password, newPassword, email } = req.body
	if (!password || !newPassword || !email) return formatResponse("请登录再进行此操作", 0, req.body, res)

	if (password.length < 6) {
		formatResponse("密码长度需要大于6位", 0, password, res)
		return false
	}

	const userinfo = await usersDB.getUserByEmailAndPassword({ email, password })

	if (!userinfo) return formatResponse("登录失败", 0, req.body, res)

	let newUserinfo = await usersDB.resetPassword(userinfo, newPassword)
	if (!newUserinfo) return formatResponse("更新密码失败", 0, req.body, res)
	formatResponse("更新密码成功", 1, newUserinfo, res)
})

// 修改名称
router.post("/resetName", async (req, res) => {
	const { sid, name } = req.body
	if (!sid || !name) return formatResponse("请登录再进行此操作", 0, req.body, res)

	if (name.length > 32) {
		formatResponse("昵称长度不能超过32个字符", 0, name, res)
		return false
	}

	const userinfo = await usersDB.getUserBySID(sid)
	if (!userinfo) return formatResponse("登录失败", 0, req.body, res)

	let newUserinfo = await usersDB.resetName(userinfo, name)
	if (!newUserinfo) return formatResponse("更新名称失败", 0, req.body, res)
	formatResponse("更新名称成功", 1, newUserinfo, res)
})

// 查询用户的公开信息
router.get("/:username", async (req, res) => {
	const { username } = req.params
	if (!username) return formatResponse("请传入用户名", 0, req.body, res)
	const userinfo = await usersDB.getUserByUsername(username, "public")

	if (!userinfo) return formatResponse("用户不存在", 0, req.body, res)

	formatResponse("查询成功", 1, userinfo, res)
})

// 查询Email是否存在
router.get("/email/:email", async (req, res) => {
	const { email } = req.params
	if (!email) return formatResponse("请传入Email", 0, req.body, res)
	const userinfo = await usersDB.getUserByEmail(decodeURI(email))

	if (!userinfo) return formatResponse("Email不存在", 0, res, null)

	formatResponse("查询成功", 1, res, userinfo.username)
})

export default router
