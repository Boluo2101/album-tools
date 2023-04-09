// 依赖项
import PathTools from  './PathTools'
import FileTools from './FileTools'
import * as fs from 'fs';
import * as NodePath from 'path';

export default class DirectoryTools extends PathTools {
  children: any[] = [];

  constructor(public path: string) {
    console.info('DirectoryTools', path)
    super(path)
    if (!this.isDirectory) {
      console.error('path is not directory')
      return
    } 
    this.children = fs.readdirSync(this.path).map((childPath) => {
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