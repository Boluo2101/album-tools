import * as ExifTool from 'exiftool-vendored'

ExifTool
  .exiftool
  .version()
  .then((version) => {
    console.log(`We're running ExifTool v${version}`)
    ExifTool.exiftool.end()
  })
  .catch((err) => console.error(err))