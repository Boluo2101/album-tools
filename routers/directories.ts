// 配置信息
import CONFIGS from '../configs/index'

// 包
import express from 'express'
import DirectoryTools from '../methods/DirectoryTools'
import CommonTools from '../methods/CommonTools'
const { formatResponse } = CommonTools


// 路由
let router = express.Router()

router.get('/', (req, res) => {
  let directories = new DirectoryTools(CONFIGS.rootPath)
  formatResponse('success', 200, res, directories)
})

// 仅返回目录下有照片的路径
router.get('/only', (req, res) => {
  let directories = new DirectoryTools(CONFIGS.rootPath)

  const handle = (directory: DirectoryTools) => {
    console.info('handle', directory.isDirectory)
    if (directory.isFile) return false
    directory.children = directory.children.filter((child) => handle(child))
    return true
  }

  const arr = directories.children.filter((directory) => handle(directory))
  formatResponse('success', 200, res, arr)
})

export default router