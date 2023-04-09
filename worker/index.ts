// 子进程
import path from 'path'
import fs from 'fs'
import { fork } from 'child_process'
import { randomUUID, UUID } from 'crypto'
import { ChildStatus } from './types'
import DirectoryTools from '../methods/DirectoryTools'
import ImageTools from '../methods/ImageTools'
import VideoTools from '../methods/VideoTools'
import CONFIGS from '../configs/index'
import ImageDB from '../methods/ImageDB'
import VideoDB from '../methods/VideoDB'
import colors from 'colors'
import { chunk } from 'lodash'

const imageDb = new ImageDB()
const videoDb = new VideoDB()

// 获取CPU核心数，留一颗给主进程/服务进程
const cpus = require('os').cpus().length
const childNumber = cpus > 3 ? cpus - 2 : 1
console.log('childNumber:', childNumber)

// 当前文件的目录
const workerPath = path.resolve(__dirname, 'Worker')
console.log('workerPath:', workerPath)

// 初始化
let childrens = new Array(childNumber).map((item, index) => createChild(index));

// 任务队列
let taskQueue: Array<any> = []

// child times
let childTimes = 0

// 缓存
let caches: any = createCacheNull()
function createCacheNull() {
  return { directories: null, pictures: null, videos: null }
}

// 计数，统计任务被添加的次数，如果同一个任务被添加了多次，那么就会被忽略
let pathsTaskCountMap = new Map()
let videosTaskCountMap = new Map()

// while 是否暂停
let isPause = false

function createChild(index: Number, childTimes: number = 0) {
  const uuid: UUID = randomUUID()
  const createTime = new Date().getTime()

  // 子进程
  const child = fork(workerPath)

  // 监听子进程消息
  child.on('message', (msg: any) => {
    const { type, data: { types: taskTypes = [] }, name } = msg
    console.log('child:', colors.bgYellow(colors.red(String(childTimes))), 'messsgae from child', colors.green(taskTypes.join('，') + ' ' + type))

    const child = childrens.find((item: any) => item.uuid === uuid)
    if (!child) return false
    if (type === 'done') {
      removeTask(msg.uuid)
      child && (child.status = 'free')
      return
    }

    child.status = 'error'
    child.child.kill()
  })

  // 监听子进程退出
  child.on('exit', (code: any, signal: any) => {
    console.error('child:', colors.rainbow(String(index)), 'exit', code, signal)

    // 移除子进程
    const cIndex = childrens.findIndex((item: any) => item.uuid === uuid)
    if (cIndex > -1) {
      childrens.splice(cIndex, 1)
    }
  })

  // 初始化消息
  child.send({ type: 'init', hello: 'world' })

  const status: ChildStatus = 'free'

  console.info((colors.rainbow('create child:' + childTimes)))
  return {
    name: `child ${index}`,
    uuid,
    createTime,
    status,
    child,
  }
}

function addTask(task: any) {
  taskQueue.push(task)
}

function removeTask(uuid: UUID) {
  const index = taskQueue.findIndex((item: any) => item.uuid === uuid)
  if (index > -1) {
    taskQueue.splice(index, 1)
  }
}

function removeTaskByIndex(index: number) {
  // console.log('removeTaskByIndex', index)
  taskQueue.splice(index, 1)
}

