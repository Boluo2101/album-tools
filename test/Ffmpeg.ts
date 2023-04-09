import Ffmpeg from "../utils/Ffmpeg"

Ffmpeg.checkFfmpegInstalled().then((res) => {
  console.log('checkFfmpegInstalled', res)

  const path = Ffmpeg.getFfmpegPath()
  console.log('getFfmpegPath', path)

  // 判断是否可用
  Ffmpeg.checkFfmpegUseable().then((res) => {
    console.log('checkFfmpegUseable', res)
  })
})