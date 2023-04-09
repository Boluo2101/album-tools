import os from './os'
import fs from 'fs'
import path from 'path'

export default {
  // 检查GraphicsMagick是否安装
  checkGraphicsMagickInstalled() {
    return new Promise((resolve) => {
      const exec = require('child_process').exec
      exec('gm -version', { windowsHide: true }, (error: any, stdout: any, stderr: any) => {
        // console.log('checkGraphicsMagickInstalled', error, stdout, stderr)
        if (error) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  },

  // 获取GraphicsMagick的可执行文件路径
  getGraphicsMagickPath() {
    // 如果是windows系统，则根据系统架构获取不同的路径
    // 路径在bin目录下

    if (!os.getOSIsWindows()) {
      // 暂未支持其他操作系统
      return ''
    } else {

      // 如果是64，则返回64位的路径，如果是32，则返回32位的路径
      const name = 'gm.exe'
      if (os.getOSArchIsX64() || os.getOSArchIsArm64()) {
        return path.resolve(process.cwd(), 'bin\\GraphicsMagick\\windows\\64\\' + name)
      } else if (os.getOSArchIsArm() || os.getOSArchIsIa32()) {
        return path.resolve(process.cwd(), 'bin\\GraphicsMagick\\windows\\32\\' + name)
      } else {
        return ''
      }
    }
  },

  // 判断GM是否可用
  checkGMUseable(): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (await this.checkGraphicsMagickInstalled()) {
        resolve(true)
        return
      }

      const binPath = this.getGraphicsMagickPath()
      if (!binPath) {
        resolve(false)
      }

      // 检查文件是否存在
      if (!fs.existsSync(binPath)) {
        resolve(false)
      }

      const exec = require('child_process').exec
      exec(`${binPath} -version`, { windowsHide: true }, (error: any, stdout: any, stderr: any) => {
        // console.log('checkGMUseable', error, stdout, stderr)
        if (error) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }
}