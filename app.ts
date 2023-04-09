// express
import express from 'express'
import { json } from 'body-parser'
import CONFIGS from './configs/index'

// 初始化
const app = express()
app.use(json())

// 所有请求允许跨域
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With')
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    if (req.method == 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
})

// 路由
import pictures from './routers/pictures'
app.use('/pictures', pictures)

import directories from './routers/directories'
app.use('/directories', directories)

import videos from './routers/videos'
app.use('/videos', videos)

app.listen(CONFIGS.ports.server, () => {
    console.info(`App listening on port ${CONFIGS.ports.server}!`)
})

process.on('uncaughtException', err => console.error(err)) //监听未捕获的异常
process.on('unhandledRejection', err => console.error(err)) //监听Promise没有被捕获的失败函数