// 导入文件工具类
import FileTools from './FileTools'
import VideoDB from './VideoDB'
import DirectoryTools from './DirectoryTools'
const videoDb = new VideoDB()
import FluentFFmpeg from 'fluent-ffmpeg'
import Ffmpeg from '../utils/Ffmpeg'
import CONFIGS from '../configs/index'
import getColors from 'get-image-colors'

export default class VideoTools extends FileTools {
  isVideo: boolean = false
  inited: boolean = false
  details: any

  constructor(public path: string, options?: { log?: boolean }) {
    super(path)
    this.log = options?.log ?? true
    VideoTools.initENV()
    this.details = null
    this.inited = false
  }

  static async initENV() {
    FluentFFmpeg.setFfmpegPath(Ffmpeg.getFfmpegPath())
    FluentFFmpeg.setFfprobePath(Ffmpeg.getFfprobePath())
  }

  // 初始化
  async init() {
    this.details = await this.getDetails()
    this.inited = true
  }

  async getDetails() {
    const { path } = this
    return this.details || await videoDb.getItem({ path }) || await this.createDetails()
  }

  async createDetails() {
    const { name, path, stat: { size } } = this
    const data = { name, path, size }
    return videoDb.create(data)
  }

  static async getVideosByDirectories(directories: DirectoryTools) {
    const videos: any[] = []
    const handle: any = async (item: FileTools | DirectoryTools) => {
      if (await item.getIsVideo()) return videos.push(item)
      if (item.isDirectory) {
        for (const child of item.children) await handle(child)
      }
    }
    await handle(directories)
    return videos
  }

  getAndUpdateMD5() {
    return new Promise(async (resolve) => {
      if (!this.inited) await this.init()
      if (this.details.md5) return resolve(this.details.md5)

      const md5 = await this.getMD5()
      resolve(md5)
      md5 && videoDb.updateSet(this.details, { md5 })
    })
  }

  getVideoInfo() {
    return new Promise(async (resolve) => {
      if (!this.inited) await this.init()
      if (this.details.details) return resolve(this.details.details)

      const details = await this.getVideoInfoByFFmpeg()
      resolve(details)
      details && videoDb.updateSet(this.details, { details })
    })
  }

  getVideoInfoByFFmpeg() {
    return new Promise((resolve) => {
      FluentFFmpeg.ffprobe(this.path, function (err, metadata) {
        err && console.error(err)
        // console.dir(metadata)
        resolve(metadata)
      })
    })
  }

  getCacheFiles() {
    return new Promise(async (resolve) => {
      if (!this.inited) await this.init()
      if (this.details.cachesPath) {
        const paths = this.details.cachesPath.map((path: string) => this.checkFileExists(path)).filter((path: string) => path)
        if (paths.length) {
          return resolve(paths)
        }
      }

      const cachesPath = await this.getCachesPathByFFmpeg()
      resolve(cachesPath)
      cachesPath && videoDb.updateSet(this.details, { cachesPath })
    })
  }

  // 检查文件是否存在
  async checkFileExists(filePath: string) {
    return new Promise((resolve) => {
      const file = new FileTools(filePath)
      resolve(file.isExist)
    })
  }

  getCachesPathByFFmpeg() {
    return new Promise((resolve) => {
      // 缓存目录
      const cacheDir = CONFIGS.cachePath + '/videos/' + encodeURIComponent(this.path)

      const cacheFiles: any[] = []

      // 如果目录非空，则直接返回目录下的文件
      const dir = new DirectoryTools(cacheDir)
      if (dir.isExist && dir.children.length) {
        cacheFiles.push(...dir.children.filter(async i => i.isFile && await (new FileTools(i.path)).getIsPicture()).map((i: any) => i.path))
        if (cacheFiles.length >= 3) return resolve(cacheFiles)

        // 如果目录下的文件不足3个，则删除目录，重新生成
        dir.children.forEach((i: FileTools) => i.delete())
        dir.delete()
      }

      FluentFFmpeg(this.path)
        .inputOptions('-threads 1')
        .screenshots({
          timestamps: ['20%', '60%', '80%',],
          filename: 'thumbnail-at-%s.png',
          folder: cacheDir,
          size: '320x240'
        })
        .on('filenames', function (filenames) {
          cacheFiles.push(...filenames)
        })
        .on('end', function () {
          resolve(cacheFiles)
        })
        .on('error', function (err) {
          console.error(err)
          resolve([])
        })
    })
  }

  getColors() {
    return new Promise(async (resolve) => {
      if (!this.inited) await this.init()
      if (this.details.colors) return resolve(this.details.colors)

      const images = this.details.cachesPath || await this.getCacheFiles()

      const promiseArray = images.map((path: string) => {
        return getColors(path)
      })

      let res = await Promise.allSettled(promiseArray)
      res = res.filter((i: any) => i.status === 'fulfilled').map((colors: any = []) => colors.map((i: any) => i.hex()))

      const colors = res.flat()
      resolve(colors)
      colors && videoDb.updateSet(this.details, { colors })
    })
  }
}