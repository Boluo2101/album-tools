import ImageTools from "../methods/ImageTools";

const heicPath = "G:/Pictures/2b296f91-a3b0-4bdd-a5ad-45e3f1988e57.heic"

async function main() {
    const image = new ImageTools(heicPath);
    const jimp = await image.init()
    console.info(await jimp.getColors())
}

main();
