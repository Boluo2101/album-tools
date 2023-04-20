import { Sequelize, DataTypes } from 'sequelize'

import sequelize from "./indexRSS"

const Subscriptions = sequelize.define('subscriptions', {
  uuid: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createByUUID: {
    type: DataTypes.STRING,
  },
  categoryUUID: {
    type: DataTypes.STRING,
  },
  rssUUID: {
    type: DataTypes.STRING,
  },
  rssCounts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  urlCounts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  times: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unreadCounts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tags: {
    type: DataTypes.STRING,
  },
  private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  // 这是其他模型参数
})

export default Subscriptions