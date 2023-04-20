// 配置信息
import CONFIGS from "../configs/index"

// 包
import express from "express"
import CommonTools from "../methods/CommonTools"
const { formatResponse, isEmail } = CommonTools
import RSSDB from "../methods/RSSDB"
import UsersDB from "../methods/UsersDB"
import CategoriesDB from "../methods/CategoriesDB"
import SubscriptionsDB from "../methods/SubscriptionsDB"
const rssDB = new RSSDB()
const usersDB = new UsersDB()
const categoriesDB = new CategoriesDB()
const subscriptionsDB = new SubscriptionsDB()

// 路由
let router = express.Router()

// 添加订阅关系
router.post("/", async (req, res) => {
	let { url, sid, rssUUID, categoryUUID } = req.body

	// 权限检测
	if (!sid) {
		formatResponse("请登录再进行此操作", 0, req.body, res)
		return false
	}

	// 分类检测
	if (!categoryUUID) {
		formatResponse("没有传入分类", 0, req.body, res)
		return false
	}

	if (!rssUUID && !url) {
		//既没有接收到rssUUID又没有接收到url
		formatResponse("没有传入订阅源ID或没有传入URL", 0, req.body, res)
		return false
	}

	/* DB数据检测 */
	// 权限
	const user = await usersDB.getUserBySID(sid)
	if (!user) {
		formatResponse("用户不存在", 0, req.body, res)
		return false
	}

	// 分类
	const category = await categoriesDB.getItem({ uuid: categoryUUID })
	if (!category) {
		formatResponse("分类不存在", 0, req.body, res)
		return false
	}

	// 权限
	if (category.createByUUID != user.uuid) {
		formatResponse("该分类不属于该用户", 0, req.body, res)
		return false
	}

	// 分类类型
	if (category.type !== 1) {
		formatResponse("该分类不是订阅源分类", 0, req.body, res)
		return false
	}

	// 通过url的方式
	if (url) {
		const rss = await rssDB.getItem({ url })
		if (!rss) {
			formatResponse("订阅源不存在", 0, req.body, res)
			return false
		}

		rssUUID = rss.uuid
	}

	subscriptionsDB
		.create({
			rssUUID,
			categoryUUID,
			createByUUID: user.uuid,
		})
		.then((subscription: any) => {
			formatResponse("订阅成功", 1, subscription, res)
		})
		.catch((err: any) => {
			formatResponse("订阅失败", 0, err, res)
		})
})

// 加载订阅列表
router.get("/", async (req, res) => {
	const { uuid, categoryUUID, page = 1, limit = 20, sort = "DESC" } = req.query

	let where = { createByUUID: uuid, isDeleted: 0, categoryUUID }
	!where.categoryUUID && delete where.categoryUUID
	!where.createByUUID && delete where.createByUUID

	const options: any = { sort, page, limit }
	const subscribings = await subscriptionsDB.getItems(where, options)

	formatResponse("加载成功", 1, subscribings, res)
})

// 取消订阅
router.delete("/subscribing/", async (req, res) => {
	const { uuid, sid } = req.body
	// 参数校验
	if (!uuid) return formatResponse("没有传入订阅ID", 0, req.body, res)
	if (!sid) return formatResponse("请登录再进行此操作", 0, req.body, res)

	// 权限校验
	const user = await usersDB.getUserBySID(sid)
	if (!user) return formatResponse("登录失败", 0, req.body, res)

	const subscribing = await subscriptionsDB.getItem({ uuid, createByUUID: user.uuid })
	if (!subscribing) return formatResponse("订阅不存在", 0, req.body, res)

	subscribing
		.destroy()
		.then((result: any) => {
			formatResponse("取消订阅成功", 1, result, res)
		})
		.catch((err: any) => {
			console.error(err)
			formatResponse("取消订阅失败", 0, err, res)
		})
})

// 查询订阅详情
router.get("/subscribing/", async (req, res) => {
	const { uuid, sid } = req.query
	// 参数校验
	if (!uuid) return formatResponse("没有传入订阅ID", 0, req.query, res)
	if (!sid) return formatResponse("请登录再进行此操作", 0, req.query, res)

	// 权限校验
	const user = await usersDB.getUserBySID(String(sid))
	if (!user) return formatResponse("登录失败", 0, req.query, res)

	const subscribing = await subscriptionsDB.getItem({ uuid, createByUUID: user.uuid })
	if (!subscribing) return formatResponse("订阅不存在", 0, req.query, res)

	formatResponse("查询成功", 1, subscribing, res)
})

export default router
