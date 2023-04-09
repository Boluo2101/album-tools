// 公共工具类

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

    // 同一组装response
    static formatResponse(message: string = 'success', code: number = 200, res: any, data: any,) {
        res.json({
            code,
            message,
            data
        })
    }
}