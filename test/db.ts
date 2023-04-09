import ImageDB from "../methods/ImageDB"


function main() {
  const imageDB = new ImageDB()

  // imageDB.dbModel.update({ cachePath: '' }, { where: {} })
  imageDB.dbModel.update({ exif: null }, { where: {} })
}

main()