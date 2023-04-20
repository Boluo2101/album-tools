import { Sequelize, DataTypes } from 'sequelize'

import sequelize from "./indexRSS"

const Relationships = sequelize.define('relationships', {
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
  UUIDSorted: {
    // 以字典序排序的UUID组合
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  type: {
    // 1，关注关系
    // 2，阻止关系
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  // 这是其他模型参数
})

export default Relationships