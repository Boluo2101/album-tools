import os from './os'
import fs from 'fs'
import path from 'path'

export default {
  // 检查ffmpeg是否安装
  checkFfmpegInstalled() {
    return new Promise((resolve) => {
      const exec = require('child_process').exec
      exec('ffmpeg -version', { windowsHide: true }, (error: any, stdout: any, stderr: any) => {
        if (error) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  },

  // 获取ffmpeg的可执行文件路径
  getFfmpegPath() {
    // 如果是windows系统，则根据系统架构获取不同的路径
    // 路径在bin目录下

    if (!os.getOSIsWindows()) {
      // 暂未支持其他操作系统
      return ''
    }

    const name = 'ffmpeg.exe'
    if (os.getOSArchIsX64() || os.getOSArchIsArm64()) {
      return path.resolve(process.cwd(), 'bin\\ffmpeg\\windows\\' + name)
    } else if (os.getOSArchIsIa32() || os.getOSArchIsArm()) {
      return path.resolve(process.cwd(), 'bin\\ffmpeg\\windows\\' + name)
    } else {
      return ''
    }
  },

  // 获取ffprobe的可执行文件路径
  getFfprobePath() {
    if (!os.getOSIsWindows()) {
      // 暂未支持其他操作系统
      return ''
    }

    const name = 'ffprobe.exe'
    if (os.getOSArchIsX64() || os.getOSArchIsArm64()) {
      return path.resolve(process.cwd(), 'bin\\ffmpeg\\windows\\' + name)
    } else if (os.getOSArchIsIa32() || os.getOSArchIsArm()) {
      return path.resolve(process.cwd(), 'bin\\ffmpeg\\windows\\' + name)
    } else {
      return ''
    }
  },

  // 判断ffmpeg是否可用
  checkFfmpegUseable(): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (await this.checkFfmpegInstalled()) {
        resolve(true)
        return
      }

      const binPath = this.getFfmpegPath()
      if (!binPath) {
        resolve(false)
      }

      // 检查文件是否存在
      if (!fs.existsSync(binPath)) {
        resolve(false)
      }

      const exec = require('child_process').exec
      exec(`${binPath} -version`, { windowsHide: true }, (error: any, stdout: any, stderr: any) => {
        // console.log('checkFfmpegUseable', error, stdout, stderr)
        if (error) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })

  }
}

