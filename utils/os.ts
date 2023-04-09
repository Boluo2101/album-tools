// OS

import CONFIG from '../configs'

export default {
  // 获取当前操作系统
  getOS() {
    const platform = process.platform
    let os = ''
    if (platform === 'win32') {
      os = 'windows'
    } else if (platform === 'darwin') {
      os = 'mac'
    } else if (platform === 'linux') {
      os = 'linux'
    }
    return os
  },

  // 获取当前操作系统是否是允许的操作系统
  getOSAllowed() {
    const os = this.getOS()
    return CONFIG.osAlloweds.includes(os)
  },

  // 获取当前操作系统是否是windows
  getOSIsWindows() {
    return this.getOS() === 'windows'
  },

  // 获取当前操作系统是否是mac
  getOSIsMac() {
    return this.getOS() === 'mac'
  },

  // 获取当前操作系统是否是linux
  getOSIsLinux() {
    return this.getOS() === 'linux'
  },

  // 获取当前操作系统的CPU架构
  getOSArch() {
    return process.arch
  },

  // 获取当前操作系统的CPU架构是否是x64
  getOSArchIsX64() {
    return this.getOSArch() === 'x64'
  },

  // 获取当前操作系统的CPU架构是否是arm64
  getOSArchIsArm64() {
    return this.getOSArch() === 'arm64'
  },

  // 获取当前操作系统的CPU架构是否是arm
  getOSArchIsArm() {
    return this.getOSArch() === 'arm'
  },

  // 获取当前操作系统的CPU架构是否是ia32
  getOSArchIsIa32() {
    return this.getOSArch() === 'ia32'
  },
}