// 创建任务
function createTasks() {
  // console.log('createTask now task length', taskQueue.length)
  return new Promise(async (resolve, reject) => {
    if (taskQueue.length) return resolve(taskQueue)

    // 获取整个图片树（文件）
    let directories = caches.directories || new DirectoryTools(CONFIGS.rootPath)
    let pictures = caches.pictures || await ImageTools.getPicturesByDirectories(directories)
    let videos = caches.videos || await VideoTools.getVideosByDirectories(directories)

    caches.directories = directories
    caches.pictures = pictures
    caches.videos = videos

    // 获取所有图片（数据库）的path
    let picturesPaths = await imageDb.getItems({}, { attributes: ['path', 'pHash', 'colors', 'cachePath', 'exif', 'md5'] })
    const paths = picturesPaths.map((i: { path: any }) => i.path)

    console.info('picturesPaths:', picturesPaths.length)

    // 获取所有视频（数据库）的path
    let videosPaths = await videoDb.getItems({}, { attributes: ['path', 'md5', 'details', 'cachesPath', 'colors'] })
    let videosPathsArray = videosPaths.map((i: { path: any }) => i.path)

    // 将数据库中的图片与文件中的图片进行对比， 文件中有，数据库中没有，添加到数据库
    const addPictures = pictures.filter((item: { path: any }) => !paths.includes(item.path)) || []

    // 将数据库中的视频与文件中的视频进行对比， 文件中有，数据库中没有，添加到数据库
    const addVideos = videos.filter((item: { path: any }) => !videosPathsArray.includes(item.path)) || []

    // 将数组分割成多个数组
    const addPicturesChunks = chunk(addPictures, CONFIGS.db.createManyNumber || 100)
    addPicturesChunks.forEach((item: any) => {
      const uuid: UUID = randomUUID()
      addTask({
        uuid,
        types: ['addPictures'],
        data: item,
      })
    })

    // 将数组分割成多个数组
    const addVideosChunks = chunk(addVideos, CONFIGS.db.createManyNumber || 100)
    addVideosChunks.forEach((item: any) => {
      const uuid: UUID = randomUUID()
      addTask({
        uuid,
        types: ['addVideos'],
        data: item,
      })
    })

    let picturesPathsAppened = new Map()
    let videosPathsAppened = new Map()

    // 获取所有pHash为空的图片
    const picturesWithoutPHash = picturesPaths.filter((item: { pHash: any }) => !item.pHash) || []
    picturesWithoutPHash.forEach((item: any) => picturesPathsAppened.set(item.path, item))

    // 获取所有exif为空的图片
    const picturesWithoutExif = picturesPaths.filter((item: { exif: any, path: any }) => !item.exif) || []
    picturesWithoutExif.forEach((item: any) => picturesPathsAppened.set(item.path, item))

    // 获取所有colors为空的图片
    // const picturesWithoutColors = picturesPaths.filter((item: { colors: any, path: any }) => (!item.colors || !item.colors.length)) || []
    // picturesWithoutColors.forEach((item: any) => picturesPathsAppened.set(item.path, item))

    // 获取所有cachePath为空的图片
    const picturesWithoutCachePath = picturesPaths.filter((item: { cachePath: any, path: any }) => !item.cachePath) || []
    picturesWithoutCachePath.forEach((item: any) => picturesPathsAppened.set(item.path, item))

    // 获取所有md5为空的图片
    // const picturesWithoutMd5 = picturesPaths.filter((item: { md5: any, path: any }) => !item.md5) || []
    // picturesWithoutMd5.forEach((item: any) => picturesPathsAppened.set(item.path, item))

    const taskGroup = chunk(Array.from(picturesPathsAppened.values()).map(item => createPicturesAllTask(item)), CONFIGS.worker.childProcessTaskNumber || 50)
    taskGroup.forEach((item: any) => {
      console.log('taskGroup', item.length)
      addTask({
        uuid: randomUUID(),
        tasks: 'list',
        data: item,
      })
    })

    // 视频处理
    // 获取所有md5为空的视频
    const videosWithoutMd5 = videosPaths.filter((item: { md5: any }) => !item.md5) || []
    videosWithoutMd5.forEach((item: any) => videosPathsAppened.set(item.path, item))

    // 获取所有details为空的视频
    const videosWithoutDetails = videosPaths.filter((item: { details: any }) => !item.details) || []
    videosWithoutDetails.forEach((item: any) => videosPathsAppened.set(item.path, item))

    // 获取所有cachesPath为空的视频
    const videosWithoutCachesPath = videosPaths.filter((item: { cachesPath: any }) => !item.cachesPath) || []
    videosWithoutCachesPath.forEach((item: any) => videosPathsAppened.set(item.path, item))

    // 获取所有colors为空但是缓存不为空的视频
    const videosWithoutColors = videosPaths.filter((item: { colors: any, cachesPath: any }) => !item.colors && item.cachesPath) || []
    videosWithoutColors.forEach((item: any) => videosPathsAppened.set(item.path, item))

    const taskGroupVideos = chunk(Array.from(videosPathsAppened.values()).map(item => createVideosAllTask(item)), CONFIGS.worker.childProcessTaskNumber || 50)
    taskGroupVideos.forEach((item: any) => {
      console.log('taskGroupVideos', item.length)
      addTask({
        uuid: randomUUID(),
        tasks: 'list',
        data: item,
      })
    })

    console.log('createTask success', taskQueue.length)
    resolve(taskQueue)
  })
}

// 添加图片任务
function createPicturesAllTask(item: any) {
  // 保证同一个图片一组任务，复用资源
  // 子任务中保证同步顺序执行任务
  // 相同的任务虽然会下发，但是方法中会从数据库数据众做判断，不会重复执行

  const mapItem = pathsTaskCountMap.get(item.path) || { times: 0 }
  if (mapItem.times > 5) return false

  const taskNames = []
  const uuid: UUID = randomUUID()


  // 如果没有exif，则添加exif任务
  if (!item.exif) {
    taskNames.push('addPicturesExif')
  }

  // 如果没有pHash，则添加pHash任务
  if (!item.pHash) {
    taskNames.push('addPicturesPHash')
  }

  // 如果没有cachePath，则添加cachePath任务
  if (!item.cachePath) {
    taskNames.push('addPicturesCachePath')
  }

  // 如果没有colors，则添加colors任务
  // if (!item.colors || !item.colors.length) {
  // if (!item.colors) {
  //   taskNames.push('addPicturesColors')
  // }

  // // 如果没有md5，则添加md5任务
  // if (!item.md5) {
  //   taskNames.push('addPicturesMD5')
  // }

  if (!taskNames.length) return false

  // 计数累加
  mapItem.times += 1
  pathsTaskCountMap.set(item.path, mapItem)

  // 添加任务
  return {
    uuid,
    types: taskNames,
    data: item,
  }
}


