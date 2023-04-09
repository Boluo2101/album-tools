// 文件夹， express 路由模块

// 配置信息
import CONFIGS from '../configs/index'

// 包
import express from 'express'
import DirectoryTools from '../methods/DirectoryTools'
import CommonTools from '../methods/CommonTools'
const { formatResponse }  = CommonTools


// 路由
let router = express.Router()

router.get('/', (req, res) => {
    let directories = new DirectoryTools(CONFIGS.rootPath)
    formatResponse('success', 200, res, directories)
})

export default router