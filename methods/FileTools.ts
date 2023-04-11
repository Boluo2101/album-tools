/*
 * @Author: 张超越 
 * @Date: 2023-04-11 21:46:07 
 * @Last Modified by:   张超越 
 * @Last Modified time: 2023-04-11 21:46:07 
 */

// 依赖项
import * as fs from 'fs'
import * as crypto from 'crypto'
import * as path from 'path'
import PathTools from './PathTools'
import CONFIGS from '../configs/index'
import { fileTypeFromBuffer } from '../utils/FileTypeCore'
import { readChunkSync, readChunk } from '../utils/ReadChunk'

type FileType = {
  mime: string
  ext: string
}

// 一份文件类
/**
 * @description 文件工具类，继承PathTools类
 * @author 张超越
 * @export
 * @class FileTools
 * @extends {PathTools}
 */
export default class FileTools extends PathTools {
  fileType!: any
  md5!: string
  md5Some!: string
  extname!: string
  readStream!: fs.ReadStream
  writeStream!: fs.WriteStream
  children = []

  constructor(public pathPath: string) {
    super(pathPath)
    this.getExtname()
  }

  getExtname() {
    if (this.extname) return (this.extname)
    this.extname = path.extname(this.path).toLocaleLowerCase()
    return this.extname
  }

  getFileType(): Promise<FileType> {
    return new Promise(async (resolve,) => {
      if (this.fileType) return resolve(this.fileType)

      const nullObj = { mime: '', ext: '' }
      if (!this.isExist) return resolve(nullObj)
      if (!this.isFile) return resolve(nullObj)

      this.fileType = await fileTypeFromBuffer(readChunkSync(this.path, { length: 4100 }))
      // console.info('fileType', this.fileType)
      resolve(this.fileType)
    })
  }

  async getIsPicture() {
    const { ext, mime } = await this.getFileType()
    const imageIsAlloewd = CONFIGS.extensions.image.includes(ext)

    if (mime.split('/')[0] === 'image' && !imageIsAlloewd) {
      // 警告，是图片，但是不在允许的图片类型中
      // console.warn('警告，是图片，但是不在允许的图片类型中', ext, mime)
    }

    return imageIsAlloewd
  }

  async getIsVideo() {
    const { ext, mime } = await this.getFileType()
    const videoIsAlloewd = CONFIGS.extensions.video.includes(ext)
    if (mime.split('/')[0] === 'video' && !videoIsAlloewd) {
      // 警告，是视频，但是不在允许的视频类型中
      console.warn('警告，是视频，但是不在允许的视频类型中', ext, mime)
    }
    return videoIsAlloewd
  }

  // 计算文件的md5值
  getMD5(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.md5) return resolve(this.md5)

      if (!this.isExist) return reject('file is not exist')
      if (!this.isFile) return reject('not a file')

      const stream = await this.getReadStram()
      const hash: any = crypto.createHash('md5')

      stream.on('data', chunk => hash.update(chunk, 'utf8'))
      stream.on('end', () => {
        this.md5 = hash.digest('hex')
        return resolve(this.md5)
      })
    })
  }

  // 计算文件的md5值（头部256k）
  getMD5Some() {
    return new Promise(async (resolve, reject) => {
      if (this.md5Some) return resolve(this.md5Some)

      if (!this.isExist) return resolve(false)
      if (!this.isFile) return resolve(false)

      // 只读取前256kb
      const chunks = await readChunk(this.path, { length: 256 * 1024 })
      const hash: crypto.Hash = crypto.createHash('md5')

      hash.update(chunks, 'utf8')
      this.md5Some = hash.digest('hex')
      resolve(this.md5Some)
    })
  }

  delete() {
    return new Promise((resolve) => {
      if (!this.isExist) return resolve(true)
      if (!this.isFile) return resolve(true)

      resolve(true)
      setTimeout(() => {
        fs.unlink(this.path, (err) => {
          if (err) console.error(err)
          console.info('deleted', this.path)
          resolve(err ? false : true)
        })
      }, CONFIGS.deleteOrMoveWaitTime || 10000)
    })
  }

  copy(newPath: string) {
    return new Promise((resolve) => {
      if (!this.isExist) return resolve(false)
      if (!this.isFile) return resolve(false)

      fs.copyFile(this.path, newPath, (err) => {
        if (err) console.error('copy error', err)
        console.info('copied', this.path, newPath)
        resolve(err ? false : true)
      })
    })
  }

  // 重命名
  async renameByUUID() {
    const newPath = path.join(path.dirname(this.path), this.uuid + this.extname.toLocaleLowerCase())
    console.info('renameByUUID', this.path, newPath)
    fs.renameSync(this.path, newPath)
  }

  // 移动
  async rename(newPath: string) {
    console.info('move', this.path, newPath)

    return new Promise((resolve) => {
      if (!this.isExist || !this.isFile) return resolve(false)

      if (this.path === newPath) return resolve(true)

      // 先将文件拷贝过去，再删除原文件（10秒钟后再删除，因为可能有未完成的流任务）
      fs.copyFile(this.path, newPath, (err) => {
        if (err) console.error(err)
        console.info('copied', this.path, newPath)
        resolve(err ? false : true)
      })

      setTimeout(() => {
        fs.rename(this.path, newPath, (err) => {
          if (err) console.error(err)
          console.info('moved', this.path, newPath)
        })
      }, CONFIGS.deleteOrMoveWaitTime || 10000)
    })
  }

  async getReadStram(path?: string) {
    this.readStream = this.readStream || fs.createReadStream(path || this.path)
    return this.readStream
  }

  // 可写流
  getWriteStream() {
    // 如果文件存在，则警告
    if (this.isExist && this.stat.size > 0) console.warn('file is exist, but create a write stream', this.path)

    this.writeStream = this.writeStream || fs.createWriteStream(this.path)
    return this.writeStream
  }
}