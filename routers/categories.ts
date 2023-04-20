// 配置信息
import CONFIGS from "../configs/index"

// 包
import express from "express"
import CommonTools from "../methods/CommonTools"
const { formatResponse } = CommonTools
import UsersDB from "../methods/UsersDB"
import CategoriesDB from "../methods/CategoriesDB"
import SubscriptionsDB from "../methods/SubscriptionsDB"
const usersDB = new UsersDB()
const categoriesDB = new CategoriesDB()
const subscriptionsDB = new SubscriptionsDB()

// 路由
let router = express.Router()

// 查询用户的分类
router.get("/users/uuid/:uuid", (req, res) => {
	const { uuid } = req.params
	const { type } = req.query
	if (!uuid) {
		formatResponse("请传入uuid", 0, req.body, res)
		return false
	}

	// 查询用户是否存在
	const user = usersDB.getUserByUUID(uuid)
	if (!user) {
		formatResponse("用户不存在", 0, req.body, res)
		return false
	}

  // 查询条件
  let where: any = { createByUUID: uuid }
  // 查询分类类型
	type && (where.type = type)

	// 查询用户的分类
	const categories = categoriesDB.getItems(where)
	formatResponse("success", 200, res, categories)
})

// 查询单个分类的信息
router.get("/uuid/:uuid", (req, res) => {
	const { uuid } = req.params
	if (!uuid) {
		formatResponse("请传入uuid", 0, req.body, res)
		return false
	}

	// 查询分类是否存在
	const category = categoriesDB.getItem({ uuid })
	if (!category) {
		formatResponse("分类不存在", 0, req.body, res)
		return false
	}

	formatResponse("success", 200, res, category)
})

// 添加分类
router.post("/", async (req, res) => {
	const { name, sid, description = "", isPrivate = false, type = 1 } = req.body
	if (!sid) {
		formatResponse("请先登录", 0, req.body, res)
		return false
	}

	// 查询用户是否存在
	const user = await usersDB.getUserBySID(sid)
	if (!user) {
		formatResponse("用户不存在", 0, req.body, res)
		return false
	}

	if (!name) {
		formatResponse("请传入分类名称", 0, req.body, res)
		return false
	}

	if (name.length > 32) {
		formatResponse("分类名称不能超过32个字符", 0, req.body, res)
		return false
	}

	// 添加分类
	const saveData = {
		name,
		description,
		createByUUID: user.uuid,
		type,
		private: isPrivate,
	}

	categoriesDB
		.create(saveData)
		.then((category) => {
			formatResponse("success", 200, res, category)
		})
		.catch((err) => {
			console.error(err)
			formatResponse("添加失败", 0, req.body, res)
		})
})

// 删除分类
router.delete("/", async (req, res) => {
	const { uuid, sid } = req.body
	if (!sid) {
		formatResponse("请先登录", 0, req.body, res)
		return false
	}

	// 查询用户是否存在
	const user = await usersDB.getUserBySID(sid)
	if (!user) {
		formatResponse("用户不存在", 0, req.body, res)
		return false
	}

	if (!uuid) {
		formatResponse("请传入分类uuid", 0, req.body, res)
		return false
	}

	// 查询分类是否存在
	const category = await categoriesDB.getItem({ uuid })
	if (!category) {
		formatResponse("分类不存在", 0, req.body, res)
		return false
	}

	// 查询分类是否属于该用户
	if (category.createByUUID !== user.uuid) {
		formatResponse("无权操作", 0, req.body, res)
		return false
	}

	// 查询分类下是否有订阅
	const subscriptions = await subscriptionsDB.countTotal({ categoryUUID: uuid })
	if (subscriptions > 0) {
		formatResponse("该分类下有订阅，无法删除", 0, req.body, res)
		return false
	}

	// 删除分类
	category
		.destroy()
		.then(() => {
			formatResponse("success", 200, res, category)
		})
		.catch((err: any) => {
			console.error(err)
			formatResponse("删除失败", 0, req.body, res)
		})
})

export default router
