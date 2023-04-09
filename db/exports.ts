import Pictures from "./Pictures";
import Videos from "./Videos";

Pictures.sync({ force: false })
Videos.sync({ force: false })

export {
  Pictures,
  Videos
}