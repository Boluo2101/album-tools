/*
 * @Author: 张超越 
 * @Date: 2023-04-11 21:45:56 
 * @Last Modified by:   张超越 
 * @Last Modified time: 2023-04-11 21:45:56 
 */

// 导入文件工具类
import FileTools from './FileTools'
import PathTools from './PathTools'
import CONFIGS from '../configs/index'
import jimpJPEG from 'jpeg-js'
import * as fs from 'fs'
// import EXIF from 'exif'
import exifr from 'exifr'
import exifReader from 'exif-reader'
import * as ICC from 'icc'
import ImageDB from './ImageDB'
import getColors from 'get-image-colors'
import { readChunkSync, readChunk } from '../utils/ReadChunk'

import PATH from 'path'
import DirectoryTools from './DirectoryTools'
import { promisify } from 'util'

// Sharp
import sharp from 'sharp'
// @ts-ignore
import phash from "sharp-phash"
// @ts-ignore
import dist from "sharp-phash/distance"

// Webp
// @ts-ignore
import webp from 'webp-converter'

// iOS HEIC
// @ts-ignore
// import HEIC from 'heic'
import HeicDecode from 'heic-decode'
import HeicCovert from 'heic-convert'

// RAWs
// @ts-ignore
import extractd from 'extractd'
import e from 'express'

// 图片类
/**
 * @description 图片工具类，继承FileTools类
 * @author 张超越
 * @export
 * @class ImageTools
 * @extends {FileTools}
 */
export default class ImageTools extends FileTools {
  buffer!: Buffer
  details: any
  inited: Boolean
  sharped: any

  constructor(public path: string, options?: { log?: Boolean }) {
    super(path)
    this.log = options?.log ?? true
    this.details = null
    this.sharped = null
    this.inited = false
  }

  static imageDb = new ImageDB()
  // static heicConvert = new HEIC()
  static HeicDecode = HeicDecode
  static HeicCovert = HeicCovert

  static {
    this.log && console.info('ImageTools static!!!')
    // console.log('sharp formats', sharp.format)
    ImageTools.initSharp()
  }

  static initSharp() {
    const stats = sharp.cache()
    sharp.cache({ memory: 1024, items: 500, files: 100 })
    this.log && console.log('sharp cache', stats)
  }

  // 初始化
  async init() {
    this.log && console.info('ImageTools init', this.path)
    if (!this.isExist) return this
    if (await this.getIsHeic() && this.isExist) await this.initHevc()
    if (await this.getIsRAW() && this.isExist) await this.initRAW()
    if (await this.getIsWebp() && this.isExist) await this.initWebp()
    this.details = await this.getDetails()
    this.inited = true
    return this
  }

  async initHevc() {
    return new Promise(async (resolve) => {
      if (!await this.getIsHeic()) return resolve(false)
      const heicsJpegCachePath = await this.getPath()
      const heicsJpegCachePathObj = new PathTools(heicsJpegCachePath)
      if (heicsJpegCachePathObj.isExist && heicsJpegCachePathObj.stat.size > 0) return resolve(true)

      const inputBuffer = await promisify(fs.readFile)(this.path);
      const outputBuffer = await ImageTools.HeicCovert({
        buffer: inputBuffer,  // the HEIC file buffer
        format: 'JPEG',    // output format
        quality: 0.3     // the jpeg compression quality, between 0 and 1
      })

      // @ts-ignore
      await promisify(fs.writeFile)(heicsJpegCachePath, outputBuffer)
      resolve(true)
    })
  }

  async initRAW() {
    return new Promise(async (resolve) => {
      // 不是raw文件，直接返回
      if (!await this.getIsRAW()) return resolve(false)

      // 如果缓存文件存在，直接返回
      const rawsJpegCachePath = await this.getPath()
      const rawsJpegCachePathObj = new PathTools(rawsJpegCachePath)
      if (rawsJpegCachePathObj.isExist && rawsJpegCachePathObj.stat.size > 0) return resolve(true)

      // 判断路径中是否包含中文
      let sourcePath = this.path.split(PATH.sep).join('/')
      const isChinese = /[\u4e00-\u9fa5]/.test(sourcePath)
      let willDelete: any = null
      if (isChinese) {
        this.log && console.log('Raw file path with chinese', isChinese, sourcePath)
        sourcePath = CONFIGS.rawCacheingPath + '/' + Math.random() + encodeURIComponent(this.name).toLocaleLowerCase()
        await this.copy(sourcePath)
        willDelete = new FileTools(sourcePath)
      }

      const { error, preview } = await extractd.generate(sourcePath, { destination: CONFIGS.rawCachePath }).finally(() => willDelete?.isExist && willDelete.delete())
      if (error || !preview) return resolve(false)
      this.log && console.log('init raw res', preview)

      // 移动文件为缓存文件
      const rawsJpegCacheObj = new FileTools(preview)
      resolve(await rawsJpegCacheObj.rename(rawsJpegCachePath))
    })
  }

