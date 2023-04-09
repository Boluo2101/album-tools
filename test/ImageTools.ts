import ImageTools from "../methods/ImageTools"

const image = new ImageTools("album/DSC_0196_副本 - 副本.jpg")

async function main() {

  console.time('get colors')
  const colors = await image.getColors()
  console.log('colors', colors)
  console.timeEnd('get colors')
}

main()

// image.getExif()
//   .then((res) => {
//     console.log('getExif', res)
//   })
//   .catch((err) => {
//     console.error(err)
//   })

