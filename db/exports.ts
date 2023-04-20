import Pictures from "./Pictures";
import Videos from "./Videos";
import Categories from "./Categories";
import Collections from "./Collections";
import Relationships from "./Relationships";
import RSS from "./RSS";
import Subscriptions from "./Subscriptions";
import Users from "./Users";
import Urls from "./Urls";

Pictures.sync({ force: false })
Videos.sync({ force: false })
Categories.sync({ force: false })
Collections.sync({ force: false })
Relationships.sync({ force: false })
RSS.sync({ force: false })
Subscriptions.sync({ force: false })
Users.sync({ force: false })
Urls.sync({ force: false })

export {
  Pictures,
  Videos,
  Categories,
  Collections,
  Relationships,
  RSS,
  Subscriptions,
  Users,
  Urls,
}