  async initWebp() {
    return new Promise(async (resolve) => {
      if (!await this.getIsWebp()) return resolve(false)
      const webpsJpegCachePath = await this.getPath()
      const webpsJpegCachePathObj = new PathTools(webpsJpegCachePath)
      if (webpsJpegCachePathObj.isExist && webpsJpegCachePathObj.stat.size > 0) return resolve(true)

      this.getSharped(this.path)
        .jpeg({ quality: 75 }).toFile(webpsJpegCachePath, (err: any, info: any) => {
          if (err) {
            console.error(err)
            return resolve(false)
          }

          this.log && console.log('init webp use sharp', info)
          resolve(true)
        })
    })
  }

  async initWebpUseGoogleWebp() {
    // 性能很好，但是废弃，使用sharp
    return new Promise(async (resolve) => {
      if (!await this.getIsWebp()) return resolve(false)
      const webpsJpegCachePath = await this.getPath()
      const webpsJpegCachePathObj = new PathTools(webpsJpegCachePath)
      if (webpsJpegCachePathObj.isExist && webpsJpegCachePathObj.stat.size > 0) return resolve(true)


      webp.dwebp(this.path, webpsJpegCachePath, "-o")
        .then((res: any) => {
          this.log && console.log('init webp', res)
          resolve(true)
        })
        .catch((err: any) => {
          console.error(err)
          resolve(false)
        })
    })

  }

  async getIsHeic() {
    const { ext } = await this.getFileType()
    return ext === 'heic'
  }

  async getIsRAW() {
    const { ext } = await this.getFileType()
    return CONFIGS.raw.includes(ext)
  }

  async getIsWebp() {
    const { ext } = await this.getFileType()
    return ext === 'webp'
  }

  async getIsGif() {
    const { ext } = await this.getFileType()
    return ext === 'gif'
  }

  async getPath() {
    if (await this.getIsHeic()) {
      const heicsJpegCachePath = PATH.join(CONFIGS.hevcCachePath, encodeURIComponent(this.name) + '.jpg')
      return heicsJpegCachePath
    } else if (await this.getIsRAW()) {
      const rawsJpegCachePath = PATH.join(CONFIGS.rawCachePath, encodeURIComponent(this.path) + '.jpg')
      return rawsJpegCachePath
    } else if (await this.getIsWebp()) {
      const webpsJpegCachePath = PATH.join(CONFIGS.webpCachePath, encodeURIComponent(this.path) + '.jpg')
      return webpsJpegCachePath
    } else {
      return this.path
    }
  }

  getSharped(path: string = this.path) {
    this.sharped = this.sharped || sharp(path)
    return this.sharped
  }

  async getDetails() {
    const { path } = this
    return this.details || await ImageTools.imageDb.getItem({ path }) || await this.createDetails()
  }

  async getDetailsAll() {
    if (!this.inited) await this.init()
    if (!this.details) await this.getDetails()
    if (!this.details.fileType) this.details.fileType = await this.getFileType()
    if (!this.details.exif) this.details.exif = await this.getExif()
    if (!this.details.cachePath) this.details.cachePath = await this.getCacheFile()
    if (!this.details.pHash) this.details.pHash = await this.getPHash()
    if (!this.details.colors) this.details.colors = await this.getColors()
    return this.details
  }

  async createDetails() {
    const { name, path, stat: { size } } = this
    const fileType = await this.getFileType()
    const data = { name, path, size, fileType }
    return ImageTools.imageDb.create(data)
  }

