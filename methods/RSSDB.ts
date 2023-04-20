import DbBase from "./DbBase"
import { RSS } from "../db/exports"
import CommonTools from "./CommonTools"
import { htmlDecode, htmlEncode } from "js-htmlencode"
import dayjs from "dayjs"
import cheerio from "cheerio"
import fetch from "./fetch"
import { XMLParser } from "fast-xml-parser"

import Urls from "./UrlsDB"
import { isObjectLike } from "lodash"
const urlsDB = new Urls()

export default class RSSDB extends DbBase {
	parser: any
	constructor() {
		super(RSS)
		this.parser = new XMLParser()
	}

	async create({ url, createByUUID }: { url: string; createByUUID?: string }): Promise<any> {
		const urlObj: URL = new URL(url)
		url = CommonTools.formatUrl(urlObj.href)

		// 如果url不合法
		if (CommonTools.isUrl(url) === false) return Promise.reject("url is invalid")

		const isExist = await this.getItem({ url })
		if (isExist) return isExist

		const urlResponse = await this.getUrlResponse(url)
		const urlResponseXMLParsed = this.parser.parse(urlResponse.data)

		// 判断是否是RSS2.0
		let channel
		if (!urlResponseXMLParsed.rss) {
			channel = urlResponseXMLParsed.feed
		} else {
			channel = urlResponseXMLParsed.rss.channel
		}

		let { title: name, description = "", image, link, id, summary, author } = channel
		author = isObjectLike(author) ? author?.name : author
		const host = urlObj.host || link || id
		const imageValue = typeof image === "object" ? image?.link : image
		name = htmlDecode(name)
		const item = {
			uuid: CommonTools.md5(url),
			createByUUID,
			name,
			description: description || summary,
			url,
			domain: host,
			image: imageValue,
			author,
		}

		console.info("item", item)
		const rssObj = await this.dbModel.create(item)
		return rssObj
	}

	async isExistRSSByUrl(url: string): Promise<boolean> {
		const res = await this.getItem({ url })
		return res !== null
	}

	getUrlResponse(url: string) {
		return fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36 Edg/92.0.902.55",
			},
		})
	}

	async refresh(uuid: string) {
		const RSS = await this.getItem({ uuid })
		if (!RSS) return Promise.reject("RSS UUIS is inexistence")

		const { url } = RSS
		const urlResponse = await this.getUrlResponse(url)
		const urlResponseXMLParsed = this.parser.parse(urlResponse.data)

		// 判断是否是RSS2.0
		let items
		if (!urlResponseXMLParsed.rss) {
			items = urlResponseXMLParsed.feed.entry
		} else {
			items = urlResponseXMLParsed.rss.channel.item
		}

		Promise.resolve(items.length)

		items.forEach((item: object) => this.createUrl(item, uuid))
	}

	async createUrl(urlItem: any, rssUUID: string) {
		console.info("createUrl", urlItem.title, rssUUID)

		const url = CommonTools.formatUrl(urlItem.link || urlItem.id)
		const urlObj = await urlsDB.getItem({ url })
		if (urlObj) return urlObj

		let {
			title = "",
			summary: description = "",
			description: content = "",
			author = "未知",
			thumbnail: image,
			viewCount: times = 1,
			pubDate,
			published,
		} = urlItem

		description = htmlDecode(String(description || title || ""))
		let images = CommonTools.getImagesFromDOMs(content || description)
		image = image || (images && images.length && images[0]) || ''

		let rawDate = dayjs(pubDate || published)

		const item = {
			uuid: CommonTools.md5(url),
			parentUUID: rssUUID,
			title,
			description,
			content: content || description,
			importType: 1,
			author,
			url,
			image,
      rawDate,
      times
		}

		urlsDB
			.create(item)
			.then((resData: any) => {
				Promise.resolve(resData)
				this.updateUrlsHTMLTexts(resData.uuid, resData)
			})
			.catch((err: any) => {
				Promise.reject(err)
			})
	}

	async updateUrlsHTMLTexts(uuid: string, urlObj: any) {
		if (!urlObj) return
		const texts = await this.getUrlsHTMLTexts(uuid, "html")
		if (!texts) return false

		urlObj.content = texts
		urlObj.contentFrom = "html"
		urlObj.save()
	}

	getUrlsHTMLTexts(uuid: string, type = "text") {
		return new Promise(async (resolve, reject) => {
			if (!uuid) return resolve("")
			const urlObj = await urlsDB.getItem({ uuid })
			if (!urlObj) return resolve("")

			const feedObj = await this.getItem({ uuid: urlObj.parentUUID })
			if (!feedObj) return resolve("")
			const { domPath } = feedObj

			if (!domPath) return resolve("")

			const { contentFrom = "rss", url, content } = urlObj
			if (contentFrom === "html") return resolve(content)

			const urlResponse = await this.getUrlResponse(url)

			console.info("getUrlsHTMLTexts", url)
			const DOMs = urlResponse.data
			const $ = cheerio.load(DOMs)
			return resolve(type === "text" ? $(domPath).text() : $(domPath).html())
		})
	}
}
