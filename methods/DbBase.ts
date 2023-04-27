/*
 * @Author: 张超越
 * @Date: 2023-04-11 21:46:19
 * @Last Modified by: 张超越
 * @Last Modified time: 2023-04-20 13:54:36
 */

import { Sequelize, Op } from "sequelize"

/**
 * @description 数据库基础类
 * @author 张超越
 * @export
 * @class DbBase
 */
export default class DbBase {
	dbModel: any
	constructor(db: any) {
		this.dbModel = db
	}

	/**
	 * @description 获取总数
	 * @author 张超越
	 * @param {*} [where={}]
	 * @return {*}  {Promise<number>}
	 * @memberof DbBase
	 */
	countTotal(where: any = {}): Promise<number> {
		return new Promise((resolve) => {
			this.dbModel
				.count(where)
				.then((num: any) => {
					resolve(num || 0)
				})
				.catch(() => {
					resolve(0)
				})
		})
	}

	/**
	 * @description 创建
	 * @author 张超越
	 * @param {*} saveData
	 * @return {*}  {Promise<any>}
	 * @memberof DbBase
	 */
	create(saveData: any): Promise<any> {
		return new Promise(async (resolve, reject) => {
			// create
			this.dbModel
				.create(saveData)
				.then((resData: any) => {
					resolve(resData)
				})
				.catch((err: any) => {
					reject(err)
				})
		})
	}

	/**
	 * @description 创建多个数据
	 * @author 张超越
	 * @param {any[]} saveDataArray
	 * @return {*}  {Promise<any>}
	 * @memberof DbBase
	 */
	createMany(saveDataArray: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			// create
			this.dbModel
				.bulkCreate(saveDataArray)
				.then((resData: any) => {
					resolve(resData)
				})
				.catch((err: any) => {
					reject(err)
				})
		})
	}

	/**
	 * @description 获取单个数据，如果有多个，只返回第一个
	 * @author 张超越
	 * @param {*} [where={}]
	 * @return {*}
	 * @memberof DbBase
	 */
	getItem(where: any = {}): any {
		return this.dbModel.findOne({ where })
	}

	/**
	 * @description 获取多个数据
	 * @author 张超越
	 * @param {*} [where={}]
	 * @param {*} [options={}]
	 * @return {*}
	 * @memberof DbBase
	 */
	getItems(where: any = {}, options: any = {}): any {
		console.info("getItems where", where)
		return this.dbModel.findAll({ where, ...options })
	}

	/**
	 * @description 更新数据
	 * @author 张超越
	 * @param {*} item
	 * @param {*} [options={}]
	 * @return {*}
	 * @memberof DbBase
	 */
	updateSet(item: any, options: any = {}): any {
		// console.info('item', item, options)
		item.set(options)
		return item.save()
	}

	updateTimes(item: any, num: number = 1) {
		console.info("updateTimes", item.times, num)
		let updatestr = {
			times: item.times + num,
		}

		item
			.update(updatestr)
			.then((res: any) => {
				console.info("updateTimes", updatestr)
			})
			.catch((err: any) => {
				console.error(err, updatestr)
			})
	}

	/**
	 * @description 根据key删除数据
	 * @author 张超越
	 * @param {string} key
	 * @param {*} value
	 * @return {*}
	 * @memberof DbBase
	 */
	deleteByKey(key: string, value: any): any {
		return this.dbModel.destroy({ where: { [key]: value } })
	}

	/**
	 * @description 根据key删除多个数据
	 * @author 张超越
	 * @param {string} key
	 * @param {any[]} values
	 * @return {*}
	 * @memberof DbBase
	 */
	deleteManyByKey(key: string, values: any[]): any {
		return this.dbModel.destroy({ where: { [key]: { [Op.in]: values } } })
	}

	/**
	 * @description 根据uuid删除数据
	 * @author 张超越
	 * @param {string} uuid
	 * @return {*}
	 * @memberof DbBase
	 */
	deleteByUUID(uuid: string): any {
		return this.deleteByKey("uuid", uuid)
	}

	/**
	 * @description 根据path删除数据
	 * @author 张超越
	 * @param {string} path
	 * @return {*}
	 * @memberof DbBase
	 */
	deleteByPath(path: string): any {
		return this.deleteByKey("path", path)
	}
}
