import { Sequelize, DataTypes } from 'sequelize'

import sequelize from "./index"

const RSS = sequelize.define('rss', {
  uuid: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  domain: {
    type: DataTypes.STRING,
  },
  author: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  icon: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  backgroundColor: {
    type: DataTypes.STRING,
  },
  backgroundImage: {
    type: DataTypes.STRING,
  },
  tags: {
    type: DataTypes.STRING,
  },
  createByUUID: {
    type: DataTypes.STRING,
  },
  times: {
    type: DataTypes.INTEGER,
  },
  urlsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  fansCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastUpdateDate: {
    type: DataTypes.STRING,
  },
  lastRefreshDate: {
    type: DataTypes.STRING,
  },
  domPath: {
    // 用于源网页抓取的节点路径
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    // 1， 允许， 0，暂停
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  // 这是其他模型参数
})

export default RSS