  async getICC() {
    return new Promise(async (resolve) => {
      if (!await this.getIsPicture()) return resolve({})
      if (!this.inited) await this.init()
      if (this.details.icc) return resolve(this.details.icc)

      await ImageTools.imageDb.updateSet(this.details, { icc: {} })

      let { icc }: any = (await this.getMetadata()).metadata
      icc = Buffer.isBuffer(icc) ? ICC.parse(icc) : {}

      resolve(icc)
      ImageTools.imageDb.updateSet(this.details, { icc, })
    })
  }

  async getExif() {
    return new Promise(async (resolve) => {
      if (!await this.getIsPicture()) return resolve({})
      if (!this.inited) await this.init()
      if (this.details.exif) return resolve(this.details.exif)

      if (!['jpeg', 'jpg'].includes((await this.getFileType()).ext)) {
        ImageTools.imageDb.updateSet(this.details, { exif: {} })
        return resolve({})
      }

      // 用Sharp解析Exif
      let { exif } = (await this.getMetadata())?.metadata || {}
      exif = Buffer.isBuffer(exif) ? exifReader(exif) : {}

      resolve(exif)
      let { DateTimeOriginal: dateTimeOriginal = '' } = exif
      dateTimeOriginal = dateTimeOriginal ? new Date(dateTimeOriginal).getTime() : ''

      const fileType = await this.getFileType()
      ImageTools.imageDb.updateSet(this.details, { exif, dateTimeOriginal, fileType })
      this.getICC()
    })
  }

  async getExifUseExifr() {
    // 性能很好，但是用sharp的Exif解析可能做到实例复用
    return new Promise(async (resolve) => {
      console.time('exifr.parse')
      const exif = await exifr.parse(await this.getPath()) || {}
      console.timeEnd('exifr.parse')
      resolve(exif)
    })
  }

  formatExifDate(dateTimeOriginal: string) {
    if (!dateTimeOriginal) return ''
    const dateTimeOriginalArr = dateTimeOriginal.split(' ')
    dateTimeOriginalArr[0] = dateTimeOriginalArr[0].replaceAll(':', '-')
    return dateTimeOriginalArr.join(' ')
  }

  getMetadata(): Promise<any> {
    return new Promise(async (resolve) => {
      if (!await this.getIsPicture()) return resolve({})
      if (!this.inited) await this.init()
      const path = this.path

      const metadata = (await this.getSharped(await this.getPath())).metadata().catch((err: any) => {
        console.error('getMetadata error', err)
        return null
      })

      if (!metadata) return resolve({ metadata: {}, path })
      // console.info('pictures metadata', metadata)
      resolve({ metadata, path })

      // 保存图片的基本信息
      const { hasAlpha, depth, channels, space, height, width } = metadata
      const updateObj: any = { hasAlpha, depth, channels, space, height, width }
      metadata && ImageTools.imageDb.updateSet(this.details, updateObj)
    })
  }

  getPHash() {
    return new Promise(async (resolve) => {
      if (!await this.getIsPicture()) return resolve({})
      if (!this.inited) await this.init()
      const path = this.path
      if (this.details.pHash) return resolve({ path, pHash: this.details.pHash })

      // 如果有缓存的jpg文件，使用缓存的jpg文件计算pHash
      const cacheJpgPath = this.details.cachePath + '.jpg'
      const cacheJpgFile = new FileTools(cacheJpgPath)
      const pHashRes = await phash(cacheJpgFile.isExist ? cacheJpgPath : await this.getPath()).catch(() => null)
      if (!pHashRes) return resolve({ pHash: '', path })
      const pHash = pHashRes
      resolve({ pHash, path })
      pHash && ImageTools.imageDb.updateSet(this.details, { pHash })
    })
  }

