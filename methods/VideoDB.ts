/*
 * @Author: 张超越 
 * @Date: 2023-04-11 21:45:35 
 * @Last Modified by:   张超越 
 * @Last Modified time: 2023-04-11 21:45:35 
 */

import DbBase from "./DbBase"
import { Videos } from "../db/exports"

/**
 * @description 视频数据库操作类，继承DbBase类
 * @author 张超越
 * @export
 * @class VideoDB
 * @extends {DbBase}
 */
export default class VideoDB extends DbBase {
    constructor() {
        super(Videos)
    }
}