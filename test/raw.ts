// @ts-ignore
import extractd from 'extractd'
import path from 'path';

(async () => {
  console.time('extractd')
  const filePath = path.join(process.cwd(), 'album', 'DSC_0015.NEF');
  // console.log('G:/Pictures/备份/DSC_0512.NEF');
  const target = path.parse('G:\\Pictures\\备份/DSC_0512.NEF')
  const source = `G:\\Projects\\album-tools\\album\\中文DSC_0015.NEF`;

  console.log('source', source);

  const done = await extractd.generate(source, {
    destination: 'G:/.cache/raw',
  })
  console.log(done);
  console.timeEnd('extractd')
})();