  getCacheFile() {
    return new Promise(async (resolve) => {
      if (!this.inited) await this.init()
      if (!await this.getIsPicture() || !this.isFile || !this.stat.size) {
        // console.info('不是图片，直接返回空')
        return resolve('')
      }

      const cacheFilePath = CONFIGS.cachePath + '/pictures/' + encodeURIComponent(await this.getPath()) + '.webp'
      let cacheFile = new FileTools(cacheFilePath)

      if (cacheFile.isExist && cacheFile.isFile && cacheFile.stat.size > 0) {
        // console.info('存在缓存文件，直接返回缓存文件')
        resolve(await cacheFile.getReadStram())
      }

      // 检查数据库中的缓存文件路径是否正确 
      if (this.details.cachePath !== cacheFilePath) {
        // console.info('数据库中的缓存文件路径不正确，更新数据库中的缓存文件路径')
        ImageTools.imageDb.updateSet(this.details, { cachePath: cacheFilePath })
      }

      // // 不存在缓存文件，生成缓存文件
      if (!cacheFile.isExist) {
        // 生成缓存文件
        // console.info('不存在缓存文件，生成缓存文件')
        const resPath = await this.createCacheFile(cacheFilePath, cacheFile)
        // console.info('生成缓存文件', resPath)

        // 生成缓存成功就返回缓存文件，否则返回原文件
        resolve(resPath ? await cacheFile.getReadStram() : await this.getReadStram())

        // 更新数据库中的缓存文件路径
        ImageTools.imageDb.updateSet(this.details, { cachePath: resPath })
      }
    })
  }

  createCacheFile(cacheFilePath: string, cacheFile: FileTools): Promise<string> {
    return new Promise(async (resolve) => {
      this.getSharped(await this.getPath())
        .webp({ quality: 40, effort: 1 })
        .resize({ height: 600 })
        .toFile(cacheFilePath, async (err: any, info: any) => {
          err && console.error('createCacheFile use sharp error ', err,)
          if (!err) {
            resolve(cacheFilePath)
          } else {
            // 错误降级处理，直接复制文件
            const copyRawFile = new FileTools(await this.getPath())
            await copyRawFile.copy(cacheFilePath)
            await copyRawFile.copy(cacheFilePath + '.jpg')
            return resolve(cacheFilePath)
          }
        })
        .jpeg()
        .toFile(cacheFilePath + '.jpg', async (err: any, info: any) => {
          err && console.error('createCacheFile .jpg use sharp error', err,)
          if (err) {
            // 错误降级处理，直接复制文件
            const copyRawFile = new FileTools(await this.getPath())
            await copyRawFile.copy(cacheFilePath + '.jpg')
            return resolve(cacheFilePath)
          }
        })
    })
  }

  createCacheFileUseGoogleWebpC(cacheFilePath: string, cacheFile: FileTools): Promise<string> {
    // 性能很好，但是现在用sharp代替
    return new Promise(async (resolve) => {
      // 用cwebp库处理
      // https://getiot.tech/zh/linux-command/cwebp

      // 如果是gif，则特殊处理
      if (await this.getIsGif()) {
        console.info('createCacheFile use cwebp is gif')
        webp.gwebp(await this.getPath(), cacheFilePath, "-q 50")
          .then((response: any) => {
            this.log && console.log(response)
            resolve(cacheFilePath)
          })
          .catch((error: any) => {
            console.error(error)
            resolve('')
          })

        return
      }

      // 其他图片
      webp.cwebp(await this.getPath(), cacheFilePath, "-m 0 -resize 600 0")
        .finally(async () => {
          // 判断输出文件是否存在，如果不存在，说明转换失败，直接返回原文件
          const outFile = new FileTools(cacheFilePath)
          if (!outFile.isExist || !outFile.isFile || !outFile.stat.size) {
            console.error('createCacheFile use cwebp error')
            const copyRawFile = new FileTools(await this.getPath())
            await copyRawFile.copy(cacheFilePath)
            await copyRawFile.copy(cacheFilePath + '.jpg')

            return resolve(cacheFilePath)
          }

          webp.dwebp(cacheFilePath, cacheFilePath + '.jpg', "-o")
            .finally(async () => {
              const outFileJpeg = new FileTools(cacheFilePath + '.jpg')
              if (!outFileJpeg.isExist || !outFileJpeg.isFile || !outFileJpeg.stat.size) {
                console.error('createCacheFile use cwebp error')
                const copyRawFile = new FileTools(await this.getPath())
                await copyRawFile.copy(cacheFilePath + '.jpg')
              }

              resolve(cacheFilePath)
            })
        })


    })
  }

