import { Sequelize, DataTypes } from 'sequelize'

import sequelize from "./index"

const Urls = sequelize.define('urls', {
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
  description: {
    type: DataTypes.STRING,
  },
  icon: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.STRING,
  },
  raw: {
    type: DataTypes.STRING,
  },
  parentUUID: {
    type: DataTypes.STRING,
  },
  times: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tags: {
    type: DataTypes.STRING,
  },
  importType: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    // 1，普通存入
    // 2，历史导入
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  // 这是其他模型参数
})

export default Urls