// 添加视频任务
function createVideosAllTask(item: any) {
  // 保证同一个视频一组任务，复用资源
  // 子任务中保证同步顺序执行任务
  // 相同的任务虽然会下发，但是方法中会从数据库数据众做判断，不会重复执行

  const mapItem = videosTaskCountMap.get(item.path) || { times: 0 }
  if (mapItem.times > 5) return false

  const taskNames = []
  const uuid: UUID = randomUUID()

  // 如果没有md5，则添加md5任务
  if (!item.md5) {
    taskNames.push('addVideosMD5')
  }

  // 如果没有视频详情，则添加视频详情任务
  if (!item.videoInfo) {
    taskNames.push('addVideosInfo')
  }

  // 如果没有视频截图缓存路径，则添加视频缓存路径任务
  if (!item.cachesPath) {
    taskNames.push('addVideosCachesPath')
  }

  // 如果没有视频颜色，则添加视频颜色任务
  if (!item.colors) {
    taskNames.push('addVideosColors')
  }

  if (!taskNames.length) return false


  // 计数累加
  mapItem.times += 1
  videosTaskCountMap.set(item.path, mapItem)

  return {
    uuid,
    types: taskNames,
    data: item,
  }
}

// 任务分发
function dispatchTask(isRandom: boolean = true) {
  return new Promise((resolve, reject) => {
    // 所有空闲的子进程
    const freeChildrens = childrens.filter((item) => item.status === 'free') || []
    if (!freeChildrens.length) {
      // console.log('all childrens are running, wait')
      return resolve(true)
    }

    if (!taskQueue.length) {
      console.log('no task, wait')
      return resolve(true)
    }

    // 任务分发
    for (let childIndex in freeChildrens) {
      let item = freeChildrens[childIndex]

      // 如果随机，则取一个不超过任务列表长度的随机数作为下标
      const index = !isRandom ? 0 : Math.floor(Math.random() * taskQueue.length)

      const task = taskQueue[index]
      if (!task) break

      // 从任务列表中移除该任务
      removeTaskByIndex(index)
      item.status = 'running'
      item.child.send({ ...task, taskIndex: index, })
      console.log('dispatch task,' + task.types + ' tsak length', taskQueue.length, 'freeChildrens.length', freeChildrens.length)
    }
    resolve(true)
  })
}

// 休眠
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 检查子进程健康
function checkChildrensHealth() {
  return new Promise((resolve) => {

    // 检查子进程是否存活
    childrens = childrens.filter((item) => {
      if (item.status === 'error' || item.child.killed) {
        console.info(colors.bgRed('child:' + item.name + ' is killed, remove it',), item.status, item.child.killed)
        // 移除该子进程
        return false
      }
      return true
    })

    // 如果子进程数量不足，则创建新的子进程
    if (childrens.length < childNumber) {
      const index = childrens.length
      childTimes += 1
      childrens.push(createChild(index, childTimes))
      isPause = false
    }

    resolve(true)
  })
}


function dirCreate(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}

async function main() {
  // 检查文件夹是否存在，不存在则创建
  dirCreate(CONFIGS.rootPath)
  dirCreate(CONFIGS.cachePath)
  dirCreate(CONFIGS.cachePath + '/pictures')
  dirCreate(CONFIGS.cachePath + '/videos')
  dirCreate(CONFIGS.recyclePath)
  dirCreate(CONFIGS.hevcCachePath)
  dirCreate(CONFIGS.rawCachePath)
  dirCreate(CONFIGS.rawCacheingPath)
  dirCreate(CONFIGS.webpCachePath)

  while (true) {
    if (isPause) {
      await sleep(CONFIGS.worker.sleepTime)
      continue
    }

    // 检查子进程健康
    await checkChildrensHealth()

    // 检查任务队列
    await createTasks()
    await dispatchTask(false)

    // 休眠
    isPause = taskQueue.length ? false : true
    isPause && console.info('isPause status', colors.bgRed(String(isPause)))

    setTimeout(() => {
      isPause = false
    }, CONFIGS.worker.sleepTime)

    await sleep(20)
  }
}

main()

// 监听文件夹内容是否变动
fs.watch(CONFIGS.rootPath, { recursive: true }, async (eventType, filename) => {
  caches = createCacheNull()
  isPause = false
})

// 捕获异常
process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err)
})

export default {
  childrens,
}