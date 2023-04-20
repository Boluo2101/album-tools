import DbBase from "./DbBase"
import { Urls } from "../db/exports"
import CommonTools from "./CommonTools"

export default class UrlsDB extends DbBase {
  constructor() {
    super(Urls)
  }
}