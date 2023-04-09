// @ts-ignore
import webp from 'webp-converter'
import path from 'path';

const result = webp.cwebp(path.resolve(process.cwd(), 'test', 'files', '1.jpeg'), path.resolve(process.cwd(), 'test', 'files', '1111.webp'), "-q 80");
result.then((response: any) => {
    console.log(response);
})


const result2 = webp.dwebp(path.resolve(process.cwd(), 'test', 'files', '1.webp'), path.resolve(process.cwd(), 'test', 'files', '2222.jpeg'), "-o");
result2.then((response: any) => {
    console.log(response);
})