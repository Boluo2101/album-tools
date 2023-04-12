/*
 * @Author: 张超越 
 * @Date: 2023-04-11 21:46:14 
 * @Last Modified by: 张超越
 * @Last Modified time: 2023-04-12 21:23:51
 */

// 依赖项
import PathTools from  './PathTools'
import FileTools from './FileTools'
import * as fs from 'fs';
import * as NodePath from 'path';

/**
 * @description 目录工具类，继承PathTools类，增加了children属性，用于存储子目录和文件
 * @author 张超越
 * @export
 * @class DirectoryTools
 * @extends {PathTools}
 */
export default class DirectoryTools extends PathTools {
  children: any[] = [];

  constructor(public path: string,   ) {
    console.info('DirectoryTools', path)
    super(path)
    if (!this.isDirectory) {
      console.error('path is not directory')
      return
    } 
    this.children = fs.readdirSync(this.path)
      .map((childPath) => {
        const childFullPath = NodePath.join(this.path, childPath) 
        const child = new PathTools(childFullPath)
        return child.isDirectory ? new DirectoryTools(childFullPath) : new FileTools(childFullPath)
      })
  }


  delete() {
    fs.unlinkSync(this.path)
  }

  async getIsPicture() {
    return false
  }

  async getIsVideo() {
    return false
  }
}