// 图片，express 路由模块

// 配置信息
import CONFIGS from '../configs/index'

// 包
import express from 'express'
import DirectoryTools from '../methods/DirectoryTools'
import ImageTools from '../methods/ImageTools'
import CommonTools from '../methods/CommonTools'
import ImageDB from '../methods/ImageDB'
import FileTools from '../methods/FileTools'
const imageDb = new ImageDB()
const { formatResponse } = CommonTools

// 路由
let router = express.Router()

router.get('/', async (req, res) => {
  let directories = new DirectoryTools(CONFIGS.rootPath)
  let pictures = await ImageTools.getPicturesByDirectories(directories)
  formatResponse('success', 200, res, pictures)
})

// 获取图片数组的数据库信息
router.get('/details', async (req, res) => {
  const images = await imageDb.getItems({}, { attributes: { exclude: ['exif'] }, })
  formatResponse('success', 200, res, images)
})

// 获取图片的数据库信息
router.get('/details/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  const image = new ImageTools(path)
  formatResponse('success', 200, res, await image.getDetailsAll())
})

// 获取图片的MD5 Some
router.get('/MD5Some/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  console.log('path', path)
  let file = new FileTools(path)
  const md5Some = await file.getMD5Some()
  formatResponse('success', md5Some ? 200 : 400, res, md5Some)
})

// 获取图片缩略图
router.get('/cache/:path', (req, res) => {
  let path = decodeURI(req.params.path)
  let image = new ImageTools(path)
  image.getCacheFile()
    .then((stream: any) => {
      stream.pipe(res)
    })
    .catch((err: any) => {
      console.error('err', err)
    })
})

// 获取图片
router.get('/raw/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let image = new ImageTools(path);

  const readStream = await image.getReadStram()
  readStream.pipe(res)
})

// 获取图片exif
router.get('/exif/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let image = new ImageTools(path)
  formatResponse('success', 200, res, await image.getExif())
})

// 加载图片的pHash
router.get('/pHash/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let image = new ImageTools(path)
  formatResponse('success', 200, res, await image.getPHash())
})

// 加载图片的colors
router.get('/colors/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let image = new ImageTools(path)
  formatResponse('success', 200, res, await image.getColors())
})

// 批量加载图片的colors
router.post('/colors', async (req, res) => {
  let paths = req.body.paths
  let images = paths.map((path: string) => new ImageTools(decodeURI(path)))
  const colors = (await Promise.allSettled(images.map((image: ImageTools) => image.getColors())).catch((err: any) => console.error(err)) || []).map((i: any) => i.value)
  formatResponse('success', 200, res, colors)
})

// 批量加载图片的pHash
router.post('/pHashes', async (req, res) => {
  let paths = req.body.paths
  let images = paths.filter((i: any) => i).map((path: string) => new ImageTools(decodeURI(path)))
  const pHashes = (await Promise.allSettled(images.map((image: ImageTools) => image.getPHash())).catch((err: any) => console.error(err)) || []).map((i: any) => i.value)
  formatResponse('success', 200, res, pHashes)
})

// 删除图片
router.delete('/:path', async (req, res) => {
  let path = decodeURI(req.params.path)
  let image = new ImageTools(path)
  await image.deletePicture()
  formatResponse('success', 200, res, '删除成功')
})

// 批量删除图片
router.post('/delete', async (req, res) => {
  let paths = req.body.paths

  // 判断数组长度是否大于最大值
  if (paths.length > CONFIGS.deleteMaxLimit) {
    return formatResponse('error', 400, res, `单次批量删除数量不能超过${CONFIGS.deleteMaxLimit}张`)
  }

  let images = paths.map((path: string) => new ImageTools(decodeURI(path)))
  const result = await Promise.allSettled(images.map((image: ImageTools) => image.deletePicture()))
  formatResponse('success', 200, res, result)
})

// 批量移动图片到回收站
router.post('/moveToTrash', async (req, res) => {
  let paths = req.body.paths

  // 判断数组长度是否大于最大值
  if (paths.length > CONFIGS.deleteMaxLimit) {
    return formatResponse('error', 400, res, `单次批量删除数量不能超过${CONFIGS.deleteMaxLimit}张`)
  }

  let images = paths.map((path: string) => new ImageTools((path)))
  const result = await Promise.allSettled(images.map((image: ImageTools) => image.moveToTrash(false)))
  await imageDb.deleteManyByKey('path', paths).catch((err: any) => console.error(err))
  formatResponse('success', 200, res, result)
})

export default router