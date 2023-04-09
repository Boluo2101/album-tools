import os from './os'
import fs from 'fs'
import path from 'path'

export default {
  // 检查ImageMagick是否安装
  checkImageMagickInstalled() {
    return new Promise((resolve) => {
      const exec = require('child_process').exec
      exec('magick -version', { windowsHide: true }, (error: any, stdout: any, stderr: any) => {
        if (error) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  },

  // 获取ImageMagick的可执行文件路径
  getImageMagickPath() {
    // 如果是windows系统，则根据系统架构获取不同的路径
    // 路径在bin目录下

    if (!os.getOSIsWindows()) {
      // 暂未支持其他操作系统
      return ''
    } else {
      const name = 'magick.exe'
      if (os.getOSArchIsX64()) {
        return path.resolve(process.cwd(), 'bin\\ImageMagick\\windows\\x64\\' + name)
      } else if (os.getOSArchIsArm64()) {
        return path.resolve(process.cwd(), 'bin\\ImageMagick\\windows\\arm64\\' + name)
      } else if (os.getOSArchIsArm()) {
        return path.resolve(process.cwd(), 'bin\\ImageMagick\\windows\\arm\\' + name)
      } else if (os.getOSArchIsIa32()) {
        return path.resolve(process.cwd(), 'bin\\ImageMagick\\windows\\ia32\\' + name)
      } else {
        return ''
      }
    }
  },

  // 判断IM是否可用
  checkIMUseable(): Promise<boolean> {
    return new Promise( async (resolve) => {
      if (await this.checkImageMagickInstalled()) {
        resolve(true)
        return
      }

      const binPath = this.getImageMagickPath()
      if (!binPath) {
        resolve(false)
      }

      // 检查文件是否存在
      if (!fs.existsSync(binPath)) {
        resolve(false)
      }

      const exec = require('child_process').exec
      exec(`${binPath} -version`, { windowsHide: true }, (error: any, stdout: any, stderr: any) => {
        if (error) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }
}