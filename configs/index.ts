import path from "path"

const raw = ['cr2', 'rw2', 'dng', 'raf', 'arw', 'nef',]
export default {
    rootPath: 'E:/Pictures',
    cachePath: 'E:/.cache',
    hevcCachePath: 'E:/.cache/hevc',
    rawCachePath: 'E:/.cache/raw',
    rawCacheingPath: 'E:/.cache/raw/ing',
    webpCachePath: 'E:/.cache/webp',
    // 回收站路径
    recyclePath: 'E:/.cache/.recycle',
    cachePictureWidth: 400,
    raw,
    extensions: {
        image: [...raw, 'webp', 'heic', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'],
        video: ['mp4', 'avi', 'wmv', '3gp', 'mpeg', 'm4v', 'mov', 'flv', 'f4v', 'rmvb', 'rm', 'mkv']
    },
    jimp: {
        maxMemoryUsageInMB: 1024
    },
    db: {
        fileName: 'database.sqlite',
        fileNameOfVideos: 'databaseOfVideos.sqlite',
        createManyNumber: 1000,
        log: false
    },
    deleteMaxLimit: 1000,
    osAlloweds: ['win32', 'darwin', 'linux'],
    worker: {
        sleepTime: 5000, // worker任务队列休眠时的等待时间
        childProcessTaskNumber: 50 // 每个子进程最大任务数
    },
    ports: {
        server: 3000,
    },
    deleteOrMoveWaitTime: 10000,
}