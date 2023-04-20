import RSSDB from "../methods/RSSDB"
const rssDB = new RSSDB()

const rssUrls = [
	"https://hgoldfish.com/blogs/rss/articles.xml",
	"https://61.life/feed.xml",
	"https://geekplux.com/cn-feed.xml",
	"https://yanyue404.github.io/blog/rss",
	"https://growdu.gitee.io/dblog/atom.xml",
	"https://ruanyifeng.com/blog/atom.xml",
	"https://blog.t9t.io/atom.xml",
	"https://www.zhihu.com/rss",
	"https://ifanr.com/feed",
	"https://sspai.com/feed",
	"https://www.36kr.com/feed",
	"https://hutusi.com/feed.xml",
	"https://greatdk.com/rss",
	"http://www.zhouyong123.com/feed",
	"https://rss.huxiu.com",
	"https://www.ifanr.com/feed",
	"https://www.biede.com/feed",
	"http://liqi.io/feed/",
	"https://jesor.me/feed.xml",
	"http://shanglei.net/feed",
	"http://www.geekpark.net/rss",
	"http://wanqu.co/feed",
	"https://www.changhai.org/feed.xml",
	"https://feed.appinn.com",
	"https://feed.iplaysoft.com",
	"https://tech.meituan.com/feed",
	"http://insights.thoughtworkers.org/feed",
]

function create(url: string) {
	rssDB
		.create({ url })
		.then((res) => {
			// console.info("res", res.uuid)
			rssDB.refresh(res.uuid).catch((err) => console.error("err", err))
		})
		.catch((err) => {
			console.error("err", err)
		})
}

rssUrls.forEach((url) => {
	create(url)
})
