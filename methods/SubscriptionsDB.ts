import DbBase from "./DbBase"
import { Subscriptions } from "../db/exports"
import CommonTools from "./CommonTools"
import RSSDB from "./RSSDB"
import CategoriesDB from "./CategoriesDB"
const rssDB = new RSSDB()
const categoriesDB = new CategoriesDB()

interface Subscription {
	uuid?: string
	name?: string
	createByUUID: string
	categoryUUID: string
	rssUUID: string
	rssCounts?: number
	urlCounts?: number
	times?: number
	unreadCounts?: number
	tags?: string
	private?: boolean
	isDeleted?: boolean
}

export default class SubscriptionsDB extends DbBase {
	constructor() {
		super(Subscriptions)
	}

	async create(saveData: Subscription): Promise<any> {
		const { rssUUID, createByUUID, categoryUUID } = saveData

		const rss = await rssDB.getItem({ keyName: "uuid", keyValue: rssUUID })
		if (!rss) return false

		let isSubscribingExist = await this.getItem({ rssUUID, categoryUUID, createByUUID })
		if (isSubscribingExist) {
			console.info("重复订阅")
			return isSubscribingExist
    }
    
    saveData = {
      ...saveData,
      uuid: CommonTools.genarateUUID(),
      times: 1,
      private: false,
      isDeleted: false,
    }

    return await this.dbModel.create(saveData)
	}
}
