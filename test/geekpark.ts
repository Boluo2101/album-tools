import RSSDB from "../methods/RSSDB"
const rssDB = new RSSDB()

rssDB
	.getItem({ uuid: "7ae3c670975ef47969c9d17302d88fc2" })
	.then((res: any) => {
    console.info("res", res)
    
	})
	.catch((err: any) => {
		console.error("err", err)
	})
