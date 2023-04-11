import ImageDB from "../methods/ImageDB";
import CommonTools from "../methods/CommonTools";
const imageDb = new ImageDB();

// 获取所有的图片
(async () => {
  const images = await imageDb.getItems()
  console.log('images', images.length)

  // 组装测试数据
  const imagesArray = images.map((item: { pHash: any; }, index: any) => {
    return {
      index,
      pHash: item.pHash
    }
  })

  // 对比图片
  console.time('comparePHashArray returns')
  const returns = CommonTools.mapToArray(CommonTools.comparePHashArray(imagesArray))
  console.log('returns', returns)
  console.log('returns.length', returns.length)
  console.timeEnd('comparePHashArray returns')
})()