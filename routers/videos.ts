// 文件夹， express 路由模块

// 配置信息
import CONFIGS from '../configs/index'

// 包
import express from 'express'
import DirectoryTools from '../methods/DirectoryTools'
import CommonTools from '../methods/CommonTools'
import VideoTools from '../methods/VideoTools'
const { formatResponse } = CommonTools


// 路由
let router = express.Router()

router.get('/', async (req, res) => {
  let directories = new DirectoryTools(CONFIGS.rootPath)
  let videos = await VideoTools.getVideosByDirectories(directories)
  formatResponse('success', 200, res, videos)
})

// 获取视频的VideoInfo详细信息
router.get('/info/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let video = new VideoTools(path)
  formatResponse('success', 200, res, await video.getVideoInfo())
})

// 获取视频的详情
router.get('/details/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let video = new VideoTools(path)
  formatResponse('success', 200, res, await video.getDetails())
})

// 获取视频文件
router.get('/raw/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let video = new VideoTools(path)

  let readStream = await video.getReadStram()
  readStream.pipe(res)
})

// 获取视频缩略图
router.get('/cachesPath/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let video = new VideoTools(path)
  formatResponse('success', 200, res, await video.getCacheFiles())
})

// 获取视频的colors
router.get('/colors/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let video = new VideoTools(path)
  formatResponse('success', 200, res, await video.getColors())
})

export default router