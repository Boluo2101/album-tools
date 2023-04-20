import { Sequelize, DataTypes } from 'sequelize'

import sequelize from "./indexRSS"

const Collections = sequelize.define('collections', {
  uuid: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  remark: {
    type: DataTypes.STRING,
  },
  createByUUID: {
    type: DataTypes.STRING,
  },
  targetUUID: {
    type: DataTypes.STRING,
  },
  parentUUID: {
    // 分类的UUID
    type: DataTypes.STRING,
  },
  targetType: {
    // 1 url
    type: DataTypes.STRING,
    defaultValue: 1,
  },
  times: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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

export default Collections