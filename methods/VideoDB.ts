import DbBase from "./DbBase"
import { Videos } from "../db/exports"

export default class ImageDB extends DbBase {
    constructor() {
        super(Videos)
    }
}