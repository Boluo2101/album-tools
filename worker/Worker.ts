import process from 'node:process'
import colors from 'colors'

import ImageTools from '../methods/ImageTools'
import VideoTools from '../methods/VideoTools'
import ImageDB from '../methods/ImageDB'
import VideoDB from '../methods/VideoDB'
const imageDb = new ImageDB()
const videoDb = new VideoDB()
let typesNumber = 0

// 任务优先级排序数组
const sortKeyNames = ['addPictures', 'addPicture', 'addPicturesExif', 'addPicturesCachePath', 'addPicturesPHash', 'addPicturesColors']

// 子进程，用于后台任务处理
process.on('message', async (msg: any) => {
  // console.log('message from parent:', msg)
  if (!msg) {
    console.log('无任务')
    checkTaskDone(process, msg)
  }

  // 计算typesNumber，用于判断任务是否全部结束
  if (msg.tasks !== 'list') {
    typesNumber = msg?.types?.length || 0
  } else {
    msg.data.forEach((item: any) => {
      typesNumber += item?.types?.length || 0
    })
  }

  // 判断是单任务还是多任务
  if (msg.tasks !== 'list') {
    return handleTask(msg)
  }

  // 多任务
  for await (let item of msg.data) {
    await handleTask(item)
  }
})

async function handleTask(msg: any) {
  return new Promise(async (resolve) => {
    let { types, taskIndex, index = '未知' } = msg
    // console.log('message from parent:', msg)
    if (!types || !types.length) {
      console.log('无任务')
      return resolve(true)
    }

    types = types.sort((a: any, b: any) => sortKeyNames.indexOf(a) - sortKeyNames.indexOf(b))
    for await (let type of types) {
      await handleType(msg, type, taskIndex)
    }

    resolve(true)
  })
}

function handleType(msg: any, type = '', index = '') {
  console.info('handleType: index', colors.bgYellow(colors.white(String(index))), colors.green(type))
  const { data } = msg
  const { path } = data
  let image = path && new ImageTools(path, { log: false })
  let video = path && new VideoTools(path, { log: false })

  switch (type) {
    case 'init':
      // 初始化
      console.log('init')
      break
    case 'addPicture':
      // 添加图片
      return addPicture(image, process, msg)
    case 'addPictures':
      // 批量添加图片
      return addPictures(msg, process)
    case 'addVideos':
      // 批量添加视频
      return addVideos(msg, process)
    case 'addPicturesPHash':
      // 添加图片pHash
      return addPicturesPHash(image, process, msg)
    case 'addPicturesColors':
      // 添加图片colors
      return addPicturesColors(image, process, msg)
    case 'addPicturesCachePath':
      // 添加图片cachePath
      return addPicturesCachePath(image, process, msg)
    case 'addPicturesExif':
      // 添加图片exif
      return addPicturesExif(image, process, msg)
    case 'addPicturesMD5':
      // 添加图片md5
      return addPicturesMD5(image, process, msg)
    case 'addVideosMD5':
      // 添加视频md5
      return addVideosMD5(video, process, msg)
    case 'addVideosInfo':
      // 添加视频信息
      return addVideosInfo(video, process, msg)
    case 'addVideosCachesPath':
      // 添加视频cachePath
      return addVideosCachesPath(video, process, msg)
    case 'addVideosColors':
      // 添加视频colors
      return addVideosColors(video, process, msg)
    default:
      console.info('未知的任务类型')
      break
  }
}

// 判断任务是否全部结束
function checkTaskDone(process: any, msg: any) {
  console.log('typesNumber', typesNumber)
  if (typesNumber <= 0) {
    process.send({ type: 'done', data: msg, })
  }
}

async function addPicture(image: any, process: any, msg: any) {
  // console.log('addPicture')
  return new Promise((resolve, reject) => {
    image
      .createDetails()
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}


async function addPictures(msg: any, process: any,) {
  // console.log('addPictures')
  return new Promise((resolve, reject) => {
    let { data: arr } = msg
    arr = arr.map((item: any) => {
      const { name, path, stat: { size } } = item
      const data = { name, path, size }
      return data
    })
    imageDb
      .createMany(arr)
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}

async function addVideos(msg: any, process: any,) {
  // console.log('addVideos')
  return new Promise((resolve, reject) => {
    let { data: arr } = msg
    arr = arr.map((item: any) => {
      const { name, path, stat: { size } } = item
      const data = { name, path, size }
      return data
    })
    videoDb
      .createMany(arr)
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}

async function addPicturesPHash(image: ImageTools, process: any, msg: any) {
  // console.log('addPicturesPHash')
  return new Promise((resolve, reject) => {
    image
      .getPHash()
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}


async function addPicturesColors(image: ImageTools, process: any, msg: any) {
  // console.log('addPicturesColors')
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      image
        .getColors()
        .finally(() => {
          --typesNumber
          resolve(typesNumber)
          checkTaskDone(process, msg)
        })
    }, 300)
  })
}

async function addPicturesCachePath(image: ImageTools, process: any, msg: any) {
  // console.log('addPicturesCachePath')
  return new Promise((resolve, reject) => {
    image
      .getCacheFile()
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}

async function addPicturesExif(image: ImageTools, process: any, msg: any) {
  // console.log('addPicturesExif')
  return new Promise((resolve, reject) => {
    image
      .getExif()
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}

async function addPicturesMD5(image: ImageTools, process: any, msg: any) {
  // console.log('addPicturesMD5')
  return new Promise((resolve, reject) => {
    image
      .getAndUpdateMD5()
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}

async function addVideosMD5(video: VideoTools, process: any, msg: any) {
  // console.log('addVideosMD5')
  return new Promise((resolve, reject) => {
    video
      .getAndUpdateMD5()
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}

async function addVideosInfo(video: VideoTools, process: any, msg: any) {
  // console.log('addVideosInfo')
  return new Promise((resolve, reject) => {
    video
      .getVideoInfo()
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}

async function addVideosCachesPath(video: VideoTools, process: any, msg: any) {
  // console.log('addVideosCachesPath')
  return new Promise((resolve, reject) => {
    video
      .getCacheFiles()
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}

async function addVideosColors(video: VideoTools, process: any, msg: any) {
  // console.log('addVideosColors')
  return new Promise((resolve, reject) => {
    video
      .getColors()
      .finally(() => {
        --typesNumber
        resolve(typesNumber)
        checkTaskDone(process, msg)
      })
  })
}

process.on('uncaughtException', (err: any) => {
  console.error(colors.bgRed('子进程'), 'uncaughtException', err)
  process.send && process.send({ type: 'error', data: err, })
  process.exit(1)
})

process.on('uncaughtExceptionMonitor', (err: any) => {
  console.error(colors.bgRed('子进程'), 'uncaughtExceptionMonitor', err)
  process.send && process.send({ type: 'error', data: err, })
  process.exit(1)
})

process.on('warnning', (warning) => {
  console.warn(colors.bgRed('触发到了warning事件'), warning);
})

process.on('unhandledRejection', err => {
  console.error(colors.bgRed('子进程'), 'unhandledRejection', err)
  process.send && process.send({ type: 'error', data: err, })
  process.exit(1)
})