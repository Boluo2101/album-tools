import ImageMagick from "../utils/ImageMagick"

ImageMagick.checkImageMagickInstalled().then((res) => {
  console.log('checkImageMagickInstalled', res)

  const path = ImageMagick.getImageMagickPath()
  console.log('getImageMagickPath', path)

  // 判断是否可用
  ImageMagick.checkIMUseable().then((res) => {
    console.log('checkIMUseable', res)
  })
})