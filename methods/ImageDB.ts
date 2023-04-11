/*
 * @Author: 张超越 
 * @Date: 2023-04-11 21:46:01 
 * @Last Modified by:   张超越 
 * @Last Modified time: 2023-04-11 21:46:01 
 */

import DbBase from "./DbBase"
import { Pictures } from "../db/exports"

/**
 * @description 图片数据库操作类，继承DbBase类
 * @author 张超越
 * @export
 * @class ImageDB
 * @extends {DbBase}
 */
export default class ImageDB extends DbBase {
    constructor() {
        super(Pictures)
    }
}