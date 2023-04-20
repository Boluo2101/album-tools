import DbBase from "./DbBase"
import { Categories } from "../db/exports"
import CommonTools from "./CommonTools"

export default class CategoriesDB extends DbBase {
  constructor() {
    super(Categories)
  }

  async create(saveData: any): Promise<any> {
    const { name, createByUUID } = saveData

    let isCategoryExist = await this.getItem({ name, createByUUID })
    if (isCategoryExist) {
      console.info("重复分类")
      return isCategoryExist
    }

    saveData = {
      ...saveData,
      uuid: CommonTools.genarateUUID(),
      isDeleted: false,
    }

    return await this.dbModel.create(saveData)
  }
  
}