import GraphicsMagick from "../utils/GraphicsMagick"

GraphicsMagick.checkGraphicsMagickInstalled().then((res) => {
  console.log('checkGraphicsMagickInstalled', res)

  const path = GraphicsMagick.checkGMUseable()
  console.log('getGraphicsMagickPath', path)

  // 判断是否可用
  GraphicsMagick.checkGMUseable().then((res) => {
    console.log('checkGMUseable', res)
  })
})