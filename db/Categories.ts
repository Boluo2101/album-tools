import { Sequelize, DataTypes } from 'sequelize'

import sequelize from "./indexRSS"

const Categories = sequelize.define('categories', {
  uuid: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  createByUUID: {
    type: DataTypes.STRING,
  },
  parentUUID: {
    type: DataTypes.STRING,
  },
  times: {
    type: DataTypes.INTEGER,
  },
  cover: {
    type: DataTypes.STRING,
  },
  private: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  type: {
    // 1 订阅的分类
    // 2 收藏的分类
    type: DataTypes.STRING,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

}, {
  // 这是其他模型参数
})

export default Categories