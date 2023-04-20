/*
 * @Author: 张超越
 * @Date: 2023-04-11 21:31:17
 * @Last Modified by: 张超越
 * @Last Modified time: 2023-04-20 18:00:17
 */

// 公共工具类
import { PHashArrayItemReturn, PHashArrayItem } from "../types/PHashArray"
import crypto from "crypto"
import { randomUUID, UUID } from "crypto"
import { htmlDecode, htmlEncode } from "js-htmlencode"
import cheerio from "cheerio"
export default class CommonTools {
	log: Boolean = true
	static log: Boolean = true

	constructor() {}

	// 获取随机数
	/**
	 * @description get random number between min and max, default is 0 and 10000
	 * @author 张超越
	 * @static
	 * @param {number} min
	 * @param {number} max
	 * @return {*}  {number}
	 * @memberof CommonTools
	 */
	static getRandomNumber(min: number = 0, max: number = 10000): number {
		return Math.floor(Math.random() * (max - min + 1)) + min
	}

	// 获取随机字符串
	/**
	 * @description get random string by length, default is 6, max is 32, min is 1, and the string is a-z A-Z 0-9, like 'abc123' or 'ABC123' etc.
	 * @author 张超越
	 * @static
	 * @param {number} length
	 * @return {*}  {string}
	 * @memberof CommonTools
	 */
	static getRandomString(length: number = 6): string {
		const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		let result = ""
		for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
		return result
	}

	// 获取随机颜色
	/**
	 * @description get random color string like #ffffff or #000000 or #123456 etc.
	 * @author 张超越
	 * @static
	 * @return {*}  {string}
	 * @memberof CommonTools
	 */
	static getRandomColor(): string {
		return `#${CommonTools.getRandomString(6)}`
	}

	// 获取随机颜色数组
	/**
	 * @description get randmon color array by length
	 * @author 张超越
	 * @static
	 * @param {number} length
	 * @return {*}  {string[]}
	 * @memberof CommonTools
	 */
	static getRandomColors(length: number): string[] {
		let colors: string[] = []
		for (let i = 0; i < length; i++) {
			colors.push(CommonTools.getRandomColor())
		}
		return colors
	}

	// 统一组装response
	/**
	 * @description
	 * @author 张超越
	 * @static
	 * @param {string} [message='success']
	 * @param {number} [code=200]
	 * @param {*} res
	 * @param {*} data
	 * @memberof CommonTools
	 */
	static formatResponse(message: string = "success", code: number = 200, res: any, data: any) {
		res.json({
			code,
			message,
			data,
		})
	}

	/**
	 * @description pHash对比，可传入百分比
	 * @author 张超越
	 * @static
	 * @param {string} pHash1
	 * @param {string} pHash2
	 * @param {number} [fPercent=1] 百分比，若传入，则大于百分比后直接返回，其结果不一定是完全正确的
	 * @return {*}  {number}
	 * @memberof CommonTools
	 */
	static comparePHash(pHash1: string, pHash2: string, fPercent: number = 1): number {
		let n = 0
		const len = pHash1.length
		if (len !== pHash2.length) return 1
		for (let i = 0; i < len; i++) {
			// 如果百分比已经大于fPercent，则直接返回
			const nowPercent = n / len
			if (nowPercent > fPercent) return nowPercent

			// 如果两个字符不相等，则n计数+1
			if (pHash1[i] !== pHash2[i]) {
				n++
			}
		}
		return n / len
	}

	// 对比图片数组
	/**
	 * @description 对比图片数组，返回相似的图片的index，返回的是Map，key为index，value为Set，Set中存放的是相似的index，若传入百分比，则大于百分比后直接返回，其结果不一定是完全正确的
	 * @author 张超越
	 * @static
	 * @param {PHashArrayItem[]} pHashArray
	 * @param {number} [fPercent=0.15]
	 * @return {*}  {Map<number, Set<number>>}
	 * @memberof CommonTools
	 */
	static comparePHashArray(pHashArray: PHashArrayItem[], fPercent: number = 0.15): Map<number, Set<number>> {
		const map = new Map()
		const setted = new Map()

		let times = 0

		this.log && console.time("comparePHashArray")
		for (let i = 0; i < pHashArray.length; i++) {
			for (let j = i + 1; j < pHashArray.length; j++) {
				const res = CommonTools.comparePHash(pHashArray[i].pHash, pHashArray[j].pHash, fPercent)

				if (res > fPercent) continue

				const iItem = pHashArray[i]
				const jItem = pHashArray[j]
				const isSetted = setted.has(jItem.index)
				if (!map.has(iItem.index) && !isSetted) {
					map.set(iItem.index, new Set())
				}

				const key = isSetted ? setted.get(jItem.index) : iItem.index
				map.get(key).add(jItem.index)
				setted.set(jItem.index, key)
			}
			times++
		}

		this.log && console.timeEnd("comparePHashArray")
		this.log && console.log("times", times)

		return map
	}

	/**
	 * @description 将map转换为数组，返回的数组中的每一项都是一个对象，对象中包含index，indexs，title，description，index为当前组的index，indexs为当前组中的所有index，title为当前组的标题，description为当前组的描述，若传入百分比，则大于百分比后直接返回，其结果不一定是完全正确的
	 * @author 张超越
	 * @static
	 * @param {Map<any, any>} map
	 * @return {*}  {PHashArrayItemReturn[]}
	 * @memberof CommonTools
	 */
	static mapToArray(map: Map<any, any>): PHashArrayItemReturn[] {
		const result = []

		let groupIndex = 0
		for (let arr of map) {
			let [index, value]: [number, Set<number>] = arr
			groupIndex++
			result.push({
				index,
				indexs: Array.from(value),
				title: `第${groupIndex + 1}组`,
				description: `第${groupIndex + 1}组，共${value.size + 1}张图片`,
			})
		}

		return result
	}

	static isEmail(email: string): boolean {
		return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/i.test(email)
	}

	static md5(str: string): string {
		const md5 = crypto.createHash("md5")
		const returnValue = md5.update(str).digest("hex")
		return returnValue
	}

	static genarateUUID(): UUID {
		const uuid = randomUUID()
		return uuid
	}

	static usernameAllowed(username: string): boolean {
		// 未传入用户名，则视为不允许
		if (!username) return false

		// 用户名长度不合法，则视为不允许
		if (username.length < 3 || username.length > 32) return false

		// 用户名不合法，则视为不允许，只允许字母、数字、下划线，大于等于3个字符，小于等于32个字符
		const test = /^[a-zA-Z0-9_]{3,32}$/.test(username)
		return test
	}

	static isUrl(url: string): boolean {
		// 未传入url，则视为不允许
		if (!url) return false

		const reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/
		return reg.test(url)
	}

	static deleteEndSymbol(url: string): string {
		if (["/", "?", "&"].includes(url.charAt(url.length - 1)) === false) return url
		url = url.slice(0, url.length - 1)
		return this.deleteEndSymbol(url)
	}

	static formatUrl(url: string): string {
		return decodeURI(this.deleteEndSymbol(url))
	}

	static getImagesFromDOMs(DOMs: string) {
		DOMs = htmlDecode(DOMs)
		const $ = cheerio.load(DOMs)
		let images = []
		for (let item of $("img")) {
			images.push(item.attribs.src)
		}
		return images
	}
}
