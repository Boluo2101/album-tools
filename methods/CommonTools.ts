// 公共工具类
import { PHashArrayItemReturn, PHashArrayItem } from '../types/PHashArray'
export default class CommonTools {
  log: Boolean = true
  static log: Boolean = true

  constructor() {

  }

  // 获取随机数
  static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // 获取随机字符串
  static getRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
    return result
  }

  // 获取随机颜色
  static getRandomColor(): string {
    return `#${CommonTools.getRandomString(6)}`
  }

  // 获取随机颜色数组
  static getRandomColors(length: number): string[] {
    let colors: string[] = []
    for (let i = 0; i < length; i++) {
      colors.push(CommonTools.getRandomColor())
    }
    return colors
  }

  // 统一组装response
  static formatResponse(message: string = 'success', code: number = 200, res: any, data: any,) {
    res.json({
      code,
      message,
      data
    })
  }

  // 对比pHash
  static comparePHash(pHash1: string, pHash2: string): number {
    let n = 0
    if (pHash1.length !== pHash2.length) return n
    for (let i = 0; i < pHash1.length; i++) {
      if (pHash1[i] !== pHash2[i]) {
        n++
      }
    }
    return n / pHash1.length
  }

  // 对比图片数组
  static comparePHashArray(pHashArray: PHashArrayItem[], fPercent: number = 0.15): Map<number, Set<number>> {
    const map = new Map()
    const setted = new Map()

    for (let i = 0; i < pHashArray.length; i++) {
      const iItem = pHashArray[i]
      if (!map.has(iItem.index)) {
        map.set(iItem.index, new Set())
      }

      for (let j = i + 1; j < pHashArray.length; j++) {
        const res = CommonTools.comparePHash(pHashArray[i].pHash, pHashArray[j].pHash)

        if (res > fPercent) continue

        const jItem = pHashArray[j]
        const key = setted.has(jItem.index) ? setted.get(jItem.index) : iItem.index
        map.get(key).add(jItem.index)
        setted.set(jItem.index, key)
      }
    }

    return map
  }

  // 将map转换为数组
  static mapToArray(map: Map<any, any>): PHashArrayItemReturn[] {
    const result = []

    for (let arr of map.entries()) {
      const [index, value]: [number, Set<number>] = arr
      result.push({
        index,
        indexs: Array.from(value)
      })
    }

    return result
  }
}