import DbBase from "./DbBase"
import { Pictures } from "../db/exports"

export default class ImageDB extends DbBase {
    constructor() {
        super(Pictures)
    }
}