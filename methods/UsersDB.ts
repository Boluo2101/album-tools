/*
 * @Author: 张超越
 * @Date: 2023-04-20 13:25:53
 * @Last Modified by: 张超越
 * @Last Modified time: 2023-04-20 14:38:57
 */

import DbBase from "./DbBase"
import { Users } from "../db/exports"
import CommonTools from "./CommonTools"

export default class UsersDB extends DbBase {
	constructor() {
		super(Users)
	}

	async usernameExists(username: string): Promise<boolean> {
		// 未传入用户名，则视为已存在
		if (!username) return true

		const countOptions = {
			where: {
				username,
			},
		}

		const count = await this.countTotal(countOptions)
		return count > 0
	}

	async emailExists(email: string): Promise<boolean> {
		// 未传入邮箱，则视为已存在
		if (!email) return true

		// 邮箱格式不正确，则视为已存在
		if (!CommonTools.isEmail(email)) return true

		const countOptions = {
			where: {
				email,
			},
		}
		const count = await this.countTotal(countOptions)
		return count > 0
	}

	async UUIDExists(UUID: string): Promise<boolean> {
		// 未传入UUID，则视为已存在
		if (!UUID) return true

		const countOptions = {
			where: {
				uuid: UUID,
			},
		}

		const count = await this.countTotal(countOptions)
		return count > 0
	}

	async getUUIDBySID(sid: string): Promise<string> {
		if (!sid) return ""

		const countOptions = {
			where: {
				sid,
			},
		}

		const user = await this.dbModel.findOne(countOptions)
		return user ? user.uuid : ""
	}

	async createUser(username: string, passwordRaw: string, email: string, saveData: any = {}): Promise<any> {
		const randomKey = CommonTools.getRandomString(6)
		const password = CommonTools.md5(passwordRaw)
		const sid = CommonTools.md5(password + randomKey)
		const uuid = CommonTools.genarateUUID()

		const saveObj = {
			...saveData,
			username,
			email,
			uuid,
			password,
			randomKey,
			sid,
		}

		const user = await this.dbModel.create(saveObj)
		return user
	}

	async getUser({ by = "uuid", value, type = "public" }: { by: string; value: any; type?: string }): Promise<any> {
		if (["uuid", "name", "username", "email", "sid"].includes(by) === false) return null

		if (!value) return null

		let where = {
			[by]: value,
		}

		const queryOptions = {
			attributes: type === "public" ? { exclude: ["password", "randomKey", "sid", "regIP", "email"] } : { exclude: [] },
			where,
		}

		const user = await this.dbModel.findOne(queryOptions)
		user && this.updateTimes(user)
		return user
	}

	getUserByUUID(uuid: string, type = "all"): Promise<any> {
		return this.getUser({ by: "uuid", value: uuid, type })
	}

	getUserByUsername(username: string, type = "all"): Promise<any> {
		return this.getUser({ by: "username", value: username, type })
	}

	getUserByEmail(email: string, type = "all"): Promise<any> {
		return this.getUser({ by: "email", value: email, type })
	}

	getUserBySID(sid: string, type = "all"): Promise<any> {
		return this.getUser({ by: "sid", value: sid, type })
	}

	getUserByName(name: string, type = "all"): Promise<any> {
		return this.getUser({ by: "name", value: name, type })
	}

	async getUserByEmailAndPassword({ email, password }: { email: string; password: string }): Promise<any> {
		if (!email || !password) return null

		const queryOptions = {
			where: {
				email,
				password,
			},
		}

		const user = await this.dbModel.findOne(queryOptions)
		user && this.updateTimes(user)
		return user
	}

	async updateLastLoginDate(userinfoDBObj: any) {
		if (!userinfoDBObj) return false
		let updatestr = { lastlogin: new Date() }

		return userinfoDBObj.update(updatestr)
	}

	async resetSID(userinfoDBObj: any) {
		if (!userinfoDBObj) return false

		userinfoDBObj.randomKey = CommonTools.getRandomString(6)
		userinfoDBObj.sid = CommonTools.md5(userinfoDBObj.password + userinfoDBObj.randomKey)

		console.info(userinfoDBObj.username + `更新了SID`, userinfoDBObj.sid)
		await userinfoDBObj.save()
		return userinfoDBObj.sid
	}

	async resetPassword(userinfoDBObj: any, newPassword: string | number) {
		if (!userinfoDBObj) return false

		userinfoDBObj.randomKey = CommonTools.getRandomString(6)
		userinfoDBObj.password = CommonTools.md5(String(newPassword))
		userinfoDBObj.sid = CommonTools.md5(userinfoDBObj.password + userinfoDBObj.randomKey)

		console.info(userinfoDBObj.username + `更新了密码`)
		await userinfoDBObj.save()
		return userinfoDBObj
	}

	async resetName(userinfoDBObj: any, newName: string) {
		if (!userinfoDBObj) return false

		userinfoDBObj.name = newName

		console.info(userinfoDBObj.username + `更新了名字`)
		await userinfoDBObj.save()
		return userinfoDBObj
	}
}
