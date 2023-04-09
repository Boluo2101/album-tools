import FileTools from "../methods/FileTools"
import path from "path"

const file = new FileTools(path.resolve(process.cwd(), 'test', 'files', '1.HEIC'))

file.getFileType().then((fileType) => {
    console.info('fileType', fileType)
})