  async createCacheFileUseJimp(cacheFilePath: string) {
    // 已移除JIMP
    // await this.init()
    // // 用jimp库处理
    // this.jimp
    //   .resize(Jimp.AUTO, CONFIGS.cachePictureWidth)
    //   .write(cacheFilePath, (err: any) => {
    //     if (err) return resolve('')
    //     // console.info('create cacheFilePath', cacheFilePath)
    //     resolve(cacheFilePath)
    //   })
  }

  async createCacheFileUseGMIM(cacheFilePath: string) {
    // 已移除GM支持
    // 测试是否支持 GraphicsMagick
    // ImageTools.initedGm = ImageTools.initedGm ?? await ImageTools.initGm()
    // if (ImageTools.initedGm) {
    //   // 用gm库处理 (移除exif)
    //   // console.info('createCacheFile use gm', cacheFilePath)
    //   gm(await this.getReadStram())
    //     .resize(CONFIGS.cachePictureWidth, CONFIGS.cachePictureWidth)
    //     .noProfile()
    //     .stream()
    //     .pipe(cacheFile.getWriteStream())
    //     .on('finish', () => {
    //       // console.info('create cacheFilePath', cacheFilePath)
    //       resolve(cacheFilePath)
    //     })
    //     .on('error', (err: any) => {
    //       console.error(err)
    //       resolve('')
    //     })
    //   return
    // }
  }

  getAndUpdateMD5() {
    return new Promise(async (resolve) => {
      if (!this.inited) await this.init()
      if (this.details.md5) return resolve(this.details.md5)

      const md5 = await this.getMD5()
      resolve(md5)
      md5 && ImageTools.imageDb.updateSet(this.details, { md5 })
    })
  }

  getColors() {
    return new Promise(async (resolve) => {
      if (!await this.getIsPicture()) return resolve([])
      if (!this.inited) await this.init()
      if (this.details.colors) return resolve(this.details.colors)

      // 先写数据库为空，读取后重新写入
      ImageTools.imageDb.updateSet(this.details, { colors: [] })

      // 检查文件是否存在
      if (!this.isExist) return resolve([])

      getColors(await this.getPath())
        .then((colors: any = []) => {
          colors = colors.map((i: any) => i.hex())
          resolve(colors)
          ImageTools.imageDb.updateSet(this.details, { colors })
        })
        .catch((err: any) => {
          console.error(err)
          resolve([])
        })
    })
  }

  deletePicture() {
    return new Promise(async (resolve) => {
      if (!await this.getIsPicture()) return resolve(false)
      if (!this.inited) await this.init()

      // 删除缓存文件
      const cacheFilePath = this.details.cachePath
      if (cacheFilePath) {
        const cacheFile = new FileTools(cacheFilePath)
        await cacheFile.delete()
      }

      // 删除heicJpeg缓存文件
      if (await this.getIsHeic()) {
        const heicJpegPath = await this.getPath()
        const heicJpegFile = new FileTools(heicJpegPath)
        await heicJpegFile.delete()
      }

      // 删除数据库记录
      await ImageTools.imageDb.deleteByKey('path', this.details.path)

      // 删除原图
      await this.delete()

      resolve(true)
    })
  }

  moveToTrash(deleteDB = true) {
    return new Promise(async (resolve) => {
      if (this.isExist === false) return resolve(true)
      if (!await this.getIsPicture()) return resolve(false)
      if (!this.inited) await this.init()

      // 删除缓存文件
      const cacheFilePath = this.details.cachePath
      if (cacheFilePath) {
        const cacheFile = new FileTools(cacheFilePath)
        cacheFile.isExist && await cacheFile.delete()
      }

      // 删除数据库记录
      deleteDB && await ImageTools.imageDb.deleteByKey('path', this.details.path)

      // 移动原图到回收站
      const trashPath = CONFIGS.recyclePath + '/' + encodeURIComponent(this.details.path)
      resolve(await this.rename(trashPath))
    })
  }

  // @ts-ignore
  async getReadStram() {
    if (!this.inited) await this.init()
    return await super.getReadStram(await this.getPath())
  }

  static async getPicturesByDirectories(directories: any) {
    const pictures: any[] = []
    const handle: any = async (item: FileTools | DirectoryTools) => {
      if (await item.getIsPicture()) return pictures.push(item)
      if (item.isDirectory) {
        for (const child of item.children) await handle(child)
      }
    }
    await handle(directories)
    return pictures
  }

}
