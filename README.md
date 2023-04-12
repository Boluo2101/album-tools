## **背景** Background
1，项目立项背景请查阅 [`docs/README.md`](https://github.com/Boluo2101/album-tools/blob/main/docs/README.md)

1,Project background please refer to  [`docs/README.md`](https://github.com/Boluo2101/album-tools/blob/main/docs/README.md)



## **简介** Description
1，一个使用Node.js开发的图片/视频处理工具的后端项目，其依赖于Libvips、FFmpeg、Webp-converter等库。使用Express.js作为服务框架，使用Sqlite3作为应用数据库，使用Sequelize作为ORM框架。

1,A backend project of image/video processing tool developed by Node.js, which depends on Libvips, FFmpeg, Webp-converter and so on. Express.js is used as the service framework, Sqlite3 is used as the application database, and Sequelize is used as the ORM framework.

## Sharp镜像源配置
1，本项目依赖于Sharp库，Sharp库在国内下载速度较慢，你可以使用淘宝镜像源来加速下载，具体配置可查阅 [Sharp官方文档](https://sharp.pixelplumbing.com/install#alpine-linux)。或者在安装依赖前在终端中分别执行 `npm config set sharp_binary_host "https://npm.taobao.org/mirrors/sharp"` 和 
`npm config set sharp_libvips_binary_host "https://npm.taobao.org/mirrors/sharp-libvips"`
1, This project depends on the Sharp library. The Sharp library downloads slowly in China. You can use the Taobao mirror source to accelerate the download. You can refer to the [Sharp official document](https://sharp.pixelplumbing.com/install#alpine-linux) for specific configuration. Or execute `npm config set sharp_binary_host "https://npm.taobao.org/mirrors/sharp"` and `npm config set sharp_libvips_binary_host "https://npm.taobao.org/mirrors/sharp-libvips"` in the terminal before installing the dependencies.

## **运行环境** Runtime Environment
1，基于现代前端的基础环境如Node.js等安装不过多介绍，执行 `npm install` 或 `yarn` 安装依赖，在Windows环境下，你可能需要添加前缀来使用yarn，如 `npx yarn`。

1,Based on the basic environment of modern front-end such as Node.js, there is no need to introduce the installation in detail. Execute `npm install` or `yarn` to install dependencies. In the Windows environment, you may need to add a prefix to use yarn, such as `npx yarn`.


## **开发** Development
1，执行 `tsc --watch` 启动开发模式
1, Execute `tsc --watch` to start the development mode

## **配置图片库路径** Configure the path of the image library
1，请修改 `configs/index.ts` 中的 `rootPath` `cachePath` 等名称中带有`Path`的配置项，指向你的图片库路径。

1,Please modify the configuration item with `Path` in the name of `rootPath` `cachePath` in `configs/index.ts` to point to your image library path.

## **编译** Compile
1，执行 `tsc` 编译项目，编译结果位于 `dist` 目录下

1,Execute `tsc` to compile the project, the compilation result is located in the `dist` directory

## **数据预处理** Data Preprocessing
1，注意，执行预处理任务前，你需要先执行 `tsc` 编译项目。

1,Note that before executing the preprocessing task, you need to first execute `tsc` to compile the project.


2，你可在项目启动前执行图片库预处理任务，这是一个多进程的任务，启动后会自动开始预处理图片库，执行 `创建图片缩略图` `计算图片pHash特征值` 等任务，执行预处理任务后，你的后续接口请求会更快得到响应。

2,You can execute the image library preprocessing task before starting the project. This is a multi-process task. After starting, it will automatically start preprocessing the image library and execute tasks such as `Create Image Thumbnail` `Calculate Image pHash Feature Value`. After executing the preprocessing task, your subsequent interface requests will get a faster response.


3，推荐你在服务启动前或设备空闲时执行预处理任务，执行 `node ./dist/worker/index.js` 即可。

3,It is recommended that you execute the preprocessing task before the service starts or when the device is idle. Execute `node ./dist/worker/index.js` to do so.


## **启动服务（热更新）** Start Service (Hot Update)
1，执行 `nodemon dist/app.js` 启动热更新式的服务，当你改动任意TS文件，会自动编译JS文件，然后服务会自动重启。

1,Execute `nodemon dist/app.js` to start the hot update service. When you change any TS file, the JS file will be automatically compiled, and the service will automatically restart.


## **启动服务（进程守护）** Start Service (Process Guard)
1，执行 `pm2 start dist/app.js` 启动进程守护式的服务，此模式启动的服务在报错进程退出后，会自动重启。更多文档请查阅pm2官网。

1,Execute `pm2 start dist/app.js` to start the process guard service. The service started in this mode will automatically restart after the error process exits. For more documents, please refer to the pm2 official website.