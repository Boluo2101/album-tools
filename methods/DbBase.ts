import { Sequelize, Op } from "sequelize"

export default class DbBase {
    dbModel: any
    constructor(db: any) {
        this.dbModel = db
    }

    countTotal(where = {}): Promise<number> {
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


    getItem(where = {}) {
        return this.dbModel.findOne({ where })
    }

    getItems(where = {}, options = {}) {
        console.info('getItems where', where)
        return this.dbModel.findAll({ where, ...options })
    }

    updateSet(item: any, options = {}) {
        // console.info('item', item, options)
        item.set(options)
        return item.save()
    }

    deleteByKey(key: string, value: any) {
        return this.dbModel.destroy({ where: { [key]: value } })
    }

    deleteManyByKey(key: string, values: any[]) {
        return this.dbModel.destroy({ where: { [key]: { [Op.in]: values } } })
    }

    deleteByUUID(uuid: string) {
        return this.deleteByKey('uuid', uuid)
    }

    deleteByPath(path: string) {
        return this.deleteByKey('path', path)
    }
}