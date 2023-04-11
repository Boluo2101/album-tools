/*
 * @Author: 张超越 
 * @Date: 2023-04-11 21:45:51 
 * @Last Modified by:   张超越 
 * @Last Modified time: 2023-04-11 21:45:51 
 */

// 依赖项
import * as fs from 'fs'
import * as path from 'path'
import { randomUUID, UUID } from 'crypto'
import CommonTools from './CommonTools'

// 一份文件类
/**
 * @description 路径工具类，继承CommonTools类，增加了isExist、path、pathEncode、stat、isFile、isDirectory、name、uuid属性
 * @author 张超越
 * @export
 * @class PathTools
 * @extends {CommonTools}
 */
export default class PathTools extends CommonTools {
  isExist: boolean = false
  path: string
  pathEncode!: string
  stat: any
  isFile: boolean = false
  isDirectory: boolean = false
  name!: string
  uuid!: UUID

  constructor(pathPath: string, options?: { log?: boolean }) {
    super()
    this.log = options?.log ?? true
    this.path = pathPath
    this.pathEncode = encodeURIComponent(this.path)
    this.name = path.basename(this.path)
    this.uuid = randomUUID()

    if (!this.path) {
      console.error('pathPath is not defined')
      return
    }

    this.isExist = this.checkPathExistSync()
    if (!this.isExist) {
      console.error('path is not exist', this.path)
      return
    }

    this.stat = this.getStat()
    if (!this.stat) {
      console.error('stat is not exist')
      return
    }

    this.isFile = this.stat.isFile()
    this.isDirectory = this.stat.isDirectory()
  }

  // 检查路径是否存在（同步）
  checkPathExistSync(): boolean {
    return fs.existsSync(this.path)
  }

  // 检查路径的stat
  getStat(): any {
    return fs.statSync(this.path)
  }
}