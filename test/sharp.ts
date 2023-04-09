import sharp from "sharp";
import path from 'path'

sharp(path.resolve(process.cwd(), 'album', 'DSC_0107.JPG'))
  .metadata()
  .then(function (metadata: any) {
    // 将exif buffer转为json
    const exif = (metadata.exif);
    console.log(exif);
  });