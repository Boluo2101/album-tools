// @ts-ignore
import tesseract from 'node-tesseract'

const imagePath = '../cache/1.png'
tesseract.process(imagePath, function (err: any, text: any) {
  if (err) {
    console.error(err);
  } else {
    console.log(text);
  }
});